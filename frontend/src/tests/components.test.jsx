import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import '@testing-library/jest-dom';
import Home from '../components/Home';
import APOD from '../components/APOD';
import MarsRover from '../components/MarsRover';
import NearEarthObjects from '../components/NearEarthObjects';
import ImageLibrary from '../components/ImageLibrary';
import EarthImages from '../components/EarthImages';

// Mock API calls
jest.mock('../lib/api', () => ({
  apodAPI: {
    getToday: jest.fn(() => Promise.resolve({
      data: {
        success: true,
        data: {
          title: 'Test APOD',
          explanation: 'Test explanation',
          url: 'https://example.com/image.jpg',
          date: '2023-01-01'
        }
      }
    })),
    getRandom: jest.fn(() => Promise.resolve({
      data: {
        success: true,
        data: [
          {
            title: 'Random APOD',
            explanation: 'Random explanation',
            url: 'https://example.com/random.jpg',
            date: '2023-01-02'
          }
        ]
      }
    })),
    getByDate: jest.fn(() => Promise.resolve({
      data: {
        success: true,
        data: {
          title: 'Date APOD',
          explanation: 'Date explanation',
          url: 'https://example.com/date.jpg',
          date: '2023-01-03'
        }
      }
    }))
  },
  marsRoverAPI: {
    getRovers: jest.fn(() => Promise.resolve({
      data: {
        success: true,
        data: {
          rovers: [
            {
              name: 'Curiosity',
              status: 'active',
              max_sol: 3000,
              max_date: '2023-01-01'
            }
          ]
        }
      }
    })),
    getPhotos: jest.fn(() => Promise.resolve({
      data: {
        success: true,
        data: {
          photos: [
            {
              id: 1,
              img_src: 'https://example.com/mars.jpg',
              earth_date: '2023-01-01',
              camera: { name: 'MAST' }
            }
          ]
        }
      }
    })),
    getLatest: jest.fn(() => Promise.resolve({
      data: {
        success: true,
        data: {
          latest_photos: [
            {
              id: 2,
              img_src: 'https://example.com/latest.jpg',
              earth_date: '2023-01-01',
              camera: { name: 'NAVCAM' }
            }
          ]
        }
      }
    }))
  },
  neoAPI: {
    getToday: jest.fn(() => Promise.resolve({
      data: {
        success: true,
        data: {
          near_earth_objects: {
            '2023-01-01': [
              {
                id: '123',
                name: 'Test Asteroid',
                is_potentially_hazardous_asteroid: false,
                estimated_diameter: {
                  kilometers: {
                    estimated_diameter_min: 0.1,
                    estimated_diameter_max: 0.2
                  }
                },
                close_approach_data: [
                  {
                    miss_distance: { kilometers: '1000000' },
                    relative_velocity: { kilometers_per_hour: '50000' }
                  }
                ]
              }
            ]
          }
        }
      }
    })),
    getStats: jest.fn(() => Promise.resolve({
      data: {
        success: true,
        data: {
          total_count: 1000,
          potentially_hazardous_count: 100,
          average_diameter_km: 0.5,
          largest_diameter_km: 10.0
        }
      }
    })),
    getFeed: jest.fn(() => Promise.resolve({
      data: {
        success: true,
        data: {
          near_earth_objects: {}
        }
      }
    })),
    browse: jest.fn(() => Promise.resolve({
      data: {
        success: true,
        data: {
          near_earth_objects: []
        }
      }
    }))
  },
  imageLibraryAPI: {
    search: jest.fn(() => Promise.resolve({
      data: {
        success: true,
        data: {
          collection: {
            items: [
              {
                data: [{
                  title: 'Test Image',
                  description: 'Test description',
                  nasa_id: 'test123',
                  date_created: '2023-01-01',
                  media_type: 'image'
                }],
                links: [{ href: 'https://example.com/test.jpg' }]
              }
            ]
          }
        }
      }
    })),
    getFeatured: jest.fn(() => Promise.resolve({
      data: {
        success: true,
        data: {}
      }
    })),
    getRandom: jest.fn(() => Promise.resolve({
      data: {
        success: true,
        data: {
          images: []
        }
      }
    }))
  },
  epicAPI: {
    getLatest: jest.fn(() => Promise.resolve({
      data: {
        success: true,
        data: {
          images: [
            {
              image: 'epic_1b_20230101000000',
              date: '2023-01-01 00:00:00',
              image_url: 'https://example.com/earth.jpg',
              centroid_coordinates: { lat: 0, lon: 0 }
            }
          ],
          date: '2023-01-01'
        }
      }
    })),
    getAvailableDates: jest.fn(() => Promise.resolve({
      data: {
        success: true,
        data: [
          { date: '2023-01-01' },
          { date: '2023-01-02' }
        ]
      }
    })),
    getImages: jest.fn(() => Promise.resolve({
      data: {
        success: true,
        data: []
      }
    }))
  }
}));

