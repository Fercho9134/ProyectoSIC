from flask import Blueprint, jsonify, request
from services.crypto_service import get_summary, get_crypto_data, get_crypto_by_date

bp = Blueprint('crypto', __name__, url_prefix='/api/crypto/')

@bp.route('', methods=['GET'])
def get_cryptos():
    #saludamos en json
    return jsonify({"message": "Hello, World!"})

@bp.route('/summary', methods=['GET'])
def summary():
    return jsonify(get_summary())

@bp.route('/data', methods=['POST'])
def rypto_data():
    return get_crypto_data(request)

@bp.route('/date', methods=['POST'])
def crypto_by_date():
    return get_crypto_by_date(request)