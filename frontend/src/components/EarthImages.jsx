import { useState, useEffect } from 'react';
import { Calendar, Globe, Download, MapPin, Clock } from 'lucide-react';
import LoadingSpinner from './ui/LoadingSpinner';
import { epicAPI } from '../lib/api';

const EarthImages = () => {
  const [epicImages, setEpicImages] = useState([]);
  const [availableDates, setAvailableDates] = useState([]);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedType, setSelectedType] = useState('natural');
  const [loading, setLoading] = useState(false);
  const [datesLoading, setDatesLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);

  useEffect(() => {
    fetchAvailableDates();
    fetchLatestImages();
  }, [selectedType]);

  const fetchAvailableDates = async () => {
    try {
      setDatesLoading(true);
      const response = await epicAPI.getAvailableDates(selectedType);
      if (Array.isArray(response.data.data)) {
        setAvailableDates(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching available dates:', error);
    } finally {
      setDatesLoading(false);
    }
  };

  const fetchLatestImages = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await epicAPI.getLatest(selectedType);
      if (response.data.data && response.data.data.images) {
        setEpicImages(response.data.data.images);
        setSelectedDate(response.data.data.date);
      }
    } catch (error) {
      console.error('Error fetching latest EPIC images:', error);
      setError('Failed to load latest Earth images. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const fetchImagesByDate = async (date) => {
    try {
      setLoading(true);
      setError(null);
      const response = await epicAPI.getImages(date, selectedType);
      if (Array.isArray(response.data.data)) {
        setEpicImages(response.data.data);
      } else {
        setEpicImages([]);
      }
    } catch (error) {
      console.error('Error fetching EPIC images by date:', error);
      setError('Failed to load Earth images for the selected date.');
    } finally {
      setLoading(false);
    }
  };

  const handleDateChange = (e) => {
    const date = e.target.value;
    setSelectedDate(date);
    if (date) {
      fetchImagesByDate(date);
    }
  };

  const handleTypeChange = (type) => {
    setSelectedType(type);
    setSelectedDate('');
    setEpicImages([]);
  };

  const formatDateTime = (dateTimeString) => {
    const date = new Date(dateTimeString);
    return {
      date: date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      }),
      time: date.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        timeZoneName: 'short'
      })
    };
  };

  const getCoordinateString = (coords) => {
    if (!coords || coords.lat === undefined || coords.lon === undefined) return 'N/A';
    const lat = parseFloat(coords.lat).toFixed(2);
    const lon = parseFloat(coords.lon).toFixed(2);
    return `${lat}°, ${lon}°`;
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
          Earth from Space
        </h1>
        <p className="text-lg text-gray-300 max-w-2xl mx-auto">
          View our beautiful planet from space through NASA's EPIC (Earth Polychromatic Imaging Camera) 
          aboard the DSCOVR satellite, positioned at the L1 Lagrange point.
        </p>
      </div>

      {/* Controls */}
      <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
        <div className="grid md:grid-cols-3 gap-4 items-end">
          {/* Image Type Selection */}
          <div>
            <label className="block text-sm text-gray-400 mb-2">Image Type</label>
            <div className="flex gap-2">
              <button
                onClick={() => handleTypeChange('natural')}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  selectedType === 'natural'
                    ? 'bg-cyan-600 text-white'
                    : 'bg-white/10 text-gray-300 hover:bg-white/20'
                }`}
              >
                Natural
              </button>
              <button
                onClick={() => handleTypeChange('enhanced')}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  selectedType === 'enhanced'
                    ? 'bg-cyan-600 text-white'
                    : 'bg-white/10 text-gray-300 hover:bg-white/20'
                }`}
              >
                Enhanced
              </button>
            </div>
          </div>

          {/* Date Selection */}
          <div>
            <label className="block text-sm text-gray-400 mb-2">Select Date</label>
            <select
              value={selectedDate}
              onChange={handleDateChange}
              disabled={datesLoading}
              className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 disabled:opacity-50"
            >
              <option value="">Latest Images</option>
              {availableDates.map((dateObj) => (
                <option key={dateObj.date} value={dateObj.date}>
                  {new Date(dateObj.date).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </option>
              ))}
            </select>
          </div>

          {/* Refresh Button */}
          <button
            onClick={fetchLatestImages}
            disabled={loading}
            className="px-6 py-2 bg-cyan-600 hover:bg-cyan-700 disabled:bg-gray-600 disabled:opacity-50 text-white rounded-lg transition-colors"
          >
            {loading ? 'Loading...' : 'Latest Images'}
          </button>
        </div>

        <div className="mt-4 text-sm text-gray-400">
          <p>
            <strong>Natural:</strong> Images using natural color filters. 
            <strong className="ml-4">Enhanced:</strong> Images with enhanced color processing for better visibility.
          </p>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-500/20 border border-red-500/30 rounded-lg p-4 text-center">
          <p className="text-red-300">{error}</p>
          <button
            onClick={fetchLatestImages}
            className="mt-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
          >
            Try Again
          </button>
        </div>
      )}

      {/* Image Info */}
      {epicImages.length > 0 && (
        <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
          <div className="grid md:grid-cols-4 gap-6 text-center">
            <div>
              <div className="text-2xl font-bold text-cyan-400">{epicImages.length}</div>
              <div className="text-sm text-gray-400">Images Available</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-blue-400 capitalize">{selectedType}</div>
              <div className="text-sm text-gray-400">Image Type</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-green-400">
                {selectedDate ? new Date(selectedDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'Latest'}
              </div>
              <div className="text-sm text-gray-400">Date</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-purple-400">DSCOVR</div>
              <div className="text-sm text-gray-400">Satellite</div>
            </div>
          </div>
        </div>
      )}

      {/* Images Grid */}
      {loading ? (
        <div className="text-center py-12">
          <LoadingSpinner size="lg" />
          <p className="text-gray-300 mt-4">Loading Earth images...</p>
        </div>
      ) : epicImages.length > 0 ? (
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-white text-center">
            Earth Images - {selectedDate ? formatDateTime(selectedDate).date : 'Latest Available'}
          </h2>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {epicImages.map((image, index) => {
              const dateTime = formatDateTime(image.date);
              
              return (
                <div 
                  key={image.image || index} 
                  className="bg-white/5 backdrop-blur-sm rounded-xl overflow-hidden border border-white/10 hover:border-white/20 transition-all duration-300 group cursor-pointer"
                  onClick={() => setSelectedImage(image)}
                >
                  <div className="aspect-square overflow-hidden">
                    <img
                      src={image.image_url}
                      alt={`Earth from EPIC - ${image.image}`}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      loading="lazy"
                    />
                  </div>
                  
                  <div className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold text-white">{image.image}</h3>
                      <Globe className="h-5 w-5 text-cyan-400" />
                    </div>
                    
                    <div className="space-y-2 text-sm text-gray-300">
                      <div className="flex items-center">
                        <Calendar className="h-3 w-3 mr-2" />
                        <span>{dateTime.date}</span>
                      </div>
                      <div className="flex items-center">
                        <Clock className="h-3 w-3 mr-2" />
                        <span>{dateTime.time}</span>
                      </div>
                      {image.centroid_coordinates && (
                        <div className="flex items-center">
                          <MapPin className="h-3 w-3 mr-2" />
                          <span>{getCoordinateString(image.centroid_coordinates)}</span>
                        </div>
                      )}
                    </div>
                    
                    <button className="mt-3 text-cyan-400 hover:text-cyan-300 text-sm font-medium">
                      View Details →
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : !loading && !error && (
        <div className="text-center py-12">
          <Globe className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-white mb-2">No Images Available</h3>
          <p className="text-gray-300">
            No Earth images are available for the selected date and type. Try a different date or image type.
          </p>
        </div>
      )}

      {/* Image Details Modal */}
      {selectedImage && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-gray-900 rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto border border-white/10">
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <h3 className="text-xl font-bold text-white">Earth Image - {selectedImage.image}</h3>
                <button
                  onClick={() => setSelectedImage(null)}
                  className="text-gray-400 hover:text-white"
                >
                  ✕
                </button>
              </div>
              
              <div className="grid lg:grid-cols-2 gap-6">
                {/* Image */}
                <div className="space-y-4">
                  <img
                    src={selectedImage.image_url}
                    alt={`Earth from EPIC - ${selectedImage.image}`}
                    className="w-full rounded-lg"
                  />
                  
                  <a
                    href={selectedImage.image_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center space-x-2 px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg transition-colors"
                  >
                    <Download className="h-4 w-4" />
                    <span>Download Full Resolution</span>
                  </a>
                </div>
                
                {/* Details */}
                <div className="space-y-6">
                  <div>
                    <h4 className="font-semibold text-white mb-3">Image Information</h4>
                    <div className="space-y-3 text-sm">
                      <div className="grid grid-cols-2 gap-2">
                        <span className="text-gray-400">Image ID:</span>
                        <span className="text-white">{selectedImage.image}</span>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <span className="text-gray-400">Date & Time:</span>
                        <span className="text-white">{formatDateTime(selectedImage.date).date} at {formatDateTime(selectedImage.date).time}</span>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <span className="text-gray-400">Image Type:</span>
                        <span className="text-white capitalize">{selectedType}</span>
                      </div>
                    </div>
                  </div>
                  
                  {selectedImage.centroid_coordinates && (
                    <div>
                      <h4 className="font-semibold text-white mb-3">Earth Center Coordinates</h4>
                      <div className="space-y-2 text-sm">
                        <div className="grid grid-cols-2 gap-2">
                          <span className="text-gray-400">Latitude:</span>
                          <span className="text-white">{parseFloat(selectedImage.centroid_coordinates.lat).toFixed(4)}°</span>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <span className="text-gray-400">Longitude:</span>
                          <span className="text-white">{parseFloat(selectedImage.centroid_coordinates.lon).toFixed(4)}°</span>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {selectedImage.dscovr_j2000_position && (
                    <div>
                      <h4 className="font-semibold text-white mb-3">DSCOVR Satellite Position</h4>
                      <div className="space-y-2 text-sm">
                        <div className="grid grid-cols-2 gap-2">
                          <span className="text-gray-400">X Position:</span>
                          <span className="text-white">{parseFloat(selectedImage.dscovr_j2000_position.x).toLocaleString()} km</span>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <span className="text-gray-400">Y Position:</span>
                          <span className="text-white">{parseFloat(selectedImage.dscovr_j2000_position.y).toLocaleString()} km</span>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <span className="text-gray-400">Z Position:</span>
                          <span className="text-white">{parseFloat(selectedImage.dscovr_j2000_position.z).toLocaleString()} km</span>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
                    <h4 className="font-semibold text-blue-300 mb-2">About EPIC</h4>
                    <p className="text-sm text-gray-300 leading-relaxed">
                      The Earth Polychromatic Imaging Camera (EPIC) is aboard the DSCOVR satellite, 
                      positioned at the L1 Lagrange point between Earth and the Sun. This unique 
                      vantage point allows EPIC to capture the entire sunlit side of Earth, 
                      providing valuable data for climate and atmospheric research.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Loading States */}
      {datesLoading && (
        <div className="text-center py-8">
          <LoadingSpinner size="md" />
          <p className="text-gray-300 mt-2">Loading available dates...</p>
        </div>
      )}
    </div>
  );
};

export default EarthImages;

