import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useState, useEffect } from 'react';
import './App.css';

// Components
import Navbar from './components/Navbar';
import Home from './components/Home';
import APOD from './components/APOD';
import MarsRover from './components/MarsRover';
import NearEarthObjects from './components/NearEarthObjects';
import ImageLibrary from './components/ImageLibrary';
import EarthImages from './components/EarthImages';
import LoadingSpinner from './components/ui/LoadingSpinner';

// API
import { healthAPI } from './lib/api';

function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [apiStatus, setApiStatus] = useState('checking');

  useEffect(() => {
    // Check API health on app load
    const checkAPIHealth = async () => {
      try {
        await healthAPI.check();
        setApiStatus('connected');
      } catch (error) {
        console.error('API health check failed:', error);
        setApiStatus('disconnected');
      } finally {
        setIsLoading(false);
      }
    };

    checkAPIHealth();
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner size="lg" />
          <p className="text-white mt-4 text-lg">Connecting to NASA Data Explorer...</p>
        </div>
      </div>
    );
  }

  return (
    <Router>
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <Navbar apiStatus={apiStatus} />
        
        <main className="container mx-auto px-4 py-8">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/apod" element={<APOD />} />
            <Route path="/mars-rover" element={<MarsRover />} />
            <Route path="/neo" element={<NearEarthObjects />} />
            <Route path="/images" element={<ImageLibrary />} />
            <Route path="/earth" element={<EarthImages />} />
          </Routes>
        </main>

        {/* API Status Banner */}
        {apiStatus === 'disconnected' && (
          <div className="fixed bottom-4 right-4 bg-red-600 text-white px-4 py-2 rounded-lg shadow-lg">
            <p className="text-sm">⚠️ API Connection Lost</p>
          </div>
        )}
      </div>
    </Router>
  );
}

export default App;

