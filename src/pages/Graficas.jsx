import React, { useState, useEffect, useCallback } from 'react';
import { Line, Scatter } from 'react-chartjs-2';
import { 
  Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend 
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

const API_BASE_URL_ROOT = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';
const API_BASE_URL = `${API_BASE_URL_ROOT}/kpis`;

export default function Graficas() {
  const [selectedYear, setSelectedYear] = useState(2024); 
  const [availableYears, setAvailableYears] = useState([]);
  const [lineData, setLineData] = useState(null);
  const [scatterData, setScatterData] = useState(null);
  const [isLoadingCorrelation, setIsLoadingCorrelation] = useState(false);

  // Lógica para cargar la gráfica de Correlación (Scatter)
  const fetchCorrelationData = useCallback(async (year) => {
    setIsLoadingCorrelation(true);
    try {
      const res = await fetch(`${API_BASE_URL}/correlation-data?year=${year}`);
      const data = await res.json(); 

      if (!Array.isArray(data)) {
        console.error("Error: correlation data is not an array.", data);
        setScatterData({ datasets: [] });
        return; 
      }

      setScatterData({
        datasets: [{
          label: '', // ✅ Sin label para evitar leyenda
          data: data, 
          backgroundColor: 'rgba(3, 110, 250, 0.61)',
          pointRadius: 6,
          pointHoverRadius: 8
        }],
      });

    } catch (error) {
      console.error("Error fetching correlation data:", error);
      setScatterData({ datasets: [] });
    } finally {
      setIsLoadingCorrelation(false);
    }
  }, []); 

  // useEffect Principal: Carga la evolución global (Línea) y los años disponibles
  useEffect(() => {
    const fetchEvolutionAndYears = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/global-evolution`);
        const data = await res.json();
        
        if (!Array.isArray(data) || data.length === 0) {
          console.warn("No se encontraron datos de evolución global.");
          return; 
        }

        // Obtener Años y establecer estado
        const years = data.map(item => item.year).sort((a, b) => b - a);
        setAvailableYears(years);
        
        let initialYear = years.length > 0 ? years[0] : 2024;
        setSelectedYear(initialYear); 
        
        // Formato para Line Chart
        setLineData({
          labels: data.map(item => item.year.toString()),
          datasets: [{
            label: 'Promedio Global de Felicidad',
            data: data.map(item => item.score),
            borderColor: '#118ab2ff',
            backgroundColor: 'rgba(53, 162, 235, 0.5)',
            tension: 0.4
          }],
        });
        
        // Iniciar la carga de la gráfica de dispersión con el año inicial
        fetchCorrelationData(initialYear);

      } catch (error) {
        console.error("Error en la carga inicial de datos de gráficas:", error);
      }
    };

    fetchEvolutionAndYears();
  }, [fetchCorrelationData]); 

  // useEffect para cambio de año: Solo llama a la función de dispersión
  useEffect(() => {
    if (selectedYear && availableYears.length > 0) {
      fetchCorrelationData(selectedYear);
    }
  }, [selectedYear, availableYears, fetchCorrelationData]);
  
  // Opciones de Configuración (Chart.js)
  const lineOptions = {
    responsive: true, 
    maintainAspectRatio: false, 
    plugins: { 
      legend: { 
        position: 'top',
        labels: {
          font: {
            size: window.innerWidth < 768 ? 10 : 12
          },
          padding: window.innerWidth < 768 ? 10 : 15
        }
      }, 
      title: { 
        display: true, 
        text: 'Evolución del promedio global de felicidad (2015–2024)',
        font: {
          size: window.innerWidth < 768 ? 14 : 16
        }
      },
      tooltip: {
        mode: 'index',
        intersect: false,
        callbacks: {
          label: function(context) {
            return `Promedio: ${context.parsed.y}`;
          }
        }
      }
    }, 
    scales: { 
      x: { 
        type: 'category',
        ticks: {
          font: {
            size: window.innerWidth < 768 ? 10 : 12
          }
        }
      },
      y: {
        ticks: {
          font: {
            size: window.innerWidth < 768 ? 10 : 12
          }
        }
      }
    } 
  };

  const scatterOptions = {
    responsive: true, 
    maintainAspectRatio: false,
    interaction: {
      mode: 'nearest',
      intersect: true
    },
    plugins: { 
      legend: { 
        display: false // ✅ Totalmente oculta
      }, 
      title: { 
        display: true, 
        text: `Relación entre el PIB Per cápita y el índice de felicidad (${selectedYear})`,
        font: {
          size: window.innerWidth < 768 ? 14 : 16
        }
      },
      tooltip: {
        enabled: true,
        displayColors: false, // ✅ Quita el cuadro de color en tooltip
        callbacks: {
          title: function() {
            return ''; // ✅ Sin título
          },
          label: function(context) {
            const point = context.raw;
            return `PIB: ${point.x.toFixed(2)} | Felicidad: ${point.y.toFixed(2)}`;
          }
        }
      }
    }, 
    scales: { 
      x: { 
        type: 'linear', 
        position: 'bottom', 
        title: { 
          display: true, 
          text: 'PIB per cápita',
          font: {
            size: window.innerWidth < 768 ? 11 : 13
          }
        },
        ticks: {
          font: {
            size: window.innerWidth < 768 ? 10 : 12
          }
        }
      }, 
      y: { 
        type: 'linear', 
        title: { 
          display: true, 
          text: 'Índice de felicidad',
          font: {
            size: window.innerWidth < 768 ? 11 : 13
          }
        },
        ticks: {
          font: {
            size: window.innerWidth < 768 ? 10 : 12
          }
        }
      } 
    } 
  };
  
  const handleYearChange = (e) => setSelectedYear(parseInt(e.target.value));

  // Renderizado
  return (
    <div style={{ 
      padding: "clamp(15px, 3vw, 20px)", 
      maxWidth: "1600px", 
      margin: "0 auto" 
    }}>
      <h1 style={{ 
        fontSize: "clamp(1.3rem, 4vw, 1.8rem)", 
        color: "#333", 
        fontFamily: "sans-serif",
        marginBottom: "1.5rem"
      }}>
        Gráficas de Análisis Detallado
      </h1>
      
      {/* GRÁFICA DE LÍNEA: Evolución Global */}
      <div style={{ 
        background: "white", 
        padding: "clamp(15px, 3vw, 20px)", 
        borderRadius: "16px", 
        boxShadow: "0 4px 12px rgba(0,0,0,0.05)", 
        marginBottom: '40px' 
      }}>
        <h2 style={{ 
          fontSize: "clamp(1.1rem, 3vw, 1.5rem)",
          marginBottom: "15px"
        }}>
          Evolución del promedio global de felicidad
        </h2>
        <div style={{ 
          height: 'clamp(300px, 50vh, 400px)',
          width: '100%'
        }}> 
          {lineData ? (
            <Line options={lineOptions} data={lineData} />
          ) : (
            <p>Cargando datos de evolución global...</p>
          )}
        </div>
      </div>

      <hr style={{ 
        border: 'none', 
        borderTop: '1px solid #e5e7eb', 
        margin: '30px 0' 
      }} />

      {/* GRÁFICA DE DISPERSIÓN: Correlación PIB vs Felicidad */}
      <div style={{ 
        background: "white", 
        padding: "clamp(15px, 3vw, 20px)", 
        borderRadius: "16px", 
        boxShadow: "0 4px 12px rgba(0,0,0,0.05)", 
        marginTop: '40px' 
      }}>
        <h2 style={{ 
          fontSize: "clamp(1.1rem, 3vw, 1.5rem)", 
          margin: "0 0 15px 0" 
        }}>
          Relación PIB vs Felicidad
        </h2>
        
        {/* Selector de Año */}
        <div style={{ 
          marginBottom: '20px', 
          display: 'flex', 
          flexDirection: window.innerWidth < 768 ? 'column' : 'row',
          alignItems: window.innerWidth < 768 ? 'stretch' : 'center', 
          gap: '10px' 
        }}>
          <label htmlFor="year-select" style={{ 
            color: "#666",
            fontSize: "0.9rem"
          }}>
            Selecciona el Año:
          </label>
          <select 
            id="year-select" 
            value={selectedYear} 
            onChange={handleYearChange}
            style={{ 
              padding: '8px 12px', 
              borderRadius: '8px', 
              border: '1px solid #ccc',
              fontSize: '0.9rem',
              cursor: 'pointer',
              backgroundColor: 'white'
            }}
            disabled={availableYears.length === 0}
          >
            {availableYears.map(year => (
              <option key={year} value={year}>{year}</option>
            ))}
          </select>
        </div>

        {/* Gráfica */}
        <div style={{ 
          height: 'clamp(300px, 50vh, 400px)',
          width: '100%'
        }}> 
          {isLoadingCorrelation ? (
            <p>Cargando correlación para el año {selectedYear}...</p>
          ) : (
            scatterData && scatterData.datasets.length > 0 && scatterData.datasets[0].data.length > 0 ? (
              <Scatter options={scatterOptions} data={scatterData} />
            ) : (
              <p>No se encontraron datos de correlación para el año {selectedYear}.</p>
            )
          )}
        </div>
      </div>
    </div>
  );
}