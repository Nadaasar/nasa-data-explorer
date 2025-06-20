import { useState, useEffect } from 'react';
import { Calendar, Shuffle, Image as ImageIcon, Video, ExternalLink } from 'lucide-react';
import LoadingSpinner from './ui/LoadingSpinner';
import { apodAPI } from '../lib/api';

const APOD = () => {
  const [apodData, setApodData] = useState(null);
  const [selectedDate, setSelectedDate] = useState('');
  const [randomImages, setRandomImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [randomLoading, setRandomLoading] = useState(false);
  const [error, setError] = useState(null);

  // Get today's date in YYYY-MM-DD format
  const today = new Date().toISOString().split('T')[0];

  useEffect(() => {
    fetchTodayAPOD();
  }, []);

  const fetchTodayAPOD = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await apodAPI.getToday();
      setApodData(response.data.data);
    } catch (error) {
      console.error('Error fetching APOD:', error);
      setError('Failed to load today\'s astronomy picture. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const fetchAPODByDate = async (date) => {
    try {
      setLoading(true);
      setError(null);
      const response = await apodAPI.getByDate(date);
      setApodData(response.data.data);
    } catch (error) {
      console.error('Error fetching APOD by date:', error);
      setError('Failed to load astronomy picture for the selected date.');
    } finally {
      setLoading(false);
    }
  };

  const fetchRandomImages = async () => {
    try {
      setRandomLoading(true);
      const response = await apodAPI.getRandom(6);
      setRandomImages(response.data.data);
    } catch (error) {
      console.error('Error fetching random APOD images:', error);
    } finally {
      setRandomLoading(false);
    }
  };

  const handleDateChange = (e) => {
    const date = e.target.value;
    setSelectedDate(date);
    if (date) {
      fetchAPODByDate(date);
    }
  };

  const handleTodayClick = () => {
    setSelectedDate('');
    fetchTodayAPOD();
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
          Astronomy Picture of the Day
        </h1>
        <p className="text-lg text-gray-300 max-w-2xl mx-auto">
          Discover the cosmos! Each day a different image or photograph of our fascinating universe 
          is featured, along with a brief explanation written by a professional astronomer.
        </p>
      </div>

      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
        <div className="flex items-center space-x-2">
          <Calendar className="h-5 w-5 text-blue-400" />
          <input
            type="date"
            value={selectedDate}
            max={today}
            onChange={handleDateChange}
            className="px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <button
          onClick={handleTodayClick}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
        >
          Today's Picture
        </button>
        <button
          onClick={fetchRandomImages}
          disabled={randomLoading}
          className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors disabled:opacity-50 flex items-center space-x-2"
        >
          <Shuffle className="h-4 w-4" />
          <span>{randomLoading ? 'Loading...' : 'Random Images'}</span>
        </button>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-500/20 border border-red-500/30 rounded-lg p-4 text-center">
          <p className="text-red-300">{error}</p>
          <button
            onClick={fetchTodayAPOD}
            className="mt-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
          >
            Try Again
          </button>
        </div>
      )}

      {/* Main APOD Display */}
      {loading ? (
        <div className="text-center py-12">
          <LoadingSpinner size="lg" />
          <p className="text-gray-300 mt-4">Loading astronomy picture...</p>
        </div>
      ) : apodData && (
        <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
          <div className="grid lg:grid-cols-2 gap-8">
            {/* Image/Video */}
            <div className="space-y-4">
              {apodData.media_type === 'image' ? (
                <div className="relative group">
                  <img
                    src={apodData.hdurl || apodData.url}
                    alt={apodData.title}
                    className="w-full rounded-lg shadow-2xl"
                  />
                  <div className="absolute top-4 right-4 bg-black/50 backdrop-blur-sm rounded-lg p-2">
                    <ImageIcon className="h-5 w-5 text-white" />
                  </div>
                  {apodData.hdurl && (
                    <a
                      href={apodData.hdurl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="absolute bottom-4 right-4 bg-blue-600/80 hover:bg-blue-600 text-white px-3 py-2 rounded-lg transition-colors flex items-center space-x-2"
                    >
                      <ExternalLink className="h-4 w-4" />
                      <span>HD Version</span>
                    </a>
                  )}
                </div>
              ) : (
                <div className="relative">
                  <iframe
                    src={apodData.url}
                    title={apodData.title}
                    className="w-full aspect-video rounded-lg"
                    allowFullScreen
                  />
                  <div className="absolute top-4 right-4 bg-black/50 backdrop-blur-sm rounded-lg p-2">
                    <Video className="h-5 w-5 text-white" />
                  </div>
                </div>
              )}
              
              {/* Copyright */}
              {apodData.copyright && (
                <p className="text-sm text-gray-400 text-center">
                  © {apodData.copyright}
                </p>
              )}
            </div>

            {/* Content */}
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">
                  {apodData.title}
                </h2>
                <p className="text-blue-400 font-medium">
                  {new Date(apodData.date).toLocaleDateString('en-US', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </p>
              </div>

              <div className="prose prose-invert max-w-none">
                <p className="text-gray-300 leading-relaxed text-lg">
                  {apodData.explanation}
                </p>
              </div>

              {/* Additional Info */}
              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/10">
                <div>
                  <p className="text-sm text-gray-400">Media Type</p>
                  <p className="text-white font-medium capitalize">{apodData.media_type}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-400">Service Version</p>
                  <p className="text-white font-medium">v{apodData.service_version}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Random Images Gallery */}
      {randomImages.length > 0 && (
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-white text-center">Random Astronomy Pictures</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {randomImages.map((image, index) => (
              <div key={index} className="bg-white/5 backdrop-blur-sm rounded-xl overflow-hidden border border-white/10 hover:border-white/20 transition-all duration-300 group">
                {image.media_type === 'image' ? (
                  <div className="aspect-video overflow-hidden">
                    <img
                      src={image.url}
                      alt={image.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                ) : (
                  <div className="aspect-video bg-gray-800 flex items-center justify-center">
                    <Video className="h-12 w-12 text-gray-400" />
                  </div>
                )}
                <div className="p-4">
                  <h3 className="font-semibold text-white mb-2 line-clamp-2">{image.title}</h3>
                  <p className="text-sm text-blue-400 mb-2">
                    {new Date(image.date).toLocaleDateString()}
                  </p>
                  <p className="text-sm text-gray-300 line-clamp-3">{image.explanation}</p>
                  <button
                    onClick={() => {
                      setApodData(image);
                      setSelectedDate(image.date);
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className="mt-3 text-blue-400 hover:text-blue-300 text-sm font-medium"
                  >
                    View Details →
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Random Loading */}
      {randomLoading && (
        <div className="text-center py-8">
          <LoadingSpinner size="md" />
          <p className="text-gray-300 mt-2">Loading random images...</p>
        </div>
      )}
    </div>
  );
};

export default APOD;

