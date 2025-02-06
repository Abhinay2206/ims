import pandas as pd
from datetime import datetime, timedelta
import numpy as np

class ExpiryManagementSystem:
    def __init__(self, data):
        """Initialize the system with product data"""
        self.df = pd.DataFrame(data)
        self.df['manufacturing_date'] = pd.to_datetime(self.df['manufacturing_date'])
        self.df['expiry_date'] = pd.to_datetime(self.df['expiry_date'])
        self.today = pd.Timestamp('2025-02-05')  # Current date

    def calculate_risk_scores(self):
        """Calculate risk scores for products based on multiple factors"""
        # Calculate days until expiry
        self.df['days_until_expiry'] = (self.df['expiry_date'] - self.today).dt.days

        # Calculate stock ratio (current stock vs low stock threshold)
        self.df['stock_ratio'] = self.df['stock'] / self.df['lowStockThreshold']

        # Calculate risk score (0-100, higher means higher risk of waste)
        self.df['risk_score'] = 100 * (
            # More weight to items closer to expiry
            0.5 * (1 - self.df['days_until_expiry'] / self.df['days_until_expiry'].max()) +
            # More weight to items with high stock compared to threshold
            0.3 * (self.df['stock_ratio'] / self.df['stock_ratio'].max()) +
            # More weight to higher priced items
            0.2 * (self.df['price'] / self.df['price'].max())
        )

        return self.df

    def suggest_discounts(self, risk_threshold=60):
        """Suggest discounts based on risk scores"""
        high_risk = self.df[self.df['risk_score'] >= risk_threshold].copy()
        
        # Check for expired products first
        expired_mask = high_risk['days_until_expiry'] <= 0
        high_risk.loc[expired_mask, 'suggested_discount'] = -1  # Flag for expired products
        
        # Calculate discounts only for non-expired products
        non_expired_mask = ~expired_mask
        high_risk.loc[non_expired_mask, 'suggested_discount'] = np.where(
            high_risk.loc[non_expired_mask, 'days_until_expiry'] <= 1, 70,
            np.where(
                high_risk.loc[non_expired_mask, 'days_until_expiry'] <= 4, 50,
                np.where(
                    high_risk.loc[non_expired_mask, 'days_until_expiry'] <= 7, 20, 5
                )
            )
        )

        return high_risk

    def generate_report(self):
        """Generate a comprehensive report of at-risk products and recommendations"""
        self.calculate_risk_scores()
        high_risk_products = self.suggest_discounts()

        report = {
            'summary': {
                'total_products': len(self.df),
                'high_risk_products': len(high_risk_products),
                'total_inventory_value': self.df['price'].sum(),
                'at_risk_value': high_risk_products['price'].sum()
            },
            'recommendations': []
        }

        # Generate specific recommendations for each high-risk product
        for _, product in high_risk_products.iterrows():
            recommendation = {
                'name': product['name'],
                'sku': product['sku'],
                'category': product['category'],
                'current_stock': product['stock'],
                'days_until_expiry': product['days_until_expiry'],
                'risk_score': round(product['risk_score'], 2),
                'suggested_discount': product['suggested_discount'],
                'current_price': product['price'],
            }
            
            # Handle expired products
            if product['days_until_expiry'] <= 0:
                recommendation['status'] = "EXPIRED - DO NOT SELL"
                recommendation['discounted_price'] = None
            else:
                recommendation['status'] = "Active"
                recommendation['discounted_price'] = round(product['price'] * (1 - product['suggested_discount']/100), 2)
                
            report['recommendations'].append(recommendation)

        return report

