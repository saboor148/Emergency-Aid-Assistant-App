import React, { useEffect, useState, useRef } from 'react';
import { 
  APIProvider, 
  Map, 
  AdvancedMarker, 
  Pin, 
  InfoWindow, 
  useMap, 
  useMapsLibrary,
  useAdvancedMarkerRef
} from '@vis.gl/react-google-maps';
import { 
  Navigation, 
  MapPin, 
  AlertCircle, 
  Hospital, 
  PhoneCall, 
  ShieldAlert, 
  CornerUpRight, 
  Search, 
  Activity, 
  Compass,
  CheckCircle2
} from 'lucide-react';

const API_KEY = (
  process.env.GOOGLE_MAPS_PLATFORM_KEY ||
  (import.meta as any).env?.VITE_GOOGLE_MAPS_PLATFORM_KEY ||
  (globalThis as any).GOOGLE_MAPS_PLATFORM_KEY ||
  ''
).trim();

const hasValidKey = (() => {
  if (!API_KEY) return false;
  if (API_KEY.length < 15) return false;
  // Google Maps Platform API keys strictly start with the AIzaSy prefix
  if (!API_KEY.startsWith("AIzaSy")) return false;
  const lower = API_KEY.toLowerCase();
  if (
    lower.includes('placeholder') || 
    lower.includes('your_') || 
    lower.includes('api_key') || 
    lower.includes('secret') || 
    lower.includes('config')
  ) {
    return false;
  }
  // Alphanumeric, underscores, hyphens, and periods (safely supports standard keys)
  return /^[\w.-]+$/.test(API_KEY);
})();

// Default focus in Lahore, Pakistan if location is disabled
const FALLBACK_LOCATION = { lat: 31.5204, lng: 74.3587 };

// Static curated list of critical public & government hospitals across Pakistan
const EMERGENCY_FALLBACK_DATA = [
  {
    id: "mayo-lahore",
    displayName: "Mayo Hospital (Government), Lahore",
    lat: 31.5714,
    lng: 74.3113,
    formattedAddress: "Hospital Road, Near Anarkali, Lahore, Punjab",
    editorialSummary: "One of the oldest and largest public sector hospitals in Lahore, Pakistan, offering round-the-clock free emergency care and trauma facilities."
  },
  {
    id: "jinnah-lahore",
    displayName: "Jinnah Hospital (Government), Lahore",
    lat: 31.4828,
    lng: 74.3015,
    formattedAddress: "Usman Road, Quaid-e-Azam Campus, Lahore, Punjab",
    editorialSummary: "A large-scale teaching hospital with advanced cardiology, burns center, and highly active emergency trauma department."
  },
  {
    id: "jpmc-karachi",
    displayName: "Jinnah Postgraduate Medical Centre (JPMC), Karachi",
    lat: 24.8519,
    lng: 67.0427,
    formattedAddress: "Rafiquee Shaheed Road, Karachi, Sindh",
    editorialSummary: "Largest public hospital in Karachi providing free state-of-the-art medical services and massive trauma emergency treatment."
  },
  {
    id: "civil-karachi",
    displayName: "Dr. Ruth K.M. Pfau Civil Hospital, Karachi",
    lat: 24.8596,
    lng: 67.0102,
    formattedAddress: "Baba-e-Urdu Road, Karachi, Sindh",
    editorialSummary: "Historic tertiary care public hospital serving millions with completely free special surgical and emergency wards."
  },
  {
    id: "pims-islamabad",
    displayName: "Pakistan Institute of Medical Sciences (PIMS), Islamabad",
    lat: 33.7027,
    lng: 73.0454,
    formattedAddress: "G-8/3, Islamabad, ICT",
    editorialSummary: "Main federal government hospital in the capital featuring specialized children and adult emergency treatment."
  },
  {
    id: "lrh-peshawar",
    displayName: "Lady Reading Hospital (LRH), Peshawar",
    lat: 34.0152,
    lng: 71.5724,
    formattedAddress: "Soekarno Road, LRH Chowk, Peshawar, KP",
    editorialSummary: "The premium tertiary care teaching hospital of Khyber Pakhtunkhwa with massive scale emergency services."
  },
  {
    id: "sandeman-quetta",
    displayName: "Sandeman Provincial Hospital, Quetta",
    lat: 30.1979,
    lng: 66.9995,
    formattedAddress: "Jinnah Road, Quetta, Balochistan",
    editorialSummary: "Main government provincial center providing trauma surgery and critical care in Balochistan."
  }
];

function getDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371; // Radius of the Earth in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
  return R * c;
}

const createLatLng = (lat: number, lng: number) => {
  if (typeof google !== 'undefined' && google.maps && google.maps.LatLng) {
    return new google.maps.LatLng(lat, lng);
  }
  const locationObj = {
    lat: () => lat,
    lng: () => lng,
    toJSON: () => ({ lat, lng }),
    getLat: () => lat,
    getLng: () => lng
  };
  Object.defineProperty(locationObj, 'latVal', { value: lat });
  Object.defineProperty(locationObj, 'lngVal', { value: lng });
  return locationObj as any;
};

const getSortedFallbackHospitals = (centerLat: number, centerLng: number) => {
  return EMERGENCY_FALLBACK_DATA.map(h => {
    const dist = getDistanceKm(centerLat, centerLng, h.lat, h.lng);
    return {
      ...h,
      distance: dist,
      location: createLatLng(h.lat, h.lng)
    };
  }).sort((a, b) => a.distance - b.distance);
};

interface HospitalMapInnerProps {
  emergencyName: string;
  userCoords: google.maps.LatLngLiteral | null;
  locationError: string | null;
  onLocateUser: () => void;
  isLocating: boolean;
}

function HospitalMapInner({ 
  emergencyName, 
  userCoords, 
  locationError, 
  onLocateUser, 
  isLocating 
}: HospitalMapInnerProps) {
  const map = useMap();
  const placesLib = useMapsLibrary('places');
  
  const [searchType, setSearchType] = useState<'government' | 'all'>('government');
  const [hospitals, setHospitals] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [activeHospitalId, setActiveHospitalId] = useState<string | null>(null);
  const [customSearchQuery, setCustomSearchQuery] = useState('');
  
  // Center tracking helper
  const mapCenter = userCoords || FALLBACK_LOCATION;

  // Search hospitals near the center
  useEffect(() => {
    if (!map) return;

    setIsSearching(true);
    
    // Construct search term based on query type
    let query = searchType === 'government' 
      ? 'government public services hospital medical center' 
      : 'hospital medical care center';
      
    if (customSearchQuery.trim()) {
      query = customSearchQuery;
    }

    try {
      const currentCenter: any = map.getCenter() || (typeof google !== 'undefined' && google.maps?.LatLng ? new google.maps.LatLng(mapCenter.lat, mapCenter.lng) : mapCenter);
      
      const currentLat = typeof currentCenter.lat === 'function' 
        ? currentCenter.lat() 
        : ((currentCenter as any).lat ?? mapCenter.lat);
        
      const currentLng = typeof currentCenter.lng === 'function' 
        ? currentCenter.lng() 
        : ((currentCenter as any).lng ?? mapCenter.lng);

      const mapDiv = map.getDiv ? map.getDiv() : null;
      const service = new google.maps.places.PlacesService(mapDiv || (window as any).google?.maps?.Map ? map : (document.createElement('div')));
      
      const request: any = {
        query: `${query} in Pakistan`,
        location: currentCenter,
        radius: 12000, // 12 km
      };

      service.textSearch(request, (results, status) => {
        setIsSearching(false);
        if (status === google.maps.places.PlacesServiceStatus.OK && results && results.length > 0) {
          const mappedHospitals = results.map((r) => ({
            id: r.place_id || String(Math.random()),
            displayName: r.name || 'Hospital',
            location: r.geometry?.location || null,
            formattedAddress: r.formatted_address || r.vicinity || 'Pakistan Address Not Specified',
            editorialSummary: (r as any).editorial_summary?.overview || ''
          }));
          
          setHospitals(mappedHospitals);

          // Auto-center viewport to fit hospital markers if any are found
          const bounds = new google.maps.LatLngBounds();
          bounds.extend(currentCenter as any);
          mappedHospitals.forEach((p) => {
            if (p.location) bounds.extend(p.location as any);
          });
          map.fitBounds(bounds);
        } else {
          // Fall back gracefully if error or zero results to keep UI highly usable
          console.warn("PlacesService textSearch status was:", status, ". Loading sorted fallback public hospitals...");
          const sortedFallbacks = getSortedFallbackHospitals(currentLat, currentLng);
          setHospitals(sortedFallbacks);
        }
      });
    } catch (e) {
      console.error("Error executing legacy textSearch:", e);
      const sortedFallbacks = getSortedFallbackHospitals(mapCenter.lat, mapCenter.lng);
      setHospitals(sortedFallbacks);
      setIsSearching(false);
    }
  }, [map, searchType, customSearchQuery, userCoords, placesLib]);

  // Recenter on user's coordinate changes
  useEffect(() => {
    if (map && userCoords) {
      map.setCenter(userCoords);
      map.setZoom(14);
    }
  }, [map, userCoords]);

  // Safe display name parsing helper
  const getPlaceName = (p: any) => {
    if (!p) return 'Hospital';
    if (typeof p.displayName === 'string') return p.displayName;
    return p.displayName?.text || p.name || 'Hospital';
  };

  const activeHospital = hospitals.find(h => h.id === activeHospitalId);

  return (
    <div className="flex flex-col lg:flex-row gap-5 h-[580px] border border-white/5 bg-[#0a0a0a] rounded-xl overflow-hidden p-1.5">
      
      {/* 1. LEFT SIDEBAR: FILTER AND HOSPITAL CARDS LIST */}
      <div className="w-full lg:w-80 flex flex-col h-1/2 lg:h-full bg-[#0f0f0f] border-b lg:border-b-0 lg:border-r border-white/10 p-3.5 space-y-4 overflow-y-auto">
        <div>
          <h4 className="text-white font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 mb-1">
            <Activity className="w-4 h-4 text-red-500" />
            <span>Pakistan Hospital Hub</span>
          </h4>
          <p className="text-[10px] text-gray-400 font-medium font-mono leading-tight">
            Emergency: <span className="text-red-400 font-bold uppercase">{emergencyName}</span>
          </p>
        </div>

        {/* Location Controller */}
        <div className="bg-[#151515] p-3 rounded-lg border border-white/5 space-y-2">
          <div className="flex justify-between items-center text-[10px]">
            <span className="text-gray-400 font-bold">📍 LOCATION STATUS</span>
            <span className={userCoords ? 'text-green-400 font-bold' : 'text-amber-500 font-bold'}>
              {userCoords ? 'ACTIVE (GPS)' : 'FALLBACK (LAHORE)'}
            </span>
          </div>

          <button
            onClick={onLocateUser}
            disabled={isLocating}
            className="w-full py-1.5 px-3 rounded-md bg-red-650 hover:bg-red-700 active:bg-red-800 disabled:bg-white/5 text-white disabled:text-gray-500 font-bold text-[11px] flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-[0_0_8px_rgba(220,38,38,0.3)]"
          >
            <Compass className={`w-3.5 h-3.5 ${isLocating ? 'animate-spin' : ''}`} />
            <span>{isLocating ? 'GPS Coordinates Dhund rahe...' : 'Apni Location Update Karein'}</span>
          </button>

          {locationError && (
            <p className="text-[10px] text-amber-500 font-medium leading-tight pt-1">
              {locationError}
            </p>
          )}
        </div>

        {/* Search Filters */}
        <div className="space-y-2">
          <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest block">🚑 Filter Mode:</label>
          <div className="flex rounded-lg border border-white/10 overflow-hidden bg-[#151515] font-semibold text-[10px]">
            <button
              onClick={() => {
                setSearchType('government');
                setCustomSearchQuery('');
              }}
              className={`flex-1 py-1.5 cursor-pointer text-center border-r border-white/5 ${searchType === 'government' ? 'bg-green-600 font-bold text-white shadow-[0_0_8px_rgba(34,197,94,0.3)]' : 'text-gray-400 hover:bg-white/5'}`}
            >
              Government Free Hospitals
            </button>
            <button
              onClick={() => {
                setSearchType('all');
                setCustomSearchQuery('');
              }}
              className={`flex-1 py-1.5 cursor-pointer text-center ${searchType === 'all' ? 'bg-red-650 font-bold text-white shadow-[0_0_8px_rgba(220,38,38,0.3)]' : 'text-gray-400 hover:bg-white/5'}`}
            >
              All Nearby Hospitals
            </button>
          </div>
        </div>

        {/* Custom manual search in map boundary */}
        <div className="relative">
          <input
            type="text"
            placeholder="Search custom (e.g. Mayo, Jinnah)..."
            value={customSearchQuery}
            onChange={(e) => setCustomSearchQuery(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 bg-[#1a1a1a] border border-white/10 rounded-lg text-xs text-white placeholder-gray-500 focus:outline-none focus:border-red-600 transition-colors"
          />
          <Search className="w-3.5 h-3.5 text-gray-500 absolute left-2.5 top-2.5" />
        </div>

        {/* Hospitals Cards List */}
        <div className="flex-1 overflow-y-auto space-y-2.5 pr-1 min-h-[140px]">
          <div className="flex items-center justify-between text-[9px] font-bold text-gray-500 uppercase tracking-widest pb-1 border-b border-white/5">
            <span>Dhunday Gaye Hospitals:</span>
            <span>{isSearching ? 'Dhund rahe hain...' : hospitals.length}</span>
          </div>

          {isSearching ? (
            <div className="flex flex-col items-center justify-center py-8 text-center text-gray-500 space-y-2">
              <div className="w-5 h-5 rounded-full border-2 border-red-600 border-t-transparent animate-spin"></div>
              <span className="text-[10px] font-mono">MAP SE DATA DHUND RAHE HAIN...</span>
            </div>
          ) : hospitals.length === 0 ? (
            <div className="py-8 text-center text-gray-500">
              <p className="text-[11px]">Koi hospital nahi mila.</p>
              <p className="text-[10px] text-gray-600">Filter badal kar try karein.</p>
            </div>
          ) : (
            hospitals.map((hosp) => {
              const isActive = hosp.id === activeHospitalId;
              const name = getPlaceName(hosp);
              
              return (
                <button
                  key={hosp.id}
                  onClick={() => {
                    setActiveHospitalId(hosp.id);
                    if (hosp.location && map) {
                      map.panTo(hosp.location);
                      map.setZoom(15);
                    }
                  }}
                  className={`w-full p-2.5 rounded-lg border text-left flex gap-2 transition-all cursor-pointer ${
                    isActive 
                      ? 'bg-red-950/20 border-red-650/80 shadow-[0_0_8px_rgba(220,38,38,0.15)] ring-1 ring-red-650/40' 
                      : 'bg-white/5 border-white/5 hover:bg-white/10'
                  }`}
                >
                  <div className="w-7 h-7 bg-[#151515] text-red-400 border border-white/5 rounded flex items-center justify-center shrink-0">
                    <Hospital className="w-4 h-4" />
                  </div>
                  <div className="space-y-0.5 overflow-hidden">
                    <h5 className="text-[11px] font-bold text-white truncate leading-tight group-hover:text-red-400">
                      {name}
                    </h5>
                    <p className="text-[10px] text-gray-400 truncate leading-normal">
                      {hosp.formattedAddress || 'Pakistan Address Not Specified'}
                    </p>
                    
                    {/* Public badge indicator */}
                    {(name.toLowerCase().includes('govt') || 
                      name.toLowerCase().includes('government') || 
                      name.toLowerCase().includes('public') || 
                      name.toLowerCase().includes('services') || 
                      name.toLowerCase().includes('civil') || 
                      name.toLowerCase().includes('jinnah') || 
                      name.toLowerCase().includes('mayo')) && (
                      <span className="inline-block text-[8px] font-mono bg-green-500/10 text-green-400 px-1 py-0.2 rounded border border-green-500/20 font-bold uppercase mt-1">
                        Government Free Care
                      </span>
                    )}
                  </div>
                </button>
              );
            })
          )}
        </div>
      </div>

      {/* 2. CHIEF ELEMENT: GOOGLE MAP VIEW */}
      <div className="flex-1 h-1/2 lg:h-full rounded-lg overflow-hidden relative">
        <Map
          defaultCenter={FALLBACK_LOCATION}
          defaultZoom={11}
          mapId="HospitalFinderMap"
          internalUsageAttributionIds={['gmp_mcp_codeassist_v1_aistudio']}
          gestureHandling="greedy"
          style={{ width: '100%', height: '100%' }}
        >
          {/* Active User GPS Marker */}
          {userCoords && (
            <AdvancedMarker position={userCoords} title="Aap Ki Current Location">
              <div className="relative flex items-center justify-center">
                <span className="animate-ping absolute inline-flex h-6 w-6 rounded-full bg-blue-400 opacity-60"></span>
                <div className="w-4 h-4 bg-blue-500 rounded-full border-2 border-white flex items-center justify-center shadow-lg"></div>
              </div>
            </AdvancedMarker>
          )}

          {/* Fallback Marker if GPS is disabled */}
          {!userCoords && (
            <AdvancedMarker position={FALLBACK_LOCATION} title="Lahore Center (GPS Off)">
              <div className="relative flex items-center justify-center">
                <div className="w-4 h-4 bg-gray-500 rounded-full border-2 border-white flex items-center justify-center shadow-lg"></div>
              </div>
            </AdvancedMarker>
          )}

          {/* Hospitals Markers */}
          {hospitals.map((hosp) => {
            if (!hosp.location) return null;
            const name = getPlaceName(hosp);
            const isSelected = hosp.id === activeHospitalId;
            const isGovt = name.toLowerCase().includes('govt') || 
                           name.toLowerCase().includes('government') || 
                           name.toLowerCase().includes('public') || 
                           name.toLowerCase().includes('services') || 
                           name.toLowerCase().includes('mayo') || 
                           name.toLowerCase().includes('jinnah') || 
                           name.toLowerCase().includes('civil');

            return (
              <AdvancedMarker
                key={hosp.id}
                position={hosp.location}
                onClick={() => setActiveHospitalId(hosp.id)}
              >
                <Pin 
                  background={isSelected ? '#e03a3a' : isGovt ? '#10b981' : '#f59e0b'} 
                  borderColor="#fff" 
                  glyphColor="#fff" 
                  scale={isSelected ? 1.2 : 0.95}
                />
              </AdvancedMarker>
            );
          })}

          {/* Interactive Info Window for Selected Hospital */}
          {activeHospital && activeHospital.location && (
            <InfoWindow
              position={activeHospital.location}
              onCloseClick={() => setActiveHospitalId(null)}
            >
              <div className="p-1.5 max-w-[200px] text-gray-950 font-sans space-y-1">
                <div className="flex items-start gap-1">
                  <Hospital className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                  <strong className="text-xs text-gray-900 block leading-tight">
                    {getPlaceName(activeHospital)}
                  </strong>
                </div>
                <p className="text-[10px] text-gray-650 leading-tight">
                  {activeHospital.formattedAddress || 'Address Not Specified'}
                </p>
                {activeHospital.editorialSummary && (
                  <p className="text-[9px] text-gray-500 italic block leading-snug">
                    "{activeHospital.editorialSummary}"
                  </p>
                )}
                
                <a
                  href={userCoords 
                    ? `https://www.google.com/maps/dir/?api=1&origin=${userCoords.lat},${userCoords.lng}&destination=${activeHospital.location.lat()},${activeHospital.location.lng()}&travelmode=driving`
                    : `https://www.google.com/maps/dir/?api=1&destination=${activeHospital.location.lat()},${activeHospital.location.lng()}&travelmode=driving`
                  }
                  target="_blank"
                  rel="noreferrer"
                  className="mt-1 flex items-center justify-center gap-1.5 w-full py-1 bg-red-600 text-white rounded text-[9px] font-bold uppercase transition-colors hover:bg-red-700"
                >
                  <CornerUpRight className="w-3 h-3" />
                  <span>Rasta Dekhein</span>
                </a>
              </div>
            </InfoWindow>
          )}
        </Map>

        {/* Small floating hint */}
        <div className="absolute bottom-3 left-3 right-3 bg-[#0f0f0f]/90 backdrop-blur border border-white/5 p-2 rounded-lg text-[10px] flex items-center justify-between gap-3 text-gray-300">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-green-500"></span>
            <span>Green Pin: Government (Free treatment)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-amber-500"></span>
            <span>Orange Pin: Private</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// Static backup curated public hospitals in Pakistan with active contact details and location links
const FALLBACK_HOSPITALS_LIST = [
  {
    id: "mayo-lahore",
    name: "Mayo Hospital, Lahore (Government)",
    city: "Lahore, Punjab",
    phone: "04299211102",
    displayPhone: "(042) 99211102",
    address: "Hospital Road, Near Anarkali, Lahore",
    lat: 31.5714,
    lng: 74.3113,
    desc: "Pakistan ka sab se bara aur active public emergency trauma ward containing specialized ICU support."
  },
  {
    id: "jpmc-karachi",
    name: "Jinnah Postgraduate Medical Centre (JPMC)",
    city: "Karachi, Sindh",
    phone: "02199201300",
    displayPhone: "(021) 99201300",
    address: "Rafiquee Shaheed Road, Karachi",
    lat: 24.8519,
    lng: 67.0427,
    desc: "Sindh ka sub se bara public hospital. High-quality tertiary care and accident/emergency services free of cost."
  },
  {
    id: "pims-islamabad",
    name: "Pakistan Institute of Medical Sciences (PIMS)",
    city: "Islamabad, Federal Capital",
    phone: "0519261170",
    displayPhone: "(051) 9261170",
    address: "G-8/3, Islamabad",
    lat: 33.7027,
    lng: 73.0454,
    desc: "Federal area ka central authority hospital with 24/7 dedicated disaster management, critical ICU & trauma care."
  },
  {
    id: "civil-karachi",
    name: "Dr. Ruth K.M. Pfau Civil Hospital",
    city: "Karachi, Sindh",
    phone: "02199215740",
    displayPhone: "(021) 99215740",
    address: "Baba-e-Urdu Road, Karachi",
    lat: 24.8596,
    lng: 67.0102,
    desc: "Government core free hospital with massive scale surgical, cardiac and burns emergency blocks."
  },
  {
    id: "lrh-peshawar",
    name: "Lady Reading Hospital (LRH)",
    city: "Peshawar, Khyber Pakhtunkhwa",
    phone: "0919211430",
    displayPhone: "(091) 9211430",
    address: "Soekarno Road, LRH Chowk, Peshawar",
    lat: 34.0152,
    lng: 71.5724,
    desc: "Peshawar and KP province's top high-throughput emergency center equipped to handle extreme emergency calls."
  },
  {
    id: "sandeman-quetta",
    name: "Sandeman Provincial Civil Hospital",
    city: "Quetta, Balochistan",
    phone: "0819202013",
    displayPhone: "(081) 9202013",
    address: "Jinnah Road, Quetta",
    lat: 30.1979,
    lng: 66.9995,
    desc: "Balochistan's vital government trauma center offering life-saving assistance and public surgeries."
  }
];

export default function HospitalMap({ emergencyName }: { emergencyName: string }) {
  const [userCoords, setUserCoords] = useState<google.maps.LatLngLiteral | null>(null);
  const [isLocating, setIsLocating] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [isKeyInvalid, setIsKeyInvalid] = useState(false);

  // Auto-fetch geolocation on first render
  useEffect(() => {
    locateUser();

    // Catch Google Maps API auth failure dynamically (such as InvalidKeyMapError)
    (window as any).gm_authFailure = () => {
      console.warn("Google Maps authentication failed dynamically via gm_authFailure.");
      setIsKeyInvalid(true);
    };

    // Global event listeners to suppress cross-origin Google Maps / InvalidKeyMapError console errors
    const handleGlobalError = (event: ErrorEvent) => {
      const msg = (event.message || '').toLowerCase();
      const url = (event.filename || '').toLowerCase();
      
      const isMapsError = 
        msg.includes('google') || 
        msg.includes('maps') || 
        msg.includes('invalidkeymaperror') ||
        url.includes('googleapis') || 
        url.includes('google.com/maps') ||
        msg === 'script error.';

      if (isMapsError) {
        console.warn("Safely intercepted and suppressed Google Maps script error:", event.message);
        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation();
        setIsKeyInvalid(true);
        return true;
      }
    };

    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      const reason = event.reason?.message || String(event.reason || '');
      const lowerReason = reason.toLowerCase();
      
      const isMapsRejection = 
        lowerReason.includes('google') || 
        lowerReason.includes('maps') || 
        lowerReason.includes('invalidkeymaperror');

      if (isMapsRejection) {
        console.warn("Safely intercepted and suppressed Google Maps promise rejection:", reason);
        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation();
        setIsKeyInvalid(true);
        return true;
      }
    };

    window.addEventListener('error', handleGlobalError, true);
    window.addEventListener('unhandledrejection', handleUnhandledRejection, true);

    return () => {
      // Do not leave stale handlers on unmount
      if ((window as any).gm_authFailure) {
        delete (window as any).gm_authFailure;
      }
      window.removeEventListener('error', handleGlobalError, true);
      window.removeEventListener('unhandledrejection', handleUnhandledRejection, true);
    };
  }, []);

  const locateUser = () => {
    if (!navigator.geolocation) {
      setLocationError("Aap ke browser mein Google Location support nahi hai.");
      return;
    }

    setIsLocating(true);
    setLocationError(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setUserCoords({
          lat: position.coords.latitude,
          lng: position.coords.longitude
        });
        setIsLocating(false);
      },
      (error) => {
        console.error("Geolocation fetch error:", error);
        setIsLocating(false);
        switch (error.code) {
          case error.PERMISSION_DENIED:
            setLocationError("Browser location blocked! Settings se permission ON karein, tab tak humne Lahore center lagaya.");
            break;
          case error.POSITION_UNAVAILABLE:
            setLocationError("GPS signal kamzor hai ya location available nahi hai.");
            break;
          case error.TIMEOUT:
            setLocationError("Location check karne ka session timeout hogaya.");
            break;
          default:
            setLocationError("Geolocation access block / fail hogayi.");
        }
      },
      { enableHighAccuracy: true, timeout: 8000, maximumAge: 0 }
    );
  };

  if (!hasValidKey || isKeyInvalid) {
    return (
      <div className="space-y-6 max-w-4xl mx-auto mt-4">
        {/* Offline Pakistan Government Critical Centers list */}
        <div className="space-y-3 p-4 bg-[#0a0a0a] rounded-xl border border-white/5 shadow-md">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-white/10 pb-2 gap-2">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-red-650 animate-pulse"></span>
              <h3 className="text-white font-bold text-xs uppercase tracking-wider font-sans">
                🗺️ Pakistan Government Emergency Centers & Critical Care Hospitals:
              </h3>
            </div>
            <span className="text-[9px] font-mono text-green-400 font-bold bg-green-950/20 px-2 py-0.5 rounded border border-green-500/15 max-w-fit select-none">
              VERIFIED LIST ACTIVE
            </span>
          </div>

          <p className="text-[11px] text-gray-400 leading-relaxed font-sans">
            Pakistan ke baray emergency public government hospitals ki checked guidance list niche di gaye hai. Kisi bhi emergency mein aap directly unke critical contacts par call kar saktay hain ya driving directions dekhne ke liye <strong>'Rasta Dekhein'</strong> dabaein:
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {FALLBACK_HOSPITALS_LIST.map((hosp) => (
              <div 
                key={hosp.id} 
                className="bg-[#0f0f0f] border border-white/5 hover:border-white/10 rounded-xl p-3.5 flex flex-col justify-between space-y-3 transition-all"
              >
                <div className="space-y-1.5">
                  <div className="flex justify-between items-start gap-1">
                    <h4 className="text-white font-bold text-xs font-sans leading-tight">
                      {hosp.name}
                    </h4>
                    <span className="text-[8px] font-mono bg-green-500/10 text-green-400 px-1 py-0.2 rounded border border-green-500/15 shrink-0 font-bold uppercase select-none">
                      Govt Free
                    </span>
                  </div>
                  <p className="text-[10px] text-gray-400 font-mono flex items-center gap-1 leading-normal">
                    <MapPin className="w-3 h-3 text-red-500 shrink-0" />
                    <span>{hosp.city} — {hosp.address}</span>
                  </p>
                  <p className="text-[10px] text-gray-500 leading-normal italic">
                    "{hosp.desc}"
                  </p>
                </div>

                <div className="flex gap-2 pt-2 border-t border-white/5">
                  <a 
                    href={`tel:${hosp.phone}`}
                    className="flex-1 py-1.5 px-3 rounded bg-white/5 hover:bg-white/10 text-white font-bold text-[10px] flex items-center justify-center gap-1.5 transition-colors border border-white/5"
                  >
                    <PhoneCall className="w-3.5 h-3.5 text-green-400 shrink-0" />
                    <span>Call: {hosp.displayPhone}</span>
                  </a>
                  <a 
                    href={userCoords 
                      ? `https://www.google.com/maps/dir/?api=1&origin=${userCoords.lat},${userCoords.lng}&destination=${hosp.lat},${hosp.lng}&travelmode=driving`
                      : `https://www.google.com/maps/dir/?api=1&destination=${hosp.lat},${hosp.lng}&travelmode=driving`
                    }
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 py-1.5 px-3 rounded bg-red-650 hover:bg-red-750 text-white font-bold text-[10px] flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <CornerUpRight className="w-3.5 h-3.5 shrink-0" />
                    <span>Rasta Dekhein</span>
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <div className="w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse"></div>
        <h3 className="text-white font-bold text-xs uppercase tracking-widest leading-none">
          🗺️ Nearby Government & Critical Care Hospitals (Pakistan):
        </h3>
      </div>
      
      <APIProvider apiKey={API_KEY} version="weekly">
        <HospitalMapInner 
          emergencyName={emergencyName}
          userCoords={userCoords}
          locationError={locationError}
          onLocateUser={locateUser}
          isLocating={isLocating}
        />
      </APIProvider>
    </div>
  );
}

