import React, { useState, useEffect } from "react";
import { fetchCryptoByYear } from "../services/api"; // Función para obtener datos de criptomonedas por año
import { BsCalendarDate } from "react-icons/bs"; // Icono para el selector de año
import { FaCoins, FaSpinner } from "react-icons/fa"; // Iconos para dinero y cargando
import Footer from "../components/Footer";

const YearlyCrypto = () => {
  const [year, setYear] = useState("2020"); // Año por defecto
  const [cryptos, setCryptos] = useState([]);
  const [loading, setLoading] = useState(true); // Estado para mostrar la animación de carga

  // Arreglo de degradados para las cartas
  const gradients = [
    "from-pink-400 to-purple-500",  // Rosa vibrante a morado
    "from-teal-400 to-cyan-500",    // Verde azulado a cian
    "from-blue-400 to-indigo-500",  // Azul a morado
    "from-yellow-400 to-orange-500",// Amarillo cálido a naranja
    "from-green-400 to-teal-500",   // Verde a verde azulado
    "from-indigo-400 to-pink-500",  // Morado a rosa
    "from-lime-400 to-pink-500",    // Verde limón a rosa fuerte
    "from-purple-400 to-indigo-600",// Morado a morado más profundo
    "from-red-400 to-yellow-500",   // Rojo cálido a amarillo
    "from-rose-400 to-yellow-400",  // Rosa fuerte a amarillo cálido
    "from-blue-300 to-teal-400",    // Azul claro a verde azulado
    "from-cyan-400 to-teal-600",    // Cian más fuerte a verde azulado
  ];
  
  // Obtener las criptomonedas para el año seleccionado
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true); // Comienza la carga de datos
      const response = await fetchCryptoByYear(year);
      setCryptos(response.data.data); // Asumimos que la respuesta tiene un atributo `data` con las criptos
      setLoading(false); // Finaliza la carga de datos
    };
    fetchData();
  }, [year]);

  return (
    <div className="py-12 px-6 bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen">
      {/* Título */}
      <h1 className="text-4xl font-extrabold text-center text-gray-800 mb-6">
        MarketCaps de Criptomonedas en el Año {year}
      </h1>

      {/* Filtro de Año */}
      <div className="flex justify-center mb-12">
        <div className="flex items-center border-2 border-blue-600 rounded-lg p-2 bg-gradient-to-r from-blue-500 to-indigo-500 shadow-lg">
          <BsCalendarDate className="text-white text-2xl mr-3" />
          <select
            className="bg-transparent p-3 text-lg text-white font-semibold rounded-md focus:outline-none appearance-none"
            value={year}
            onChange={(e) => setYear(e.target.value)}
          >
            {[
              "2015", "2016", "2017", "2018", "2019", "2020", "2021", "2022", "2023", "2024"
            ].map((yr) => (
              <option key={yr} value={yr} className="bg-gray-900 text-white">
                {yr}
              </option>
            ))}
          </select>
          <div className="absolute right-0 mr-3">
            <BsCalendarDate className="text-white text-2xl" />
          </div>
        </div>
      </div>

      {/* Listado de Criptomonedas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8 max-w-6xl mx-auto">
        {loading ? (
          // Mostrar el spinner de carga mientras los datos se están obteniendo
          <div className="col-span-full flex justify-center items-center">
            <FaSpinner className="animate-spin text-4xl text-blue-600" />
          </div>
        ) : (
          cryptos.map((crypto, index) => (
            <div
              key={index}
              className={`p-6 rounded-xl shadow-xl transform transition-transform duration-500 ease-in-out hover:scale-105 hover:shadow-2xl hover:opacity-90 bg-gradient-to-br ${
                gradients[index % gradients.length]
              }`}
            >
              {/* Icono genérico */}
              <div className="flex justify-center mb-4">
                <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-lg">
                  <FaCoins size={40} className="text-blue-600" />
                </div>
              </div>

              {/* Nombre de la Cripto */}
              <h2 className="text-2xl font-semibold text-white mb-3 text-center">
                {crypto.coin_name}
              </h2>

              {/* Información de Market Cap */}
              <p className="text-lg text-white text-center mt-2">
                <span className="font-bold">Market Cap: </span>$ 
                {crypto.market_cap.toLocaleString()}
              </p>
            </div>
          ))
        )}
      </div>

      {/* Pie de Página */}
      <Footer />
    </div>
  );
};

export default YearlyCrypto;