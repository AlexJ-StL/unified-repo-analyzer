
from flask import Flask, jsonify
import requests

app = Flask(__name__)

@app.route('/')
def hello():
  return jsonify({'message': 'Hello from Python!'})

@app.route('/data')
def get_data():
    try:
        response = requests.get('https://api.example.com/data')
        response.raise_for_status()
        return jsonify(response.json())
    except requests.exceptions.RequestException as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True)
