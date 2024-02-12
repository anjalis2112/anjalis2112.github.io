from flask import Flask, request, jsonify
import requests

app = Flask(__name__)

API_KEY = "cn4rrc1r01qgb8m674g0cn4rrc1r01qgb8m674gg"

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

if __name__ == '__main__':
    app.run(debug=True)
    
    
@app.route('/stock/summary', methods=['GET'])
def get_stock_profile():
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

if __name__ == '__main__':
    app.run(debug=True)
    
@app.route('/stock/recommendation-trends', methods=['GET'])
def get_stock_profile():
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

if __name__ == '__main__':
    app.run(debug=True)
    
@app.route('/stock/company-news', methods=['GET'])
def get_stock_profile():
    symbol = request.args.get('symbol')

    if symbol:
        url = f"https://finnhub.io/api/v1/company-news?symbol=>{symbol}&from=BEFORE_30&to=TODAY &token={API_KEY}"
        response = requests.get(url)

        if response.status_code == 200:
            return response.json()
        else:
            return jsonify({'error': 'Failed to fetch data from Finnhub API'})
    else:
        return jsonify({'error': 'Symbol parameter is missing'})

if __name__ == '__main__':
    app.run(debug=True)