const renderWithRouter = (component) => {
  return render(
    <BrowserRouter>
      {component}
    </BrowserRouter>
  );
};

describe('NASA Data Explorer Components', () => {
  describe('Home Component', () => {
    test('renders home page with navigation links', () => {
      renderWithRouter(<Home />);
      
      expect(screen.getByText('NASA Data Explorer')).toBeInTheDocument();
      expect(screen.getByText('Explore the universe through NASA\'s vast collection')).toBeInTheDocument();
      expect(screen.getByText('Start Exploring')).toBeInTheDocument();
      expect(screen.getByText('Browse Gallery')).toBeInTheDocument();
    });

    test('displays featured sections', () => {
      renderWithRouter(<Home />);
      
      expect(screen.getByText('Astronomy Picture of the Day')).toBeInTheDocument();
      expect(screen.getByText('Mars Rover Photos')).toBeInTheDocument();
      expect(screen.getByText('Near Earth Objects')).toBeInTheDocument();
    });
  });

  describe('APOD Component', () => {
    test('renders APOD page and loads today\'s picture', async () => {
      renderWithRouter(<APOD />);
      
      expect(screen.getByText('Astronomy Picture of the Day')).toBeInTheDocument();
      expect(screen.getByText('Discover the cosmos!')).toBeInTheDocument();
      
      await waitFor(() => {
        expect(screen.getByText('Test APOD')).toBeInTheDocument();
      });
    });

    test('handles date selection', async () => {
      renderWithRouter(<APOD />);
      
      const dateInput = screen.getByDisplayValue(/\d{4}-\d{2}-\d{2}/);
      fireEvent.change(dateInput, { target: { value: '2023-01-03' } });
      
      const fetchButton = screen.getByText('Get Picture');
      fireEvent.click(fetchButton);
      
      await waitFor(() => {
        expect(screen.getByText('Date APOD')).toBeInTheDocument();
      });
    });

    test('handles random images', async () => {
      renderWithRouter(<APOD />);
      
      const randomButton = screen.getByText('Random Images');
      fireEvent.click(randomButton);
      
      await waitFor(() => {
        expect(screen.getByText('Random APOD')).toBeInTheDocument();
      });
    });
  });

  describe('Mars Rover Component', () => {
    test('renders Mars Rover page and loads rovers', async () => {
      renderWithRouter(<MarsRover />);
      
      expect(screen.getByText('Mars Rover Photos')).toBeInTheDocument();
      expect(screen.getByText('Explore the Red Planet')).toBeInTheDocument();
      
      await waitFor(() => {
        expect(screen.getByText('Curiosity')).toBeInTheDocument();
      });
    });

    test('handles rover selection and photo search', async () => {
      renderWithRouter(<MarsRover />);
      
      await waitFor(() => {
        const curiosityButton = screen.getByText('Curiosity');
        fireEvent.click(curiosityButton);
      });
      
      const solInput = screen.getByPlaceholderText('Enter Sol (Martian day)');
      fireEvent.change(solInput, { target: { value: '1000' } });
      
      const searchButton = screen.getByText('Search Photos');
      fireEvent.click(searchButton);
      
      await waitFor(() => {
        expect(screen.getByText('MAST')).toBeInTheDocument();
      });
    });
  });

  describe('Near Earth Objects Component', () => {
    test('renders NEO page and loads statistics', async () => {
      renderWithRouter(<NearEarthObjects />);
      
      expect(screen.getByText('Near Earth Objects')).toBeInTheDocument();
      expect(screen.getByText('Track asteroids and comets')).toBeInTheDocument();
      
      await waitFor(() => {
        expect(screen.getByText('1,000')).toBeInTheDocument(); // Total count
        expect(screen.getByText('100')).toBeInTheDocument(); // Hazardous count
      });
    });

    test('handles date range search', async () => {
      renderWithRouter(<NearEarthObjects />);
      
      const startDateInput = screen.getByLabelText('Start Date');
      const endDateInput = screen.getByLabelText('End Date');
      
      fireEvent.change(startDateInput, { target: { value: '2023-01-01' } });
      fireEvent.change(endDateInput, { target: { value: '2023-01-07' } });
      
      const searchButton = screen.getByText('Search NEOs');
      fireEvent.click(searchButton);
      
      await waitFor(() => {
        expect(screen.getByText('Test Asteroid')).toBeInTheDocument();
      });
    });
  });

  describe('Image Library Component', () => {
    test('renders Image Library page', () => {
      renderWithRouter(<ImageLibrary />);
      
      expect(screen.getByText('NASA Image & Video Library')).toBeInTheDocument();
      expect(screen.getByText('Explore NASA\'s vast collection')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Search for space images, videos, and audio...')).toBeInTheDocument();
    });

    test('handles search functionality', async () => {
      renderWithRouter(<ImageLibrary />);
      
      const searchInput = screen.getByPlaceholderText('Search for space images, videos, and audio...');
      fireEvent.change(searchInput, { target: { value: 'apollo' } });
      
      const searchButton = screen.getByText('Search');
      fireEvent.click(searchButton);
      
      await waitFor(() => {
        expect(screen.getByText('Test Image')).toBeInTheDocument();
      });
    });

    test('handles media type selection', () => {
      renderWithRouter(<ImageLibrary />);
      
      const mediaSelect = screen.getByDisplayValue('Images');
      fireEvent.change(mediaSelect, { target: { value: 'video' } });
      
      expect(mediaSelect.value).toBe('video');
    });
  });

  describe('Earth Images Component', () => {
    test('renders Earth Images page and loads latest images', async () => {
      renderWithRouter(<EarthImages />);
      
      expect(screen.getByText('Earth from Space')).toBeInTheDocument();
      expect(screen.getByText('View our beautiful planet from space')).toBeInTheDocument();
      
      await waitFor(() => {
        expect(screen.getByText('epic_1b_20230101000000')).toBeInTheDocument();
      });
    });

    test('handles image type selection', async () => {
      renderWithRouter(<EarthImages />);
      
      const enhancedButton = screen.getByText('Enhanced');
      fireEvent.click(enhancedButton);
      
      expect(enhancedButton).toHaveClass('bg-cyan-600');
    });

    test('handles date selection', async () => {
      renderWithRouter(<EarthImages />);
      
      await waitFor(() => {
        const dateSelect = screen.getByDisplayValue('Latest Images');
        fireEvent.change(dateSelect, { target: { value: '2023-01-01' } });
        
        expect(dateSelect.value).toBe('2023-01-01');
      });
    });
  });

  describe('Error Handling', () => {
    test('displays error message when API fails', async () => {
      // Mock API failure
      const mockAPI = require('../lib/api');
      mockAPI.apodAPI.getToday.mockRejectedValueOnce(new Error('API Error'));
      
      renderWithRouter(<APOD />);
      
      await waitFor(() => {
        expect(screen.getByText('Failed to load today\'s astronomy picture')).toBeInTheDocument();
      });
    });
  });

  describe('Loading States', () => {
    test('displays loading spinner during API calls', async () => {
      // Mock delayed API response
      const mockAPI = require('../lib/api');
      mockAPI.apodAPI.getToday.mockImplementationOnce(
        () => new Promise(resolve => setTimeout(resolve, 100))
      );
      
      renderWithRouter(<APOD />);
      
      expect(screen.getByText('Loading today\'s astronomy picture...')).toBeInTheDocument();
    });
  });

  describe('Responsive Design', () => {
    test('components render properly on mobile viewport', () => {
      // Mock mobile viewport
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 375,
      });
      
      renderWithRouter(<Home />);
      
      expect(screen.getByText('NASA Data Explorer')).toBeInTheDocument();
    });
  });
});

