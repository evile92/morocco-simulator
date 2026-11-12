import React, { useState } from 'react';
import {
  Flame,
  Heart,
  Briefcase,
  Droplets,
  TrendingUp,
  Flag,
  AlertTriangle,
  MapPin,
  CheckCircle2,
  X,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Sparkles,
  Mic,
  FileText,
  Shield,
  Anchor,
  ChevronRight,
  Layers,
  Newspaper
} from 'lucide-react';
import { GameState, RegionData, RegionalInterventionType } from '../../types/game';
import { CITY_COORDINATES } from '../../data/cityCoordinates';
import moroccoApiData from '../../data/moroccoApiData.json';

export type MapLensMode = 'tension' | 'satisfaction' | 'unemployment' | 'water' | 'party' | 'gdp';
export type { RegionalInterventionType };

function projectLatLngToSvg(lat: number, lng: number): [number, number] {
  return [
    Number((69.07 * lng + 1353.4).toFixed(1)),
    Number((-87.16 * lat + 3192.6).toFixed(1))
  ];
}

interface StrategicMapCanvasProps {
  state: GameState;
  onSelectCrisis: (crisisId: string) => void;
  onSelectProtest: (protestId: string) => void;
  onRegionalIntervention: (regionId: string, actionType: RegionalInterventionType) => void;
  onOpenEncounter: (mode: 'press' | 'unions' | 'cabinet') => void;
  onOpenCustomDecree: () => void;
  onOpenAiAdvisor: () => void;
}

const STRATEGIC_LANDMARKS: {
  id: string;
  coords: [number, number];
  icon: string;
  nameAr: string;
  nameEn: string;
  descAr: string;
  descEn: string;
  color: string;
}[] = [
  {
    id: 'tanger_med',
    coords: [980, 68],
    icon: '⚓',
    nameAr: 'ميناء طنجة المتوسط',
    nameEn: 'Tanger Med Megaport',
    descAr: 'القطب اللوجستي والصناعي الأول بالبحر المتوسط وإفريقيا',
    descEn: 'Premier Mediterranean & African maritime logistics hub',
    color: '#38bdf8'
  },
  {
    id: 'water_highway',
    coords: [915, 192],
    icon: '💧',
    nameAr: 'الطريق السيار المائي (سبو - أبي رقراق)',
    nameEn: 'Sebou-Bouregreg Water Highway',
    descAr: 'منشأة التحويل المائي الاستراتيجي لتأمين مياه الشرب للرباط والدار البيضاء',
    descEn: 'Strategic inter-basin water transfer securing Rabat-Casablanca axis',
    color: '#22d3ee'
  },
  {
    id: 'ocp_jorf',
    coords: [765, 305],
    icon: '🏭',
    nameAr: 'المركب الصناعي الجرف الأصفر (OCP)',
    nameEn: 'OCP Jorf Lasfar Complex',
    descAr: 'أكبر مركب عالمي لإنتاج الأسمدة ومعالجة الفوسفاط',
    descEn: 'World-leading phosphate processing and fertilizer hub',
    color: '#10b981'
  },
  {
    id: 'sand_wall_mahbes',
    coords: [680, 775],
    icon: '🛡️',
    nameAr: 'الجدار الرملي الدفاعي (قطاع المحبس)',
    nameEn: 'Defense Sand Wall (Mahbes Sector)',
    descAr: 'منظومة الرصد الراداري والردع العسكري للقوات المسلحة الملكية',
    descEn: 'Royal Armed Forces fortified radar & UAV deterrence line',
    color: '#f59e0b'
  },
  {
    id: 'dakhla_port',
    coords: [215, 1110],
    icon: '🚢',
    nameAr: 'ورش ميناء الداخلة الأطلسي',
    nameEn: 'Dakhla Atlantic Megaport',
    descAr: 'البوابة البحرية الأطلسية الكبرى نحو عمق القارة الإفريقية',
    descEn: 'Strategic deepwater Atlantic gateway to West Africa',
    color: '#38bdf8'
  },
  {
    id: 'guerguerat',
    coords: [155, 1265],
    icon: '🚛',
    nameAr: 'معبر الكركرات الحدودي السيادي',
    nameEn: 'Guerguerat Sovereign Border Crossing',
    descAr: 'الشريان التجاري البري الوحيد الرابط بين المغرب وموريتانيا وغرب إفريقيا',
    descEn: 'Vital commercial land corridor linking Morocco to Mauritania & West Africa',
    color: '#10b981'
  }
];

