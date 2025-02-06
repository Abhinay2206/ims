import pandas as pd
import numpy as np
from sklearn.preprocessing import StandardScaler, LabelEncoder
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestRegressor, GradientBoostingRegressor
from sklearn.metrics import mean_squared_error, classification_report
import tensorflow as tf
from tensorflow.keras.models import Sequential
from tensorflow.keras.layers import Dense, Dropout, BatchNormalization
import matplotlib.pyplot as plt

class SupplierAnalysis:
    def __init__(self):
        self.gb_model = None
        self.dl_model = None
        self.scaler = None
        self.label_encoder = None
        
    def create_supplier_features(self, df):
        df['total_value'] = df['price'] * df['stock']
        df['supply_efficiency'] = df['stock'] / df['supplyFrequency']
        
        supplier_metrics = df.groupby('supplierName').agg({
            'price': ['mean', 'std'],
            'stock': ['mean', 'std'],
            'supplyFrequency': 'mean',
            'sku': 'count',
            'total_value': 'sum',
            'supply_efficiency': 'mean'
        }).reset_index()
        
        supplier_metrics.columns = ['supplierName', 'avg_price', 'price_std', 'avg_stock', 'stock_std', 
                                  'avg_supply_freq', 'product_count', 'total_value', 'supply_efficiency']
        
        supplier_metrics['efficiency_score'] = (
            supplier_metrics['supply_efficiency'] * supplier_metrics['product_count']
        )
        
        return supplier_metrics

    def create_performance_labels(self, metrics):
        metrics['performance_label'] = pd.qcut(metrics['efficiency_score'], q=3, labels=['Low', 'Medium', 'High'])
        return metrics

    def train_stock_predictor(self, df):
        X = df[['price', 'supplyFrequency', 'total_value']].values
        y = df['stock'].values
        
        X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
        
        self.gb_model = GradientBoostingRegressor(n_estimators=200, learning_rate=0.05, max_depth=5)
        self.gb_model.fit(X_train, y_train)
        
        return X_test, y_test

    def create_dl_classifier(self, input_dim):
        model = Sequential([
            Dense(128, activation='relu', input_dim=input_dim),
            BatchNormalization(),
            Dropout(0.3),
            Dense(64, activation='relu'),
            BatchNormalization(),
            Dropout(0.2),
            Dense(32, activation='relu'),
            Dense(3, activation='softmax')
        ])
        
        model.compile(optimizer='adam',
                     loss='sparse_categorical_crossentropy',
                     metrics=['accuracy'])
        
        return model

    def analyze_suppliers(self, df):
        supplier_metrics = self.create_supplier_features(df)
        supplier_metrics = self.create_performance_labels(supplier_metrics)
        
        # Train stock predictor
        X_test, y_test = self.train_stock_predictor(df)
        stock_predictions = self.gb_model.predict(X_test)
        stock_rmse = np.sqrt(mean_squared_error(y_test, stock_predictions))
        
        # Prepare data for DL classifier
        X = supplier_metrics[['avg_price', 'avg_stock', 'avg_supply_freq', 'product_count', 'total_value', 'supply_efficiency']].values
        self.label_encoder = LabelEncoder()
        y = self.label_encoder.fit_transform(supplier_metrics['performance_label'])
        
        X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
        self.scaler = StandardScaler()
        X_train_scaled = self.scaler.fit_transform(X_train)
        X_test_scaled = self.scaler.transform(X_test)
        
        self.dl_model = self.create_dl_classifier(X_train.shape[1])
        self.dl_model.fit(X_train_scaled, y_train, epochs=100, batch_size=32, verbose=0)
        
        supplier_predictions = self.dl_model.predict(X_test_scaled)
        predicted_classes = np.argmax(supplier_predictions, axis=1)
        
        return {
            'supplier_metrics': supplier_metrics,
            'stock_rmse': stock_rmse,
            'performance_distribution': supplier_metrics['performance_label'].value_counts(),
            'model_accuracy': self.dl_model.evaluate(X_test_scaled, y_test, verbose=0)[1]
        }

    def predict_stock(self, price, supply_frequency, total_value):
        if self.gb_model is None:
            raise ValueError("Model not trained. Please run analyze_suppliers first.")
        return self.gb_model.predict([[price, supply_frequency, total_value]])[0]

    def classify_supplier(self, features):
        if self.dl_model is None or self.scaler is None:
            raise ValueError("Model not trained. Please run analyze_suppliers first.")
        scaled_features = self.scaler.transform([features])
        predictions = self.dl_model.predict(scaled_features)
        predicted_class = np.argmax(predictions, axis=1)[0]
        return self.label_encoder.inverse_transform([predicted_class])[0]
