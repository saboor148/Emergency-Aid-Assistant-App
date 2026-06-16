import React, { useEffect, useState, useRef } from 'react';
import { 
  APIProvider, 
  Map, 
  AdvancedMarker, 
  Pin, 
  InfoWindow, 
  useMap, 
  useMapsLibrary
} from '@vis.gl/react-google-maps';
import { 
  Hospital, 
  MapPin, 
  Compass, 
  CornerUpRight, 
  PhoneCall, 
  AlertTriangle, 
  Activity,
  Award,
  ChevronRight,
  Route
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

// Detailed database of core public & government hospitals in major divisions of Pakistan
const PUBLIC_HOSPITALS_DATABASE = [
  // Lahore
  {
    id: "mayo-lahore",
    name: "Mayo Hospital (Govt)",
    city: "Lahore, Punjab",
    phone: "04299211102",
    address: "Hospital Road, Near Anarkali, Lahore",
    lat: 31.5714,
    lng: 74.3113,
    desc: "Pakistan's oldest and largest public health complex featuring fully free 24/7 major trauma center."
  },
  {
    id: "jinnah-lahore",
    name: "Jinnah Hospital (Govt)",
    city: "Lahore, Punjab",
    phone: "04299231400",
    address: "Usman Road, Quaid-e-Azam Campus, Lahore",
    lat: 31.4828,
    lng: 74.3015,
    desc: "Major government hospital with extensive state-of-the-art trauma, emergency, and burn care facilities."
  },
  {
    id: "services-lahore",
    name: "Services Hospital (Govt)",
    city: "Lahore, Punjab",
    phone: "04299203402",
    address: "Ghaus-ul-Azam Road, Jail Road, Lahore",
    lat: 31.5434,
    lng: 74.3314,
    desc: "Prominent 1196-bed public sector hospital offering comprehensive emergency medicine."
  },
  {
    id: "gangaram-lahore",
    name: "Sir Ganga Ram Hospital (Govt)",
    city: "Lahore, Punjab",
    phone: "04299203718",
    address: "Shara-i-Fatima Jinnah, Queen's Road, Lahore",
    lat: 31.5543,
    lng: 74.3218,
    desc: "Highly respected public sector teaching hospital specialized in massive operations and acute care."
  },
  {
    id: "lgh-lahore",
    name: "Lahore General Hospital (Govt)",
    city: "Lahore, Punjab",
    phone: "04299264036",
    address: "Ferozepur Road, Lahore",
    lat: 31.4552,
    lng: 74.3567,
    desc: "Large scale government medical setup containing a dedicated, state-of-the-art neurosurgery unit."
  },
  // Karachi
  {
    id: "jpmc-karachi",
    name: "Jinnah Postgraduate Medical Centre (JPMC)",
    city: "Karachi, Sindh",
    phone: "02199201300",
    address: "Rafiquee Shaheed Road, Karachi",
    lat: 24.8519,
    lng: 67.0427,
    desc: "The largest government healthcare enterprise in Karachi, completely free modern critical care."
  },
  {
    id: "civil-karachi",
    name: "Dr. Ruth K.M. Pfau Civil Hospital",
    city: "Karachi, Sindh",
    phone: "02199215740",
    address: "Baba-e-Urdu Road, Karachi",
    lat: 24.8596,
    lng: 67.0102,
    desc: "Grand public medical establishment. Provides life-saving surgeries and diagnostics at zero cost."
  },
  {
    id: "abbasi-karachi",
    name: "Abbasi Shaheed Hospital (Govt)",
    city: "Karachi, Sindh",
    phone: "02199260400",
    address: "Tabish Dehlavi Road, Block 3 Nazimabad, Karachi",
    lat: 24.9192,
    lng: 67.0315,
    desc: "Third-largest government public tertiary hospital in Karachi with an extremely active trauma unit."
  },
  {
    id: "nicvd-karachi",
    name: "NICVD Cardiac Hospital (Govt)",
    city: "Karachi, Sindh",
    phone: "02199201271",
    address: "Rafiquee Shaheed Road, Karachi",
    lat: 24.8510,
    lng: 67.0420,
    desc: "Pakistan's leading public cardiovascular center providing completely free state-of-the-art heart surgery."
  },
  {
    id: "sindhgovt-liaquatabad",
    name: "Sindh Govt Hospital, Liaquatabad",
    city: "Karachi, Sindh",
    phone: "02199228221",
    address: "Angara Goth, Liaquatabad Town, Karachi",
    lat: 24.9083,
    lng: 67.0384,
    desc: "Essential public sector hospital supporting the dense local populace with standard free medical procedures."
  },
  // Islamabad & Rawalpindi
  {
    id: "pims-islamabad",
    name: "Pakistan Institute of Medical Sciences (PIMS)",
    city: "Islamabad, Capital Territory",
    phone: "0519261170",
    address: "Ibn-e-Sina Road, G-8/3, Islamabad",
    lat: 33.7027,
    lng: 73.0454,
    desc: "The leading federal government hospital with top specialists, pediatric trauma, and general ER."
  },
  {
    id: "polyclinic-islamabad",
    name: "Federal Govt Polyclinic Hospital",
    city: "Islamabad, Capital Territory",
    phone: "0519204364",
    address: "Luqman Hakeem Road, Sector G-6/2, Islamabad",
    lat: 33.7194,
    lng: 73.0645,
    desc: "The second-oldest federal public hospital serving with a highly robust primary emergency response unit."
  },
  {
    id: "holyfamily-pindi",
    name: "Holy Family Hospital (Govt)",
    city: "Rawalpindi, Punjab",
    phone: "0519290321",
    address: "Holy Family Road, Satellite Town, Rawalpindi",
    lat: 33.6191,
    lng: 73.0691,
    desc: "A massive public division medical facility providing intensive therapeutic services for Twin Cities."
  },
  {
    id: "benazir-pindi",
    name: "Benazir Bhutto Hospital (Govt)",
    city: "Rawalpindi, Punjab",
    phone: "0519290301",
    address: "Murree Road, Rawalpindi",
    lat: 33.6062,
    lng: 73.0768,
    desc: "Prominent regional tertiary hospital with vast critical capacity and efficient roadside emergency team."
  },
  {
    id: "dhq-pindi",
    name: "District Headquarter Hospital (Govt)",
    city: "Rawalpindi, Punjab",
    phone: "0519270311",
    address: "Raja Bazar, Rawalpindi",
    lat: 33.5982,
    lng: 73.0538,
    desc: "Core public town health system located near traffic hub to handle emergency trauma instantly."
  },
  // Peshawar
  {
    id: "lrh-peshawar",
    name: "Lady Reading Hospital (Govt)",
    city: "Peshawar, Khyber Pakhtunkhwa",
    phone: "0919211430",
    address: "Soekarno Road, LRH Chowk, Peshawar",
    lat: 34.0152,
    lng: 71.5724,
    desc: "KP's most historic and heavily equipped government hospital with specialized disaster relief units."
  },
  {
    id: "kth-peshawar",
    name: "Khyber Teaching Hospital (Govt)",
    city: "Peshawar, Khyber Pakhtunkhwa",
    phone: "0919224400",
    address: "University Road, Peshawar",
    lat: 33.9962,
    lng: 71.4845,
    desc: "Premier government teaching institution equipped with grand inpatient blocks and rapid medical ER."
  },
  {
    id: "hmc-peshawar",
    name: "Hayatabad Medical Complex (Govt)",
    city: "Peshawar, Khyber Pakhtunkhwa",
    phone: "0919217140",
    address: "Phase 4, Hayatabad, Peshawar",
    lat: 33.9782,
    lng: 71.4398,
    desc: "Sleek, massive scale state-owned enterprise in Peshawar specialized in orthopedics, cardiology and trauma."
  },
  // Quetta
  {
    id: "sandeman-quetta",
    name: "Sandeman Provincial Civil Hospital",
    city: "Quetta, Balochistan",
    phone: "0819202013",
    address: "Jinnah Road, Quetta",
    lat: 30.1979,
    lng: 66.9995,
    desc: "Balochistan's chief military-civil response hospital offering specialized free ICU and critical survival assistance."
  },
  {
    id: "bmc-quetta",
    name: "Bolan Medical Complex Hospital (Govt)",
    city: "Quetta, Balochistan",
    phone: "0819213010",
    address: "Brewery Road, Quetta",
    lat: 30.1633,
    lng: 66.9744,
    desc: "Huge provincial public teaching hospital delivering broad multi-disciplinary free diagnostic and trauma care."
  },
  // Faisalabad
  {
    id: "allied-faisalabad",
    name: "Allied Hospital (Govt)",
    city: "Faisalabad, Punjab",
    phone: "0419210082",
    address: "Sargodha Road, Faisalabad",
    lat: 31.4355,
    lng: 73.0682,
    desc: "A massive 1500-bed government division complex which provides completely free triage care."
  },
  {
    id: "dhq-faisalabad",
    name: "DHQ Hospital Faisalabad (Govt)",
    city: "Faisalabad, Punjab",
    phone: "0419210080",
    address: "Circular Road, Faisalabad",
    lat: 31.4239,
    lng: 73.0805,
    desc: "Primary government city hospital providing accessible free medicine and operations."
  },
  // Multan
  {
    id: "nishtar-multan",
    name: "Nishtar Hospital (Govt)",
    city: "Multan, Punjab",
    phone: "0619200231",
    address: "Nishtar Road, Multan",
    lat: 30.1950,
    lng: 71.4389,
    desc: "South Punjab's premier government health citadel serving millions with modern intensive trauma blocks."
  },
  // Sialkot
  {
    id: "allama-iqbal-sialkot",
    name: "Allama Iqbal Memorial Hospital (Govt)",
    city: "Sialkot, Punjab",
    phone: "0529250051",
    address: "Commissioner Road, Sialkot",
    lat: 32.4939,
    lng: 74.5422,
    desc: "Chief teaching public sector hospital offering 24/7 fully functional critical care units."
  },
  // Gujranwala
  {
    id: "dhq-gujranwala",
    name: "DHQ Hospital Gujranwala (Govt)",
    city: "Gujranwala, Punjab",
    phone: "0559200132",
    address: "G.T. Road, Gujranwala",
    lat: 32.1644,
    lng: 74.1833,
    desc: "Key division public hospital providing emergency cardiac and trauma support directly on G.T. road corridor."
  },
  // Hyderabad
  {
    id: "liaquat-hyderabad",
    name: "Liaquat University Hospital (Govt)",
    city: "Hyderabad, Sindh",
    phone: "0229210201",
    address: "Hospital Road, Hyderabad",
    lat: 25.3951,
    lng: 68.3688,
    desc: "The largest government public hospital of interior Sindh, high density emergency surgery focus."
  }
];

// Helper to calculate exact spherical distance in kilometers between two points
function getDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371; // Earth ratio in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
  return R * c;
}

