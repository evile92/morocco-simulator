import React from 'react';
import {
  Map,
  Landmark,
  Sliders,
  Droplets,
  Globe2,
  BarChart3,
  Briefcase,
  Flag,
  Vote,
  Receipt,
  FileText,
  TrendingUp,
  Layers,
  Building2,
  Users,
  Newspaper,
  History,
  Settings,
  LayoutDashboard,
  Mic
} from 'lucide-react';
import { ViewTab, GameState } from '../types/game';

export type StrategicHubId = 'map_canvas' | 'governance' | 'economy_policy' | 'infrastructure' | 'sovereignty' | 'intel_archives';

interface CommandDockProps {
  activeHub: StrategicHubId;
  activeTab: ViewTab;
  state: GameState;
  onSelectHub: (hub: StrategicHubId, defaultTab?: ViewTab) => void;
  onOpenEncounter: () => void;
}

export const HUB_SUBTABS: Record<
  Exclude<StrategicHubId, 'map_canvas'>,
  { tab: ViewTab; labelAr: string; labelEn: string; icon: React.ReactNode }[]
> = {
  governance: [
    { tab: 'government', labelAr: 'مجلس الوزراء والتعيينات', labelEn: 'Cabinet & Ministers', icon: <Briefcase className="w-3.5 h-3.5" /> },
    { tab: 'parliament', labelAr: 'البرلمان والتشريع', labelEn: 'Parliament & Votes', icon: <Landmark className="w-3.5 h-3.5" /> },
    { tab: 'parties', labelAr: 'الأحزاب السياسية', labelEn: 'Political Parties', icon: <Flag className="w-3.5 h-3.5" /> },
    { tab: 'elections', labelAr: 'الانتخابات التشريعية', labelEn: 'General Elections', icon: <Vote className="w-3.5 h-3.5" /> }
  ],
  economy_policy: [
    { tab: 'budget', labelAr: 'منزلقات الميزانية والضرائب', labelEn: 'Live Fiscal Sliders', icon: <Receipt className="w-3.5 h-3.5" /> },
    { tab: 'decisions', labelAr: 'المراسيم ومشاريع القوانين', labelEn: 'Decrees & Bills', icon: <FileText className="w-3.5 h-3.5" /> },
    { tab: 'economy', labelAr: 'الاقتصاد الكلي والقطاعات', labelEn: 'Macroeconomy', icon: <TrendingUp className="w-3.5 h-3.5" /> }
  ],
  infrastructure: [
    { tab: 'water', labelAr: 'الأمن المائي والسدود', labelEn: 'Water & Desalination', icon: <Droplets className="w-3.5 h-3.5" /> },
    { tab: 'regions', labelAr: 'الجهات الـ 12', labelEn: '12 Regions Matrix', icon: <Layers className="w-3.5 h-3.5" /> },
    { tab: 'cities', labelAr: 'الحواضر الـ 30', labelEn: '30 Major Cities', icon: <Building2 className="w-3.5 h-3.5" /> }
  ],
  sovereignty: [
    { tab: 'foreign', labelAr: 'الصحراء المغربية والخارجية', labelEn: 'Sahara & Diplomacy', icon: <Globe2 className="w-3.5 h-3.5" /> },
    { tab: 'society', labelAr: 'الفئات المجتمعية والأزمات', labelEn: 'Society & Crises', icon: <Users className="w-3.5 h-3.5" /> }
  ],
  intel_archives: [
    { tab: 'dashboard', labelAr: 'غرفة العمليات الشاملة', labelEn: 'Executive Overview', icon: <LayoutDashboard className="w-3.5 h-3.5" /> },
    { tab: 'statistics', labelAr: 'المبيانات والمنحنيات', labelEn: 'Charts & Analytics', icon: <BarChart3 className="w-3.5 h-3.5" /> },
    { tab: 'news', labelAr: 'الصحافة والأنباء', labelEn: 'National Press', icon: <Newspaper className="w-3.5 h-3.5" /> },
    { tab: 'history', labelAr: 'الأرشيف التاريخي', labelEn: 'Decision Archive', icon: <History className="w-3.5 h-3.5" /> },
    { tab: 'settings', labelAr: 'الإعدادات والحفظ', labelEn: 'Settings & Saves', icon: <Settings className="w-3.5 h-3.5" /> }
  ]
};

