import { Link, useLocation } from 'react-router-dom';
import { useState } from 'react';
import { Menu, X, Rocket, Wifi, WifiOff } from 'lucide-react';

const Navbar = ({ apiStatus }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();

  const navItems = [
    { path: '/', label: 'Home', icon: '🏠' },
    { path: '/apod', label: 'Picture of the Day', icon: '🌌' },
    { path: '/mars-rover', label: 'Mars Rovers', icon: '🚗' },
    { path: '/neo', label: 'Near Earth Objects', icon: '☄️' },
    { path: '/images', label: 'Image Library', icon: '📸' },
    { path: '/earth', label: 'Earth Images', icon: '🌍' }
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="bg-black/20 backdrop-blur-md border-b border-white/10 sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2 text-white hover:text-blue-300 transition-colors">
            <Rocket className="h-8 w-8 text-blue-400" />
            <span className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              NASA Data Explorer
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  isActive(item.path)
                    ? 'bg-blue-600/20 text-blue-300 border border-blue-500/30'
                    : 'text-gray-300 hover:text-white hover:bg-white/10'
                }`}
              >
                <span className="mr-2">{item.icon}</span>
                {item.label}
              </Link>
            ))}
          </div>

          {/* API Status & Mobile Menu Button */}
          <div className="flex items-center space-x-4">
            {/* API Status Indicator */}
            <div className="hidden sm:flex items-center space-x-2">
              {apiStatus === 'connected' ? (
                <div className="flex items-center space-x-1 text-green-400">
                  <Wifi className="h-4 w-4" />
                  <span className="text-xs">Connected</span>
                </div>
              ) : apiStatus === 'disconnected' ? (
                <div className="flex items-center space-x-1 text-red-400">
                  <WifiOff className="h-4 w-4" />
                  <span className="text-xs">Disconnected</span>
                </div>
              ) : (
                <div className="flex items-center space-x-1 text-yellow-400">
                  <div className="animate-spin h-4 w-4 border-2 border-yellow-400 border-t-transparent rounded-full"></div>
                  <span className="text-xs">Checking...</span>
                </div>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden text-white hover:text-blue-300 transition-colors"
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-white/10">
            <div className="flex flex-col space-y-2">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setIsMenuOpen(false)}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    isActive(item.path)
                      ? 'bg-blue-600/20 text-blue-300 border border-blue-500/30'
                      : 'text-gray-300 hover:text-white hover:bg-white/10'
                  }`}
                >
                  <span className="mr-2">{item.icon}</span>
                  {item.label}
                </Link>
              ))}
              
              {/* Mobile API Status */}
              <div className="px-3 py-2 border-t border-white/10 mt-2 pt-4">
                <div className="flex items-center space-x-2">
                  <span className="text-xs text-gray-400">API Status:</span>
                  {apiStatus === 'connected' ? (
                    <div className="flex items-center space-x-1 text-green-400">
                      <Wifi className="h-4 w-4" />
                      <span className="text-xs">Connected</span>
                    </div>
                  ) : apiStatus === 'disconnected' ? (
                    <div className="flex items-center space-x-1 text-red-400">
                      <WifiOff className="h-4 w-4" />
                      <span className="text-xs">Disconnected</span>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-1 text-yellow-400">
                      <div className="animate-spin h-4 w-4 border-2 border-yellow-400 border-t-transparent rounded-full"></div>
                      <span className="text-xs">Checking...</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;

