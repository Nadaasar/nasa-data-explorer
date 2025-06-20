import { useState, useEffect } from 'react';
import { Search, Image as ImageIcon, Video, Play, ExternalLink, Star } from 'lucide-react';
import LoadingSpinner from './ui/LoadingSpinner';
import { imageLibraryAPI } from '../lib/api';

const ImageLibrary = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [featuredCollections, setFeaturedCollections] = useState({});
  const [randomImages, setRandomImages] = useState([]);
  const [selectedMediaType, setSelectedMediaType] = useState('image');
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [featuredLoading, setFeaturedLoading] = useState(true);
  const [randomLoading, setRandomLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedItem, setSelectedItem] = useState(null);

  useEffect(() => {
    fetchFeaturedCollections();
    fetchRandomImages();
  }, []);

  const fetchFeaturedCollections = async () => {
    try {
      setFeaturedLoading(true);
      const response = await imageLibraryAPI.getFeatured();
      setFeaturedCollections(response.data.data);
    } catch (error) {
      console.error('Error fetching featured collections:', error);
    } finally {
      setFeaturedLoading(false);
    }
  };

  const fetchRandomImages = async () => {
    try {
      setRandomLoading(true);
      const response = await imageLibraryAPI.getRandom(12);
      setRandomImages(response.data.data.images || []);
    } catch (error) {
      console.error('Error fetching random images:', error);
    } finally {
      setRandomLoading(false);
    }
  };

  const searchImages = async (page = 1) => {
    if (!searchQuery.trim()) {
      setError('Please enter a search term.');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const response = await imageLibraryAPI.search(searchQuery, selectedMediaType, page);
      
      if (response.data.data.collection && response.data.data.collection.items) {
        if (page === 1) {
          setSearchResults(response.data.data.collection.items);
        } else {
          setSearchResults(prev => [...prev, ...response.data.data.collection.items]);
        }
        setCurrentPage(page);
      } else {
        setSearchResults([]);
      }
    } catch (error) {
      console.error('Error searching images:', error);
      setError('Failed to search NASA image library. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setSearchResults([]);
    setCurrentPage(1);
    searchImages(1);
  };

  const loadMoreResults = () => {
    searchImages(currentPage + 1);
  };

  const getImageUrl = (item) => {
    if (item.links && item.links.length > 0) {
      return item.links[0].href;
    }
    return null;
  };

  const getVideoThumbnail = (item) => {
    if (item.links && item.links.length > 0) {
      // For videos, NASA API usually provides thumbnail as first link
      return item.links[0].href;
    }
    return null;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const MediaItem = ({ item, onClick }) => {
    const isVideo = item.data[0].media_type === 'video';
    const isAudio = item.data[0].media_type === 'audio';
    const imageUrl = getImageUrl(item);

    return (
      <div 
        className="bg-white/5 backdrop-blur-sm rounded-xl overflow-hidden border border-white/10 hover:border-white/20 transition-all duration-300 group cursor-pointer"
        onClick={() => onClick(item)}
      >
        <div className="aspect-video overflow-hidden relative">
          {isAudio ? (
            <div className="w-full h-full bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center">
              <div className="text-center">
                <div className="text-4xl mb-2">🎵</div>
                <p className="text-white font-medium">Audio Content</p>
              </div>
            </div>
          ) : imageUrl ? (
            <>
              <img
                src={imageUrl}
                alt={item.data[0].title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                loading="lazy"
              />
              {isVideo && (
                <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                  <div className="bg-white/20 backdrop-blur-sm rounded-full p-3">
                    <Play className="h-8 w-8 text-white" />
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="w-full h-full bg-gray-800 flex items-center justify-center">
              <ImageIcon className="h-12 w-12 text-gray-400" />
            </div>
          )}
          
          <div className="absolute top-2 right-2 bg-black/50 backdrop-blur-sm rounded-lg p-1">
            {isVideo ? (
              <Video className="h-4 w-4 text-white" />
            ) : isAudio ? (
              <div className="h-4 w-4 text-white">🎵</div>
            ) : (
              <ImageIcon className="h-4 w-4 text-white" />
            )}
          </div>
        </div>
        
        <div className="p-4">
          <h3 className="font-semibold text-white mb-2 line-clamp-2">{item.data[0].title}</h3>
          <p className="text-sm text-blue-400 mb-2">
            {formatDate(item.data[0].date_created)}
          </p>
          <p className="text-sm text-gray-300 line-clamp-3">{item.data[0].description}</p>
          
          {item.data[0].keywords && item.data[0].keywords.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-1">
              {item.data[0].keywords.slice(0, 3).map((keyword, index) => (
                <span key={index} className="px-2 py-1 bg-blue-600/20 text-blue-300 text-xs rounded">
                  {keyword}
                </span>
              ))}
            </div>
          )}
          
          <button className="mt-3 text-green-400 hover:text-green-300 text-sm font-medium">
            View Details →
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-green-400 to-blue-400 bg-clip-text text-transparent">
          NASA Image & Video Library
        </h1>
        <p className="text-lg text-gray-300 max-w-2xl mx-auto">
          Explore NASA's vast collection of images, videos, and audio from space missions, 
          astronomical observations, and scientific discoveries.
        </p>
      </div>

      {/* Search */}
      <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
        <form onSubmit={handleSearch} className="space-y-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search for space images, videos, and audio..."
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
            
            <div className="flex gap-2">
              <select
                value={selectedMediaType}
                onChange={(e) => setSelectedMediaType(e.target.value)}
                className="px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                <option value="image">Images</option>
                <option value="video">Videos</option>
                <option value="audio">Audio</option>
              </select>
              
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-3 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 disabled:opacity-50 text-white rounded-lg transition-colors flex items-center space-x-2"
              >
                <Search className="h-4 w-4" />
                <span>{loading ? 'Searching...' : 'Search'}</span>
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-500/20 border border-red-500/30 rounded-lg p-4 text-center">
          <p className="text-red-300">{error}</p>
        </div>
      )}

      {/* Search Results */}
      {searchResults.length > 0 && (
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-white">
            Search Results ({searchResults.length} items)
          </h2>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {searchResults.map((item, index) => (
              <MediaItem 
                key={`${item.data[0].nasa_id}-${index}`} 
                item={item} 
                onClick={setSelectedItem}
              />
            ))}
          </div>

          {/* Load More Button */}
          {searchResults.length > 0 && searchResults.length % 100 === 0 && (
            <div className="text-center">
              <button
                onClick={loadMoreResults}
                disabled={loading}
                className="px-6 py-3 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 disabled:opacity-50 text-white rounded-lg transition-colors"
              >
                {loading ? 'Loading...' : 'Load More Results'}
              </button>
            </div>
          )}
        </div>
      )}

      {/* Featured Collections */}
      {featuredLoading ? (
        <div className="text-center py-8">
          <LoadingSpinner size="md" />
          <p className="text-gray-300 mt-2">Loading featured collections...</p>
        </div>
      ) : Object.keys(featuredCollections).length > 0 && (
        <div className="space-y-8">
          <h2 className="text-2xl font-bold text-white text-center">Featured Collections</h2>
          
          {Object.entries(featuredCollections).map(([collectionName, collection]) => (
            <div key={collectionName} className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-semibold text-white">{collectionName}</h3>
                  <p className="text-gray-300">{collection.description}</p>
                </div>
                <div className="text-sm text-gray-400">
                  {collection.total_hits?.toLocaleString()} items
                </div>
              </div>
              
              {collection.items && (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {collection.items.slice(0, 6).map((item, index) => (
                    <MediaItem 
                      key={`${item.data[0].nasa_id}-${index}`} 
                      item={item} 
                      onClick={setSelectedItem}
                    />
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Random Images */}
      {randomImages.length > 0 && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-white">Random Discoveries</h2>
            <button
              onClick={fetchRandomImages}
              disabled={randomLoading}
              className="px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 disabled:opacity-50 text-white rounded-lg transition-colors flex items-center space-x-2"
            >
              <Star className="h-4 w-4" />
              <span>{randomLoading ? 'Loading...' : 'Refresh'}</span>
            </button>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {randomImages.map((item, index) => (
              <MediaItem 
                key={`random-${index}`} 
                item={item} 
                onClick={setSelectedItem}
              />
            ))}
          </div>
        </div>
      )}

      {/* Loading States */}
      {loading && searchResults.length === 0 && (
        <div className="text-center py-12">
          <LoadingSpinner size="lg" />
          <p className="text-gray-300 mt-4">Searching NASA image library...</p>
        </div>
      )}

      {randomLoading && randomImages.length === 0 && (
        <div className="text-center py-8">
          <LoadingSpinner size="md" />
          <p className="text-gray-300 mt-2">Loading random images...</p>
        </div>
      )}

      {/* No Results */}
      {!loading && searchResults.length === 0 && searchQuery && !error && (
        <div className="text-center py-12">
          <Search className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-white mb-2">No Results Found</h3>
          <p className="text-gray-300">
            No {selectedMediaType}s were found for "{searchQuery}". Try different keywords or media type.
          </p>
        </div>
      )}

      {/* Item Details Modal */}
      {selectedItem && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-gray-900 rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto border border-white/10">
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <h3 className="text-xl font-bold text-white pr-4">{selectedItem.data[0].title}</h3>
                <button
                  onClick={() => setSelectedItem(null)}
                  className="text-gray-400 hover:text-white flex-shrink-0"
                >
                  ✕
                </button>
              </div>
              
              <div className="grid lg:grid-cols-2 gap-6">
                {/* Media */}
                <div>
                  {selectedItem.data[0].media_type === 'image' && getImageUrl(selectedItem) && (
                    <img
                      src={getImageUrl(selectedItem)}
                      alt={selectedItem.data[0].title}
                      className="w-full rounded-lg"
                    />
                  )}
                  
                  {selectedItem.data[0].media_type === 'video' && (
                    <div className="aspect-video bg-gray-800 rounded-lg flex items-center justify-center">
                      <div className="text-center">
                        <Video className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-300">Video content available</p>
                        {selectedItem.links && selectedItem.links[0] && (
                          <a
                            href={selectedItem.links[0].href}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-block mt-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                          >
                            Watch Video
                          </a>
                        )}
                      </div>
                    </div>
                  )}
                  
                  {selectedItem.data[0].media_type === 'audio' && (
                    <div className="aspect-video bg-gradient-to-br from-purple-600 to-blue-600 rounded-lg flex items-center justify-center">
                      <div className="text-center">
                        <div className="text-6xl mb-4">🎵</div>
                        <p className="text-white font-medium">Audio Content</p>
                      </div>
                    </div>
                  )}
                </div>
                
                {/* Details */}
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold text-white mb-2">Description</h4>
                    <p className="text-gray-300 text-sm leading-relaxed">
                      {selectedItem.data[0].description}
                    </p>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-400">NASA ID: </span>
                      <span className="text-white">{selectedItem.data[0].nasa_id}</span>
                    </div>
                    <div>
                      <span className="text-gray-400">Media Type: </span>
                      <span className="text-white capitalize">{selectedItem.data[0].media_type}</span>
                    </div>
                    <div>
                      <span className="text-gray-400">Date Created: </span>
                      <span className="text-white">{formatDate(selectedItem.data[0].date_created)}</span>
                    </div>
                    <div>
                      <span className="text-gray-400">Center: </span>
                      <span className="text-white">{selectedItem.data[0].center || 'NASA'}</span>
                    </div>
                  </div>
                  
                  {selectedItem.data[0].keywords && selectedItem.data[0].keywords.length > 0 && (
                    <div>
                      <h4 className="font-semibold text-white mb-2">Keywords</h4>
                      <div className="flex flex-wrap gap-2">
                        {selectedItem.data[0].keywords.map((keyword, index) => (
                          <span key={index} className="px-2 py-1 bg-blue-600/20 text-blue-300 text-xs rounded">
                            {keyword}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {selectedItem.links && selectedItem.links[0] && (
                    <div className="pt-4">
                      <a
                        href={selectedItem.links[0].href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center space-x-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
                      >
                        <ExternalLink className="h-4 w-4" />
                        <span>View Original</span>
                      </a>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ImageLibrary;