interface MapViewInnerProps {
  userCoords: google.maps.LatLngLiteral;
  nearestHospitals: any[];
  activeHospitalId: string | null;
  setActiveHospitalId: (id: string | null) => void;
  isSearching: boolean;
}

function MapViewInner({ 
  userCoords, 
  nearestHospitals, 
  activeHospitalId, 
  setActiveHospitalId,
  isSearching 
}: MapViewInnerProps) {
  const map = useMap();

  // Handle autcentering viewport when hospitals change
  useEffect(() => {
    if (!map || nearestHospitals.length === 0) return;

    try {
      const bounds = new google.maps.LatLngBounds();
      bounds.extend(userCoords);
      nearestHospitals.forEach((hosp) => {
        if (hosp.lat && hosp.lng) {
          bounds.extend({ lat: hosp.lat, lng: hosp.lng });
        }
      });
      map.fitBounds(bounds, 40);
    } catch (e) {
      console.warn("Could not fit map bounds:", e);
    }
  }, [map, nearestHospitals, userCoords]);

  const activeHospital = nearestHospitals.find(h => h.id === activeHospitalId);

  return (
    <div className="flex flex-col lg:flex-row gap-4 h-[450px] bg-[#0c0c0c] rounded-xl overflow-hidden">
      {/* List Area */}
      <div className="w-full lg:w-72 flex flex-col h-2/5 lg:h-full bg-[#111] border-b lg:border-b-0 lg:border-r border-white/5 p-3 overflow-y-auto space-y-2">
        <div className="border-b border-white/5 pb-2">
          <span className="text-[9px] font-bold text-gray-500 uppercase tracking-widest block">Nearest 5 Resolved:</span>
          <p className="text-[10px] text-emerald-400 font-extrabold flex items-center gap-1 mt-0.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping"></span>
            Sorted By Kilometers (Qareeb-Tareen)
          </p>
        </div>

        <div className="space-y-1.5 flex-grow overflow-y-auto">
          {isSearching ? (
            <div className="flex flex-col items-center justify-center py-10 space-y-2 text-center">
              <div className="w-4 h-4 rounded-full border-2 border-red-650 border-t-transparent animate-spin"></div>
              <p className="text-[10px] font-mono text-gray-500">Calculating closest paths...</p>
            </div>
          ) : nearestHospitals.length === 0 ? (
            <p className="text-[10px] text-gray-500 text-center py-10">No public hospitals detected in this zone.</p>
          ) : (
            nearestHospitals.map((h, idx) => {
              const isActive = h.id === activeHospitalId;
              return (
                <button
                  key={h.id}
                  onClick={() => {
                    setActiveHospitalId(h.id);
                    if (map) {
                      map.panTo({ lat: h.lat, lng: h.lng });
                      map.setZoom(15);
                    }
                  }}
                  className={`w-full text-left p-2.5 rounded-lg border text-xs flex gap-2.5 cursor-pointer transition-all ${
                    isActive 
                      ? 'bg-red-950/20 border-red-650/80 shadow-[0_0_8px_rgba(220,38,38,0.1)]' 
                      : 'bg-white/5 border-white/5 hover:bg-white/10'
                  }`}
                >
                  <div className={`w-6.5 h-6.5 rounded flex items-center justify-center text-[10px] font-extrabold shrink-0 border ${
                    isActive ? 'bg-red-600 text-white border-red-600' : 'bg-[#1a1a1a] text-red-400 border-white/5'
                  }`}>
                    {idx + 1}
                  </div>
                  <div className="space-y-0.5 min-w-0 flex-grow">
                    <div className="flex justify-between items-start gap-1">
                      <h4 className="font-extrabold text-[#fff] truncate leading-tight text-[11px] group-hover:text-red-400">
                        {h.name}
                      </h4>
                      <span className="text-[9px] font-bold text-red-400 font-mono shrink-0">
                        {h.distance ? `${h.distance.toFixed(1)} km` : ''}
                      </span>
                    </div>
                    <p className="text-[9.5px] text-gray-400 truncate leading-snug">{h.address}</p>
                    <span className="inline-block text-[8px] font-mono tracking-wider font-extrabold text-emerald-400 bg-emerald-950/20 border border-emerald-900/40 px-1 py-0.2 rounded mt-0.5">
                      Government Public Care
                    </span>
                  </div>
                </button>
              );
            })
          )}
        </div>
      </div>

      {/* Map View */}
      <div className="flex-1 h-3/5 lg:h-full relative bg-[#070707]">
        <Map
          defaultCenter={userCoords}
          defaultZoom={13}
          mapId="NearestPublicHospitalsMap"
          internalUsageAttributionIds={['gmp_mcp_codeassist_v1_aistudio']}
          gestureHandling="greedy"
          style={{ width: '100%', height: '100%' }}
        >
          {/* User Coordinates Active Pin */}
          <AdvancedMarker position={userCoords} title="Apka Safe Place">
            <div className="relative flex items-center justify-center">
              <span className="animate-ping absolute inline-flex h-7 w-7 rounded-full bg-blue-500 opacity-45"></span>
              <div className="w-4.5 h-4.5 bg-blue-550 rounded-full border-2 border-white flex items-center justify-center shadow-lg"></div>
            </div>
          </AdvancedMarker>

          {/* hospitals */}
          {nearestHospitals.map((h, idx) => {
            const isSelected = h.id === activeHospitalId;
            return (
              <AdvancedMarker
                key={h.id}
                position={{ lat: h.lat, lng: h.lng }}
                onClick={() => setActiveHospitalId(h.id)}
              >
                <Pin 
                  background={isSelected ? '#e03a3a' : '#10b981'} 
                  borderColor="#fff" 
                  glyphColor="#fff" 
                  scale={isSelected ? 1.25 : 0.95}
                />
              </AdvancedMarker>
            );
          })}

          {/* Info Window */}
          {activeHospital && (
            <InfoWindow
              position={{ lat: activeHospital.lat, lng: activeHospital.lng }}
              onCloseClick={() => setActiveHospitalId(null)}
            >
              <div className="p-1.5 max-w-[200px] text-gray-950 font-sans space-y-1">
                <div className="flex items-start gap-1">
                  <Hospital className="w-4 h-4 text-red-650 shrink-0 mt-0.5" />
                  <strong className="text-xs text-gray-900 block leading-tight">
                    {activeHospital.name}
                  </strong>
                </div>
                <p className="text-[10px] text-gray-650 leading-tight">
                  {activeHospital.address}
                </p>
                {activeHospital.desc && (
                  <p className="text-[9px] text-gray-500 italic block leading-snug">
                    "{activeHospital.desc}"
                  </p>
                )}
                {activeHospital.phone && (
                  <p className="text-[9.5px] font-bold text-red-650 font-mono">
                    ☎️ Phone: {activeHospital.phone}
                  </p>
                )}
                <a
                  href={`https://www.google.com/maps/dir/?api=1&origin=${userCoords.lat},${userCoords.lng}&destination=${activeHospital.lat},${activeHospital.lng}&travelmode=driving`}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-1 flex items-center justify-center gap-1.5 w-full py-1 bg-red-650 text-white rounded text-[9px] font-bold uppercase transition-colors hover:bg-red-700"
                >
                  <CornerUpRight className="w-3 h-3" />
                  <span>Rasta Dekhein (Direction)</span>
                </a>
              </div>
            </InfoWindow>
          )}
        </Map>
      </div>
    </div>
  );
}

