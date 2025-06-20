import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { Rocket, Camera, Globe, Telescope, Image, Zap } from 'lucide-react';
import LoadingSpinner from './ui/LoadingSpinner';
import { apodAPI, marsRoverAPI, neoAPI } from '../lib/api';

const Home = () => {
  const [featuredData, setFeaturedData] = useState({
    apod: null,
    latestMarsPhotos: null,
    neoStats: null
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFeaturedData = async () => {
      try {
        const [apodResponse, marsResponse, neoResponse] = await Promise.allSettled([
          apodAPI.getToday(),
          marsRoverAPI.getLatest(),
          neoAPI.getStats()
        ]);

        setFeaturedData({
          apod: apodResponse.status === 'fulfilled' ? apodResponse.value.data.data : null,
          latestMarsPhotos: marsResponse.status === 'fulfilled' ? marsResponse.value.data.data : null,
          neoStats: neoResponse.status === 'fulfilled' ? neoResponse.value.data.data : null
        });
      } catch (error) {
        console.error('Error fetching featured data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchFeaturedData();
  }, []);

  const features = [
    {
      title: 'Astronomy Picture of the Day',
      description: 'Discover the cosmos with daily stunning images and explanations from NASA',
      icon: <Telescope className="h-8 w-8" />,
      path: '/apod',
      color: 'from-blue-500 to-purple-600',
      bgColor: 'bg-blue-500/10 border-blue-500/20'
    },
    {
      title: 'Mars Rover Photos',
      description: 'Explore the Red Planet through the eyes of NASA\'s Mars rovers',
      icon: <Camera className="h-8 w-8" />,
      path: '/mars-rover',
      color: 'from-red-500 to-orange-600',
      bgColor: 'bg-red-500/10 border-red-500/20'
    },
    {
      title: 'Near Earth Objects',
      description: 'Track asteroids and comets approaching our planet',
      icon: <Zap className="h-8 w-8" />,
      path: '/neo',
      color: 'from-yellow-500 to-red-600',
      bgColor: 'bg-yellow-500/10 border-yellow-500/20'
    },
    {
      title: 'NASA Image Library',
      description: 'Browse thousands of images, videos, and audio from NASA missions',
      icon: <Image className="h-8 w-8" />,
      path: '/images',
      color: 'from-green-500 to-blue-600',
      bgColor: 'bg-green-500/10 border-green-500/20'
    },
    {
      title: 'Earth Images',
      description: 'View our planet from space with EPIC satellite imagery',
      icon: <Globe className="h-8 w-8" />,
      path: '/earth',
      color: 'from-cyan-500 to-blue-600',
      bgColor: 'bg-cyan-500/10 border-cyan-500/20'
    }
  ];

  return (
    <div className="space-y-12">
      {/* Hero Section */}
      <section className="text-center py-12">
        <div className="flex justify-center mb-6">
          <div className="p-4 bg-blue-500/20 rounded-full border border-blue-500/30">
            <Rocket className="h-16 w-16 text-blue-400" />
          </div>
        </div>
        <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
          NASA Data Explorer
        </h1>
        <p className="text-xl md:text-2xl text-gray-300 mb-8 max-w-3xl mx-auto">
          Explore the universe through NASA's vast collection of space data, images, and discoveries. 
          From daily astronomy pictures to Mars rover photos and near-Earth objects.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            to="/apod"
            className="px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700 transition-all duration-200 transform hover:scale-105"
          >
            Start Exploring
          </Link>
          <Link
            to="/images"
            className="px-8 py-3 bg-white/10 text-white rounded-lg font-semibold hover:bg-white/20 transition-all duration-200 border border-white/20"
          >
            Browse Gallery
          </Link>
        </div>
      </section>

      {/* Featured Content */}
      {!loading && (
        <section className="py-8">
          <h2 className="text-3xl font-bold text-white mb-8 text-center">Featured Today</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {/* Today's APOD */}
            {featuredData.apod && (
              <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
                <h3 className="text-xl font-semibold text-white mb-4">Today's Astronomy Picture</h3>
                <div className="aspect-video rounded-lg overflow-hidden mb-4">
                  {featuredData.apod.media_type === 'image' ? (
                    <img
                      src={featuredData.apod.url}
                      alt={featuredData.apod.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-800 flex items-center justify-center">
                      <p className="text-gray-400">Video Content</p>
                    </div>
                  )}
                </div>
                <h4 className="font-semibold text-white mb-2">{featuredData.apod.title}</h4>
                <p className="text-gray-300 text-sm line-clamp-3">{featuredData.apod.explanation}</p>
                <Link
                  to="/apod"
                  className="inline-block mt-4 text-blue-400 hover:text-blue-300 text-sm font-medium"
                >
                  View Full Details →
                </Link>
              </div>
            )}

            {/* NEO Stats */}
            {featuredData.neoStats && (
              <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
                <h3 className="text-xl font-semibold text-white mb-4">Near Earth Objects</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-300">Total Tracked:</span>
                    <span className="text-white font-semibold">{featuredData.neoStats.total_count?.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-300">Potentially Hazardous:</span>
                    <span className="text-red-400 font-semibold">{featuredData.neoStats.potentially_hazardous_count}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-300">Avg Diameter:</span>
                    <span className="text-white font-semibold">{featuredData.neoStats.average_diameter_km?.toFixed(3)} km</span>
                  </div>
                </div>
                <Link
                  to="/neo"
                  className="inline-block mt-4 text-yellow-400 hover:text-yellow-300 text-sm font-medium"
                >
                  Explore NEOs →
                </Link>
              </div>
            )}

            {/* Mars Rover Count */}
            {featuredData.latestMarsPhotos && (
              <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
                <h3 className="text-xl font-semibold text-white mb-4">Mars Rover Photos</h3>
                <div className="space-y-3">
                  {Object.entries(featuredData.latestMarsPhotos).map(([rover, data]) => (
                    <div key={rover} className="flex justify-between">
                      <span className="text-gray-300 capitalize">{rover}:</span>
                      <span className="text-white font-semibold">
                        {data.photos ? `${data.photos.length} photos` : 'No recent photos'}
                      </span>
                    </div>
                  ))}
                </div>
                <Link
                  to="/mars-rover"
                  className="inline-block mt-4 text-red-400 hover:text-red-300 text-sm font-medium"
                >
                  View Mars Photos →
                </Link>
              </div>
            )}
          </div>
        </section>
      )}

      {/* Features Grid */}
      <section className="py-8">
        <h2 className="text-3xl font-bold text-white mb-8 text-center">Explore NASA Data</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <Link
              key={index}
              to={feature.path}
              className="group block"
            >
              <div className={`p-6 rounded-xl border transition-all duration-300 hover:scale-105 hover:shadow-2xl ${feature.bgColor}`}>
                <div className={`inline-flex p-3 rounded-lg bg-gradient-to-r ${feature.color} text-white mb-4`}>
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold text-white mb-3 group-hover:text-blue-300 transition-colors">
                  {feature.title}
                </h3>
                <p className="text-gray-300 group-hover:text-gray-200 transition-colors">
                  {feature.description}
                </p>
                <div className="mt-4 text-blue-400 group-hover:text-blue-300 font-medium">
                  Explore →
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Loading State */}
      {loading && (
        <section className="py-12 text-center">
          <LoadingSpinner size="lg" />
          <p className="text-gray-300 mt-4">Loading featured content...</p>
        </section>
      )}

      {/* About Section */}
      <section className="py-12 text-center">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-white mb-6">About NASA Data Explorer</h2>
          <p className="text-lg text-gray-300 mb-8">
            This application provides access to NASA's incredible collection of space data through their Open APIs. 
            Discover daily astronomy pictures, explore Mars through rover cameras, track near-Earth objects, 
            browse the vast NASA image library, and view our planet from space.
          </p>
          <div className="grid md:grid-cols-3 gap-6 text-center">
            <div className="p-4">
              <div className="text-3xl font-bold text-blue-400 mb-2">5+</div>
              <div className="text-gray-300">NASA APIs Integrated</div>
            </div>
            <div className="p-4">
              <div className="text-3xl font-bold text-purple-400 mb-2">1000s</div>
              <div className="text-gray-300">Images & Videos</div>
            </div>
            <div className="p-4">
              <div className="text-3xl font-bold text-pink-400 mb-2">Real-time</div>
              <div className="text-gray-300">Data Updates</div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;

