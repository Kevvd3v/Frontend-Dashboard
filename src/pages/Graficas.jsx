import React, { useState, useEffect, useCallback } from 'react';
import { Line, Scatter } from 'react-chartjs-2';
import { 
    Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend 
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

// Define la URL base usando la variable de entorno de Vite.
// Esto permite que el Frontend use la URL de Render en producción y localhost en desarrollo.
const API_BASE_URL = import.meta.env.VITE_API_URL + "/api/kpis";

export default function Graficas() {
    const [selectedYear, setSelectedYear] = useState(2024); 
    const [availableYears, setAvailableYears] = useState([]);
    const [lineData, setLineData] = useState(null);
    const [scatterData, setScatterData] = useState(null);
    const [isLoadingCorrelation, setIsLoadingCorrelation] = useState(false);

    // -----------------------------------------------------------
    // Lógica para cargar la gráfica de Correlación (Scatter)
    // -----------------------------------------------------------
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
                    label: `Relación PIB vs. Felicidad (${year})`,
                    data: data, 
                    backgroundColor: 'rgba(3, 110, 250, 0.61)',
                    pointRadius: 6
                }],
            });

        } catch (error) {
            console.error("Error fetching correlation data:", error);
            setScatterData({ datasets: [] });
        } finally {
            setIsLoadingCorrelation(false);
        }
    }, []); 

    // -----------------------------------------------------------
    // useEffect Principal: Carga la evolución global (Línea) y los años disponibles
    // -----------------------------------------------------------
    useEffect(() => {
        const fetchEvolutionAndYears = async () => {
            try {
                // 1. Cargar Evolución Global
                const res = await fetch(`${API_BASE_URL}/global-evolution`);
                const data = await res.json();
                
                if (!Array.isArray(data) || data.length === 0) {
                    console.warn("No se encontraron datos de evolución global.");
                    return; 
                }

                // 2. Obtener Años y establecer estado
                const years = data.map(item => item.year).sort((a, b) => b - a);
                setAvailableYears(years);
                
                let initialYear = years.length > 0 ? years[0] : 2024;
                setSelectedYear(initialYear); 
                
                // 3. Formato para Line Chart
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
                
                // 4. Iniciar la carga de la gráfica de dispersión con el año inicial
                fetchCorrelationData(initialYear);

            } catch (error) {
                console.error("Error en la carga inicial de datos de gráficas:", error);
            }
        };

        fetchEvolutionAndYears();
    }, [fetchCorrelationData]); 

    // -----------------------------------------------------------
    // useEffect para cambio de año: Solo llama a la función de dispersión
    // -----------------------------------------------------------
    useEffect(() => {
        // Ejecutar si el año cambia Y ya tenemos años disponibles
        if (selectedYear && availableYears.length > 0) {
            fetchCorrelationData(selectedYear);
        }
    }, [selectedYear, availableYears, fetchCorrelationData]);
    
    // --- Opciones de Configuración (Chart.js) ---
    const lineOptions = { /* ... (Opciones de la Gráfica de Línea) ... */
        responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'top' }, title: { display: true, text: 'Evolución del promedio global de felicidad (2015–2024)' } }, scales: { x: { type: 'category' } } 
    };

    const scatterOptions = { /* ... (Opciones de la Gráfica de Dispersión) ... */
        responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'top' }, title: { display: true, text: `Relación entre el PIB Per cápita y el índice de felicidad` } }, scales: { x: { type: 'linear', position: 'bottom', title: { display: true, text: 'x (PIB per cápita)' } }, y: { type: 'linear', title: { display: true, text: 'y (Índice de felicidad)' } } } 
    };
    
    const handleYearChange = (e) => setSelectedYear(parseInt(e.target.value));

    // --- Renderizado ---
    return (
        <div className="graficas-page" style={{ padding: '20px', maxWidth: "1600px", margin: "0 auto" }}>
            <h1 style={{ fontSize: "1.8rem", color: "#333", fontFamily: "sans-serif" }}>Gráficas de Análisis Detallado</h1>
            
            {/* GRÁFICA DE LÍNEA: Evolución Global */}
            <div className="chart-card" style={{ background: "white", padding: "20px", borderRadius: "16px", boxShadow: "0 4px 12px rgba(0,0,0,0.05)", marginBottom: '40px' }}>
                <div style={{ height: '350px' }}> 
                    <h2 style={{ fontSize: "1.5rem" }}>Evolución del promedio global de felicidad</h2>
                    {lineData ? (
                        <Line options={lineOptions} data={lineData} />
                    ) : (
                        <p>Cargando datos de evolución global...</p>
                    )}
                </div>
            </div>

            <hr />

            {/* GRÁFICA DE DISPERSIÓN: Correlación PIB vs Felicidad */}
            <div className="chart-card" style={{ background: "white", padding: "20px", borderRadius: "16px", boxShadow: "0 4px 12px rgba(0,0,0,0.05)", marginTop: '40px' }}>
                <h2 style={{ fontSize: "1.5rem", margin: "0 0 15px 0" }}>Relación PIB vs Felicidad</h2>
                
                {/* Selector de Año */}
                <div style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <label htmlFor="year-select" style={{ color: "#666" }}>Selecciona el Año:</label>
                    <select 
                        id="year-select" 
                        value={selectedYear} 
                        onChange={handleYearChange}
                        style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
                        disabled={availableYears.length === 0}
                    >
                        {availableYears.map(year => (
                            <option key={year} value={year}>{year}</option>
                        ))}
                    </select>
                </div>

                {/* Gráfica */}
                <div style={{ height: '350px' }}> 
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