export default function MapView() {
  const [userCoords, setUserCoords] = useState<google.maps.LatLngLiteral | null>(null);
  const [nearestHospitals, setNearestHospitals] = useState<any[]>([]);
  const [activeHospitalId, setActiveHospitalId] = useState<string | null>(null);
  const [isLocating, setIsLocating] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [isKeyInvalid, setIsKeyInvalid] = useState(false);

  useEffect(() => {
    locateUser();

    // Catch dynamic Google Maps key authentication failure
    (window as any).gm_authFailure = () => {
      console.warn("Google Maps authentication failed in MapView.");
      setIsKeyInvalid(true);
    };

    return () => {
      if ((window as any).gm_authFailure) {
        delete (window as any).gm_authFailure;
      }
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
        const coords = {
          lat: position.coords.latitude,
          lng: position.coords.longitude
        };
        setUserCoords(coords);
        setIsLocating(false);
        resolve5Nearest(coords);
      },
      (error) => {
        console.error("MapView Geolocation lookup failed:", error);
        setIsLocating(false);
        setLocationError("Gps coordinates lookup timing-out or blocked. High Accuracy disabled.");
        // Try with standard precision coordinates as fallback
        navigator.geolocation.getCurrentPosition(
          (pos) => {
            const coords = {
              lat: pos.coords.latitude,
              lng: pos.coords.longitude
            };
            setUserCoords(coords);
            resolve5Nearest(coords);
          },
          (err) => {
            setLocationError("Active location blocker or device location switch is turned off.");
          },
          { enableHighAccuracy: false, timeout: 6000 }
        );
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  };

  const resolve5Nearest = (coords: google.maps.LatLngLiteral) => {
    setIsSearching(true);
    
    // Step 1: Calculate distance to all our pre-curated public government hospitals
    const loadedHospitals = PUBLIC_HOSPITALS_DATABASE.map((hosp) => {
      const distance = getDistanceKm(coords.lat, coords.lng, hosp.lat, hosp.lng);
      return {
        ...hosp,
        distance
      };
    });

    // Step 2: Sort by distance ascending and pick top 5
    const computedTop5 = loadedHospitals
      .sort((a, b) => a.distance - b.distance)
      .slice(0, 5);

    setNearestHospitals(computedTop5);
    setIsSearching(false);
  };

  const handleManualTrigger = () => {
    locateUser();
  };

  return (
    <div className="bg-[#0f0f0f] border border-white/5 rounded-2xl p-5 space-y-4 shadow-xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/5 pb-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-emerald-600/10 text-emerald-400 border border-emerald-500/20 rounded-xl flex items-center justify-center">
            <Route className="w-5 h-5 animate-pulse text-emerald-400" />
          </div>
          <div>
            <h3 className="text-white font-bold text-sm uppercase tracking-wider flex items-center gap-1.5 leading-snug">
              <span>Qareeb-Tareen Hospital Guide</span>
              <span className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-mono font-bold text-[8px] px-1.5 py-0.2 rounded-full uppercase">
                Granted Live
              </span>
            </h3>
            <p className="text-[10.5px] text-gray-400 font-medium">
              Apki live space se top <strong>5 nearest government & public hospitals</strong> ki location aur direct emergency details.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-stretch sm:self-auto shrink-0">
          <button
            onClick={handleManualTrigger}
            disabled={isLocating}
            className="flex-1 sm:flex-none text-[10.5px] font-bold bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 text-gray-200 px-3 py-1.5 rounded-lg flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
          >
            <Compass className={`w-3.5 h-3.5 text-red-500 ${isLocating ? 'animate-spin' : ''}`} />
            <span>{isLocating ? 'GPS Re-Locating...' : 'Refresh GPS coordinates'}</span>
          </button>
        </div>
      </div>

      {locationError && (
        <div className="bg-amber-950/20 border border-amber-900/40 p-3 rounded-lg text-[11px] text-amber-400 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-amber-500 flex-shrink-0" />
          <span>{locationError}</span>
        </div>
      )}

      {/* RENDER ACTIVE LIVE COORDINATE MAP */}
      {userCoords ? (
        (!hasValidKey || isKeyInvalid) ? (
          // Key failure rendering list directly with direct external redirection
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {nearestHospitals.map((h, idx) => (
                <div 
                  key={h.id} 
                  className="bg-[#131313] border border-white/5 hover:border-white/10 p-4 rounded-xl flex flex-col justify-between space-y-4 transition-all hover:translate-y-[-1px]"
                >
                  <div className="space-y-2">
                    <div className="flex justify-between items-start gap-2">
                      <div className="flex items-center gap-2">
                        <div className="w-5.5 h-5.5 rounded-lg bg-emerald-500/10 border border-emerald-500/25 flex items-center justify-center text-emerald-400 text-[10px] font-black">
                          {idx + 1}
                        </div>
                        <h4 className="text-white font-extrabold text-xs font-sans leading-tight">
                          {h.name}
                        </h4>
                      </div>
                      <span className="text-[10px] font-extrabold text-red-400 font-mono bg-red-955/20 px-2 py-0.5 rounded border border-red-900/30">
                        {h.distance ? `${h.distance.toFixed(1)} km` : ''}
                      </span>
                    </div>
                    <p className="text-[10.5px] text-gray-400 font-mono flex items-start gap-1 leading-normal">
                      <MapPin className="w-3.5 h-3.5 text-red-505 shrink-0 mt-0.5" />
                      <span>{h.city} — {h.address}</span>
                    </p>
                    <p className="text-[10px] text-gray-500 leading-normal italic">
                      "{h.desc}"
                    </p>
                  </div>

                  <div className="flex gap-2.5 pt-2 border-t border-white/5">
                    {h.phone && (
                      <a 
                        href={`tel:${h.phone}`}
                        className="flex-1 py-1.5 px-2 bg-white/5 hover:bg-white/10 active:bg-white/15 text-white font-bold text-[10px] flex items-center justify-center gap-1.5 rounded transition-colors border border-white/5"
                      >
                        <PhoneCall className="w-3 h-3 text-green-400 shrink-0" />
                        <span>Call</span>
                      </a>
                    )}
                    <a 
                      href={userCoords 
                        ? `https://www.google.com/maps/dir/?api=1&origin=${userCoords.lat},${userCoords.lng}&destination=${h.lat},${h.lng}&travelmode=driving`
                        : `https://www.google.com/maps/dir/?api=1&destination=${h.lat},${h.lng}&travelmode=driving`
                      }
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 py-1.5 px-3 bg-red-650 hover:bg-red-750 text-white font-bold text-[10px] flex items-center justify-center gap-1.5 rounded transition-all shadow-[0_0_8px_rgba(220,38,38,0.3)]"
                    >
                      <CornerUpRight className="w-3 h-3 shrink-0" />
                      <span>Rasta (Directions)</span>
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <APIProvider apiKey={API_KEY} version="weekly">
            <MapViewInner
              userCoords={userCoords}
              nearestHospitals={nearestHospitals}
              activeHospitalId={activeHospitalId}
              setActiveHospitalId={setActiveHospitalId}
              isSearching={isSearching}
            />
          </APIProvider>
        )
      ) : (
        <div className="flex flex-col items-center justify-center p-8 bg-[#131313] rounded-xl border border-dashed border-white/10 text-center space-y-3">
          <div className="relative">
            <Compass className="w-10 h-10 text-red-500 animate-spin" />
          </div>
          <div>
            <h4 className="text-white font-bold text-xs uppercase">GPS coordinates resolved...</h4>
            <p className="text-[10px] text-gray-500 max-w-xs mx-auto">
              Aap ki current position calculate ho rahi hai ta ke 5 sabse nazdeek public hospitals find kiye ja sakein...
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
