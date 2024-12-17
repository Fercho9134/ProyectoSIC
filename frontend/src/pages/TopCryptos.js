import React, { useState, useEffect } from "react";
import { fetchTopCryptosByYear } from "../services/api"; // Función para obtener las criptomonedas más interesantes por año
import { BsCalendarDate } from "react-icons/bs"; // Icono para el selector de año
import { Line } from "react-chartjs-2"; // Usamos Chart.js para las gráficas
import { FaBitcoin, FaEthereum, FaDollarSign, FaMoneyBillWave } from "react-icons/fa"; // Nuevos iconos relacionados con dinero
import { FaSpinner } from "react-icons/fa"; // Icono de carga
import Footer from "../components/Footer";

// Nuevos gradientes
const gradients = [
  "from-green-400 to-blue-500",
  "from-pink-400 to-yellow-500",
  "from-indigo-600 to-purple-700",
  "from-teal-500 to-cyan-500",
];

// Iconos fijos
const icons = [
  <FaBitcoin />,
  <FaEthereum />,
  <FaDollarSign />,
  <FaMoneyBillWave />
];

const TopCryptos = () => {
  const [year, setYear] = useState("2020"); // Año por defecto
  const [topCryptos, setTopCryptos] = useState([]);
  const [loading, setLoading] = useState(true); // Estado de carga

  // Obtener las criptomonedas top para el año seleccionado
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true); // Comienza la carga
      const response = await fetchTopCryptosByYear(year);
      setTopCryptos(response.data.top_cryptos); // Asumimos que la respuesta tiene un atributo `top_cryptos`
      setLoading(false); // Termina la carga
    };
    fetchData();
  }, [year]);

  // Función para obtener los datos de la gráfica
  const getChartData = (data) => {
    const chartLabels = data.map(point => point.date); // Las fechas serán las etiquetas de la gráfica
    const chartData = data.map(point => point.price); // Los precios serán los datos de la gráfica

    return {
      labels: chartLabels,
      datasets: [
        {
          label: "Precio",
          data: chartData,
          fill: true, // Rellenar el área bajo la línea
          borderColor: "rgba(0, 0, 0, 0.6)", // Borde más visible
          backgroundColor: "rgba(0, 0, 0, 0.1)", // Fondo de la gráfica más suave
          tension: 0.4, // Curva más suave
          borderWidth: 2,
        },
      ],
    };
  };

  return (
    <div className="py-12 px-6 bg-gray-50 min-h-screen">
      {/* Título */}
      <h1 className="text-4xl font-extrabold text-center text-blue-600 mb-6">
        Las 4 Criptomonedas Más Interesantes en el Año {year}
      </h1>

      {/* Filtro de Año */}
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
              "2015",
              "2016",
              "2017",
              "2018",
              "2019",
              "2020",
              "2021",
              "2022",
              "2023",
              "2024",
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

      {/* Listado de Criptomonedas y sus Gráficas en un grid 2x2 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-8">
        {loading ? (
          <div className="col-span-2 flex justify-center items-center">
            <FaSpinner className="text-4xl text-blue-500 animate-spin" />
          </div>
        ) : (
          topCryptos.map((crypto, index) => (
            <div
              key={index}
              className={`bg-gradient-to-br ${gradients[index]} p-6 rounded-xl shadow-xl transform hover:scale-105 hover:shadow-2xl transition duration-500 ease-in-out`}
            >
              {/* Icono o imagen de criptomoneda */}
              <div className="flex justify-center mb-4">
                <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-lg">
                  {icons[index]} {/* Icono fijo según el índice */}
                </div>
              </div>

              <h2 className="text-2xl font-semibold text-white mb-3 text-center">{crypto.coin_name}</h2>

              {/* Gráfica */}
              <div className="h-64">
                <Line data={getChartData(crypto.data)} options={{
                  responsive: true,
                  plugins: {
                    tooltip: {
                      backgroundColor: "rgba(0,0,0,0.7)",
                      titleColor: "#fff",
                      bodyColor: "#fff",
                    },
                  },
                  scales: {
                    x: {
                      grid: {
                        display: false,
                      },
                    },
                    y: {
                      grid: {
                        display: false,
                      },
                      ticks: {
                        color: "#fff",
                      },
                    },
                  },
                }} />
              </div>
            </div>
          ))
        )}
      </div>

      {/* Pie de Página */}
      <Footer />
    </div>
  );
};

export default TopCryptos;
