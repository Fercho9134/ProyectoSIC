from flask import Flask
from routes import crypto_routes

app = Flask(__name__)
app.register_blueprint(crypto_routes.bp)

if __name__ == "__main__":
    app.run(debug=True)
