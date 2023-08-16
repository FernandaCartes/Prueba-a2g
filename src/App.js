import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';

function Dashboard({ platforms, token, sensorRecords, setSensorRecords }) {
  const [selectedPlatformId, setSelectedPlatformId] = useState(null);
  const [showSensorsModal, setShowSensorsModal] = useState(false);

  useEffect(() => {
    // Obtener detalles de sensores 
    platforms.forEach(platform => {
      const platformId = platform.id;
      if (!sensorRecords[platformId]) {
        axios.get(`https://devtest.a2g.io/api/Platforms/${platformId}`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        })
        .then(response => {
          setSensorRecords(prevRecords => ({
            ...prevRecords,
            [platformId]: response.data.data
          }));
        })
        .catch(error => {
          console.error('Error fetching platform details:', error);
        });
      }
    });
  }, [platforms, sensorRecords, setSensorRecords, token]);

  const handleViewSensors = (platformId) => {
    setSelectedPlatformId(platformId);
    setShowSensorsModal(true);
  };

  const handleCloseSensorsModal = () => {
    setSelectedPlatformId(null);
    setShowSensorsModal(false);
  };

  // Cálculos de totales para la vista del dashboard
  const totalPlatforms = platforms.length;
  const totalSensors = platforms.reduce((total, platform) => total + (sensorRecords[platform.id]?.sensors.length || 0), 0);
  const totalFleets = platforms.reduce((total, platform) => {
    if (!total.includes(platform.fleet)) {
      total.push(platform.fleet);
    }
    return total;
  }, []).length;

  return (
    <div className="dashboard-container">
      <div className="total-row">
        <div className="total-box">
          <div className="total-label">Total de Plataformas</div>
          <div className="total-number">{totalPlatforms}</div>
        </div>
        <div className="total-box">
          <div className="total-label">Total de Sensores</div>
          <div className="total-number">{totalSensors}</div>
        </div>
        <div className="total-box">
          <div className="total-label">Total de Flotas</div>
          <div className="total-number">{totalFleets}</div>
        </div>
      </div>

      <div className="platform-rows">
        <div className="platform-row">
          {platforms.slice(0, 5).map(platform => (
            <div key={platform.id} className="platform-card">
              <h3>{platform.name}</h3>
              <p>Flota: {platform.fleet}</p>
              <button onClick={() => handleViewSensors(platform.id)}>Ver Sensores</button>
              <p className="total-sensors">Total de Sensores: {sensorRecords[platform.id]?.sensors.length}</p>
            </div>
          ))}
        </div>
        <div className="platform-row">
          {platforms.slice(5, 10).map(platform => (
            <div key={platform.id} className="platform-card">
              <h3>{platform.name}</h3>
              <p>Flota: {platform.fleet}</p>
              <button onClick={() => handleViewSensors(platform.id)}>Ver Sensores</button>
              <p className="total-sensors">Total de Sensores: {sensorRecords[platform.id]?.sensors.length}</p>
            </div>
          ))}
        </div>
      </div>

      {showSensorsModal && (
        <div className="modal">
          <div className="modal-content">
            <button onClick={handleCloseSensorsModal} className="close-button">
              Cerrar
            </button>
            <h3>Sensores de la Plataforma</h3>
            <ul>
              {sensorRecords[selectedPlatformId]?.sensors.map(sensor => (
                <li key={sensor.id}>
                  {sensor.name} - Tipo: {sensor.type}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}

function App() {
  // Estado para la autenticación y la visualización de datos
  const [token, setToken] = useState('');
  const [platforms, setPlatforms] = useState([]);
  const [selectedPlatform, setSelectedPlatform] = useState(null);
  const [selectedSensorId, setSelectedSensorId] = useState('');
  const [sensorRecords, setSensorRecords] = useState({});
  const [isViewingDetails, setIsViewingDetails] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isViewingDashboard, setIsViewingDashboard] = useState(false);
  const [isViewingPlatformList, setIsViewingPlatformList] = useState(false);
  const [loginError, setLoginError] = useState('');

  // obtener la lista de plataformas al obtener un token válido
  useEffect(() => {
    if (token) {
      axios.get('https://devtest.a2g.io/api/Platforms', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })
      .then(response => {
        setPlatforms(response.data.data);
      })
      .catch(error => {
        console.error('Error fetching platforms:', error);
      });
    }
  }, [token]);

  // click plataforma para ver detalles
  const handlePlatformClick = (platformId) => {
    axios.get(`https://devtest.a2g.io/api/Platforms/${platformId}`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
    .then(response => {
      setSelectedPlatform(response.data.data);
      setIsViewingDetails(true);
      setSensorRecords(prevRecords => ({
        ...prevRecords,
        [platformId]: response.data.data 
      }));
    })
    .catch(error => {
      console.error('Error fetching platform details:', error);
    });
  };

  // botón "Atrás" en la vista de detalles
  const handleGoBack = () => {
    setIsViewingDetails(false);
    setSelectedPlatform(null);
    setSelectedSensorId('');
    setSensorRecords({});
  };

  // botón de cierre de sesión
  const handleLogout = () => {
    setToken('');
    setPlatforms([]);
    setSelectedPlatform(null);
    setSelectedSensorId('');
    setSensorRecords({});
    setIsViewingDetails(false);
    setEmail('');
    setPassword('');
  };

  // Manejo del inicio de sesión
  const handleLogin = () => {
    if (email && password) {
      axios.post('https://devtest.a2g.io/api/Auth', {
        email: email,
        password: password
      })
      .then(response => {
        setToken(response.data.token);
        setLoginError(''); // Limpiar el mensaje de error si el inicio de sesión es exitoso
      })
      .catch(error => {
        console.error('Error authenticating:', error);
        setLoginError('Credenciales incorrectas'); // Establecer el mensaje de error en caso de fallo
      });
    } else {
      setLoginError('Por favor, ingresa un correo y una contraseña');
    }
  };

  // click botón para ver el dashboard
  const handleDashboardClick = () => {
    setIsViewingDashboard(!isViewingDashboard);
  };

  // click botón para ver la lista de plataformas
  const handlePlatformListClick = () => {
    setIsViewingPlatformList(!isViewingPlatformList);
  };

  // obtener registros de sensores al seleccionar un sensor
  useEffect(() => {
    if (selectedPlatform && token && selectedSensorId) {
      axios.get(`https://devtest.a2g.io/api/Records/${selectedSensorId}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })
      .then(response => {
        setSensorRecords(prevRecords => ({
          ...prevRecords,
          [selectedSensorId]: response.data.data
        }));
      })
      .catch(error => {
        console.error('Error fetching sensor records:', error);
      });
    }
  }, [selectedSensorId, selectedPlatform, token]);

  return (
    <div className="App">
      {token && (
        <div className="header-banner">
          <h1>A2G Mini App</h1>
          <div className="header-buttons">
            {isViewingDetails && (
              <button onClick={handleGoBack}>Atrás</button>
            )}
            <button onClick={handleLogout}>Cerrar Sesión</button>
          </div>
        </div>
      )}
      {token ? (
        <div>
          {isViewingDetails ? (
            // Vista detallada de una plataforma
            <div>
              <div className="detail-container">
                <h2>Detalle de Plataforma</h2>
                <p><strong>Nombre:</strong> {selectedPlatform.name}</p>
                <p><strong>Flota:</strong> {selectedPlatform.fleet}</p>
                <img src={selectedPlatform.img} alt={selectedPlatform.name} width="100" />
                <h3>Sensores</h3>
                <select value={selectedSensorId} onChange={(e) => setSelectedSensorId(e.target.value)}>
                  <option value="">Selecciona un sensor...</option>
                  {selectedPlatform.sensors.map(sensor => (
                    <option key={sensor.id} value={sensor.id}>
                      {sensor.name} - Tipo: {sensor.type}
                    </option>
                  ))}
                </select>
                {selectedSensorId && sensorRecords[selectedSensorId] && (
                  <div className="sensor-records-container">
                    <h3>Registros del Sensor - {selectedSensorId}</h3>
                    <table className="sensor-records-table">
                      <thead>
                        <tr>
                          <th>Timestamp</th>
                          <th>Valor</th>
                        </tr>
                      </thead>
                      <tbody>
                        {sensorRecords[selectedSensorId].map(record => (
                          <tr key={record.id}>
                            <td>{record.ts}</td>
                            <td>{record.value}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          ) : (
            // Opciones disponibles en la vista principal
            <div>
              <div className="options-container">
                <h2>Seleccione una opción</h2>
                <button onClick={handlePlatformListClick}>
                  {isViewingPlatformList ? 'Cerrar Lista de Plataformas' : 'Ver Lista de Plataformas'}
                </button>
                {isViewingPlatformList && (
                  <div>
                    <label>Seleccione una plataforma:</label>
                    <select value={selectedPlatform} onChange={(e) => setSelectedPlatform(e.target.value)}>
                      <option value="">Selecciona una plataforma...</option>
                      {platforms.map(platform => (
                        <option key={platform.id} value={platform.id}>
                          {platform.name}
                        </option>
                      ))}
                    </select>
                    {selectedPlatform && (
                      <div>
                        <button onClick={() => handlePlatformClick(selectedPlatform)}>
                          Ver Detalles
                        </button>
                      </div>
                    )}
                  </div>
                )}
                <button onClick={handleDashboardClick} className="dashboard-button">
                  {isViewingDashboard ? 'Cerrar Dashboard' : 'Ver Dashboard'}
                </button>
              </div>
            </div>
          )}

          {isViewingDashboard && (
            // Componente del dashboard
            <Dashboard
              platforms={platforms}
              token={token}
              sensorRecords={sensorRecords}
              setSensorRecords={setSensorRecords}
            />
          )}
        </div>
      ) : (
        // Vista de autenticación
        <div className="auth-container">
          <div className="banner">A2G Mini App</div>
          <h2>Autenticación</h2>
          {loginError && <p className="error-message">{loginError}</p>}
          <div>
            <label>Correo:</label>
            <input type="text" value={email} onChange={e => setEmail(e.target.value)} />
          </div>
          <div>
            <label>Contraseña:</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} />
          </div>
          <button onClick={handleLogin}>Iniciar Sesión</button>
        </div>
      )}
    </div>
  );
}

export default App;





























































