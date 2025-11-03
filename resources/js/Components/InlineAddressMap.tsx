import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useTranslation } from '@/hooks/useTranslation';
// Import Leaflet CSS to ensure proper map rendering
import 'leaflet/dist/leaflet.css';

interface InlineAddressMapProps {
  address?: string;
  onAddressSelect: (address: string, coordinates: { lat: number; lng: number }) => void;
  onLocationSelect: (coordinates: { lat: number; lng: number }) => void;
  isVisible: boolean;
  onToggle: () => void;
  validationResult?: {
    valid: boolean;
    location?: { lat: number; lng: number };
  } | null;
}

const InlineAddressMap: React.FC<InlineAddressMapProps> = ({
  address,
  onAddressSelect,
  onLocationSelect,
  isVisible,
  onToggle,
  validationResult,
}) => {
  const { t } = useTranslation();
  const mapRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<any>(null);
  const [marker, setMarker] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mapCenter, setMapCenter] = useState<[number, number]>([34.0522, -5.0000]); // Default to Morocco (Fes)
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [lastGeocodedAddress, setLastGeocodedAddress] = useState<string>('');
  const [exactCoordinates, setExactCoordinates] = useState<{ lat: number; lng: number } | null>(null);
  const [isGettingLocation, setIsGettingLocation] = useState(false);

  // Helper function to safely remove marker
  const removeMarker = useCallback(() => {
    if (marker) {
      try {
        if (map && map.hasLayer(marker)) {
          map.removeLayer(marker);
        }
      } catch (err) {
        // Error removing marker
      }
      setMarker(null);
    }
  }, [marker, map]);

  // Get user's current location
  const getUserLocation = () => {
    setIsGettingLocation(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude, accuracy } = position.coords;
          
          // Only use location if accuracy is reasonable (within 100 meters)
          if (accuracy <= 100) {
          setUserLocation({ lat: latitude, lng: longitude });
          setMapCenter([latitude, longitude]);
          
            if (map) {
              map.setView([latitude, longitude], 15); // Higher zoom for better accuracy
            }
          } else {
            // Use default Morocco location if accuracy is poor
            setUserLocation({ lat: 34.0522, lng: -5.0000 });
            setMapCenter([34.0522, -5.0000]);
            
          if (map) {
              map.setView([34.0522, -5.0000], 13);
            }
          }
          setIsGettingLocation(false);
        },
        (error) => {
          // Use default Morocco location
          setUserLocation({ lat: 34.0522, lng: -5.0000 });
          setMapCenter([34.0522, -5.0000]);
          
          if (map) {
            map.setView([34.0522, -5.0000], 13);
          }
          setIsGettingLocation(false);
        },
        {
          enableHighAccuracy: true,
          timeout: 15000, // Increased timeout
          maximumAge: 60000 // 1 minute cache
        }
      );
    } else {
      // Use default Morocco location
      setUserLocation({ lat: 34.0522, lng: -5.0000 });
      setMapCenter([34.0522, -5.0000]);
      
      if (map) {
        map.setView([34.0522, -5.0000], 13);
      }
      setIsGettingLocation(false);
    }
  };

  // Initialize map when component becomes visible
  useEffect(() => {
    if (isVisible && mapRef.current && !map) {
      // Get user location first
      getUserLocation();
      
      // Wait for container to be properly sized
      const initializeMap = () => {
        if (!mapRef.current) return;
        
        const container = mapRef.current;
        const rect = container.getBoundingClientRect();
        
        if (rect.width === 0 || rect.height === 0) {
          setTimeout(initializeMap, 50);
          return;
        }
        
        import('leaflet').then((L) => {
        delete (L.default.Icon.Default.prototype as any)._getIconUrl;
        L.default.Icon.Default.mergeOptions({
          iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
          iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
          shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
        });

        container.style.width = '100%';
        container.style.height = '100%';
        container.style.position = 'absolute';
        container.style.top = '0';
        container.style.left = '0';
        container.style.right = '0';
        container.style.bottom = '0';

        const leafletMap = L.default.map(mapRef.current!, {
          center: mapCenter,
          zoom: 13,
          zoomControl: true,
          attributionControl: false,
          preferCanvas: false,
          renderer: L.default.svg(),
          fadeAnimation: true,
          zoomAnimation: true,
          markerZoomAnimation: true
        });

        L.default.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
          maxZoom: 19,
          minZoom: 1,
          crossOrigin: true,
          detectRetina: true,
          updateWhenIdle: true,
          updateWhenZooming: true,
          keepBuffer: 2
        }).addTo(leafletMap);

        // Add click event listener
        leafletMap.on('click', (e: any) => {
          const { lat, lng } = e.latlng;
          handleLocationSelect({ lat, lng });
        });

        setMap(leafletMap);

        setTimeout(() => {
          leafletMap.invalidateSize();
          setTimeout(() => {
            leafletMap.invalidateSize();
              setTimeout(() => {
                leafletMap.invalidateSize();
                const currentZoom = leafletMap.getZoom();
                leafletMap.setZoom(currentZoom + 0.1);
                setTimeout(() => {
                  leafletMap.setZoom(currentZoom);
                  leafletMap.invalidateSize();
                setTimeout(() => {
                  leafletMap.invalidateSize();
                  leafletMap.setView(leafletMap.getCenter(), leafletMap.getZoom());
                }, 50);
                }, 10);
            }, 25);
          }, 25);
        }, 150);
      });
    };
    
    setTimeout(initializeMap, 100);
    }
  }, [isVisible]);

  useEffect(() => {
    if (!isVisible && map) {
      map.remove();
      setMap(null);
      setMarker(null);
    }
  }, [isVisible, map]);

  useEffect(() => {
    if (isVisible && map) {
      setTimeout(() => {
        map.invalidateSize();
        setTimeout(() => {
          map.invalidateSize();
        }, 50);
      }, 100);
    }
  }, [isVisible, map]);

  useEffect(() => {
    const handleResize = () => {
      if (map && isVisible) {
        setTimeout(() => {
          map.invalidateSize();
        }, 100);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [map, isVisible]);

  useEffect(() => {
    const handleAddressChange = async () => {
      if (map) {
        const cleanAddress = address
          ?.replace(/Download the React DevTools.*?$/gm, '')
          ?.replace(/Unchecked runtime\.lastError.*?$/gm, '')
          ?.replace(/Backend locale.*?$/gm, '')
          ?.replace(/Frontend locale.*?$/gm, '')
          ?.replace(/user Object.*?$/gm, '')
          ?.replace(/Container dimensions.*?$/gm, '')
          ?.replace(/Map resized.*?$/gm, '')
          ?.replace(/Map initialized.*?$/gm, '')
          ?.replace(/CSRF Token.*?$/gm, '')
          ?.replace(/Address to validate.*?$/gm, '')
          ?.replace(/Validation API result.*?$/gm, '')
          ?.replace(/API Success Response.*?$/gm, '')
          ?.replace(/Creating marker.*?$/gm, '')
          ?.replace(/Marker created.*?$/gm, '')
          ?.replace(/Successfully geocoded.*?$/gm, '')
          ?.replace(/Trying geocoding.*?$/gm, '')
          ?.replace(/Geocoding result.*?$/gm, '')
          ?.replace(/Skipping duplicate.*?$/gm, '')
          ?.replace(/Validation API failed.*?$/gm, '')
          ?.replace(/Trying direct geocoding.*?$/gm, '')
          ?.replace(/API Error Response.*?$/gm, '')
          ?.replace(/Address validation error.*?$/gm, '')
          ?.replace(/General\.tsx.*?$/gm, '')
          ?.replace(/InlineAddressMap\.tsx.*?$/gm, '')
          ?.replace(/useAddressValidation\.ts.*?$/gm, '')
          ?.replace(/console\.log.*?$/gm, '')
          ?.replace(/console\.warn.*?$/gm, '')
          ?.replace(/console\.error.*?$/gm, '')
          ?.replace(/console\.info.*?$/gm, '')
          ?.replace(/\s+/g, ' ')
          ?.trim() || '';

        if (cleanAddress && cleanAddress.length > 5) {
          const isCoordinateAddress = /^-?\d+\.?\d*,\s*-?\d+\.?\d*$/.test(cleanAddress);
          
          if (isCoordinateAddress) {
            const [lat, lng] = cleanAddress.split(',').map(coord => parseFloat(coord.trim()));
            const newCenter: [number, number] = [lat, lng];
            setMapCenter(newCenter);
            map.setView(newCenter, 13);
            
            if (!marker || !marker.getLatLng || 
                Math.abs(marker.getLatLng().lat - lat) > 0.0001 || 
                Math.abs(marker.getLatLng().lng - lng) > 0.0001) {
              removeMarker();
              try {
                const L = await import('leaflet');
                if (map && map.getContainer()) {
                  const newMarker = L.default.marker(newCenter).addTo(map);
                  setMarker(newMarker);
                }
              } catch (err) {
                // Error creating marker
              }
            }
            setError(null);
          } else if (validationResult && validationResult.valid && validationResult.location) {
            const coords = validationResult.location;
            const newCenter: [number, number] = [coords.lat, coords.lng];
            setMapCenter(newCenter);
            map.setView(newCenter, 13);
            
            if (!marker || !marker.getLatLng || 
                Math.abs(marker.getLatLng().lat - coords.lat) > 0.0001 || 
                Math.abs(marker.getLatLng().lng - coords.lng) > 0.0001) {
            removeMarker();
            try {
              const L = await import('leaflet');
              if (map && map.getContainer()) {
                const newMarker = L.default.marker(newCenter).addTo(map);
                setMarker(newMarker);
                }
              } catch (err) {
                // Error creating marker
              }
            }
            setError(null);
          } else {
            geocodeAddress(cleanAddress);
          }
        } else if (!address || address.trim().length === 0) {
          if (userLocation) {
            setMapCenter([userLocation.lat, userLocation.lng]);
            map.setView([userLocation.lat, userLocation.lng], 13);
          }
        }
      }
    };

    handleAddressChange();
  }, [address, map, userLocation, validationResult]);

  const getCoordinatesFromValidationAPI = async (addressToGeocode: string): Promise<{ lat: number; lng: number } | null> => {
    try {
      const response = await fetch('/validate-address', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
        },
        body: JSON.stringify({ address: addressToGeocode }),
        credentials: 'same-origin',
      });

      if (response.ok) {
        const result = await response.json();
        if (result.valid && result.location) {
          return result.location;
        }
      }
    } catch (err) {
      // Validation API error
    }
    return null;
  };

  const geocodeAddress = async (addressToGeocode: string) => {
    const cleanAddress = addressToGeocode
      ?.replace(/Download the React DevTools.*?$/gm, '')
      ?.replace(/Unchecked runtime\.lastError.*?$/gm, '')
      ?.replace(/Backend locale.*?$/gm, '')
      ?.replace(/Frontend locale.*?$/gm, '')
      ?.replace(/user Object.*?$/gm, '')
      ?.replace(/Container dimensions.*?$/gm, '')
      ?.replace(/Map resized.*?$/gm, '')
      ?.replace(/Map initialized.*?$/gm, '')
      ?.replace(/CSRF Token.*?$/gm, '')
      ?.replace(/Address to validate.*?$/gm, '')
      ?.replace(/Validation API result.*?$/gm, '')
      ?.replace(/API Success Response.*?$/gm, '')
      ?.replace(/Creating marker.*?$/gm, '')
      ?.replace(/Marker created.*?$/gm, '')
      ?.replace(/Successfully geocoded.*?$/gm, '')
      ?.replace(/Trying geocoding.*?$/gm, '')
      ?.replace(/Geocoding result.*?$/gm, '')
      ?.replace(/Skipping duplicate.*?$/gm, '')
      ?.replace(/Validation API failed.*?$/gm, '')
      ?.replace(/Trying direct geocoding.*?$/gm, '')
      ?.replace(/API Error Response.*?$/gm, '')
      ?.replace(/Address validation error.*?$/gm, '')
      ?.replace(/General\.tsx.*?$/gm, '')
      ?.replace(/InlineAddressMap\.tsx.*?$/gm, '')
      ?.replace(/useAddressValidation\.ts.*?$/gm, '')
      ?.replace(/console\.log.*?$/gm, '')
      ?.replace(/console\.warn.*?$/gm, '')
      ?.replace(/console\.error.*?$/gm, '')
      ?.replace(/console\.info.*?$/gm, '')
      ?.replace(/\s+/g, ' ')
      ?.trim() || '';

    if (!cleanAddress || cleanAddress.length < 5) {
      return;
    }

    if (lastGeocodedAddress === cleanAddress) {
      return;
    }
    
    setLastGeocodedAddress(cleanAddress);
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/validate-address', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
        },
        body: JSON.stringify({ address: cleanAddress }),
        credentials: 'same-origin',
      });

      if (response.ok) {
        const result = await response.json();
        
        if (result.valid && result.location) {
          const { lat, lng } = result.location;
          const newCenter: [number, number] = [lat, lng];
          setMapCenter(newCenter);
          
          if (map) {
            map.setView(newCenter, 13);
            
            if (!marker || !marker.getLatLng || 
                Math.abs(marker.getLatLng().lat - lat) > 0.0001 || 
                Math.abs(marker.getLatLng().lng - lng) > 0.0001) {
            removeMarker();
            try {
              const L = await import('leaflet');
              if (map && map.getContainer()) {
                const newMarker = L.default.marker(newCenter).addTo(map);
                setMarker(newMarker);
              }
            } catch (err) {
                // Error creating marker
              }
            }
          }
          
          // Clear any previous errors
          setError(null);
          return;
        }
      }
      
      // Try different search variations for better results
      const searchVariations = [
        cleanAddress,
        cleanAddress.replace('AV ', 'Avenue '),
        cleanAddress.replace('Fès', 'Fes'),
        cleanAddress.replace('Fès', 'Fez'),
        `Avenue Allal Ben Abdellah, Fes, Morocco`,
        `Avenue Allal Ben Abdellah, Fès, Morocco`,
      ];

      let geocodeData = null;
      
      for (let i = 0; i < searchVariations.length; i++) {
        const searchTerm = searchVariations[i];
        
        const geocodeResponse = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchTerm)}&limit=3&addressdetails=1&countrycodes=ma`,
          {
            headers: {
              'User-Agent': 'VetoClick/1.0 (Address Validation)',
            },
          }
        );

        if (geocodeResponse.ok) {
          const data = await geocodeResponse.json();
          
          if (data && data.length > 0) {
            geocodeData = data;
            break;
          }
        }
        
        if (i < searchVariations.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 200));
        }
      }

      if (geocodeData && geocodeData.length > 0) {
        const result = geocodeData[0];
        const lat = parseFloat(result.lat);
        const lng = parseFloat(result.lon);
        const newCenter: [number, number] = [lat, lng];
        setMapCenter(newCenter);
        
        if (map) {
          map.setView(newCenter, 13);
          
          // Only add marker if we don't already have one at this location
          if (!marker || !marker.getLatLng || 
              Math.abs(marker.getLatLng().lat - lat) > 0.0001 || 
              Math.abs(marker.getLatLng().lng - lng) > 0.0001) {
          removeMarker();
          try {
            const L = await import('leaflet');
            if (map && map.getContainer()) {
              const newMarker = L.default.marker(newCenter).addTo(map);
              setMarker(newMarker);
            }
          } catch (err) {
            // Error creating marker
            }
          }
        }
        
        setError(null);
      } else {
        setError(t('common.unable_to_locate_address'));
      }
    } catch (err) {
      setError(t('common.unable_to_locate_address'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleLocationSelect = async (coordinates: { lat: number; lng: number }) => {
    
    if (map) {
      // Remove existing marker
      removeMarker();
      
      try {
        const L = await import('leaflet');
        if (map && map.getContainer()) {
          const newMarker = L.default.marker([coordinates.lat, coordinates.lng]).addTo(map);
          setMarker(newMarker);
        }
      } catch (err) {
        // Error creating marker
      }
    }
    
    setMapCenter([coordinates.lat, coordinates.lng]);
    setExactCoordinates(coordinates);
    
    onLocationSelect(coordinates);
    
    reverseGeocode(coordinates);
  };

  const reverseGeocode = async (coordinates: { lat: number; lng: number }) => {
    setIsLoading(true);
    setError(null);

    try {
      // Try multiple reverse geocoding approaches to get a better address
      const geocodingUrls = [
        // Most detailed address with all components (building level)
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${coordinates.lat}&lon=${coordinates.lng}&addressdetails=1&zoom=18&extratags=1`,
        // Detailed address with street level
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${coordinates.lat}&lon=${coordinates.lng}&addressdetails=1&zoom=17&extratags=1`,
        // Street level address
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${coordinates.lat}&lon=${coordinates.lng}&addressdetails=1&zoom=16&extratags=1`,
        // Area level address
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${coordinates.lat}&lon=${coordinates.lng}&addressdetails=1&zoom=14&extratags=1`,
      ];

      let bestAddress = null;
      let bestResult = null;

      for (const url of geocodingUrls) {
        try {
          const response = await fetch(url, {
          headers: {
            'User-Agent': 'VetoClick/1.0 (Address Validation)',
          },
          });

          if (response.ok) {
            const result = await response.json();
            
            if (result.display_name) {
              // Try to build a simpler address from the components
              const address = result.address;
              let simpleAddress = '';
              
              if (address) {
                // Build address from most important components, prioritizing specific location info
                const components = [];
                
                // Most specific location info first
                if (address.house_number) components.push(address.house_number);
                if (address.road) components.push(address.road);
                if (address.building) components.push(address.building);
                if (address.amenity) components.push(address.amenity); // For businesses like "Pharmacie", "Restaurant", etc.
                if (address.shop) components.push(address.shop); // For shops
                if (address.office) components.push(address.office); // For offices
                
                // Area information
                if (address.suburb || address.neighbourhood) components.push(address.suburb || address.neighbourhood);
                if (address.quarter) components.push(address.quarter);
                if (address.district) components.push(address.district);
                
                // City and administrative info
                if (address.city || address.town) components.push(address.city || address.town);
                if (address.state) components.push(address.state);
                if (address.country) components.push(address.country);
                
                simpleAddress = components.join(', ');
              }
              
              // Use the simpler address if available, otherwise use display_name
              const finalAddress = simpleAddress || result.display_name;
              
              // Prefer addresses that contain specific business or location info
              const hasBusinessInfo = address && (address.amenity || address.shop || address.office || address.building);
              const hasSpecificLocation = address && (address.house_number || address.road);
              const isMoreSpecific = hasBusinessInfo || hasSpecificLocation;
              
              // Prefer addresses with business info or specific location details
              if (!bestAddress || 
                  (isMoreSpecific && !bestResult?.address?.amenity && !bestResult?.address?.shop) ||
                  (finalAddress.length < bestAddress.length && finalAddress.length > 10 && !isMoreSpecific)) {
                bestAddress = finalAddress;
                bestResult = result;
              }
            }
          }
        } catch (err) {
          // Reverse geocoding attempt failed
        }
        
        await new Promise(resolve => setTimeout(resolve, 100));
      }

      if (bestAddress) {
        
        const hasRoadInfo = bestAddress.includes('RN') || bestAddress.includes('Route') || bestAddress.includes('Avenue') || bestAddress.includes('Rue');
        const isGenericAddress = (!hasRoadInfo && bestAddress.length < 20) || 
          (!hasRoadInfo && !bestAddress.includes(',')) || 
          (!hasRoadInfo && bestAddress.split(',').length < 3) ||
          (bestAddress.includes('Morocco') && bestAddress.split(',').length < 3 && !hasRoadInfo);
        
        if (isGenericAddress) {
          const fallbackAddress = `${coordinates.lat.toFixed(6)}, ${coordinates.lng.toFixed(6)}`;
          onAddressSelect(fallbackAddress, coordinates);
        } else {
          const hasSpecificLocation = bestResult?.address && (
            bestResult.address.house_number || 
            bestResult.address.building || 
            bestResult.address.amenity || 
            bestResult.address.shop || 
            bestResult.address.office
          );
          
          if (hasSpecificLocation) {
          onAddressSelect(bestAddress, coordinates);
          } else {
            const exactAddress = `${coordinates.lat.toFixed(6)}, ${coordinates.lng.toFixed(6)}`;
            onAddressSelect(exactAddress, coordinates);
          }
        }
      } else {
        const fallbackAddress = `${coordinates.lat.toFixed(6)}, ${coordinates.lng.toFixed(6)}`;
        onAddressSelect(fallbackAddress, coordinates);
      }
    } catch (err) {
      setError(t('common.unable_to_get_address'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="mt-4">
      {/* Map Toggle Button */}
      <div className="flex items-center justify-between mb-2">
        <h4 className="text-sm font-medium text-gray-700">{t('common.map_location')}</h4>
        <div className="flex items-center space-x-3">
          {(!address || address.trim().length === 0 || (error && !(validationResult && validationResult.valid && validationResult.location))) && (
            <button
              type="button"
              disabled={isGettingLocation}
              onClick={async () => {
                setIsGettingLocation(true);
                // Force a fresh geolocation request
                if (navigator.geolocation) {
                  navigator.geolocation.getCurrentPosition(
                    async (position) => {
                      const { latitude, longitude, accuracy } = position.coords;
                      
                      if (accuracy <= 100) {
                        const newLocation = { lat: latitude, lng: longitude };
                        setUserLocation(newLocation);
                        setMapCenter([latitude, longitude]);
                        
                        if (map) {
                          map.setView([latitude, longitude], 15);
                          removeMarker();
                          
                          try {
                            const L = await import('leaflet');
                            if (map && map.getContainer()) {
                              const newMarker = L.default.marker([latitude, longitude]).addTo(map);
                              setMarker(newMarker);
                            }
                          } catch (err) {
                            // Error creating marker
                          }
                          reverseGeocode(newLocation);
                        }
                      } else {
                        // Still use the location but with lower zoom
                        const newLocation = { lat: latitude, lng: longitude };
                        setUserLocation(newLocation);
                        setMapCenter([latitude, longitude]);
                        
                        if (map) {
                          map.setView([latitude, longitude], 13);
                          removeMarker();
                          
                          try {
                            const L = await import('leaflet');
                            if (map && map.getContainer()) {
                              const newMarker = L.default.marker([latitude, longitude]).addTo(map);
                              setMarker(newMarker);
                            }
                          } catch (err) {
                            // Error creating marker
                          }
                          reverseGeocode(newLocation);
                        }
                      }
                      setIsGettingLocation(false);
                    },
                    (error) => {
                      // Fallback to existing user location or default
                      if (userLocation) {
                        setMapCenter([userLocation.lat, userLocation.lng]);
                        if (map) {
                          map.setView([userLocation.lat, userLocation.lng], 13);
                        }
                      } else {
                        getUserLocation();
                      }
                      setIsGettingLocation(false);
                    },
                    {
                      enableHighAccuracy: true,
                      timeout: 15000,
                      maximumAge: 0 // Force fresh location
                    }
                  );
                } else {
                  getUserLocation();
                }
              }}
              className="flex items-center space-x-1 text-sm text-green-600 hover:text-green-800 transition-colors"
            >
              {isGettingLocation ? (
                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              ) : (
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              )}
              <span>{isGettingLocation ? 'Getting location...' : t('common.use_current_location')}</span>
            </button>
          )}
          <button
            type="button"
            onClick={onToggle}
            className="flex items-center space-x-2 text-sm text-blue-600 hover:text-blue-800 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
            </svg>
            <span>{isVisible ? t('common.hide_map') : t('common.show_map')}</span>
          </button>
        </div>
      </div>

      {/* Map Container */}
      {isVisible && (
        <div className="border border-gray-300 rounded-lg overflow-hidden w-full">
          <div 
            className="relative" 
            style={{ 
              width: '100%', 
              height: '320px',
              minWidth: '100%',
              minHeight: '320px',
              position: 'relative',
              display: 'block',
              // Ensure proper rendering context
              transform: 'translateZ(0)',
              backfaceVisibility: 'hidden'
            }}
          >
            {isLoading && (
              <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center z-10">
                <div className="flex items-center space-x-2">
                  <svg className="animate-spin h-5 w-5 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span className="text-sm text-gray-600">{t('common.loading_map')}</span>
                </div>
              </div>
            )}

            {error && !(validationResult && validationResult.valid && validationResult.location) && (
              <div className="absolute top-2 left-2 right-2 bg-red-100 border border-red-400 text-red-700 px-3 py-2 rounded text-sm z-10">
                {error}
              </div>
            )}

            <div 
              ref={mapRef} 
              className="leaflet-container"
              style={{ 
                width: '100%', 
                height: '100%', 
                minWidth: '100%',
                minHeight: '320px',
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                zIndex: 1,
                // Add these styles to prevent rendering issues
                transform: 'translateZ(0)',
                backfaceVisibility: 'hidden',
                WebkitTransform: 'translateZ(0)',
                // Ensure proper tile rendering
                imageRendering: 'crisp-edges',
                // Prevent text selection on map
                WebkitUserSelect: 'none',
                MozUserSelect: 'none',
                msUserSelect: 'none'
              }} 
            />
          </div>
          
        </div>
      )}
    </div>
  );
};

export default InlineAddressMap;
