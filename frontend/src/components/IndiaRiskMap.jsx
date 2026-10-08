import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, CircleMarker } from 'react-leaflet';
import { MapPin, AlertTriangle, ShieldCheck, Flame, Navigation } from 'lucide-react';
import L from 'leaflet';

// Fix default leaflet marker icon issue in react
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

export default function IndiaRiskMap({ cities }) {
  const [selectedCity, setSelectedCity] = useState(null);
  const [mapInstance, setMapInstance] = useState(null);

  const defaultCenter = [21.5, 78.9]; // Center of India

  const handleCitySelect = (city) => {
    setSelectedCity(city);
    if (mapInstance) {
      mapInstance.flyTo([city.lat, city.lng], 10, { duration: 1.5 });
    }
  };

  return (
    <div className="mt-10 glass-panel rounded-3xl p-6 sm:p-8 border border-slate-800 shadow-2xl relative overflow-hidden">
      
      {/* Map Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-cyan-400 font-semibold">
            <MapPin className="w-4 h-4" />
            <span>Geospatial Incident Intelligence</span>
          </div>
          <h3 className="text-2xl font-bold text-white mt-1">
            Metropolitan Accident Corridor Map
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            Displaying coordinates and incident distributions across 8 major Indian metropolitan areas.
          </p>
        </div>

        {/* City Filter Pills */}
        <div className="flex flex-wrap gap-2">
          {cities && cities.map((c) => (
            <button
              key={c.city}
              onClick={() => handleCitySelect(c)}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-all ${
                selectedCity?.city === c.city
                  ? 'bg-cyan-500 text-[#06090F] font-bold shadow-md shadow-cyan-500/20'
                  : 'bg-slate-900/80 text-slate-300 hover:text-white border border-slate-800 hover:border-slate-700'
              }`}
            >
              {c.city}
            </button>
          ))}
        </div>
      </div>

      {/* Map Container & Sidebar */}
      <div className="mt-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Interactive Leaflet Map */}
        <div className="lg:col-span-8 h-[450px] rounded-2xl overflow-hidden border border-slate-800 relative z-0">
          <MapContainer
            center={defaultCenter}
            zoom={4.8}
            scrollWheelZoom={false}
            className="w-full h-full"
            ref={setMapInstance}
          >
            {/* Dark Mode CartoDB TileLayer */}
            <TileLayer
              attribution='&copy; <a href="https://carto.com/">CARTO</a> dark tiles'
              url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
            />

            {/* City Circle Markers */}
            {cities && cities.map((city) => (
              <CircleMarker
                key={city.city}
                center={[city.lat, city.lng]}
                radius={16}
                pathOptions={{
                  fillColor: city.fatal_rate > 15 ? '#EF4444' : '#06B6D4',
                  fillOpacity: 0.65,
                  color: '#FFFFFF',
                  weight: 2,
                }}
                eventHandlers={{
                  click: () => setSelectedCity(city)
                }}
              >
                <Popup>
                  <div className="p-2 space-y-2 text-slate-100 font-sans">
                    <div className="flex items-center justify-between border-b border-slate-700 pb-1.5">
                      <strong className="text-base font-bold text-white">{city.city}</strong>
                      <span className="text-[11px] font-mono text-cyan-400">{city.state}</span>
                    </div>
                    <div className="space-y-1 text-xs">
                      <div className="flex justify-between">
                        <span className="text-slate-400">Total Accidents:</span>
                        <strong className="font-mono text-white">{city.total_accidents.toLocaleString()}</strong>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Avg Risk Index:</span>
                        <strong className="font-mono text-amber-400">{city.avg_risk_score}%</strong>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Fatal Incidents:</span>
                        <strong className="font-mono text-red-400">{city.fatal_accidents} ({city.fatal_rate}%)</strong>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Primary Hazard:</span>
                        <span className="font-medium text-slate-200">{city.top_cause}</span>
                      </div>
                    </div>
                  </div>
                </Popup>
              </CircleMarker>
            ))}
          </MapContainer>
        </div>

        {/* Selected City Intel Card */}
        <div className="lg:col-span-4 p-5 rounded-2xl bg-slate-900/70 border border-slate-800 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-xs font-mono uppercase text-slate-400 mb-2">
              <span>Metropolitan Profile</span>
              <Navigation className="w-3.5 h-3.5 text-cyan-400" />
            </div>

            <h4 className="text-2xl font-bold text-white">
              {selectedCity ? selectedCity.city : 'All Metros Aggregate'}
            </h4>
            <p className="text-xs text-slate-400 mt-1">
              {selectedCity ? `${selectedCity.state} Corridor` : 'Select any metro pin or pill to inspect localized hazard telemetry.'}
            </p>

            {selectedCity ? (
              <div className="mt-5 space-y-4">
                
                <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800/80">
                  <span className="text-xs text-slate-400 font-mono">Recorded Incident Volume</span>
                  <div className="text-2xl font-black font-mono text-white mt-0.5">
                    {selectedCity.total_accidents.toLocaleString()}
                  </div>
                  <div className="text-[11px] text-slate-400 mt-1">
                    Minor: <strong className="text-emerald-400">{selectedCity.minor_accidents}</strong> • Major: <strong className="text-amber-400">{selectedCity.major_accidents}</strong> • Fatal: <strong className="text-red-400">{selectedCity.fatal_accidents}</strong>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800/80">
                    <span className="text-[11px] text-slate-400 font-mono">Avg Risk Index</span>
                    <div className="text-xl font-bold font-mono text-amber-400 mt-0.5">
                      {selectedCity.avg_risk_score}%
                    </div>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800/80">
                    <span className="text-[11px] text-slate-400 font-mono">Fatal Rate</span>
                    <div className="text-xl font-bold font-mono text-red-400 mt-0.5">
                      {selectedCity.fatal_rate}%
                    </div>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800/80">
                  <span className="text-[11px] text-slate-400 font-mono">Dominant Collision Catalyst</span>
                  <div className="text-sm font-semibold text-cyan-300 capitalize mt-0.5">
                    {selectedCity.top_cause}
                  </div>
                </div>

              </div>
            ) : (
              <div className="mt-6 p-4 rounded-xl bg-slate-950/60 border border-dashed border-slate-800 text-center text-xs text-slate-400 space-y-2">
                <ShieldCheck className="w-8 h-8 text-cyan-400/50 mx-auto" />
                <p>Click on any marker on the map to inspect city-level risk scores, casualty ratios, and dominant collision catalysts.</p>
              </div>
            )}
          </div>

          <div className="mt-4 pt-4 border-t border-slate-800 text-[11px] font-mono text-slate-400 flex items-center justify-between">
            <span>Coordinates: WGS84 Datum</span>
            <span className="text-cyan-400">8 Metros Active</span>
          </div>
        </div>

      </div>

    </div>
  );
}
