import { Minister, PoliticalParty } from '../types/game';

export interface PartyLeaderInfo {
  pmNameEn: string;
  pmNameAr: string;
  prominentFigures: Array<{
    nameEn: string;
    nameAr: string;
    preferredPortfolios: Minister['portfolio'][];
  }>;
}

export const PARTY_LEADERS_AND_FIGURES: Record<string, PartyLeaderInfo> = {
  rni: {
    pmNameEn: 'Aziz Akhannouch',
    pmNameAr: 'عزيز أخنوش',
    prominentFigures: [
      { nameEn: 'Nadia Fettah Alaoui', nameAr: 'نادية فتاح العلوي', preferredPortfolios: ['economy_finance'] },
      { nameEn: 'Ahmed El Bouari', nameAr: 'أحمد البواري', preferredPortfolios: ['agriculture_water'] },
      { nameEn: 'Chakib Benmoussa', nameAr: 'شكيب بنموسى', preferredPortfolios: ['national_education'] },
      { nameEn: 'Mohamed Sadiki', nameAr: 'محمد صديقي', preferredPortfolios: ['agriculture_water', 'equipment_water'] },
      { nameEn: 'Mustapha Baitas', nameAr: 'مصطفى بايتاس', preferredPortfolios: ['digital_transition'] }
    ]
  },
  pam: {
    pmNameEn: 'Fatima Ezzahra El Mansouri',
    pmNameAr: 'فاطمة الزهراء المنصوري',
    prominentFigures: [
      { nameEn: 'Abdellatif Ouahbi', nameAr: 'عبد اللطيف وهبي', preferredPortfolios: ['housing_urbanism', 'interior'] },
      { nameEn: 'Younes Sekkouri', nameAr: 'يونس سكوري', preferredPortfolios: ['industry_trade', 'digital_transition'] },
      { nameEn: 'Leila Benali', nameAr: 'ليلى بنعلي', preferredPortfolios: ['energy_transition'] },
      { nameEn: 'Mohamed Mehdi Bensaid', nameAr: 'محمد المهدي بنسعيد', preferredPortfolios: ['national_education', 'digital_transition'] },
      { nameEn: 'Ahmed Akhchichine', nameAr: 'أحمد اخشيشن', preferredPortfolios: ['national_education'] }
    ]
  },
  istiqlal: {
    pmNameEn: 'Nizar Baraka',
    pmNameAr: 'نزار بركة',
    prominentFigures: [
      { nameEn: 'Ryad Mezzour', nameAr: 'رياض مزور', preferredPortfolios: ['industry_trade', 'economy_finance'] },
      { nameEn: 'Kenza El Ghali', nameAr: 'كنزة الغالي', preferredPortfolios: ['health_social'] },
      { nameEn: 'Chiba Maoulainine', nameAr: 'شيبة ماء العينين', preferredPortfolios: ['equipment_water', 'agriculture_water'] },
      { nameEn: 'Fouad Douiri', nameAr: 'فؤاد الدويري', preferredPortfolios: ['energy_transition'] },
      { nameEn: 'Noureddine Mediane', nameAr: 'نور الدين مضيان', preferredPortfolios: ['transport_logistics'] }
    ]
  },
  pjd: {
    pmNameEn: 'Abdelilah Benkirane',
    pmNameAr: 'عبد الإله ابن كيران',
    prominentFigures: [
      { nameEn: 'Dr. Saadeddine Othmani', nameAr: 'د. سعد الدين العثماني', preferredPortfolios: ['foreign_affairs', 'health_social'] },
      { nameEn: 'Aziz Rabbah', nameAr: 'عزيز رباح', preferredPortfolios: ['energy_transition', 'equipment_water'] },
      { nameEn: 'Mustapha Ramid', nameAr: 'مصطفى الرميد', preferredPortfolios: ['interior', 'housing_urbanism'] },
      { nameEn: 'Dr. Lahcen Daoudi', nameAr: 'د. لحسن الداودي', preferredPortfolios: ['economy_finance', 'national_education'] },
      { nameEn: 'Jamila El Moussali', nameAr: 'جميلة المصلي', preferredPortfolios: ['health_social', 'digital_transition'] }
    ]
  },
  usfp: {
    pmNameEn: 'Driss Lachgar',
    pmNameAr: 'إدريس لشكر',
    prominentFigures: [
      { nameEn: 'Habib El Malki', nameAr: 'الحبيب المالكي', preferredPortfolios: ['national_education', 'economy_finance'] },
      { nameEn: 'Abdelkarim Benatiq', nameAr: 'عبد الكريم بنعتيق', preferredPortfolios: ['foreign_affairs', 'industry_trade'] },
      { nameEn: 'Mohamed Benabdelkader', nameAr: 'محمد بنعبد القادر', preferredPortfolios: ['digital_transition', 'interior'] },
      { nameEn: 'Khaoula Lachgar', nameAr: 'خولة لشكر', preferredPortfolios: ['digital_transition', 'health_social'] },
      { nameEn: 'Tariq Kabbage', nameAr: 'طارق القباج', preferredPortfolios: ['agriculture_water'] }
    ]
  },
  mp: {
    pmNameEn: 'Mohamed Ouzzine',
    pmNameAr: 'محمد أوزين',
    prominentFigures: [
      { nameEn: 'Driss Sentissi', nameAr: 'إدريس السنتيسي', preferredPortfolios: ['equipment_water', 'transport_logistics'] },
      { nameEn: 'Halima Assali', nameAr: 'حليمة العسالي', preferredPortfolios: ['health_social'] },
      { nameEn: 'Said Amzazi', nameAr: 'سعيد أمزازي', preferredPortfolios: ['national_education'] },
      { nameEn: 'Mohamed Moubdii', nameAr: 'محمد مبديع', preferredPortfolios: ['digital_transition'] }
    ]
  },
  pps: {
    pmNameEn: 'Nabil Benabdallah',
    pmNameAr: 'نبيل بنعبد الله',
    prominentFigures: [
      { nameEn: 'Dr. El Houssaine Louardi', nameAr: 'د. الحسين الوردي', preferredPortfolios: ['health_social'] },
      { nameEn: 'Charafat Afilal', nameAr: 'شرفات أفيلال', preferredPortfolios: ['equipment_water', 'agriculture_water'] },
      { nameEn: 'Abdeslam Seddiki', nameAr: 'عبد السلام الصديقي', preferredPortfolios: ['economy_finance', 'industry_trade'] },
      { nameEn: 'Said Fekkak', nameAr: 'سعيد الفكاك', preferredPortfolios: ['digital_transition'] }
    ]
  },
  uc: {
    pmNameEn: 'Mohamed Joudar',
    pmNameAr: 'محمد جودار',
    prominentFigures: [
      { nameEn: 'Sajid Mohamed', nameAr: 'محمد ساجد', preferredPortfolios: ['transport_logistics', 'housing_urbanism'] },
      { nameEn: 'Yassir Adil', nameAr: 'ياسر عادل', preferredPortfolios: ['industry_trade', 'economy_finance'] },
      { nameEn: 'Abdellah Firdaous', nameAr: 'عبد الله الفردوس', preferredPortfolios: ['health_social'] }
    ]
  },
  fgd: {
    pmNameEn: 'Nabila Mounib',
    pmNameAr: 'نبيلة منيب',
    prominentFigures: [
      { nameEn: 'Omar Balafrej', nameAr: 'عمر بلافريج', preferredPortfolios: ['economy_finance', 'national_education'] },
      { nameEn: 'Mustapha Chanaoui', nameAr: 'مصطفى الشناوي', preferredPortfolios: ['health_social'] }
    ]
  }
};