export const CommandDock: React.FC<CommandDockProps> = ({
  activeHub,
  state,
  onSelectHub,
  onOpenEncounter
}) => {
  const isAr = state.language === 'ar';

  const hubs: {
    id: StrategicHubId;
    defaultTab?: ViewTab;
    labelAr: string;
    labelEn: string;
    icon: React.ReactNode;
    badge?: string | number;
    badgeColor?: string;
  }[] = [
    {
      id: 'map_canvas',
      labelAr: 'الخريطة الاستراتيجية',
      labelEn: 'Strategic Map',
      icon: <Map className="w-5 h-5" />
    },
    {
      id: 'governance',
      defaultTab: state.pendingElection ? 'elections' : 'government',
      labelAr: 'الحكومة والبرلمان',
      labelEn: 'Cabinet & Parliament',
      icon: <Landmark className="w-5 h-5" />,
      badge: state.pendingElection ? (isAr ? 'انتخابات' : 'Vote') : state.government.parliamentarySeats < 198 ? '!' : undefined,
      badgeColor: state.pendingElection ? 'bg-emerald-500' : 'bg-rose-500'
    },
    {
      id: 'economy_policy',
      defaultTab: 'budget',
      labelAr: 'الميزانية والقوانين',
      labelEn: 'Budget & Policies',
      icon: <Sliders className="w-5 h-5" />
    },
    {
      id: 'infrastructure',
      defaultTab: 'water',
      labelAr: 'الماء والأوراش',
      labelEn: 'Water & Regions',
      icon: <Droplets className="w-5 h-5" />,
      badge: state.water.overallDamFillRate < 26 ? '💧' : undefined,
      badgeColor: 'bg-amber-600'
    },
    {
      id: 'sovereignty',
      defaultTab: 'foreign',
      labelAr: 'السيادة والخارجية',
      labelEn: 'Sahara & Foreign',
      icon: <Globe2 className="w-5 h-5" />,
      badge: state.activeCrises.length > 0 ? state.activeCrises.length : undefined,
      badgeColor: 'bg-rose-600'
    },
    {
      id: 'intel_archives',
      defaultTab: 'dashboard',
      labelAr: 'التقارير والأرشيف',
      labelEn: 'Intel & Archives',
      icon: <BarChart3 className="w-5 h-5" />
    }
  ];

  return (
    <div className="fixed bottom-3 left-1/2 -translate-x-1/2 z-40 flex items-center gap-2 px-3 py-2 rounded-3xl bg-slate-950/90 backdrop-blur-2xl border border-slate-700/80 shadow-[0_15px_50px_rgba(0,0,0,0.85)]">
      {hubs.map(hub => {
        const isActive = activeHub === hub.id;
        return (
          <button
            key={hub.id}
            onClick={() => onSelectHub(hub.id, hub.defaultTab)}
            className={`relative px-3.5 py-2 rounded-2xl flex items-center gap-2 text-xs font-bold transition-all duration-200 group ${
              isActive
                ? 'bg-gradient-to-r from-sky-600 to-emerald-600 text-white shadow-lg scale-105'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/80'
            }`}
          >
            <span className={isActive ? 'text-white' : 'text-sky-400 group-hover:text-sky-300'}>
              {hub.icon}
            </span>
            <span className="hidden sm:inline whitespace-nowrap">
              {isAr ? hub.labelAr : hub.labelEn}
            </span>

            {hub.badge !== undefined && (
              <span
                className={`px-1.5 py-0.5 text-[10px] rounded-full text-white font-black ${
                  hub.badgeColor || 'bg-rose-600'
                }`}
              >
                {hub.badge}
              </span>
            )}
          </button>
        );
      })}

      {/* Divider */}
      <div className="h-7 w-[1px] bg-slate-800 mx-1 hidden md:block" />

      {/* Direct Interactive Encounter Button in Dock */}
      <button
        onClick={onOpenEncounter}
        className="px-3.5 py-2 rounded-2xl bg-gradient-to-r from-amber-600/90 to-rose-600/90 hover:from-amber-500 hover:to-rose-500 text-white text-xs font-black flex items-center gap-1.5 shadow-lg transition-all hover:scale-105"
      >
        <Mic className="w-4 h-4" />
        <span className="hidden md:inline whitespace-nowrap">
          {isAr ? 'الديوان التفاعلي' : 'Live Encounter'}
        </span>
      </button>
    </div>
  );
};
