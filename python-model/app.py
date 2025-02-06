from flask import Flask, jsonify, request
from flask_cors import CORS
from pymongo import MongoClient
from model import ComprehensiveRecommendationModel
from customer import AdvancedCustomerAnalytics
from discount import ExpiryManagementSystem
import json
from bson import ObjectId
import pandas as pd

class JSONEncoder(json.JSONEncoder):
    def default(self, o):
        if isinstance(o, ObjectId):
            return str(o)
        return json.JSONEncoder.default(self, o)

app = Flask(__name__)
CORS(app)
app.json_encoder = JSONEncoder

# MongoDB Connection
client = MongoClient('mongodb://localhost:27017/')
db = client['ims']
bills_collection = db['bills']
products_collection = db['products']
market_demand_collection = db['market_demand']

@app.route('/inventory-recommendations', methods=['GET'])
def get_inventory_recommendations():
    # Fetch data from MongoDB
    bills_data = list(bills_collection.find())
    products_data = list(products_collection.find())
    market_demand_data = list(market_demand_collection.find())
    
    # Initialize and run recommendation model
    recommender = ComprehensiveRecommendationModel(bills_data, products_data, market_demand_data)
    inventory_recs = recommender.generate_comprehensive_recommendations()
    
    return jsonify(inventory_recs)

@app.route('/product-bundles', methods=['GET'])
def get_product_bundles():
    # Fetch data from MongoDB
    bills_data = list(bills_collection.find())
    products_data = list(products_collection.find())
    market_demand_data = list(market_demand_collection.find())
    
    # Initialize and run recommendation model
    recommender = ComprehensiveRecommendationModel(bills_data, products_data, market_demand_data)
    bundle_recs = recommender.recommend_product_bundles()
    
    return jsonify(bundle_recs)

@app.route('/product-recommendation/<sku>', methods=['GET'])
def get_product_recommendation(sku):
    # Fetch data from MongoDB
    bills_data = list(bills_collection.find())
    products_data = list(products_collection.find())
    market_demand_data = list(market_demand_collection.find())
    
    # Initialize recommendation model
    recommender = ComprehensiveRecommendationModel(bills_data, products_data, market_demand_data)
    
    # Get recommendation for specific product
    product_rec = recommender.get_product_recommendation(sku)
    
    if product_rec:
        return jsonify(product_rec)
    else:
        return jsonify({"error": "Product not found"}), 404

@app.route('/customer-insights', methods=['GET'])
def get_customer_insights():
    # Fetch bills data from MongoDB
    bills_data = list(bills_collection.find())
    
    # Initialize customer analytics
    customer_analytics = AdvancedCustomerAnalytics(pd.DataFrame(bills_data))
    insights = customer_analytics.generate_customer_insights()
    
    return jsonify(insights)

@app.route('/customer-segments', methods=['GET'])
def get_customer_segments():
    # Fetch bills data from MongoDB
    bills_data = list(bills_collection.find())
    
    # Initialize customer analytics
    customer_analytics = AdvancedCustomerAnalytics(pd.DataFrame(bills_data))
    segmentation, profiles = customer_analytics.perform_customer_segmentation()
    
    return jsonify({
        'segments': segmentation.to_dict(),
        'profiles': profiles.to_dict()
    })

@app.route('/rfm-analysis', methods=['GET'])
def get_rfm_analysis():
    # Fetch bills data from MongoDB
    bills_data = list(bills_collection.find())
    
    # Initialize customer analytics
    customer_analytics = AdvancedCustomerAnalytics(pd.DataFrame(bills_data))
    rfm = customer_analytics.perform_rfm_analysis()
    
    return jsonify(rfm.to_dict())

@app.route('/purchase-patterns', methods=['GET'])
def get_purchase_patterns():
    # Fetch bills data from MongoDB
    bills_data = list(bills_collection.find())
    
    # Initialize customer analytics
    customer_analytics = AdvancedCustomerAnalytics(pd.DataFrame(bills_data))
    temporal_patterns, rules = customer_analytics.analyze_purchase_patterns()
    
    return jsonify({
        'temporal_patterns': temporal_patterns.to_dict(),
        'association_rules': rules.to_dict()
    })

@app.route('/discount-recommendations', methods=['GET'])
def get_discount_recommendations():
    # Fetch products data from MongoDB
    products_data = list(products_collection.find())
    
    # Initialize expiry management system
    expiry_system = ExpiryManagementSystem(products_data)
    
    # Generate discount report
    discount_report = expiry_system.generate_report()
    
    return jsonify(discount_report)

if __name__ == '__main__':
    app.run(debug=True)