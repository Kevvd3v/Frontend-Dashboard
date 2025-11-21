import React, { useState, useEffect } from "react";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Doughnut } from 'react-chartjs-2';
import Mapa from "../pages/Mapa";
import { Smile, HandCoins, Users, Globe } from "lucide-react";

ChartJS.register(ArcElement, Tooltip, Legend);

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';

export default function Resumen() {
  const [year, setYear] = useState(2024);
  const [kpis, setKpis] = useState({ happiness: "-", gdp: "-", social: "-" });
  const [chartData, setChartData] = useState(null);
  const [mapData, setMapData] = useState([]);

  const getColorByScore = (score) => {
    const val = parseFloat(score);
    if (val >= 7.0) return "#0E4F77"; 
    if (val >= 6.0) return "#118ab2ff"; 
    if (val >= 5.5) return "#73C2FB"; 
    if (val >= 4.5) return "#A2D2FF"; 
    return "#ffffffff";
  };

  const REGION_MAPPING = {
    "Western Europe": "Europa", "Central and Eastern Europe": "Europa", "Commonwealth of Independent States": "Europa",
    "North America": "Norteamérica", "Oceania": "Oceanía",
    "Latin America and Caribbean": "Latinoamérica",
    "East Asia": "Asia", "Southeast Asia": "Asia", "South Asia": "Asia",
    "Middle East and North Africa": "África y M. Oriente", "Sub-Saharan Africa": "África y M. Oriente"
  };

  const agruparYTraducir = (labels, values) => {
    const grupos = {};
    labels.forEach((labelIngles, index) => {
      const grupoEsp = REGION_MAPPING[labelIngles] || "Otros"; 
      if (grupoEsp === "Otros") return; 
      const valor = values[index];
      if (!grupos[grupoEsp]) grupos[grupoEsp] = { sum: 0, count: 0 };
      grupos[grupoEsp].sum += valor;
      grupos[grupoEsp].count += 1;
    });
    const newLabels = Object.keys(grupos);
    const newValues = newLabels.map(grupo => {
      const promedio = grupos[grupo].sum / grupos[grupo].count;
      return Number(promedio.toFixed(2));
    });
    return { newLabels, newValues };
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const resKpis = await fetch(`${API_BASE_URL}/kpis/summary?year=${year}`);
        const dataKpis = await resKpis.json();
        setKpis({
          happiness: dataKpis.happiness ? Number(dataKpis.happiness).toFixed(2) : "-",
          gdp: dataKpis.gdp ? Number(dataKpis.gdp).toFixed(2) : "-",
          social: dataKpis.social ? Number(dataKpis.social).toFixed(2) : "-"
        });

        const resChart = await fetch(`${API_BASE_URL}/kpis/happiness-by-region?year=${year}`);
        const dataChart = await resChart.json();
        const { newLabels, newValues } = agruparYTraducir(dataChart.labels, dataChart.values);
        const dynamicColors = newValues.map(score => getColorByScore(score));

        setChartData({
          labels: newLabels,
          datasets: [{
            data: newValues,
            backgroundColor: dynamicColors,
            borderColor: "#ffffff", borderWidth: 3, hoverOffset: 6
          }]
        });

        const resMap = await fetch(`${API_BASE_URL}/kpis/map-data?year=${year}`);
        const dataMap = await resMap.json();
        setMapData(dataMap);

      } catch (error) { console.error("Error:", error); }
    };
    fetchData();
  }, [year]);

  const handleSliderChange = (e) => setYear(e.target.value);

  const chartOptions = {
    responsive: true, 
    maintainAspectRatio: false, 
    plugins: {
      legend: { 
        display: true, 
        position: 'bottom', 
        labels: { 
          usePointStyle: true, 
          boxWidth: 8, 
          padding: 15, 
          color: '#666', 
          font: {size: 11} 
        } 
      },
      tooltip: { callbacks: { label: (c) => ` ${c.label}: ${c.raw}` } }
    },
    cutout: '70%', 
    layout: { padding: 0 }
  };

  return (
    <div style={{ padding: "20px", maxWidth: "1600px", margin: "0 auto" }}>
      
      <h1 style={{ 
        margin: "0 0 1.5rem 0", 
        fontSize: "clamp(1.3rem, 4vw, 1.8rem)", 
        color: "#333", 
        fontFamily: "sans-serif" 
      }}>
        El Pulso de la Felicidad Mundial (2015–2024)
      </h1>

      {/* LAYOUT PRINCIPAL: Grid adaptativo */}
      <div style={{ 
        display: "grid", 
        gridTemplateColumns: "repeat(12, 1fr)",
        gap: "30px"
      }}>

        {/* COLUMNA IZQUIERDA (ocupa 8 columnas en desktop, 12 en móvil) */}
        <div style={{ 
          gridColumn: "span 12",
          display: "flex", 
          flexDirection: "column", 
          gap: "30px"
        }} className="desktop-col-8">
          
          {/* KPIs - Usando clase CSS para mantener 3 columnas */}
          <div className="kpi-grid">
            <div style={{ 
              background: "linear-gradient(135deg, #5cc4e7ff 0%, #3096d6ff 100%)", 
              color: "white", 
              padding: "20px", 
              borderRadius: "16px", 
              display: "flex", 
              alignItems: "center", 
              gap: "15px", 
              boxShadow: "0 4px 12px rgba(17, 138, 178, 0.3)" 
            }}>
              <div style={{ 
                background: "rgba(255,255,255,0.2)", 
                width: "55px", 
                height: "55px", 
                display: "flex", 
                alignItems: "center", 
                justifyContent: "center", 
                borderRadius: "50%",
                flexShrink: 0
              }}>
                <Smile size={32} color="white" strokeWidth={2} />
              </div>
              <div>
                <p style={{ fontSize: "2.2rem", fontWeight: "bold", margin: 0, lineHeight: 1 }}>{kpis.happiness}</p>
                <p style={{ margin: 0, fontSize: "0.85rem", opacity: 0.9 }}>Promedio global</p>
              </div>
            </div>

            <div style={{ 
              background: "white", 
              padding: "20px", 
              borderRadius: "16px", 
              boxShadow: "0 4px 12px rgba(0,0,0,0.05)", 
              display: "flex", 
              alignItems: "center", 
              gap: "15px" 
            }}>
              <div style={{ 
                background: "#F0F9FF", 
                width: "50px", 
                height: "50px", 
                display: "flex", 
                alignItems: "center", 
                justifyContent: "center", 
                borderRadius: "50%",
                flexShrink: 0
              }}>
                <HandCoins size={28} color="#118AB2" />
              </div>
              <div>
                <p style={{ fontSize: "1.8rem", fontWeight: "bold", margin: 0, color: "#333" }}>{kpis.gdp}</p>
                <p style={{ margin: 0, fontSize: "0.8rem", color: "#666" }}>PIB per cápita</p>
              </div>
            </div>

            <div style={{ 
              background: "white", 
              padding: "20px", 
              borderRadius: "16px", 
              boxShadow: "0 4px 12px rgba(0,0,0,0.05)", 
              display: "flex", 
              alignItems: "center", 
              gap: "15px" 
            }}>
              <div style={{ 
                background: "#F0F9FF", 
                width: "50px", 
                height: "50px", 
                display: "flex", 
                alignItems: "center", 
                justifyContent: "center", 
                borderRadius: "50%",
                flexShrink: 0
              }}>
                <Users size={28} color="#118AB2" />
              </div>
              <div>
                <p style={{ fontSize: "1.8rem", fontWeight: "bold", margin: 0, color: "#333" }}>{kpis.social}</p>
                <p style={{ margin: 0, fontSize: "0.8rem", color: "#666" }}>Apoyo social</p>
              </div>
            </div>
          </div>

          {/* MAPA */}
          <div style={{ 
            background: "white", 
            borderRadius: "16px", 
            boxShadow: "0 4px 12px rgba(0,0,0,0.05)", 
            padding: "20px",
            height: "450px",
            position: "relative", 
            overflow: "hidden" 
          }}>
            <div style={{display:'flex', alignItems:'center', gap:'10px', marginBottom:'10px'}}>
              <Globe size={20} color="#666" />
              <h3 style={{ margin: 0, fontSize: "1.1rem", color: "#333" }}>Mapa Mundial</h3>
            </div>
            
            <Mapa data={mapData} />
            
            <div style={{ 
              position: "absolute", 
              bottom: "20px", 
              left: "20px", 
              background: "rgba(255,255,255,0.95)", 
              padding: "8px 12px", 
              borderRadius: "8px", 
              fontSize: "0.7rem", 
              boxShadow: "0 2px 5px rgba(0,0,0,0.1)" 
            }}>
              <div style={{display:"flex", alignItems:"center", gap:"5px", marginBottom: "3px"}}>
                <span style={{width:8, height:8, borderRadius:"50%", background:"#083272ff"}}></span> Alto (&gt;7.0)
              </div>
              <div style={{display:"flex", alignItems:"center", gap:"5px", marginBottom: "3px"}}>
                <span style={{width:8, height:8, borderRadius:"50%", background:"#3597c5ff"}}></span> Medio (5.5)
              </div>
              <div style={{display:"flex", alignItems:"center", gap:"5px", marginBottom: "3px"}}>
                <span style={{width:8, height:8, borderRadius:"50%", background:"#A2D2FF"}}></span> Bajo (&lt;4.5)
              </div>
              <div style={{display:"flex", alignItems:"center", gap:"5px"}}>
                <span style={{width:8, height:8, borderRadius:"50%", background:"#bec1c4ff"}}></span> N/A
              </div>
            </div>
          </div>
        </div>

        {/* COLUMNA DERECHA: GRÁFICA DE DONA (ocupa 4 columnas en desktop, 12 en móvil) */}
        <div style={{ 
          gridColumn: "span 12"
        }} className="desktop-col-4">
          <div style={{ 
            background: "white", 
            borderRadius: "16px", 
            boxShadow: "0 4px 12px rgba(0,0,0,0.05)", 
            padding: "25px 20px",
            height: "100%",
            minHeight: "500px",
            display: "flex", 
            flexDirection: "column"
          }}>
            <h3 style={{ margin: "0 0 20px 0", fontSize: "1.2rem", color: "#333" }}>
              Felicidad por Región
            </h3>
            
            <div style={{ 
              position: 'relative', 
              flex: 1,
              width: '100%',
              minHeight: '300px',
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              marginBottom: '20px'
            }}>
              <div style={{ 
                position: 'absolute', 
                top: '42%', 
                left: '50%', 
                transform: 'translate(-50%, -50%)', 
                textAlign: 'center', 
                pointerEvents: 'none' 
              }}>
                <span style={{ 
                  fontSize: '2.5rem', 
                  fontWeight: '800', 
                  color: '#0E4F77', 
                  lineHeight: '1' 
                }}>
                  {kpis.happiness}
                </span>
                <span style={{ 
                  fontSize: '0.8rem', 
                  color: '#999', 
                  display: 'block', 
                  fontWeight: '600', 
                  marginTop: '5px', 
                  letterSpacing:'1px' 
                }}>
                  GLOBAL
                </span>
              </div>
              {chartData ? <Doughnut data={chartData} options={chartOptions} /> : <p>Cargando...</p>}
            </div>

            <div style={{ paddingTop: "20px", borderTop: "1px solid #f0f0f0", marginTop: "auto" }}>
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                marginBottom: '10px', 
                fontSize: '0.9rem', 
                color: '#666' 
              }}>
                <span>Año seleccionado:</span>
                <strong style={{color:"#118AB2"}}>{year}</strong>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '0.8rem', color: '#999', flexShrink: 0 }}>2015</span>
                <input 
                  type="range" 
                  min="2015" 
                  max="2024" 
                  step="1" 
                  value={year} 
                  onChange={handleSliderChange} 
                  style={{ 
                    width: "100%", 
                    cursor: "pointer", 
                    accentColor: '#118AB2',
                    height: '4px'
                  }} 
                />
                <span style={{ fontSize: '0.8rem', color: '#999', flexShrink: 0 }}>2024</span>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}