export const DEFAULT_SOVEREIGN_MINISTERS: Array<{
  portfolio: Minister['portfolio'];
  titleEn: string;
  titleAr: string;
  nameEn: string;
  nameAr: string;
  partyId: string;
}> = [
  {
    portfolio: 'interior',
    titleEn: 'Minister of Interior',
    titleAr: 'وزير الداخلية',
    nameEn: 'Abdelouafi Laftit',
    nameAr: 'عبد الوافي لفتيت',
    partyId: 'technocrat'
  },
  {
    portfolio: 'foreign_affairs',
    titleEn: 'Minister of Foreign Affairs & African Cooperation',
    titleAr: 'وزير الشؤون الخارجية والتعاون الإفريقي',
    nameEn: 'Nasser Bourita',
    nameAr: 'ناصر بوريطة',
    partyId: 'technocrat'
  }
];

export const PORTFOLIO_SPECS: Array<{
  portfolio: Minister['portfolio'];
  titleEn: string;
  titleAr: string;
}> = [
  { portfolio: 'economy_finance', titleEn: 'Minister of Economy & Finance', titleAr: 'وزير الاقتصاد والمالية' },
  { portfolio: 'agriculture_water', titleEn: 'Minister of Agriculture & Maritime Fisheries', titleAr: 'وزير الفلاحة والصيد البحري' },
  { portfolio: 'industry_trade', titleEn: 'Minister of Industry & Commerce', titleAr: 'وزير الصناعة والتجارة' },
  { portfolio: 'national_education', titleEn: 'Minister of National Education & Sports', titleAr: 'وزير التربية الوطنية والتعليم الأولي والرياضة' },
  { portfolio: 'health_social', titleEn: 'Minister of Health & Social Protection', titleAr: 'وزير الصحة والحماية الاجتماعية' },
  { portfolio: 'equipment_water', titleEn: 'Minister of Equipment & Water', titleAr: 'وزير التجهيز والماء' },
  { portfolio: 'energy_transition', titleEn: 'Minister of Energy Transition & Sustainable Development', titleAr: 'وزير الانتقال الطاقي والتنمية المستدامة' },
  { portfolio: 'transport_logistics', titleEn: 'Minister of Transport & Logistics', titleAr: 'وزير النقل واللوجستيك' },
  { portfolio: 'housing_urbanism', titleEn: 'Minister of National Territory Planning & Housing', titleAr: 'وزير إعداد التراب الوطني والتعمير والإسكان' },
  { portfolio: 'digital_transition', titleEn: 'Minister of Digital Transition & Administrative Reform', titleAr: 'وزير الانتقال الرقمي وإصلاح الإدارة' }
];