export const StrategicMapCanvas: React.FC<StrategicMapCanvasProps> = ({
  state,
  onSelectCrisis,
  onSelectProtest,
  onRegionalIntervention,
  onOpenEncounter,
  onOpenCustomDecree,
  onOpenAiAdvisor
}) => {
  const isAr = state.language === 'ar';
  const [lens, setLens] = useState<MapLensMode>('tension');
  const [selectedRegionId, setSelectedRegionId] = useState<string | null>('casablanca_settat');
  const [hoveredRegionId, setHoveredRegionId] = useState<string | null>(null);
  const [zoom, setZoom] = useState<number>(1);
  const [pan, setPan] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [dragOrigin, setDragOrigin] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [showLandmarks, setShowLandmarks] = useState<boolean>(true);
  const [showPorts, setShowPorts] = useState<boolean>(false);
  const [selectedLandmarkId, setSelectedLandmarkId] = useState<string | null>(null);
  const [selectedPortName, setSelectedPortName] = useState<string | null>(null);

  const selectedRegion = state.regions.find(r => r.id === selectedRegionId) || null;
  const hoveredRegion = state.regions.find(r => r.id === hoveredRegionId) || null;
  const selectedLandmark = STRATEGIC_LANDMARKS.find(l => l.id === selectedLandmarkId) || null;
  const portsList = moroccoApiData.ports?.ports || [];
  const selectedPort = portsList.find(p => p.name === selectedPortName) || null;

  const citiesInSelectedRegion = selectedRegion
    ? state.cities.filter(c => c.regionId === selectedRegion.id)
    : [];

  const protestsInSelectedRegion = selectedRegion
    ? (state.activeCityProtests || []).filter(p => p.regionId === selectedRegion.id)
    : [];

  // Determine leading party in a region
  const getLeadingParty = (region: RegionData) => {
    let bestPartyId = 'rni';
    let bestScore = -1;
    for (const [pId, score] of Object.entries(region.partySupport || {})) {
      if (score > bestScore) {
        bestScore = score;
        bestPartyId = pId;
      }
    }
    return state.parties.find(p => p.id === bestPartyId);
  };

  // Compute Region Fill Color based on active lens
  const getRegionColor = (region: RegionData): string => {
    if (lens === 'satisfaction') {
      const s = region.satisfaction;
      if (s >= 65) return '#10b981';
      if (s >= 55) return '#34d399';
      if (s >= 45) return '#fbbf24';
      if (s >= 35) return '#f97316';
      return '#ef4444';
    }
    if (lens === 'tension') {
      const t = region.socialTension;
      if (t >= 65) return '#ef4444';
      if (t >= 50) return '#f97316';
      if (t >= 35) return '#fbbf24';
      if (t >= 25) return '#34d399';
      return '#10b981';
    }
    if (lens === 'unemployment') {
      const u = region.unemploymentRate;
      if (u >= 15) return '#ef4444';
      if (u >= 13) return '#f97316';
      if (u >= 11) return '#fbbf24';
      return '#10b981';
    }
    if (lens === 'water') {
      const w = region.waterStressIndex;
      if (w >= 80) return '#ef4444';
      if (w >= 65) return '#f97316';
      if (w >= 45) return '#fbbf24';
      return '#06b6d4';
    }
    if (lens === 'party') {
      const party = getLeadingParty(region);
      return party?.color || '#38bdf8';
    }
    if (lens === 'gdp') {
      const g = region.gdpContributionPercent;
      if (g >= 20) return '#3b82f6';
      if (g >= 10) return '#60a5fa';
      if (g >= 6) return '#93c5fd';
      return '#334155';
    }
    return '#334155';
  };

  const getRegionBadgeText = (region: RegionData): string => {
    if (lens === 'tension') return `${region.socialTension}%`;
    if (lens === 'satisfaction') return `${region.satisfaction}%`;
    if (lens === 'unemployment') return `${region.unemploymentRate}%`;
    if (lens === 'water') return `${region.reservoirFillRate}%`;
    if (lens === 'party') return getLeadingParty(region)?.acronym || 'RNI';
    if (lens === 'gdp') return `${region.gdpContributionPercent}%`;
    return '';
  };

  return (
    <div className="relative w-full h-full overflow-hidden bg-[#050a14] select-none">
      {/* 1. ATMOSPHERIC OCEANIC & TOPOGRAPHIC BACKGROUND */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(circle at 45% 45%, rgba(14, 38, 72, 0.55) 0%, rgba(6, 12, 24, 0.92) 70%, #030712 100%)'
        }}
      />
      {/* Subtle Tactical Grid Overlay */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.07]"
        style={{
          backgroundImage:
            'linear-gradient(to right, #38bdf8 1px, transparent 1px), linear-gradient(to bottom, #38bdf8 1px, transparent 1px)',
          backgroundSize: '48px 48px'
        }}
      />

      {/* Ambient Crisis Vignette when stability is low or tension is critical */}
      {(state.government.stability < 35 || state.activeCrises.length >= 2) && (
        <div
          className="absolute inset-0 pointer-events-none z-10 animate-pulse"
          style={{
            boxShadow: 'inset 0 0 110px rgba(225, 29, 72, 0.35)'
          }}
        />
      )}

      {/*Geographic Sea Labels */}
      <div className="absolute top-28 left-1/4 pointer-events-none opacity-25 text-sky-300 font-black tracking-[0.35em] text-xs uppercase hidden lg:block">
        {isAr ? 'المحيط الأطلسي • ATLANTIC OCEAN' : 'ATLANTIC OCEAN • المحيط الأطلسي'}
      </div>
      <div className="absolute top-20 right-1/3 pointer-events-none opacity-25 text-sky-300 font-black tracking-[0.25em] text-[11px] uppercase hidden lg:block">
        {isAr ? 'البحر الأبيض المتوسط' : 'MEDITERRANEAN SEA'}
      </div>

      {/* 2. INTERACTIVE SVG MOROCCO MAP CANVAS */}
      <div
        className={`relative w-full h-full flex items-center justify-center pt-14 pb-20 ${isDragging ? 'cursor-grabbing' : 'cursor-grab'}`}
        onPointerDown={e => {
          if ((e.target as HTMLElement).closest('path, g.cursor-pointer, button')) return;
          setIsDragging(true);
          setDragOrigin({ x: e.clientX - pan.x, y: e.clientY - pan.y });
        }}
        onPointerMove={e => {
          if (!isDragging) return;
          setPan({ x: e.clientX - dragOrigin.x, y: e.clientY - dragOrigin.y });
        }}
        onPointerUp={() => setIsDragging(false)}
        onPointerLeave={() => setIsDragging(false)}
      >
        <div
          className="w-full h-full flex items-center justify-center transition-transform duration-150 ease-out"
          style={{ transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})` }}
        >
          <svg
            viewBox="0 0 1282 1299"
            className="w-auto h-[82vh] max-w-[92vw] drop-shadow-[0_20px_50px_rgba(2,132,199,0.28)]"
          >
            <defs>
              <filter id="glow-selected" x="-20%" y="-20%" width="140%" height="140%">
                <feDropShadow dx="0" dy="0" stdDeviation="6" floodColor="#38bdf8" floodOpacity="0.85" />
              </filter>
            </defs>

            {/* 12 Official Moroccan Regions */}
            {state.regions.map(region => {
              if (!region.svgPath) return null;
              const isSelected = region.id === selectedRegionId;
              const isHovered = region.id === hoveredRegionId;
              const fillColor = getRegionColor(region);

              return (
                <g key={region.id}>
                  <path
                    d={region.svgPath}
                    fill={fillColor}
                    fillOpacity={isSelected ? 0.95 : isHovered ? 0.88 : 0.76}
                    stroke={isSelected ? '#38bdf8' : isHovered ? '#f8fafc' : '#0f172a'}
                    strokeWidth={isSelected ? 4.5 : isHovered ? 3 : 1.5}
                    filter={isSelected ? 'url(#glow-selected)' : undefined}
                    className="cursor-pointer transition-all duration-200"
                    onClick={() => {
                      setSelectedRegionId(region.id);
                      setSelectedLandmarkId(null);
                    }}
                    onMouseEnter={() => setHoveredRegionId(region.id)}
                    onMouseLeave={() => setHoveredRegionId(null)}
                  />
                </g>
              );
            })}

            {/* Region Centroid Badges (Name + Active Lens Metric) */}
            {state.regions.map(region => {
              const [cx, cy] = region.centroid;
              const isSelected = region.id === selectedRegionId;
              return (
                <g
                  key={`label_${region.id}`}
                  className="pointer-events-none"
                  transform={`translate(${cx}, ${cy})`}
                >
                  <rect
                    x="-46"
                    y="-16"
                    width="92"
                    height="32"
                    rx="8"
                    fill={isSelected ? '#0284c7' : '#0f172a'}
                    fillOpacity="0.86"
                    stroke={isSelected ? '#7dd3fc' : '#334155'}
                    strokeWidth="1.2"
                  />
                  <text
                    x="0"
                    y="-2"
                    textAnchor="middle"
                    fill="#f8fafc"
                    fontSize="11"
                    fontWeight="bold"
                  >
                    {isAr ? region.capitalAr : region.capitalEn}
                  </text>
                  <text
                    x="0"
                    y="11"
                    textAnchor="middle"
                    fill="#38bdf8"
                    fontSize="10"
                    fontWeight="bold"
                  >
                    {getRegionBadgeText(region)}
                  </text>
                </g>
              );
            })}

            {/* Strategic Sovereign Landmarks */}
            {showLandmarks &&
              STRATEGIC_LANDMARKS.map(lm => {
                const [lx, ly] = lm.coords;
                const isPicked = selectedLandmarkId === lm.id;
                return (
                  <g
                    key={lm.id}
                    className="cursor-pointer transition-transform hover:scale-125"
                    onClick={e => {
                      e.stopPropagation();
                      setSelectedLandmarkId(lm.id);
                    }}
                  >
                    <circle
                      cx={lx}
                      cy={ly}
                      r={isPicked ? 18 : 13}
                      fill="#0f172a"
                      stroke={lm.color}
                      strokeWidth={isPicked ? 3 : 2}
                    />
                    <text x={lx} y={ly + 5} textAnchor="middle" fontSize="13">
                      {lm.icon}
                    </text>
                  </g>
                );
              })}

            {/* MoroccoAPI 48 Maritime Ports Layer */}
            {showPorts &&
              portsList.map(port => {
                const [px, py] = projectLatLngToSvg(port.lat, port.lng);
                const isCommercial = port.category === 'commercial';
                const isSelectedPort = selectedPortName === port.name;
                return (
                  <g
                    key={`port_${port.name}`}
                    className="cursor-pointer"
                    onClick={e => {
                      e.stopPropagation();
                      setSelectedPortName(port.name);
                      setSelectedLandmarkId(null);
                    }}
                  >
                    <circle
                      cx={px}
                      cy={py}
                      r={isSelectedPort ? 10 : isCommercial ? 7 : 4.5}
                      fill={isCommercial ? '#0ea5e9' : '#14b8a6'}
                      stroke="#0f172a"
                      strokeWidth={1.8}
                      opacity={0.92}
                    />
                    {(isCommercial || isSelectedPort) && (
                      <text
                        x={px}
                        y={py - 10}
                        textAnchor="middle"
                        fill="#bae6fd"
                        fontSize="9"
                        fontWeight="bold"
                      >
                        ⚓ {port.name}
                      </text>
                    )}
                  </g>
                );
              })}

            {/* Active City Protests Pulsing Hotspots */}
            {(state.activeCityProtests || []).map(protest => {
              const coords = CITY_COORDINATES[protest.cityId];
              if (!coords) return null;
              const [px, py] = coords;

              return (
                <g
                  key={protest.id}
                  className="cursor-pointer"
                  onClick={e => {
                    e.stopPropagation();
                    onSelectProtest(protest.id);
                  }}
                >
                  <circle
                    cx={px}
                    cy={py}
                    r="24"
                    fill="none"
                    stroke="#ef4444"
                    strokeWidth="3.5"
                    className="animate-ping opacity-80 origin-center"
                  />
                  <circle
                    cx={px}
                    cy={py}
                    r="14"
                    fill="#dc2626"
                    stroke="#ffffff"
                    strokeWidth="2.2"
                  />
                  <text
                    x={px}
                    y={py + 4}
                    textAnchor="middle"
                    fill="#ffffff"
                    fontSize="13"
                    fontWeight="bold"
                  >
                    !
                  </text>
                  <rect
                    x={px - 52}
                    y={py - 38}
                    width="104"
                    height="20"
                    rx="6"
                    fill="#450a0a"
                    stroke="#ef4444"
                    strokeWidth="1.5"
                  />
                  <text
                    x={px}
                    y={py - 24}
                    textAnchor="middle"
                    fill="#fecaca"
                    fontSize="11"
                    fontWeight="bold"
                  >
                    🔥 {isAr ? protest.cityNameAr : protest.cityNameEn}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>
      </div>

      {/* Hovered Region Quick Floating Tooltip */}
      {hoveredRegion && hoveredRegion.id !== selectedRegionId && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-20 pointer-events-none bg-slate-950/95 border border-sky-500/40 px-4 py-2 rounded-2xl shadow-2xl flex items-center gap-4 text-xs backdrop-blur-md">
          <span className="font-black text-white text-sm">
            {isAr ? hoveredRegion.nameAr : hoveredRegion.nameEn}
          </span>
          <span className="text-emerald-400 font-bold">
            {isAr ? 'الرضا:' : 'Sat:'} {hoveredRegion.satisfaction}%
          </span>
          <span className="text-rose-400 font-bold">
            {isAr ? 'الاحتقان:' : 'Tension:'} {hoveredRegion.socialTension}%
          </span>
          <span className="text-amber-400 font-bold">
            {isAr ? 'البطالة:' : 'Unemp:'} {hoveredRegion.unemploymentRate}%
          </span>
          <span className="text-cyan-400 font-bold">
            {isAr ? 'السدود:' : 'Dams:'} {hoveredRegion.reservoirFillRate}%
          </span>
        </div>
      )}

      {/* Selected Strategic Landmark Popover */}
      {selectedLandmark && (
        <div className="fixed top-24 left-1/2 -translate-x-1/2 z-30 bg-slate-950/95 border border-sky-400/50 rounded-2xl p-4 shadow-2xl max-w-md w-full backdrop-blur-xl flex items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-700 flex items-center justify-center text-xl shrink-0">
              {selectedLandmark.icon}
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase text-sky-400 block">
                {isAr ? 'معلمة سيادية استراتيجية' : 'Strategic Sovereign Asset'}
              </span>
              <h4 className="text-sm font-black text-white">
                {isAr ? selectedLandmark.nameAr : selectedLandmark.nameEn}
              </h4>
              <p className="text-xs text-slate-300 mt-1">
                {isAr ? selectedLandmark.descAr : selectedLandmark.descEn}
              </p>
            </div>
          </div>
          <button
            onClick={() => setSelectedLandmarkId(null)}
            className="text-slate-400 hover:text-white p-1"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Selected Maritime Port Popover (MoroccoAPI Ports Layer) */}
      {selectedPort && (
        <div className="fixed top-24 left-1/2 -translate-x-1/2 z-30 bg-slate-950/95 border border-teal-400/50 rounded-2xl p-4 shadow-2xl max-w-md w-full backdrop-blur-xl flex items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-700 flex items-center justify-center text-xl shrink-0">
              ⚓
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase text-teal-400 block">
                {isAr ? 'ميناء مغربي (بيانات MoroccoAPI)' : 'Moroccan Port (MoroccoAPI)'}
              </span>
              <h4 className="text-sm font-black text-white">{selectedPort.name}</h4>
              <p className="text-xs text-slate-300 mt-1">
                {selectedPort.type} • {selectedPort.connectivity} ({selectedPort.status})
              </p>
            </div>
          </div>
          <button
            onClick={() => setSelectedPortName(null)}
            className="text-slate-400 hover:text-white p-1"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* 3. FLOATING MAP LENSES & ZOOM CONTROLS (Bottom-Right / Left depending on RTL) */}
      <div className="fixed bottom-24 right-5 z-20 flex flex-col gap-2">
        {/* Map Lenses Pill Bar */}
        <div className="bg-slate-950/85 backdrop-blur-xl border border-slate-800/90 rounded-2xl p-2 shadow-2xl space-y-1.5 w-52">
          <div className="px-2 py-1 flex items-center justify-between border-b border-slate-800/80">
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-sky-400" />
              {isAr ? 'عدسات الخريطة التكتيكية' : 'Tactical Map Lenses'}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-1 text-[11px]">
            <button
              onClick={() => setLens('tension')}
              className={`px-2.5 py-1.5 rounded-xl font-bold flex items-center gap-1.5 transition-all ${
                lens === 'tension'
                  ? 'bg-rose-600 text-white shadow-md'
                  : 'bg-slate-900/70 text-slate-400 hover:text-white'
              }`}
            >
              <Flame className="w-3.5 h-3.5 shrink-0" />
              <span className="truncate">{isAr ? 'الاحتقان' : 'Tension'}</span>
            </button>

            <button
              onClick={() => setLens('satisfaction')}
              className={`px-2.5 py-1.5 rounded-xl font-bold flex items-center gap-1.5 transition-all ${
                lens === 'satisfaction'
                  ? 'bg-emerald-600 text-white shadow-md'
                  : 'bg-slate-900/70 text-slate-400 hover:text-white'
              }`}
            >
              <Heart className="w-3.5 h-3.5 shrink-0" />
              <span className="truncate">{isAr ? 'الرضا' : 'Approval'}</span>
            </button>

            <button
              onClick={() => setLens('unemployment')}
              className={`px-2.5 py-1.5 rounded-xl font-bold flex items-center gap-1.5 transition-all ${
                lens === 'unemployment'
                  ? 'bg-amber-600 text-white shadow-md'
                  : 'bg-slate-900/70 text-slate-400 hover:text-white'
              }`}
            >
              <Briefcase className="w-3.5 h-3.5 shrink-0" />
              <span className="truncate">{isAr ? 'البطالة' : 'Jobs'}</span>
            </button>

            <button
              onClick={() => setLens('water')}
              className={`px-2.5 py-1.5 rounded-xl font-bold flex items-center gap-1.5 transition-all ${
                lens === 'water'
                  ? 'bg-cyan-600 text-white shadow-md'
                  : 'bg-slate-900/70 text-slate-400 hover:text-white'
              }`}
            >
              <Droplets className="w-3.5 h-3.5 shrink-0" />
              <span className="truncate">{isAr ? 'السدود' : 'Water'}</span>
            </button>

            <button
              onClick={() => setLens('party')}
              className={`px-2.5 py-1.5 rounded-xl font-bold flex items-center gap-1.5 transition-all ${
                lens === 'party'
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'bg-slate-900/70 text-slate-400 hover:text-white'
              }`}
            >
              <Flag className="w-3.5 h-3.5 shrink-0" />
              <span className="truncate">{isAr ? 'الأحزاب' : 'Parties'}</span>
            </button>

            <button
              onClick={() => setLens('gdp')}
              className={`px-2.5 py-1.5 rounded-xl font-bold flex items-center gap-1.5 transition-all ${
                lens === 'gdp'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'bg-slate-900/70 text-slate-400 hover:text-white'
              }`}
            >
              <TrendingUp className="w-3.5 h-3.5 shrink-0" />
              <span className="truncate">{isAr ? 'الثروة' : 'GDP'}</span>
            </button>
          </div>

          {/* Toggle Strategic Landmarks, Maritime Ports & Zoom/Pan Reset */}
          <div className="pt-1.5 border-t border-slate-800/80 flex items-center justify-between gap-1">
            <button
              onClick={() => setShowLandmarks(prev => !prev)}
              className={`flex-1 py-1 px-2 rounded-lg text-[10px] font-bold flex items-center justify-center gap-1 transition-all ${
                showLandmarks
                  ? 'bg-sky-500/20 text-sky-300 border border-sky-500/40'
                  : 'bg-slate-900 text-slate-500'
              }`}
            >
              <Anchor className="w-3 h-3" />
              <span>{isAr ? 'المعالم' : 'Assets'}</span>
            </button>
            <button
              onClick={() => {
                setShowPorts(prev => !prev);
                setSelectedPortName(null);
              }}
              className={`flex-1 py-1 px-2 rounded-lg text-[10px] font-bold flex items-center justify-center gap-1 transition-all ${
                showPorts
                  ? 'bg-teal-500/20 text-teal-300 border border-teal-500/40'
                  : 'bg-slate-900 text-slate-500'
              }`}
              title={isAr ? 'عرض الموانئ الوطنية الـ 48' : 'Toggle 48 National Ports'}
            >
              <MapPin className="w-3 h-3" />
              <span>{isAr ? 'الموانئ (48)' : 'Ports (48)'}</span>
            </button>
            <button
              onClick={() => setZoom(z => Math.min(1.6, Number((z + 0.15).toFixed(2))))}
              className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300"
              title="Zoom In"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setZoom(z => Math.max(0.75, Number((z - 0.15).toFixed(2))))}
              className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300"
              title="Zoom Out"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => {
                setZoom(1);
                setPan({ x: 0, y: 0 });
              }}
              className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300"
              title={isAr ? 'إعادة ضبط التكبير والموقع' : 'Reset Zoom & Pan'}
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* 4. FLOATING STRATEGIC OUTLINER & QUICK COMMANDS (Top-Right) */}
      <div className="hidden md:block fixed top-20 right-5 z-20 w-72 space-y-2.5 max-h-[calc(100vh-21rem)] overflow-y-auto pe-0.5">
        {/* Quick Interactive Action Strip */}
        <div className="bg-slate-950/85 backdrop-blur-xl border border-sky-500/30 rounded-2xl p-2.5 shadow-2xl space-y-2">
          <span className="text-[10px] font-black uppercase tracking-wider text-sky-400 px-1 block">
            {isAr ? 'المبادرات التفاعلية المباشرة' : 'Live Executive Initiatives'}
          </span>

          <div className="grid grid-cols-2 gap-1.5">
            <button
              onClick={() => onOpenEncounter('press')}
              className="p-2 rounded-xl bg-gradient-to-br from-sky-600/30 to-blue-900/40 hover:from-sky-500/40 border border-sky-500/40 text-start flex flex-col gap-1 transition-all group"
            >
              <div className="flex items-center gap-1.5 text-sky-300 font-bold text-[11px]">
                <Mic className="w-3.5 h-3.5 text-sky-400 group-hover:scale-110 transition-transform" />
                <span>{isAr ? 'ندوة صحفية' : 'Press Conf.'}</span>
              </div>
              <span className="text-[9px] text-slate-400">
                {isAr ? 'مواجهة الإعلام والشارع' : 'Address media live'}
              </span>
            </button>

            <button
              onClick={() => onOpenEncounter('unions')}
              className="p-2 rounded-xl bg-gradient-to-br from-amber-600/30 to-orange-900/40 hover:from-amber-500/40 border border-amber-500/40 text-start flex flex-col gap-1 transition-all group"
            >
              <div className="flex items-center gap-1.5 text-amber-300 font-bold text-[11px]">
                <Briefcase className="w-3.5 h-3.5 text-amber-400 group-hover:scale-110 transition-transform" />
                <span>{isAr ? 'حوار النقابات' : 'Union Talks'}</span>
              </div>
              <span className="text-[9px] text-slate-400">
                {isAr ? 'تفاوض الأجور والسلم' : 'Bargain with unions'}
              </span>
            </button>

            <button
              onClick={onOpenCustomDecree}
              className="p-2 rounded-xl bg-gradient-to-br from-emerald-600/30 to-teal-900/40 hover:from-emerald-500/40 border border-emerald-500/40 text-left flex flex-col gap-1 transition-all group"
            >
              <div className="flex items-center gap-1.5 text-emerald-300 font-bold text-[11px]">
                <FileText className="w-3.5 h-3.5 text-emerald-400 group-hover:scale-110 transition-transform" />
                <span>{isAr ? 'مرسوم حر (AI)' : 'Custom Decree'}</span>
              </div>
              <span className="text-[9px] text-slate-400">
                {isAr ? 'اكتب أي قانون تريده' : 'Draft any law freely'}
              </span>
            </button>

            <button
              onClick={onOpenAiAdvisor}
              className="p-2 rounded-xl bg-gradient-to-br from-purple-600/30 to-indigo-900/40 hover:from-purple-500/40 border border-purple-500/40 text-left flex flex-col gap-1 transition-all group"
            >
              <div className="flex items-center gap-1.5 text-purple-300 font-bold text-[11px]">
                <Sparkles className="w-3.5 h-3.5 text-purple-400 group-hover:scale-110 transition-transform" />
                <span>{isAr ? 'مستشار الديوان' : 'AI Advisor'}</span>
              </div>
              <span className="text-[9px] text-slate-400">
                {isAr ? 'تحليل DeepSeek الذكي' : 'DeepSeek analysis'}
              </span>
            </button>
          </div>
        </div>

        {/* Active National Crises Outliner */}
        {state.activeCrises.length > 0 && (
          <div className="bg-rose-950/85 backdrop-blur-xl border border-rose-500/60 rounded-2xl p-3 shadow-2xl space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-black text-rose-300 flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-rose-400 animate-bounce" />
                {isAr ? 'أزمات وطنية طارئة' : 'Active National Crises'}
              </span>
              <span className="px-2 py-0.5 rounded-full bg-rose-600 text-white text-[10px] font-bold">
                {state.activeCrises.length}
              </span>
            </div>
            <div className="space-y-1.5">
              {state.activeCrises.map(c => (
                <button
                  key={c.id}
                  onClick={() => onSelectCrisis(c.id)}
                  className="w-full text-right bg-slate-950/80 hover:bg-rose-900/60 border border-rose-500/40 rounded-xl p-2.5 transition-all flex items-center justify-between gap-2"
                >
                  <span className="text-xs font-bold text-white line-clamp-1">
                    {isAr ? c.titleAr : c.titleEn}
                  </span>
                  <ChevronRight className="w-4 h-4 text-rose-400 shrink-0" />
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Active Civic Protests Outliner */}
        {(state.activeCityProtests || []).length > 0 && (
          <div className="bg-slate-950/85 backdrop-blur-xl border border-amber-500/40 rounded-2xl p-3 shadow-2xl space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-black text-amber-300 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-rose-400" />
                {isAr ? 'بؤر الاحتجاجات بالحواضر' : 'Active City Flashpoints'}
              </span>
              <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-[10px] font-bold">
                {(state.activeCityProtests || []).length}
              </span>
            </div>
            <div className="space-y-1.5 max-h-40 overflow-y-auto pr-0.5">
              {(state.activeCityProtests || []).map(p => (
                <button
                  key={p.id}
                  onClick={() => onSelectProtest(p.id)}
                  className="w-full text-right bg-slate-900/90 hover:bg-slate-800 border border-slate-800 hover:border-amber-500/50 rounded-xl p-2 transition-all flex items-center justify-between gap-2"
                >
                  <div>
                    <div className="text-xs font-bold text-white flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
                      <span>{isAr ? p.cityNameAr : p.cityNameEn}</span>
                    </div>
                    <span className="text-[10px] text-slate-400 line-clamp-1 block mt-0.5">
                      {isAr ? p.demandsAr[0] : p.demandsEn[0]}
                    </span>
                  </div>
                  <span className="text-[10px] font-bold text-amber-400 shrink-0">
                    {isAr ? 'تفاوض ←' : 'Act →'}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Latest News Headline Ticker Card */}
        {state.newsFeed.length > 0 && (
          <div className="bg-slate-950/80 backdrop-blur-xl border border-slate-800/90 rounded-2xl p-3 shadow-xl space-y-1">
            <div className="flex items-center gap-1.5 text-[10px] font-bold text-emerald-400 uppercase">
              <Newspaper className="w-3.5 h-3.5" />
              <span>{isAr ? 'آخر برقية إخبارية (MAP)' : 'Latest Wire Bulletin'}</span>
            </div>
            <p className="text-xs font-bold text-slate-200 leading-snug">
              {isAr ? state.newsFeed[0].headlineAr : state.newsFeed[0].headlineEn}
            </p>
            <p className="text-[10px] text-slate-400 line-clamp-2">
              {isAr ? state.newsFeed[0].summaryAr : state.newsFeed[0].summaryEn}
            </p>
          </div>
        )}
      </div>

      {/* 5. FLOATING REGIONAL TACTICAL INSPECTOR DRAWER (Left Side) */}
      {selectedRegion && (
        <div className="fixed top-20 left-3 sm:left-5 bottom-24 z-20 w-[calc(100vw-1.5rem)] sm:w-80 md:w-96 bg-slate-950/88 backdrop-blur-2xl border border-slate-800/90 rounded-3xl shadow-2xl flex flex-col overflow-hidden transition-all">
          {/* Region Header */}
          <div className="p-4 bg-gradient-to-r from-slate-900 via-[#111c35] to-slate-900 border-b border-slate-800 flex items-start justify-between gap-2">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-wider text-emerald-400">
                  {isAr ? 'القيادة الجهوية التكتيكية' : 'Regional Tactical Inspector'}
                </span>
                <span
                  className="text-[10px] px-2 py-0.5 rounded font-bold text-white"
                  style={{ backgroundColor: getLeadingParty(selectedRegion)?.color || '#0284c7' }}
                >
                  {getLeadingParty(selectedRegion)?.acronym}
                </span>
              </div>
              <h3 className="text-base font-black text-white mt-0.5">
                {isAr ? selectedRegion.nameAr : selectedRegion.nameEn}
              </h3>
              <p className="text-[11px] text-slate-400">
                {isAr ? 'العاصمة الإدارية:' : 'Regional Capital:'}{' '}
                <strong className="text-slate-200">
                  {isAr ? selectedRegion.capitalAr : selectedRegion.capitalEn}
                </strong>{' '}
                • {(selectedRegion.population / 1000000).toFixed(2)}M {isAr ? 'نسمة' : 'pop'}
              </p>
            </div>
            <button
              onClick={() => setSelectedRegionId(null)}
              className="w-7 h-7 rounded-lg bg-slate-800/80 hover:bg-rose-600 text-slate-400 hover:text-white flex items-center justify-center transition-all"
              title={isAr ? 'إغلاق لوحة الجهة' : 'Close Region Inspector'}
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Scrollable Body */}
          <div className="p-4 overflow-y-auto space-y-4 flex-1">
            {/* Core Regional Metrics */}
            <div className="grid grid-cols-4 gap-2 text-center">
              <div className="bg-slate-900/90 border border-slate-800 p-2 rounded-xl">
                <span className="text-[9px] text-slate-400 block">{isAr ? 'الرضا' : 'Approval'}</span>
                <span className="text-xs font-black text-emerald-400">{selectedRegion.satisfaction}%</span>
              </div>
              <div className="bg-slate-900/90 border border-slate-800 p-2 rounded-xl">
                <span className="text-[9px] text-slate-400 block">{isAr ? 'الاحتقان' : 'Tension'}</span>
                <span className="text-xs font-black text-rose-400">{selectedRegion.socialTension}%</span>
              </div>
              <div className="bg-slate-900/90 border border-slate-800 p-2 rounded-xl">
                <span className="text-[9px] text-slate-400 block">{isAr ? 'البطالة' : 'Unemp.'}</span>
                <span className="text-xs font-black text-amber-400">{selectedRegion.unemploymentRate}%</span>
              </div>
              <div className="bg-slate-900/90 border border-slate-800 p-2 rounded-xl">
                <span className="text-[9px] text-slate-400 block">{isAr ? 'السدود' : 'Dams'}</span>
                <span className="text-xs font-black text-cyan-400">{selectedRegion.reservoirFillRate}%</span>
              </div>
            </div>

            {/* Direct Regional Intervention Actions */}
            <div className="bg-slate-900/80 border border-sky-500/30 rounded-2xl p-3 space-y-2">
              <span className="text-[11px] font-black text-sky-300 flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5 text-sky-400" />
                {isAr ? 'قرارات التدخل الجهوي الفوري' : 'Direct Regional Interventions'}
              </span>

              <div className="space-y-1.5">
                <button
                  onClick={() => onRegionalIntervention(selectedRegion.id, 'job_stimulus')}
                  className="w-full text-start bg-slate-950/90 hover:bg-emerald-950/60 border border-slate-800 hover:border-emerald-500/50 rounded-xl p-2.5 transition-all flex items-center justify-between gap-2"
                >
                  <div>
                    <div className="text-[11px] font-bold text-emerald-300">
                      {isAr ? '🏭 دعم المنطقة الصناعية وتشغيل الشباب' : '🏭 Regional Industrial & Youth Job Grant'}
                    </div>
                    <div className="text-[10px] text-slate-400">
                      {isAr ? 'يخفض البطالة والاحتقان ويرفع الرضا الجهوي' : 'Cuts local unemployment & tension'}
                    </div>
                  </div>
                  <span className="text-[10px] font-mono font-bold text-amber-300 shrink-0">0.35B</span>
                </button>

                <button
                  onClick={() => onRegionalIntervention(selectedRegion.id, 'water_roads')}
                  className="w-full text-right bg-slate-950/90 hover:bg-cyan-950/60 border border-slate-800 hover:border-cyan-500/50 rounded-xl p-2.5 transition-all flex items-center justify-between gap-2"
                >
                  <div>
                    <div className="text-[11px] font-bold text-cyan-300">
                      {isAr ? '💧 برنامج استعجالي للماء وفك العزلة' : '💧 Emergency Water & Rural Roads'}
                    </div>
                    <div className="text-[10px] text-slate-400">
                      {isAr ? 'يخفف الإجهاد المائي ويربط المداشر والقرى' : 'Relieves water stress & upgrades roads'}
                    </div>
                  </div>
                  <span className="text-[10px] font-mono font-bold text-amber-300 shrink-0">0.25B</span>
                </button>

                <button
                  onClick={() => onRegionalIntervention(selectedRegion.id, 'social_health')}
                  className="w-full text-right bg-slate-950/90 hover:bg-sky-950/60 border border-slate-800 hover:border-sky-500/50 rounded-xl p-2.5 transition-all flex items-center justify-between gap-2"
                >
                  <div>
                    <div className="text-[11px] font-bold text-sky-300">
                      {isAr ? '🏥 تجهيز المستشفيات وقوافل الدعم' : '🏥 Hospital Upgrade & Medical Relief'}
                    </div>
                    <div className="text-[10px] text-slate-400">
                      {isAr ? 'يرفع جودة الخدمات الصحية والرضا الشعبي' : 'Boosts regional healthcare & approval'}
                    </div>
                  </div>
                  <span className="text-[10px] font-mono font-bold text-amber-300 shrink-0">0.15B</span>
                </button>
              </div>
            </div>

            {/* Active Protests in this Region */}
            {protestsInSelectedRegion.length > 0 ? (
              <div className="space-y-2">
                <span className="text-[11px] font-bold text-rose-400 block">
                  {isAr ? '🔥 احتجاجات ومطالب نشطة بالجهة:' : '🔥 Active Protests in Region:'}
                </span>
                {protestsInSelectedRegion.map(p => (
                  <div
                    key={p.id}
                    className="bg-rose-950/50 border border-rose-500/50 rounded-xl p-3 space-y-2"
                  >
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-black text-white">
                        {isAr ? p.cityNameAr : p.cityNameEn}
                      </span>
                      <span className="text-[10px] px-2 py-0.5 rounded bg-rose-600 text-white font-bold uppercase">
                        {p.intensity}
                      </span>
                    </div>
                    <ul className="text-[11px] text-rose-100 space-y-1 list-disc list-inside">
                      {(isAr ? p.demandsAr : p.demandsEn).map((d, i) => (
                        <li key={i}>{d}</li>
                      ))}
                    </ul>
                    <button
                      onClick={() => onSelectProtest(p.id)}
                      className="w-full py-1.5 bg-rose-600 hover:bg-rose-500 text-white rounded-lg text-xs font-bold transition-all"
                    >
                      {isAr ? 'التدخل والتفاوض مع المحتجين' : 'Respond to Protest Demands'}
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-emerald-950/25 border border-emerald-700/30 rounded-xl p-2.5 flex items-center gap-2 text-[11px] text-emerald-300">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>{isAr ? 'الوضع الميداني هادئ ولا توجد وقفات احتجاجية بالجهة.' : 'Calm social situation across regional cities.'}</span>
              </div>
            )}

            {/* Constituent Cities & Local Priorities */}
            <div className="space-y-2">
              <span className="text-[11px] font-bold text-slate-300 block">
                {isAr ? `حواضر ومدن الجهة (${citiesInSelectedRegion.length}):` : `Regional Cities (${citiesInSelectedRegion.length}):`}
              </span>
              <div className="space-y-2">
                {citiesInSelectedRegion.map(c => (
                  <div
                    key={c.id}
                    className="bg-slate-900/90 border border-slate-800 rounded-xl p-2.5 space-y-1 text-xs"
                  >
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-white">{isAr ? c.nameAr : c.nameEn}</span>
                      <div className="flex items-center gap-2 text-[10px] font-mono">
                        <span className="text-emerald-400">{c.satisfaction}% {isAr ? 'رضا' : 'sat'}</span>
                        <span className="text-amber-400">{c.unemploymentRate}% {isAr ? 'بطالة' : 'unemp'}</span>
                      </div>
                    </div>
                    <div className="text-[10px] text-slate-400 leading-relaxed">
                      <span className="text-amber-400 font-semibold">{isAr ? 'مطالب الساكنة: ' : 'Priorities: '}</span>
                      <span>{(isAr && c.localIssuesAr ? c.localIssuesAr : c.localIssues).join(' • ')}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
