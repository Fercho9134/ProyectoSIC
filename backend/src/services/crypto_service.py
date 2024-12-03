import pandas as pd
from utils.data_loader import load_data
from flask import jsonify

def get_summary():
    data = load_data()
    summary = {
        "total_cryptos": len(data['coin_name'].unique()),
        "average_price": data['price'].mean()
    }
    return summary

def get_crypto_data(request):
    #Recibe como parametro un json con el coin_name, start_date y end_date
    data = request.json
    coin_name = data.get('coin_name')
    start_date = data.get('start_date')
    end_date = data.get('end_date')
    crypto_data=load_data()

    if not coin_name or not start_date or not end_date:
        return jsonify({"message": "Missing required fields"}), 400
    
    # Filtrar por coin_name
    resultados = crypto_data[crypto_data['coin_name'] == coin_name]

    # Filtrar por rango de fechas
    resultados = resultados[
        (resultados['date'] >= start_date) & (resultados['date'] <= end_date)
    ]

    if resultados.empty:
        return jsonify({'message': f'No data found for {coin_name} in the given date range.'}), 404

    # Calcular el crecimiento o decrecimiento
    primeros_datos = resultados.sort_values(by='date').iloc[0]
    ultimos_datos = resultados.sort_values(by='date').iloc[-1]

    precio_inicial = primeros_datos['price']
    precio_final = ultimos_datos['price']
    variacion = ((precio_final - precio_inicial) / precio_inicial) * 100
    resultados['volume_market_cap_ratio'] = resultados['total_volume'] / resultados['market_cap']

    response = {
        'summary': {
            'coin_name': coin_name,
            'start_date': start_date,
            'end_date': end_date,
            'initial_price': precio_inicial,
            'final_price': precio_final,
            'price_change_percentage': variacion,
        },
        'data': resultados.to_dict(orient='records')  # Datos filtrados como lista de diccionarios
    }

    return jsonify(response), 200

def get_crypto_by_date(request):
    data = request.json
    date = data.get('date')
    crypto_data = load_data()

    if not date:
        return jsonify({"message": "Missing required fields"}), 400

    # Filtrar por fecha
    resultados = crypto_data[crypto_data['date'] == date]

    if resultados.empty:
        return jsonify({'message': f'No data found for the given date.'}), 404

    resultados_grouped = resultados.groupby('coin_name').agg({
        "market_cap": "first",
    }).reset_index()

    resultados_grouped = resultados_grouped.sort_values(by='market_cap', ascending=True)

    response = {
        'date': date,
        'data': resultados_grouped.to_dict(orient='records')  # Datos filtrados como lista de diccion
    }

    return jsonify(response), 200


#Me quede con las primeras graficas