/**
 * Builds a dynamic, politically coherent Moroccan cabinet based on election coalition.
 */
export function generateNewCabinet(
  rulingPartyId: string,
  coalitionPartyIds: string[]
): {
  primeMinisterEn: string;
  primeMinisterAr: string;
  ministers: Minister[];
} {
  const allCoalitionParties = [rulingPartyId, ...coalitionPartyIds.filter(id => id !== rulingPartyId)];
  const rulingLeader = PARTY_LEADERS_AND_FIGURES[rulingPartyId] || {
    pmNameEn: 'National Coalition Leader',
    pmNameAr: 'رئيس الأغلبية الحكومية',
    prominentFigures: []
  };

  const ministers: Minister[] = [];

  // 1. Prime Minister
  ministers.push({
    id: `min_pm_${Date.now()}`,
    portfolio: 'prime_minister',
    titleEn: 'Head of Government (Prime Minister)',
    titleAr: 'رئيس الحكومة',
    nameEn: rulingLeader.pmNameEn,
    nameAr: rulingLeader.pmNameAr,
    partyId: rulingPartyId,
    competence: 85 + Math.floor(Math.random() * 8),
    loyalty: 95,
    publicApproval: 68 + Math.floor(Math.random() * 10),
    corruptionRisk: 10 + Math.floor(Math.random() * 8)
  });

  // 2. Sovereign portfolios (traditionally retained or high-level appointments)
  for (const sov of DEFAULT_SOVEREIGN_MINISTERS) {
    ministers.push({
      id: `min_${sov.portfolio}_${Date.now()}`,
      portfolio: sov.portfolio,
      titleEn: sov.titleEn,
      titleAr: sov.titleAr,
      nameEn: sov.nameEn,
      nameAr: sov.nameAr,
      partyId: sov.partyId,
      competence: 92,
      loyalty: 90,
      publicApproval: 80,
      corruptionRisk: 6
    });
  }

  // 3. Distribute other key portfolios among coalition parties
  const assignedFigures = new Set<string>();

  PORTFOLIO_SPECS.forEach((spec, idx) => {
    const partyForPortfolio = allCoalitionParties[idx % allCoalitionParties.length];
    const partyData = PARTY_LEADERS_AND_FIGURES[partyForPortfolio];

    let chosenFigure = partyData?.prominentFigures.find(
      f => f.preferredPortfolios.includes(spec.portfolio) && !assignedFigures.has(f.nameEn)
    );

    if (!chosenFigure) {
      chosenFigure = partyData?.prominentFigures.find(f => !assignedFigures.has(f.nameEn));
    }

    let figureNameEn: string;
    let figureNameAr: string;

    if (chosenFigure) {
      figureNameEn = chosenFigure.nameEn;
      figureNameAr = chosenFigure.nameAr;
      assignedFigures.add(chosenFigure.nameEn);
    } else {
      const partyAcronym = partyForPortfolio.toUpperCase();
      figureNameEn = `Dr. ${partyAcronym} Minister for ${spec.portfolio.replace('_', ' ')}`;
      figureNameAr = `قيادي بحزب ${partyAcronym} (${spec.titleAr})`;
    }

    ministers.push({
      id: `min_${spec.portfolio}_${Date.now()}_${idx}`,
      portfolio: spec.portfolio,
      titleEn: spec.titleEn,
      titleAr: spec.titleAr,
      nameEn: figureNameEn,
      nameAr: figureNameAr,
      partyId: partyForPortfolio,
      competence: 75 + Math.floor(Math.random() * 18),
      loyalty: 78 + Math.floor(Math.random() * 15),
      publicApproval: 58 + Math.floor(Math.random() * 16),
      corruptionRisk: 8 + Math.floor(Math.random() * 12)
    });
  });

  return {
    primeMinisterEn: rulingLeader.pmNameEn,
    primeMinisterAr: rulingLeader.pmNameAr,
    ministers
  };
}
