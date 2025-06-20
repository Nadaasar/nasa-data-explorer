import { useState, useEffect } from 'react';
import { Calendar, AlertTriangle, Zap, TrendingUp, Search } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import LoadingSpinner from './ui/LoadingSpinner';
import { neoAPI } from '../lib/api';

const NearEarthObjects = () => {
  const [neoData, setNeoData] = useState(null);
  const [neoStats, setNeoStats] = useState(null);
  const [browsedNeos, setBrowsedNeos] = useState([]);
  const [selectedNeo, setSelectedNeo] = useState(null);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [loading, setLoading] = useState(false);
  const [statsLoading, setStatsLoading] = useState(true);
  const [browseLoading, setBrowseLoading] = useState(false);
  const [error, setError] = useState(null);

  // Get today's date and 7 days ago for default range
  const today = new Date().toISOString().split('T')[0];
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

  useEffect(() => {
    setStartDate(sevenDaysAgo);
    setEndDate(today);
    fetchNeoStats();
    fetchTodayNeos();
    fetchBrowseNeos();
  }, []);

  const fetchNeoStats = async () => {
    try {
      setStatsLoading(true);
      const response = await neoAPI.getStats();
      setNeoStats(response.data.data);
    } catch (error) {
      console.error('Error fetching NEO stats:', error);
    } finally {
      setStatsLoading(false);
    }
  };

  const fetchTodayNeos = async () => {
    try {
      const response = await neoAPI.getToday();
      if (response.data.data.near_earth_objects) {
        const todayKey = Object.keys(response.data.data.near_earth_objects)[0];
        const todayNeos = response.data.data.near_earth_objects[todayKey] || [];
        setNeoData({
          ...response.data.data,
          todayCount: todayNeos.length,
          hazardousCount: todayNeos.filter(neo => neo.is_potentially_hazardous_asteroid).length
        });
      }
    } catch (error) {
      console.error('Error fetching today\'s NEOs:', error);
    }
  };

  const fetchBrowseNeos = async () => {
    try {
      setBrowseLoading(true);
      const response = await neoAPI.browse(0, 20);
      setBrowsedNeos(response.data.data.near_earth_objects || []);
    } catch (error) {
      console.error('Error browsing NEOs:', error);
    } finally {
      setBrowseLoading(false);
    }
  };

  const fetchNeoFeed = async () => {
    if (!startDate || !endDate) {
      setError('Please select both start and end dates.');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const response = await neoAPI.getFeed(startDate, endDate);
      setNeoData(response.data.data);
    } catch (error) {
      console.error('Error fetching NEO feed:', error);
      setError('Failed to load Near Earth Objects. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const fetchNeoDetails = async (neoId) => {
    try {
      const response = await neoAPI.getById(neoId);
      setSelectedNeo(response.data.data);
    } catch (error) {
      console.error('Error fetching NEO details:', error);
    }
  };

  // Prepare chart data
  const getChartData = () => {
    if (!neoData?.near_earth_objects) return [];
    
    return Object.entries(neoData.near_earth_objects).map(([date, neos]) => ({
      date: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      total: neos.length,
      hazardous: neos.filter(neo => neo.is_potentially_hazardous_asteroid).length,
      safe: neos.filter(neo => !neo.is_potentially_hazardous_asteroid).length
    }));
  };

  const getPieData = () => {
    if (!neoStats) return [];
    
    return [
      { name: 'Safe', value: neoStats.sample_size - neoStats.potentially_hazardous_count, color: '#10B981' },
      { name: 'Potentially Hazardous', value: neoStats.potentially_hazardous_count, color: '#EF4444' }
    ];
  };

  const formatDistance = (distance) => {
    const km = parseFloat(distance);
    if (km > 1000000) {
      return `${(km / 1000000).toFixed(2)}M km`;
    }
    return `${km.toLocaleString()} km`;
  };

  const formatDiameter = (diameter) => {
    if (diameter < 1) {
      return `${(diameter * 1000).toFixed(0)}m`;
    }
    return `${diameter.toFixed(2)} km`;
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-yellow-400 to-red-400 bg-clip-text text-transparent">
          Near Earth Objects
        </h1>
        <p className="text-lg text-gray-300 max-w-2xl mx-auto">
          Track asteroids and comets that come close to Earth's orbit. Monitor potentially 
          hazardous objects and explore detailed information about these celestial visitors.
        </p>
      </div>

      {/* Statistics Cards */}
      {statsLoading ? (
        <div className="text-center py-8">
          <LoadingSpinner size="md" />
          <p className="text-gray-300 mt-2">Loading NEO statistics...</p>
        </div>
      ) : neoStats && (
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Total Tracked</p>
                <p className="text-2xl font-bold text-white">{neoStats.total_count?.toLocaleString()}</p>
              </div>
              <Zap className="h-8 w-8 text-blue-400" />
            </div>
          </div>
          
          <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Potentially Hazardous</p>
                <p className="text-2xl font-bold text-red-400">{neoStats.potentially_hazardous_count}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-400" />
            </div>
          </div>
          
          <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Avg Diameter</p>
                <p className="text-2xl font-bold text-green-400">{formatDiameter(neoStats.average_diameter_km)}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-400" />
            </div>
          </div>
          
          <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Largest Object</p>
                <p className="text-2xl font-bold text-purple-400">{formatDiameter(neoStats.largest_diameter_km)}</p>
              </div>
              <Zap className="h-8 w-8 text-purple-400" />
            </div>
          </div>
        </div>
      )}

      {/* Date Range Search */}
      <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
        <h2 className="text-xl font-semibold text-white mb-4 flex items-center">
          <Search className="h-5 w-5 mr-2" />
          Search NEOs by Date Range
        </h2>
        
        <div className="grid md:grid-cols-3 gap-4 items-end">
          <div>
            <label className="block text-sm text-gray-400 mb-2">Start Date</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              max={today}
              className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-yellow-500"
            />
          </div>
          
          <div>
            <label className="block text-sm text-gray-400 mb-2">End Date</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              max={today}
              className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-yellow-500"
            />
          </div>
          
          <button
            onClick={fetchNeoFeed}
            disabled={loading}
            className="px-6 py-2 bg-yellow-600 hover:bg-yellow-700 disabled:bg-gray-600 disabled:opacity-50 text-white rounded-lg transition-colors"
          >
            {loading ? 'Searching...' : 'Search NEOs'}
          </button>
        </div>
        
        <p className="text-sm text-gray-400 mt-2">
          Note: Date range cannot exceed 7 days due to NASA API limitations.
        </p>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-500/20 border border-red-500/30 rounded-lg p-4 text-center">
          <p className="text-red-300">{error}</p>
        </div>
      )}

      {/* Charts */}
      {neoData && getChartData().length > 0 && (
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Daily NEO Count Chart */}
          <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
            <h3 className="text-lg font-semibold text-white mb-4">Daily NEO Count</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={getChartData()}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="date" stroke="#9CA3AF" />
                <YAxis stroke="#9CA3AF" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#1F2937', 
                    border: '1px solid #374151',
                    borderRadius: '8px',
                    color: '#F3F4F6'
                  }} 
                />
                <Bar dataKey="safe" stackId="a" fill="#10B981" name="Safe" />
                <Bar dataKey="hazardous" stackId="a" fill="#EF4444" name="Potentially Hazardous" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Hazard Distribution Pie Chart */}
          <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
            <h3 className="text-lg font-semibold text-white mb-4">Hazard Distribution</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={getPieData()}
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {getPieData().map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#1F2937', 
                    border: '1px solid #374151',
                    borderRadius: '8px',
                    color: '#F3F4F6'
                  }} 
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* NEO List */}
      {neoData?.near_earth_objects && (
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-white">
            Near Earth Objects ({Object.values(neoData.near_earth_objects).flat().length} found)
          </h2>
          
          <div className="space-y-4">
            {Object.entries(neoData.near_earth_objects).map(([date, neos]) => (
              <div key={date} className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                  <Calendar className="h-5 w-5 mr-2" />
                  {new Date(date).toLocaleDateString('en-US', { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })} ({neos.length} objects)
                </h3>
                
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {neos.map((neo) => (
                    <div 
                      key={neo.id} 
                      className="bg-white/5 rounded-lg p-4 border border-white/10 hover:border-white/20 transition-all cursor-pointer"
                      onClick={() => fetchNeoDetails(neo.id)}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="font-semibold text-white text-sm">{neo.name}</h4>
                        {neo.is_potentially_hazardous_asteroid && (
                          <AlertTriangle className="h-4 w-4 text-red-400 flex-shrink-0" />
                        )}
                      </div>
                      
                      <div className="space-y-1 text-xs text-gray-300">
                        <div>
                          <span className="text-gray-400">Diameter: </span>
                          {formatDiameter(neo.estimated_diameter.kilometers.estimated_diameter_min)} - {formatDiameter(neo.estimated_diameter.kilometers.estimated_diameter_max)}
                        </div>
                        {neo.close_approach_data[0] && (
                          <div>
                            <span className="text-gray-400">Miss Distance: </span>
                            {formatDistance(neo.close_approach_data[0].miss_distance.kilometers)}
                          </div>
                        )}
                        <div>
                          <span className="text-gray-400">Velocity: </span>
                          {parseFloat(neo.close_approach_data[0]?.relative_velocity.kilometers_per_hour).toLocaleString()} km/h
                        </div>
                      </div>
                      
                      <button className="mt-2 text-yellow-400 hover:text-yellow-300 text-xs font-medium">
                        View Details →
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Browse NEOs */}
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-white">Browse All NEOs</h2>
        
        {browseLoading ? (
          <div className="text-center py-8">
            <LoadingSpinner size="md" />
            <p className="text-gray-300 mt-2">Loading NEO database...</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {browsedNeos.map((neo) => (
              <div 
                key={neo.id} 
                className="bg-white/5 backdrop-blur-sm rounded-lg p-4 border border-white/10 hover:border-white/20 transition-all cursor-pointer"
                onClick={() => fetchNeoDetails(neo.id)}
              >
                <div className="flex items-start justify-between mb-2">
                  <h4 className="font-semibold text-white text-sm">{neo.name}</h4>
                  {neo.is_potentially_hazardous_asteroid && (
                    <AlertTriangle className="h-4 w-4 text-red-400 flex-shrink-0" />
                  )}
                </div>
                
                <div className="space-y-1 text-xs text-gray-300">
                  <div>
                    <span className="text-gray-400">Diameter: </span>
                    {formatDiameter(neo.estimated_diameter.kilometers.estimated_diameter_min)} - {formatDiameter(neo.estimated_diameter.kilometers.estimated_diameter_max)}
                  </div>
                  <div>
                    <span className="text-gray-400">Approaches: </span>
                    {neo.close_approach_data.length} recorded
                  </div>
                </div>
                
                <button className="mt-2 text-yellow-400 hover:text-yellow-300 text-xs font-medium">
                  View Details →
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* NEO Details Modal */}
      {selectedNeo && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-gray-900 rounded-xl p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto border border-white/10">
            <div className="flex items-start justify-between mb-4">
              <h3 className="text-xl font-bold text-white">{selectedNeo.name}</h3>
              <button
                onClick={() => setSelectedNeo(null)}
                className="text-gray-400 hover:text-white"
              >
                ✕
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold text-white mb-2">Basic Information</h4>
                  <div className="space-y-2 text-sm">
                    <div>
                      <span className="text-gray-400">NASA JPL URL: </span>
                      <a href={selectedNeo.nasa_jpl_url} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300">
                        View on NASA JPL
                      </a>
                    </div>
                    <div>
                      <span className="text-gray-400">Potentially Hazardous: </span>
                      <span className={selectedNeo.is_potentially_hazardous_asteroid ? 'text-red-400' : 'text-green-400'}>
                        {selectedNeo.is_potentially_hazardous_asteroid ? 'Yes' : 'No'}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-semibold text-white mb-2">Size Estimates</h4>
                  <div className="space-y-2 text-sm">
                    <div>
                      <span className="text-gray-400">Diameter (km): </span>
                      <span className="text-white">
                        {formatDiameter(selectedNeo.estimated_diameter.kilometers.estimated_diameter_min)} - {formatDiameter(selectedNeo.estimated_diameter.kilometers.estimated_diameter_max)}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-400">Diameter (m): </span>
                      <span className="text-white">
                        {selectedNeo.estimated_diameter.meters.estimated_diameter_min.toFixed(0)} - {selectedNeo.estimated_diameter.meters.estimated_diameter_max.toFixed(0)} m
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div>
                <h4 className="font-semibold text-white mb-2">Close Approaches ({selectedNeo.close_approach_data.length})</h4>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {selectedNeo.close_approach_data.slice(0, 5).map((approach, index) => (
                    <div key={index} className="bg-white/5 rounded p-3 text-sm">
                      <div className="grid md:grid-cols-2 gap-2">
                        <div>
                          <span className="text-gray-400">Date: </span>
                          <span className="text-white">{new Date(approach.close_approach_date).toLocaleDateString()}</span>
                        </div>
                        <div>
                          <span className="text-gray-400">Miss Distance: </span>
                          <span className="text-white">{formatDistance(approach.miss_distance.kilometers)}</span>
                        </div>
                        <div>
                          <span className="text-gray-400">Velocity: </span>
                          <span className="text-white">{parseFloat(approach.relative_velocity.kilometers_per_hour).toLocaleString()} km/h</span>
                        </div>
                        <div>
                          <span className="text-gray-400">Orbiting Body: </span>
                          <span className="text-white">{approach.orbiting_body}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="text-center py-12">
          <LoadingSpinner size="lg" />
          <p className="text-gray-300 mt-4">Loading Near Earth Objects...</p>
        </div>
      )}
    </div>
  );
};

export default NearEarthObjects;

