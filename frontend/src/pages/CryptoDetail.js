import React, { useState, useEffect } from "react";
import { fetchAllNames, fetchDetailedCryptoData } from "../services/api"; 
import { Line } from "react-chartjs-2";
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from "chart.js";
import { FaSpinner } from "react-icons/fa";
import { BsCalendarDate } from "react-icons/bs";
import { FiTrendingUp, FiTrendingDown, FiDatabase } from "react-icons/fi";
import { MdDateRange } from "react-icons/md";
import { FaCoins } from "react-icons/fa";
import Footer from "../components/Footer";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

const CryptoDetail = () => {
  const [coins, setCoins] = useState([]); // Lista de criptomonedas
  const [selectedCoin, setSelectedCoin] = useState(""); // Criptomoneda seleccionada
  const [startDate, setStartDate] = useState(""); // Fecha de inicio
  const [endDate, setEndDate] = useState(""); // Fecha de fin
  const [data, setData] = useState(null); // Datos de la criptomoneda
  const [loading, setLoading] = useState(false); // Estado de carga
  const [error, setError] = useState(null); // Estado de error

  // Cargar las criptomonedas disponibles
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const response = await fetchAllNames();
        setCoins(response.data); // Asumiendo que esta función devuelve un array de nombres de criptos
      } catch (err) {
        setError("Error al cargar las criptomonedas.");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Obtener los datos de la criptomoneda según las fechas y la moneda seleccionada
  const handleFetchData = async () => {
    if (!selectedCoin || !startDate || !endDate) {
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const response = await fetchDetailedCryptoData(selectedCoin, startDate, endDate); 
      setData(response.data);
    } catch (err) {
      setError("No hay información para los datos ingresados.");
    } finally {
      setLoading(false);
    }
  };

  // Formato de las fechas para la API
  const handleDateChange = (date, type) => {
    const formattedDate = new Date(date).toISOString().split("T")[0]; // Formato YYYY-MM-DD
    if (type === "start") {
      setStartDate(formattedDate);
    } else {
      setEndDate(formattedDate);
    }
  };

  // Función para generar los datos de la gráfica
  const generateChartData = (data) => {
    const labels = data.map(item => new Date(item.date).toLocaleDateString()); // Extraemos las fechas
    const prices = data.map(item => item.price); // Extraemos los precios

    return {
      labels,
      datasets: [{
        label: "Precio de la Criptomoneda",
        data: prices,
        fill: false,
        borderColor: "#4CAF50", // Color verde para la línea
        tension: 0.3,
      }],
    };
  };

  return (
    <div className="bg-gray-50 min-h-screen p-8">
      {/* Encabezado */}
      <header className="text-center mb-8">
        <h1 className="text-5xl font-bold text-yellow-500 flex justify-center items-center">
          <FaCoins className="mr-3" />
          {selectedCoin ? `Detalle de ${selectedCoin}` : "Seleccione una Criptomoneda"}
        </h1>
        <p className="text-gray-600 text-lg mt-2">
          Información detallada sobre la criptomoneda seleccionada.
        </p>
      </header>

      {/* Filtros de selección */}
      <div className="flex justify-center mt-8 space-x-4 mb-6">
        <div className="flex items-center">
          <BsCalendarDate className="text-blue-600 text-2xl mr-2" />
          <select
            className="bg-white p-3 text-lg text-black font-semibold rounded-md shadow-md focus:outline-none"
            value={selectedCoin}
            onChange={(e) => setSelectedCoin(e.target.value)}
          >
            <option value="">Selecciona una Criptomoneda</option>
            {coins.map((coin, index) => (
              <option key={index} value={coin}>{coin}</option>
            ))}
          </select>
        </div>

        <div className="flex items-center">
          <label htmlFor="start-date" className="text-lg mr-2 text-gray-600">Fecha Inicio</label>
          <input
            type="date"
            id="start-date"
            className="p-3 text-lg text-black rounded-md shadow-md"
            onChange={(e) => handleDateChange(e.target.value, "start")}
          />
        </div>

        <div className="flex items-center">
          <label htmlFor="end-date" className="text-lg mr-2 text-gray-600">Fecha Fin</label>
          <input
            type="date"
            id="end-date"
            className="p-3 text-lg text-black rounded-md shadow-md"
            onChange={(e) => handleDateChange(e.target.value, "end")}
          />
        </div>

        <button
          onClick={handleFetchData}
          className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 shadow-md"
        >
          Buscar Datos
        </button>
      </div>

      {/* Mensaje de error */}
      {error && <div className="text-center text-red-600 text-xl">{error}</div>}

      {/* Spinner de carga */}
        {loading && (
            <div className="flex justify-center items-center">
                <FaSpinner className="text-4xl text-blue-500 animate-spin" />
            </div>
        )}

      {/* Mostrar la gráfica solo después de hacer la búsqueda */}
      {data && !loading && !error && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Resumen de la criptomoneda seleccionada */}
          <div className="bg-white p-6 rounded-lg shadow-lg border-l-4 border-yellow-500 lg:col-span-1">
            <h2 className="text-2xl font-semibold text-gray-800 flex items-center">
              <FiDatabase className="mr-2 text-yellow-500" /> Resumen
            </h2>
            <div className="text-gray-600 mt-4 space-y-2">
              <div>
                <MdDateRange className="inline mr-2 text-blue-500" />
                <strong>Fecha de inicio:</strong> {startDate}
              </div>
              <div>
                <MdDateRange className="inline mr-2 text-blue-500" />
                <strong>Fecha de fin:</strong> {endDate}
              </div>
              <div>
                <FiTrendingUp className="inline mr-2 text-green-500" />
                <strong>Precio inicial:</strong> ${data?.summary?.initial_price?.toFixed(2)}
              </div>
              <div>
                <FiTrendingDown className="inline mr-2 text-red-500" />
                <strong>Precio final:</strong> ${data?.summary?.final_price?.toFixed(2)}
              </div>
              <div>
                <FaCoins className="inline mr-2 text-yellow-500" />
                <strong>Variación del precio:</strong> {data?.summary?.price_change_percentage?.toFixed(2)}%
              </div>
            </div>
          </div>

          {/* Gráfico de la criptomoneda seleccionada */}
          <div className="bg-white p-6 rounded-lg shadow-lg lg:col-span-2">
            <h2 className="text-2xl font-semibold text-gray-800 flex items-center">
              <FiTrendingUp className="mr-2 text-green-500" /> Precio de la Criptomoneda
              por Periodo
            </h2>
            {loading ? (
              <div className="flex justify-center items-center">
                <FaSpinner className="text-4xl text-blue-500 animate-spin" />
              </div>
            ) : (
              <Line data={generateChartData(data?.data || [])} options={{ 
                responsive: true, 
                scales: {
                  x: {
                    grid: { display: false },
                    ticks: { color: "#333" },
                  },
                  y: {
                    grid: { display: false },
                    ticks: { color: "#333" },
                  },
                },
              }} />
            )}
          </div>
        </div>
      )}
      {data == null && (
        /* Mostrar que no se encontraron datos para lo indicado*/
        <div className="text-center text-gray-600 text-xl">No hay información para los datos ingresados.</div>
      )}
      <Footer />
    </div>
  );
};

export default CryptoDetail;
