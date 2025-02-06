import pandas as pd
import numpy as np
from sklearn.cluster import KMeans
from sklearn.preprocessing import StandardScaler, MinMaxScaler
from sklearn.decomposition import PCA
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import silhouette_score, roc_auc_score, precision_score, recall_score
import matplotlib.pyplot as plt
from mlxtend.frequent_patterns import apriori
from mlxtend.frequent_patterns import association_rules
from datetime import datetime, timedelta
from sklearn.linear_model import LogisticRegression

class AdvancedCustomerAnalytics:
    def __init__(self, df):
        self.df = df
        self.preprocess_data()
        
    def preprocess_data(self):
        """Preprocess the data with advanced cleaning and feature engineering"""
        # Convert dates if not already done
        if 'Date' in self.df.columns and not pd.api.types.is_datetime64_any_dtype(self.df['Date']):
            self.df['Date'] = pd.to_datetime(self.df['Date'])
            
        # Calculate derived features
        self.df['dayOfWeek'] = self.df['Date'].dt.dayofweek
        self.df['month'] = self.df['Date'].dt.month
        self.df['isWeekend'] = self.df['dayOfWeek'].isin([5, 6]).astype(int)
        
        # Calculate per-transaction metrics
        self.df['itemsPerTransaction'] = self.df.groupby('billNumber')['quantity'].transform('sum')
        self.df['avgItemPrice'] = self.df['totalAmount'] / self.df['quantity']
        
        # Add customer lifetime value calculation
        customer_totals = self.df.groupby('vendorName')['totalAmount'].sum()
        self.df['customerLifetimeValue'] = self.df['vendorName'].map(customer_totals)

    def perform_rfm_analysis(self):
        """Perform RFM (Recency, Frequency, Monetary) Analysis"""
        current_date = self.df['Date'].max()
        
        rfm = self.df.groupby('vendorName').agg({
            'Date': lambda x: (current_date - x.max()).days,  # Recency
            'billNumber': 'count',  # Frequency
            'totalAmount': 'sum'    # Monetary
        }).rename(columns={
            'Date': 'recency',
            'billNumber': 'frequency',
            'totalAmount': 'monetary'
        })
        
        # Score each RFM metric
        for metric in ['recency', 'frequency', 'monetary']:
            rfm[f'{metric}_score'] = pd.qcut(rfm[metric], q=5, labels=[5,4,3,2,1], duplicates='drop')
            # Convert the 'recency_score' to numeric before subtraction
            if metric == 'recency':
                rfm[f'{metric}_score'] = pd.to_numeric(rfm[f'{metric}_score'], errors='coerce')
                rfm[f'{metric}_score'] = 6 - rfm[f'{metric}_score']  # Invert recency
                
        rfm['rfm_score'] = rfm['recency_score'].astype(str) + \
                          rfm['frequency_score'].astype(str) + \
                          rfm['monetary_score'].astype(str)
        
        # Add customer value segment
        rfm['value_segment'] = pd.qcut(rfm['monetary'], q=3, labels=['Low', 'Medium', 'High'])
        
        return rfm

    def predict_churn(self, churn_threshold_days=90):
        """Predict customer churn using machine learning"""
        # Calculate days since last purchase for each customer
        current_date = self.df['Date'].max()
        last_purchase_dates = self.df.groupby('vendorName')['Date'].max()
        days_since_purchase = (current_date - last_purchase_dates).dt.days
        
        # Create features for churn prediction
        churn_features = self.df.groupby('vendorName').agg({
            'totalAmount': ['mean', 'sum', 'std'],
            'quantity': ['mean', 'sum'],
            'billNumber': 'count',
            'itemsPerTransaction': ['mean', 'max'],
            'avgItemPrice': 'mean'
        }).fillna(0)
        
        # Flatten column names
        churn_features.columns = ['_'.join(col).strip() for col in churn_features.columns.values]
        
        # Define churn (1 if customer hasn't purchased in threshold days)
        churn_labels = (days_since_purchase > churn_threshold_days).astype(int)
        
        # Split data and train model
        X_train, X_test, y_train, y_test = train_test_split(
            churn_features, churn_labels, test_size=0.2, random_state=42
        )
        
        # Train model
        clf = RandomForestClassifier(n_estimators=100, random_state=42)
        clf.fit(X_train, y_train)
        
        # Make predictions
        y_pred = clf.predict(X_test)
        y_pred_proba = clf.predict_proba(X_test)[:, 1]
        
        # Calculate metrics
        auc_score = roc_auc_score(y_test, y_pred_proba)
        precision = precision_score(y_test, y_pred)
        recall = recall_score(y_test, y_pred)
        
        # Get feature importance
        feature_importance = pd.DataFrame({
            'feature': churn_features.columns,
            'importance': clf.feature_importances_
        }).sort_values('importance', ascending=False)
        
        return {
            'model': clf,
            'auc_score': auc_score,
            'precision': precision,
            'recall': recall,
            'feature_importance': feature_importance,
            'churn_probabilities': pd.Series(clf.predict_proba(churn_features)[:, 1], index=churn_features.index)
        }

    def perform_customer_segmentation(self, n_clusters=None):
        """Advanced customer segmentation using multiple features and optimal cluster selection"""
        # Create feature matrix
        vendor_features = self.df.groupby('vendorName').agg({
            'totalAmount': ['sum', 'mean', 'std'],
            'quantity': ['sum', 'mean'],
            'billNumber': 'count',
            'paymentType': lambda x: (x == 'Due').mean(),
            'isWeekend': 'mean',
            'itemsPerTransaction': 'mean',
            'customerLifetimeValue': 'first'
        }).fillna(0)
        
        # Flatten column names
        vendor_features.columns = ['_'.join(col).strip() for col in vendor_features.columns.values]
        
        # Scale features
        scaler = StandardScaler()
        features_scaled = scaler.fit_transform(vendor_features)
        
        # Determine optimal number of clusters if not specified
        if n_clusters is None:
            silhouette_scores = []
            K = range(2, min(8, len(features_scaled) -1))
            
            for k in K:
                kmeans = KMeans(n_clusters=k, random_state=42, n_init=10)
                kmeans.fit(features_scaled)
                
                labels = kmeans.labels_
                if len(np.unique(labels)) >= 2 and len(np.unique(labels)) < len(features_scaled):
                    score = silhouette_score(features_scaled, labels)
                    silhouette_scores.append(score)
                else:
                    silhouette_scores.append(-1)
                    
            n_clusters = K[np.argmax(silhouette_scores)]
            
        # Perform clustering
        kmeans = KMeans(n_clusters=n_clusters, random_state=42)
        clusters = kmeans.fit_predict(features_scaled)
        
        # Add cluster assignments and features to results
        results = vendor_features.copy()
        results['Cluster'] = clusters
        
        # Add cluster characteristics
        cluster_profiles = pd.DataFrame()
        for i in range(n_clusters):
            cluster_data = results[results['Cluster'] == i]
            profile = cluster_data.mean()
            cluster_profiles[f'Cluster_{i}'] = profile
            
        return results, cluster_profiles

    def analyze_purchase_patterns(self):
        """Analyze temporal patterns and product associations"""
        # Temporal analysis
        temporal_patterns = self.df.groupby(['dayOfWeek', 'isWeekend']).agg({
            'totalAmount': ['mean', 'count', 'sum'],
            'quantity': ['mean', 'sum'],
            'itemsPerTransaction': 'mean'
        }).round(2)
        
        # Product association analysis with confidence filtering
        basket = pd.crosstab(self.df['billNumber'], self.df['productSku'])
        basket_sets = (basket > 0).astype(int)
        
        frequent_itemsets = apriori(basket_sets, min_support=0.01, use_colnames=True)
        rules = association_rules(frequent_itemsets, metric="lift", min_threshold=1)
        rules = rules[rules['confidence'] >= 0.5]
        
        # Add seasonality analysis
        seasonality = self.df.groupby('month').agg({
            'totalAmount': ['mean', 'sum'],
            'quantity': 'sum',
            'billNumber': 'count'
        }).round(2)
        
        return temporal_patterns, rules, seasonality

    def predict_payment_behavior(self):
        """Predict payment behavior using Random Forest"""
        features = self.df.groupby('vendorName').agg({
            'totalAmount': ['mean', 'sum', 'std'],
            'quantity': ['mean', 'sum'],
            'itemsPerTransaction': ['mean', 'max'],
            'isWeekend': 'mean',
            'customerLifetimeValue': 'first'
        }).fillna(0)
        
        features.columns = ['_'.join(col).strip() for col in features.columns.values]
        
        target = (self.df.groupby('vendorName')['paymentType']
                 .agg(lambda x: (x == 'Due').mean() > 0.5)
                 .astype(int))
        
        X_train, X_test, y_train, y_test = train_test_split(
            features, target, test_size=0.2, random_state=42
        )
        
        clf = RandomForestClassifier(n_estimators=100, random_state=42)
        clf.fit(X_train, y_train)
        
        feature_importance = pd.DataFrame({
            'feature': features.columns,
            'importance': clf.feature_importances_
        }).sort_values('importance', ascending=False)
        
        return clf, feature_importance

    def generate_customer_insights(self):
        """Generate comprehensive customer insights"""
        rfm_analysis = self.perform_rfm_analysis()
        segmentation, cluster_profiles = self.perform_customer_segmentation()
        temporal_patterns, association_rules, seasonality = self.analyze_purchase_patterns()
        _, payment_features = self.predict_payment_behavior()
        churn_analysis = self.predict_churn()
        
        insights = {
            'rfm_analysis': rfm_analysis,
            'customer_segments': segmentation,
            'cluster_profiles': cluster_profiles,
            'temporal_patterns': temporal_patterns,
            'seasonality': seasonality,
            'top_associations': association_rules.head(10),
            'payment_predictors': payment_features,
            'churn_analysis': churn_analysis
        }
        
        return insights

