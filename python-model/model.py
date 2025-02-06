import random
import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestRegressor
from sklearn.preprocessing import LabelEncoder
from datetime import datetime, timedelta
from sklearn.metrics.pairwise import cosine_similarity


class ComprehensiveRecommendationModel:
    def __init__(self, bills_data, products_data, market_demand_data):
        self.bills_data = pd.DataFrame(bills_data)
        self.products_data = pd.DataFrame(products_data)
        self.market_demand_data = pd.DataFrame(market_demand_data)

    def preprocess_data(self):
        # Merge bills and products data
        merged_data = pd.merge(
            self.bills_data,
            self.products_data,
            left_on='productSku',
            right_on='sku',
            how='inner'
        )

        # Merge with market demand if available
        if not self.market_demand_data.empty:
            merged_data = pd.merge(
                merged_data,
                self.market_demand_data,
                how='left',
                left_on='productSku',
                right_on='product_sku'
            )

        return merged_data

    def generate_comprehensive_recommendations(self):
        # Preprocess data
        processed_data = self.preprocess_data()

        # Aggregate product-level metrics
        product_metrics = processed_data.groupby('productSku').agg({
            'quantity': ['sum', 'mean'],
            'totalAmount': ['sum', 'mean'],
            'name': 'first',
            'category': 'first',
            'stock': 'first',
            'lowStockThreshold': 'first',
            'price': 'first'
        }).reset_index()
        product_metrics.columns = [
            'sku', 'total_quantity', 'avg_quantity', 
            'total_revenue', 'avg_revenue', 'name', 
            'category', 'current_stock', 'low_stock_threshold', 'price'
        ]

        # Add market demand score if available
        if 'market_demand_score' in processed_data.columns:
            market_demand = processed_data.groupby('productSku')['market_demand_score'].mean()
            product_metrics['market_demand_score'] = product_metrics['sku'].map(market_demand)
        else:
            product_metrics['market_demand_score'] = [random.randint(25, 95) for _ in range(len(product_metrics))]

        # Predict future demand
        features = [
            'total_quantity', 'avg_quantity', 'total_revenue', 
            'avg_revenue', 'current_stock', 'price', 'market_demand_score'
        ]
        X = product_metrics[features]
        y = product_metrics['total_quantity']

        # Split and train model
        X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
        demand_model = RandomForestRegressor(n_estimators=100, random_state=42)
        demand_model.fit(X_train, y_train)

        # Generate recommendations
        recommendations = []
        for _, product in product_metrics.iterrows():
            # Predict future demand
            predicted_demand = demand_model.predict([
                [product['total_quantity'], product['avg_quantity'], 
                 product['total_revenue'], product['avg_revenue'], 
                 product['current_stock'], product['price'], 
                 product['market_demand_score']]
            ])[0]

            # Calculate recommended stock
            recommended_stock = max(
                product['low_stock_threshold'] * 3,
                int(predicted_demand * 1.5)
            )

            # Determine risk level
            risk_level = self._calculate_risk_level(
                product['current_stock'], 
                recommended_stock, 
                product['market_demand_score']
            )

            # Generate monthly predictions
            monthly_predictions = []
            current_date = datetime.now()
            for i in range(6):  # Next 6 months
                month_date = current_date + timedelta(days=30*i)
                monthly_predictions.append({
                    'month': month_date.strftime('%B'),
                    'predicted_sales': round(predicted_demand * (1 + random.uniform(-0.2, 0.2))),
                    'actual_sales': round(product['avg_quantity'] * (1 + random.uniform(-0.1, 0.1)))
                })

            # Generate yearly trend
            yearly_trend = []
            current_year = datetime.now().year
            for i in range(3):  # Past 3 years
                year = current_year - i
                yearly_trend.append({
                    'year': str(year),
                    'demand_index': round(random.uniform(5, 9), 2)
                })

            recommendations.append({
                'sku': product['sku'],
                'name': product['name'],
                'category': product['category'],
                'current_stock': product['current_stock'],
                'predicted_demand': predicted_demand,
                'recommended_stock': recommended_stock,
                'risk_level': risk_level,
                'market_demand_score': product['market_demand_score'],
                'price': product['price'],
                'monthly_predictions': monthly_predictions,
                'yearly_trend': yearly_trend
            })

        return sorted(recommendations, key=lambda x: x['risk_level'], reverse=True)

    def get_product_recommendation(self, sku):
        # Get all recommendations
        all_recommendations = self.generate_comprehensive_recommendations()
        
        # Find specific product recommendation
        product_rec = next((rec for rec in all_recommendations if rec['sku'] == sku), None)
        
        if product_rec:
            # Get similar products based on category and price range
            similar_products = [
                rec for rec in all_recommendations 
                if rec['sku'] != sku 
                and rec['category'] == product_rec['category']
                and 0.7 * product_rec['price'] <= rec['price'] <= 1.3 * product_rec['price']
            ][:3]
            
            # Add similar products to recommendation
            product_rec['similar_products'] = similar_products
            
            return product_rec
        return None

    def _calculate_risk_level(self, current_stock, recommended_stock, market_demand):
        # Calculate stock risk based on current stock, recommended stock, and market demand
        stock_ratio = current_stock / recommended_stock if recommended_stock > 0 else 0
        
        # Risk calculation considers stock levels and market demand
        if stock_ratio < 0.3:
            return 'HIGH'
        elif stock_ratio < 0.6:
            return 'MEDIUM'
        elif market_demand > 70:
            return 'LOW-WATCH'
        else:
            return 'LOW'

    def recommend_product_bundles(self, min_support=0.01, min_confidence=0.3):
        # Get processed data
        processed_data = self.preprocess_data()
        
        # Create a transaction matrix
        transactions = processed_data.groupby(['billNumber'])['productSku'].agg(list).values.tolist()
        
        # Calculate product co-occurrence matrix
        product_pairs = []
        for transaction in transactions:
            for i in range(len(transaction)):
                for j in range(i + 1, len(transaction)):
                    product_pairs.append((transaction[i], transaction[j]))
        
        # Convert to DataFrame and get counts
        pair_counts = pd.DataFrame(product_pairs, columns=['product1', 'product2']).value_counts()
        
        # Calculate support and confidence
        total_transactions = len(transactions)
        bundles = []
        
        for (prod1, prod2), count in pair_counts.items():
            support = count / total_transactions
            if support >= min_support:
                # Calculate confidence both ways
                prod1_count = sum(1 for t in transactions if prod1 in t)
                prod2_count = sum(1 for t in transactions if prod2 in t)
                
                conf1 = count / prod1_count
                conf2 = count / prod2_count
                
                if conf1 >= min_confidence or conf2 >= min_confidence:
                    prod1_details = self.products_data[self.products_data['sku'] == prod1].iloc[0]
                    prod2_details = self.products_data[self.products_data['sku'] == prod2].iloc[0]
                    
                    bundles.append({
                        'products': [
                            {'sku': prod1, 'name': prod1_details['name']},
                            {'sku': prod2, 'name': prod2_details['name']}
                        ],
                        'support': support,
                        'confidence': max(conf1, conf2),
                        'bundle_price': float(prod1_details['price'] + prod2_details['price']),
                        'suggested_discount': 0.1  # 10% discount for bundles
                    })
        
        return sorted(bundles, key=lambda x: x['confidence'], reverse=True)