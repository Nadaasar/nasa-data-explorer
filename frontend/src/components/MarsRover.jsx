import { useState, useEffect } from 'react';
import { Calendar, Camera, MapPin, Zap, Filter } from 'lucide-react';
import LoadingSpinner from './ui/LoadingSpinner';
import { marsRoverAPI } from '../lib/api';

const MarsRover = () => {
  const [selectedRover, setSelectedRover] = useState('curiosity');
  const [photos, setPhotos] = useState([]);
  const [roverManifest, setRoverManifest] = useState(null);
  const [selectedCamera, setSelectedCamera] = useState('');
  const [selectedSol, setSelectedSol] = useState('');
  const [selectedEarthDate, setSelectedEarthDate] = useState('');
  const [loading, setLoading] = useState(false);
  const [manifestLoading, setManifestLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);

  const rovers = [
    { name: 'curiosity', displayName: 'Curiosity', status: 'Active', color: 'bg-blue-600' },
    { name: 'perseverance', displayName: 'Perseverance', status: 'Active', color: 'bg-green-600' },
    { name: 'opportunity', displayName: 'Opportunity', status: 'Complete', color: 'bg-orange-600' },
    { name: 'spirit', displayName: 'Spirit', status: 'Complete', color: 'bg-purple-600' }
  ];

  useEffect(() => {
    fetchRoverManifest(selectedRover);
  }, [selectedRover]);

  const fetchRoverManifest = async (rover) => {
    try {
      setManifestLoading(true);
      setError(null);
      const response = await marsRoverAPI.getManifest(rover);
      setRoverManifest(response.data.data.rover);
      
      // Set default sol to latest
      if (response.data.data.rover.max_sol) {
        setSelectedSol(response.data.data.rover.max_sol.toString());
      }
    } catch (error) {
      console.error('Error fetching rover manifest:', error);
      setError('Failed to load rover information.');
    } finally {
      setManifestLoading(false);
    }
  };

  const fetchPhotos = async (page = 1) => {
    if (!selectedSol && !selectedEarthDate) {
      setError('Please select either a Sol (Mars day) or Earth date.');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const response = await marsRoverAPI.getPhotos(
        selectedRover,
        selectedSol || null,
        selectedEarthDate || null,
        selectedCamera || null,
        page
      );
      
      if (page === 1) {
        setPhotos(response.data.data.photos || []);
      } else {
        setPhotos(prev => [...prev, ...(response.data.data.photos || [])]);
      }
      
      setCurrentPage(page);
    } catch (error) {
      console.error('Error fetching Mars rover photos:', error);
      setError('Failed to load Mars rover photos. Please try different parameters.');
    } finally {
      setLoading(false);
    }
  };

  const handleRoverChange = (rover) => {
    setSelectedRover(rover);
    setPhotos([]);
    setSelectedCamera('');
    setSelectedSol('');
    setSelectedEarthDate('');
    setCurrentPage(1);
  };

  const handleSearch = () => {
    setPhotos([]);
    setCurrentPage(1);
    fetchPhotos(1);
  };

  const loadMorePhotos = () => {
    fetchPhotos(currentPage + 1);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-red-400 to-orange-400 bg-clip-text text-transparent">
          Mars Rover Photos
        </h1>
        <p className="text-lg text-gray-300 max-w-2xl mx-auto">
          Explore the Red Planet through the eyes of NASA's Mars rovers. View stunning images 
          captured by Curiosity, Perseverance, Opportunity, and Spirit rovers.
        </p>
      </div>

      {/* Rover Selection */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {rovers.map((rover) => (
          <button
            key={rover.name}
            onClick={() => handleRoverChange(rover.name)}
            className={`p-4 rounded-xl border transition-all duration-300 ${
              selectedRover === rover.name
                ? `${rover.color} border-white/30 text-white`
                : 'bg-white/5 border-white/10 text-gray-300 hover:bg-white/10'
            }`}
          >
            <div className="text-center">
              <h3 className="font-semibold text-lg">{rover.displayName}</h3>
              <p className="text-sm opacity-80">{rover.status}</p>
            </div>
          </button>
        ))}
      </div>

      {/* Rover Info */}
      {manifestLoading ? (
        <div className="text-center py-8">
          <LoadingSpinner size="md" />
          <p className="text-gray-300 mt-2">Loading rover information...</p>
        </div>
      ) : roverManifest && (
        <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-white">{roverManifest.name}</div>
              <div className="text-sm text-gray-400">Rover Name</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-400">{roverManifest.status}</div>
              <div className="text-sm text-gray-400">Status</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-400">{roverManifest.max_sol}</div>
              <div className="text-sm text-gray-400">Max Sol</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-400">{roverManifest.total_photos?.toLocaleString()}</div>
              <div className="text-sm text-gray-400">Total Photos</div>
            </div>
          </div>
          
          <div className="mt-6 grid md:grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-400">Launch Date: </span>
              <span className="text-white">{formatDate(roverManifest.launch_date)}</span>
            </div>
            <div>
              <span className="text-gray-400">Landing Date: </span>
              <span className="text-white">{formatDate(roverManifest.landing_date)}</span>
            </div>
          </div>
        </div>
      )}

      {/* Search Controls */}
      <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
        <h2 className="text-xl font-semibold text-white mb-4 flex items-center">
          <Filter className="h-5 w-5 mr-2" />
          Search Filters
        </h2>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {/* Sol Input */}
          <div>
            <label className="block text-sm text-gray-400 mb-2">Sol (Mars Day)</label>
            <input
              type="number"
              value={selectedSol}
              onChange={(e) => {
                setSelectedSol(e.target.value);
                setSelectedEarthDate(''); // Clear earth date when sol is set
              }}
              min="0"
              max={roverManifest?.max_sol || 1000}
              placeholder="e.g., 1000"
              className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-500"
            />
          </div>

          {/* Earth Date Input */}
          <div>
            <label className="block text-sm text-gray-400 mb-2">Earth Date</label>
            <input
              type="date"
              value={selectedEarthDate}
              onChange={(e) => {
                setSelectedEarthDate(e.target.value);
                setSelectedSol(''); // Clear sol when earth date is set
              }}
              min={roverManifest?.landing_date}
              max={roverManifest?.max_date}
              className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-500"
            />
          </div>

          {/* Camera Selection */}
          <div>
            <label className="block text-sm text-gray-400 mb-2">Camera</label>
            <select
              value={selectedCamera}
              onChange={(e) => setSelectedCamera(e.target.value)}
              className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-500"
            >
              <option value="">All Cameras</option>
              {roverManifest?.cameras?.map((camera) => (
                <option key={camera.name} value={camera.name}>
                  {camera.full_name}
                </option>
              ))}
            </select>
          </div>

          {/* Search Button */}
          <div className="flex items-end">
            <button
              onClick={handleSearch}
              disabled={loading || (!selectedSol && !selectedEarthDate)}
              className="w-full px-4 py-2 bg-red-600 hover:bg-red-700 disabled:bg-gray-600 disabled:opacity-50 text-white rounded-lg transition-colors flex items-center justify-center space-x-2"
            >
              <Camera className="h-4 w-4" />
              <span>{loading ? 'Searching...' : 'Search Photos'}</span>
            </button>
          </div>
        </div>

        {/* Help Text */}
        <p className="text-sm text-gray-400">
          <strong>Sol:</strong> A Martian day (about 24 hours 37 minutes). 
          <strong className="ml-4">Earth Date:</strong> Standard Earth calendar date.
          Choose either Sol or Earth Date, not both.
        </p>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-500/20 border border-red-500/30 rounded-lg p-4 text-center">
          <p className="text-red-300">{error}</p>
        </div>
      )}

      {/* Photos Grid */}
      {photos.length > 0 && (
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-white">
            Found {photos.length} photos
            {selectedSol && ` for Sol ${selectedSol}`}
            {selectedEarthDate && ` for ${formatDate(selectedEarthDate)}`}
          </h2>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {photos.map((photo) => (
              <div key={photo.id} className="bg-white/5 backdrop-blur-sm rounded-xl overflow-hidden border border-white/10 hover:border-white/20 transition-all duration-300 group">
                <div className="aspect-square overflow-hidden">
                  <img
                    src={photo.img_src}
                    alt={`Mars photo by ${photo.rover.name}`}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    loading="lazy"
                  />
                </div>
                <div className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-blue-400">{photo.camera.full_name}</span>
                    <span className="text-xs text-gray-400">Sol {photo.sol}</span>
                  </div>
                  <div className="text-sm text-gray-300 space-y-1">
                    <div className="flex items-center">
                      <MapPin className="h-3 w-3 mr-1" />
                      <span>Rover: {photo.rover.name}</span>
                    </div>
                    <div className="flex items-center">
                      <Calendar className="h-3 w-3 mr-1" />
                      <span>{formatDate(photo.earth_date)}</span>
                    </div>
                  </div>
                  <a
                    href={photo.img_src}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-3 inline-block text-red-400 hover:text-red-300 text-sm font-medium"
                  >
                    View Full Size →
                  </a>
                </div>
              </div>
            ))}
          </div>

          {/* Load More Button */}
          {photos.length > 0 && photos.length % 25 === 0 && (
            <div className="text-center">
              <button
                onClick={loadMorePhotos}
                disabled={loading}
                className="px-6 py-3 bg-red-600 hover:bg-red-700 disabled:bg-gray-600 disabled:opacity-50 text-white rounded-lg transition-colors"
              >
                {loading ? 'Loading...' : 'Load More Photos'}
              </button>
            </div>
          )}
        </div>
      )}

      {/* Loading State */}
      {loading && photos.length === 0 && (
        <div className="text-center py-12">
          <LoadingSpinner size="lg" />
          <p className="text-gray-300 mt-4">Searching for Mars rover photos...</p>
        </div>
      )}

      {/* No Results */}
      {!loading && photos.length === 0 && (selectedSol || selectedEarthDate) && !error && (
        <div className="text-center py-12">
          <Camera className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-white mb-2">No Photos Found</h3>
          <p className="text-gray-300">
            No photos were found for the selected parameters. Try a different Sol, date, or camera.
          </p>
        </div>
      )}
    </div>
  );
};

export default MarsRover;

