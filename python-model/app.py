from flask import Flask, jsonify, request
from flask_cors import CORS
from pymongo import MongoClient
from model import ComprehensiveRecommendationModel
from customer import AdvancedCustomerAnalytics
from discount import ExpiryManagementSystem
from supplier import SupplierAnalysis
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
suppliers_collection = db['supplier']

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

@app.route('/monthly-predictions/<sku>', methods=['GET'])
def get_monthly_predictions(sku):
    # Fetch data from MongoDB
    bills_data = list(bills_collection.find())
    products_data = list(products_collection.find())
    market_demand_data = list(market_demand_collection.find())
    
    # Initialize recommendation model
    recommender = ComprehensiveRecommendationModel(bills_data, products_data, market_demand_data)
    
    # Get recommendation for specific product
    product_rec = recommender.get_product_recommendation(sku)
    
    if product_rec and 'monthly_predictions' in product_rec:
        return jsonify(product_rec['monthly_predictions'])
    else:
        return jsonify({"error": "Monthly predictions not found"}), 404

@app.route('/yearly-trend/<sku>', methods=['GET'])
def get_yearly_trend(sku):
    # Fetch data from MongoDB
    bills_data = list(bills_collection.find())
    products_data = list(products_collection.find())
    market_demand_data = list(market_demand_collection.find())
    
    # Initialize recommendation model
    recommender = ComprehensiveRecommendationModel(bills_data, products_data, market_demand_data)
    
    # Get recommendation for specific product
    product_rec = recommender.get_product_recommendation(sku)
    
    if product_rec and 'yearly_trend' in product_rec:
        return jsonify(product_rec['yearly_trend'])
    else:
        return jsonify({"error": "Yearly trend not found"}), 404

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
    
    return jsonify({
        'rfm_score': rfm['rfm_score'].to_dict(),
        'recency': rfm['recency'].to_dict(),
        'frequency': rfm['frequency'].to_dict(),
        'monetary': rfm['monetary'].to_dict(),
        'value_segment': rfm['value_segment'].to_dict()
    })

@app.route('/supplier-analysis', methods=['GET'])
def get_supplier_analysis():
    # Fetch supplier data from MongoDB
    supplier_data = list(suppliers_collection.find())
    
    # Initialize supplier analytics
    supplier_analytics = SupplierAnalysis()
    analysis_results = supplier_analytics.analyze_suppliers(pd.DataFrame(supplier_data))
    
    return jsonify({
        'supplier_metrics': analysis_results['supplier_metrics'].to_dict(),
        'stock_rmse': float(analysis_results['stock_rmse']),
        'performance_distribution': analysis_results['performance_distribution'].to_dict(),
        'model_accuracy': float(analysis_results['model_accuracy'])
    })

@app.route('/churn-prediction', methods=['GET'])
def get_churn_prediction():
    # Fetch bills data from MongoDB
    bills_data = list(bills_collection.find())
    
    # Initialize customer analytics
    customer_analytics = AdvancedCustomerAnalytics(pd.DataFrame(bills_data))
    churn_analysis = customer_analytics.predict_churn()
    
    return jsonify({
        'feature_importance': churn_analysis['feature_importance'].to_dict(),
        'churn_probabilities': churn_analysis['churn_probabilities'].to_dict(),
        'metrics': {
            'auc_score': float(churn_analysis['auc_score']),
            'precision': float(churn_analysis['precision']), 
            'recall': float(churn_analysis['recall'])
        }
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