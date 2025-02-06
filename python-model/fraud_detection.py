from sklearn.preprocessing import StandardScaler
from sklearn.ensemble import IsolationForest
from keras.models import Model
from keras.layers import Input, Dense
from keras import regularizers
import numpy as np
import pandas as pd

class FraudDetection:
    def __init__(self, products_df, bills_df):
        self.products_df = products_df
        self.bills_df = bills_df
        self.data_df = self.prepare_data()
        self.scaler = StandardScaler()
        self.iso_forest = IsolationForest(contamination=0.05, random_state=42)
        self.autoencoder = self.build_autoencoder()
        self.threshold = None

    def prepare_data(self):
        # Merge the two datasets using the products' productSku and bills' sku columns.
        data_df = pd.merge(self.bills_df, self.products_df, left_on="productSku", right_on="sku", how="left")
        # Compute the expected total amount using the product's price and the bill's quantity.
        data_df["expected_total"] = data_df["price"] * data_df["quantity"]
        # Compute the difference between the actual total_amount and the expected_total.
        data_df["difference"] = data_df["totalAmount"] - data_df["expected_total"]
        return data_df

    def fit_models(self):
        # For anomaly detection, we select a few numeric features.
        features = ["quantity", "totalAmount", "difference"]
        X = self.data_df[features].values
        X_scaled = self.scaler.fit_transform(X)

        # Fit Isolation Forest
        self.iso_forest.fit(X_scaled)

        # Fit Autoencoder
        history = self.autoencoder.fit(
            X_scaled, X_scaled,
            epochs=50,
            batch_size=32,
            shuffle=True,
            validation_split=0.1,
            verbose=0
        )

        # Compute the reconstruction error (MSE) for each sample.
        reconstructions = self.autoencoder.predict(X_scaled)
        mse = np.mean(np.power(X_scaled - reconstructions, 2), axis=1)
        self.data_df["autoencoder_mse"] = mse

        # Define a threshold for anomalies, e.g., the 95th percentile of reconstruction errors.
        self.threshold = np.percentile(mse, 95)
        self.data_df["auto_anomaly"] = mse > self.threshold

        # Flag a transaction as anomalous if either model flags it.
        iso_preds = self.iso_forest.predict(X_scaled)
        self.data_df["iso_anomaly"] = (iso_preds == -1)
        self.data_df["anomaly_flag"] = self.data_df["iso_anomaly"] | self.data_df["auto_anomaly"]

    def build_autoencoder(self):
        input_dim = 3  # Number of features
        encoding_dim = 2  # Compressed representation size

        input_layer = Input(shape=(input_dim,))
        encoder = Dense(encoding_dim, activation="relu",
                        activity_regularizer=regularizers.l1(1e-5))(input_layer)
        decoder = Dense(input_dim, activation='linear')(encoder)

        autoencoder = Model(inputs=input_layer, outputs=decoder)
        autoencoder.compile(optimizer='adam', loss='mse')
        return autoencoder

    def detect_anomaly(self, new_bill_record):
        # Retrieve product information using the sku from the new bill record.
        sku_value = new_bill_record["sku"]
        product_info = self.products_df[self.products_df["sku"] == sku_value]
        if product_info.empty:
            raise ValueError("SKU not found in the products data.")

        # Get the product price and compute expected_total.
        product_price = product_info.iloc[0]["price"]
        quantity = new_bill_record["quantity"]
        total_amount = new_bill_record["total_amount"]
        expected_total = product_price * quantity
        difference = total_amount - expected_total

        # Create a feature vector.
        features_new = np.array([[quantity, total_amount, difference]])
        features_new_scaled = self.scaler.transform(features_new)

        # Isolation Forest detection.
        iso_score = self.iso_forest.decision_function(features_new_scaled)[0]
        iso_pred = self.iso_forest.predict(features_new_scaled)[0]  # 1 for normal, -1 for anomaly

        # Autoencoder reconstruction error.
        reconstruction = self.autoencoder.predict(features_new_scaled)
        auto_error = np.mean(np.power(features_new_scaled - reconstruction, 2))

        # Flag as anomaly if either model indicates an issue.
        is_anomaly = (iso_pred == -1) or (auto_error > self.threshold)

        return {
            "iso_score": iso_score,
            "iso_prediction": iso_pred,
            "autoencoder_error": auto_error,
            "is_anomaly": is_anomaly,
            "anomalous_transactions": self.get_all_anomalies()
        }

    def get_all_anomalies(self):
        """Get all transactions flagged as anomalous from historical data."""
        return self.data_df[self.data_df["anomaly_flag"]].to_dict('records')

