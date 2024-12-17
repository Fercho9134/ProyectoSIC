import pandas as pd
from utils.data_loader import load_data
from flask import jsonify

def get_summary():
    data = load_data()
    summary = {
        "total_cryptos": len(data['coin_name'].unique()),
        "average_price": data['price'].mean()
    }
    return jsonify(summary), 200

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
    print("#########################")
    print(data)
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


def get_top_cryptos_by_year(crypto_data, year):
    # Filtrar los datos por el año
    crypto_data['date'] = pd.to_datetime(crypto_data['date'])
    print("Crypto data:")
    year_data = crypto_data[crypto_data['date'].dt.year == int(year)]

    print("Year data:")
    print(year_data)

    # Calcular la variación porcentual de precio para cada criptomoneda
    top_cryptos = []
    for coin_name in year_data['coin_name'].unique():
        coin_data = year_data[year_data['coin_name'] == coin_name]
        first_price = coin_data.iloc[0]['price']
        last_price = coin_data.iloc[-1]['price']
        price_change = ((last_price - first_price) / first_price) * 100
        top_cryptos.append({'coin_name': coin_name, 'price_change': price_change})
    
    # Ordenar por la mayor variación porcentual
    top_cryptos_sorted = sorted(top_cryptos, key=lambda x: abs(x['price_change']), reverse=True)
    
    # Seleccionar las 4 más interesantes (con mayor cambio)
    return top_cryptos_sorted[:4]

def get_most_interesting_data(request):
    data = request.json
    year = data.get('year')
    
    if not year:
        return jsonify({"message": "Missing required field: year"}), 400

    # Cargar los datos
    crypto_data = load_data() 

    # Obtener las 4 criptomonedas más interesantes
    top_cryptos = get_top_cryptos_by_year(crypto_data, year)


    # Preparar los datos para devolver
    top_cryptos_data = []
    for coin in top_cryptos:
        coin_name = coin['coin_name']
        coin_data = crypto_data[crypto_data['coin_name'] == coin_name]
        coin_data = coin_data[coin_data['date'].dt.year == int(year)]
        coin_prices = coin_data[['date', 'price']].copy()
        coin_prices['date'] = coin_prices['date'].dt.strftime('%Y-%m-%d')  # Convertir a string en formato YYYY-MM-DD
        coin_prices = coin_prices.to_dict(orient='records')
        
        top_cryptos_data.append({
            'coin_name': coin_name,
            'price_change': coin['price_change'],
            'data': coin_prices
        })

    # Devolver los datos en formato JSON
    return jsonify({
        "year": year,
        "top_cryptos": top_cryptos_data
    }), 200


def get_crypto_with_lowest_std_dev(crypto_data, year):
    # Filtrar los datos por el año
    crypto_data['date'] = pd.to_datetime(crypto_data['date'])
    year_data = crypto_data[crypto_data['date'].dt.year == int(year)]

    # Calcular la desviación estándar para cada criptomoneda
    coin_std_devs = []
    for coin_name in year_data['coin_name'].unique():
        coin_data = year_data[year_data['coin_name'] == coin_name]
        std_dev = coin_data['price'].std()
        coin_std_devs.append({'coin_name': coin_name, 'std_dev': std_dev})

    # Encontrar la criptomoneda con la menor desviación estándar
    lowest_std_dev_coin = min(coin_std_devs, key=lambda x: x['std_dev'])

    return lowest_std_dev_coin

def get_cryptos_above_global_mean(crypto_data, year):
    # Filtrar los datos por el año

    print("Bitcoin")
    print(crypto_data[crypto_data['coin_name'] == 'WRAPPED-BITCOIN'])
    crypto_data['date'] = pd.to_datetime(crypto_data['date'])
    year_data = crypto_data[crypto_data['date'].dt.year == int(year)]

    # Calcular la media de precios para cada criptomoneda en el año
    coin_means = []
    for coin_name in year_data['coin_name'].unique():
        coin_data = year_data[year_data['coin_name'] == coin_name]
        mean_price = coin_data['price'].mean()
        coin_means.append({'coin_name': coin_name, 'mean_price': mean_price})
        


    # Calcular la media global de todas las criptomonedas
    global_mean = pd.Series([coin['mean_price'] for coin in coin_means]).mean()

    # Filtrar las criptomonedas cuyo precio medio está por encima de la media global
    above_global_mean = [coin for coin in coin_means if coin['mean_price'] > global_mean]

    print("Above global mean:")
    print(above_global_mean)


    # Devolver la media global y las criptomonedas por encima de la media
    return global_mean, above_global_mean


