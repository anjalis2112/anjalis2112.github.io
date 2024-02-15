from flask import Flask, request, jsonify
from flask_cors import CORS
import requests
from datetime import datetime
from dateutil.relativedelta import relativedelta

app = Flask(__name__)
CORS(app)

API_KEY = "cn4rrc1r01qgb8m674g0cn4rrc1r01qgb8m674gg"
API_KEY_POLYGON = "mtPTlyDLSn3iRxUVJsclL6rB3ZvHUyh0"


@app.route('/stock/profile', methods=['GET'])
def get_stock_profile():
    symbol = request.args.get('symbol')

    if symbol:
        url = f"https://finnhub.io/api/v1/stock/profile2?symbol={symbol}&token={API_KEY}"
        response = requests.get(url)

        if response.status_code == 200:
            return response.json()
        else:
            return jsonify({'error': 'Failed to fetch data from Finnhub API'})
    else:
        return jsonify({'error': 'Symbol parameter is missing'})


@app.route('/stock/summary', methods=['GET'])
def get_stock_summary():
    symbol = request.args.get('symbol')

    if symbol:
        url = f"https://finnhub.io/api/v1/quote?symbol={symbol}&token={API_KEY}"
        response = requests.get(url)

        if response.status_code == 200:
            return response.json()
        else:
            return jsonify({'error': 'Failed to fetch data from Finnhub API'})
    else:
        return jsonify({'error': 'Symbol parameter is missing'})


@app.route('/stock/recommendation-trends', methods=['GET'])
def get_recommendation_trends():
    symbol = request.args.get('symbol')

    if symbol:
        url = f"https://finnhub.io/api/v1/stock/recommendation?symbol={symbol}&token={API_KEY}"
        response = requests.get(url)

        if response.status_code == 200:
            return response.json()
        else:
            return jsonify({'error': 'Failed to fetch data from Finnhub API'})
    else:
        return jsonify({'error': 'Symbol parameter is missing'})


@app.route('/stock/company-news', methods=['GET'])
def get_company_news():
    symbol = request.args.get('symbol')

    if symbol:
        thirty_days_ago = datetime.now() - relativedelta(days=30)
        date_thirty_days_ago = thirty_days_ago.strftime("%Y-%m-%d")

        current_date = datetime.now().strftime("%Y-%m-%d")
        url = f"https://finnhub.io/api/v1/company-news?symbol={symbol}&from={date_thirty_days_ago}&to={current_date}&token={API_KEY}"
        response = requests.get(url)

        if response.status_code == 200:
            return response.json()
        else:
            return jsonify({'error': 'Failed to fetch data from Finnhub API'})
    else:
        return jsonify({'error': 'Symbol parameter is missing'})


@app.route('/stock/chart-data', methods=['GET'])
def get_chart_data():
    symbol = request.args.get('symbol')

    if symbol:
        multiplier = 1
        timespan = "day"
        six_months_one_day_ago = datetime.now() - relativedelta(months=6, days=1)
        date_six_months_one_day_ago = six_months_one_day_ago.strftime(
            "%Y-%m-%d")
        current_date = datetime.now().strftime("%Y-%m-%d")
        added_string = "adjusted=true&sort=asc&apiKey=" + API_KEY_POLYGON
        url = f"https://api.polygon.io/v2/aggs/ticker/{symbol}/range/{multiplier}/{timespan}/{date_six_months_one_day_ago}/{current_date}?{added_string}"
        response = requests.get(url)

        if response.status_code == 200:
            return response.json()
        else:
            return jsonify({'error': 'Failed to fetch data from Polygon API'})
    else:
        return jsonify({'error': 'Symbol parameter is missing'})


if __name__ == '__main__':
    app.run(debug=True)