def get_crypto_data_and_stats_for_year(request):
    data = request.json
    year = data.get('year')
    
    if not year:
        return jsonify({"message": "Missing required field: year"}), 400

    # Cargar los datos
    crypto_data = load_data()  # Asume que tienes una función para cargar los datos

    # Obtener la criptomoneda con la menor desviación estándar
    lowest_std_dev_coin = get_crypto_with_lowest_std_dev(crypto_data, year)

    # Obtener las criptomonedas por encima de la media global
    global_mean, above_global_mean = get_cryptos_above_global_mean(crypto_data, year)

    # Preparar los datos para devolver
    top_cryptos_data = []
    for coin in above_global_mean:
        coin_name = coin['coin_name']
        coin_data = crypto_data[crypto_data['coin_name'] == coin_name]
        coin_data = coin_data[coin_data['date'].dt.year == int(year)]
        
        # Convertir la fecha a formato YYYY-MM-DD
        coin_prices = coin_data[['date', 'price']].copy()
        coin_prices['date'] = coin_prices['date'].dt.strftime('%Y-%m-%d')  # Convertir a string en formato YYYY-MM-DD
        
        coin_prices = coin_prices.to_dict(orient='records')  # Convertir a lista de diccionarios
        
        top_cryptos_data.append({
            'coin_name': coin_name,
            'mean_price': coin['mean_price'],
            'data': coin_prices
        })

    # Devolver los datos en formato JSON
    return jsonify({
        "year": year,
        "lowest_std_dev_coin": lowest_std_dev_coin,
        "global_mean": global_mean,
        "top_cryptos": top_cryptos_data
    }), 200


def get_most_volatile_and_stable(request):
    crypto_data = load_data()
    data = request.json
    year = data.get('year')
    # Filtrar los datos por el año
    crypto_data['date'] = pd.to_datetime(crypto_data['date'])
    year_data = crypto_data[crypto_data['date'].dt.year == int(year)]

    # Calcular la desviación estándar para cada criptomoneda en el año
    coin_std_devs = []
    for coin_name in year_data['coin_name'].unique():
        coin_data = year_data[year_data['coin_name'] == coin_name]
        std_dev = coin_data['price'].std()
        coin_std_devs.append({'coin_name': coin_name, 'std_dev': std_dev})

    # Encontrar la criptomoneda más volátil (con mayor desviación estándar)
    most_volatile_coin = max(coin_std_devs, key=lambda x: x['std_dev'])

    # Encontrar la criptomoneda más estable (con menor desviación estándar)
    most_stable_coin = min(coin_std_devs, key=lambda x: x['std_dev'])

    # Obtener el historial de precios de las criptomonedas más volátil y estable
    volatile_coin_data = year_data[year_data['coin_name'] == most_volatile_coin['coin_name']]
    stable_coin_data = year_data[year_data['coin_name'] == most_stable_coin['coin_name']]

    # Convertir las fechas a formato 'YYYY-MM-DD' para hacer más fácil graficar
    volatile_coin_data = volatile_coin_data[['date', 'price']]
    stable_coin_data = stable_coin_data[['date', 'price']]

    volatile_coin_data['date'] = volatile_coin_data['date'].dt.strftime('%Y-%m-%d')
    stable_coin_data['date'] = stable_coin_data['date'].dt.strftime('%Y-%m-%d')

    # Convertir a lista de diccionarios para poder devolver
    volatile_coin_data = volatile_coin_data.to_dict(orient='records')
    stable_coin_data = stable_coin_data.to_dict(orient='records')

    # Devolver los resultados en un formato adecuado para el frontend
    return jsonify({
        "year": year,
        "most_volatile_coin": most_volatile_coin,
        "most_stable_coin": most_stable_coin,
        "volatile_coin_data": volatile_coin_data,
        "stable_coin_data": stable_coin_data
    }), 200

from flask import jsonify

def returnAllNames():
    data = load_data()
    names = data['coin_name'].unique().tolist()
    names.sort()
    return jsonify(names), 200
