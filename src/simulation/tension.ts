import { RegionData, CityData, TensionLevel, GameEvent, CityProtest, GameState } from '../types/game';
import eventsData from '../data/events.json';

export function calculateNationalTension(regions: RegionData[]): {
  nationalTension: number;
  tensionLevel: TensionLevel;
} {
  const avgTension = regions.reduce((acc, r) => acc + r.socialTension, 0) / regions.length;
  const highestRegionTension = Math.max(...regions.map(r => r.socialTension));

  // Weighted mix between average and the most agitated region
  const nationalTension = Number(((avgTension * 0.7) + (highestRegionTension * 0.3)).toFixed(1));

  let tensionLevel: TensionLevel = 'calm';
  if (nationalTension >= 80) tensionLevel = 'critical';
  else if (nationalTension >= 60) tensionLevel = 'high';
  else if (nationalTension >= 40) tensionLevel = 'noticeable';
  else if (nationalTension >= 20) tensionLevel = 'mild';

  return { nationalTension, tensionLevel };
}

export function checkForTriggeredCrises(
  regions: RegionData[],
  activeCrises: GameEvent[],
  resolvedCrises: GameEvent[],
  month: number,
  inflationRate: number,
  damFillRate: number,
  gameMode: string,
  elapsedMonths: number = 0
): GameEvent[] {
  // Avoid piling up more than 2 active crises at a time
  if (activeCrises.length >= 2) return [];

  const newCrises: GameEvent[] = [];
  const resolvedIds = new Set(resolvedCrises.map(c => c.id));
  const activeIds = new Set(activeCrises.map(c => c.id));

  // Build a map of when an event was last resolved to enforce realistic cooldowns
  const lastResolvedMonthMap: Record<string, number> = {};
  for (const rc of resolvedCrises) {
    lastResolvedMonthMap[rc.id] = Math.max(lastResolvedMonthMap[rc.id] || 0, rc.monthOccurred || 0);
  }

  const allEvents = eventsData as GameEvent[];

  for (const template of allEvents) {
    if (activeIds.has(template.id)) continue;

    // 1. One-time milestone events (Gigafactory, OCP windfall) MUST NEVER repeat once resolved!
    if (template.isOneTime && resolvedIds.has(template.id)) {
      continue;
    }

    // 2. Cooldown for recurring crises: at least 12 months must pass since last resolution
    if (lastResolvedMonthMap[template.id] !== undefined) {
      const monthsSinceLast = elapsedMonths - lastResolvedMonthMap[template.id];
      if (monthsSinceLast < 12) {
        continue;
      }
    }

    // Check conditions
    let shouldTrigger = false;

    if (template.id === 'severe_summer_drought_crisis' && damFillRate < 28.0 && (month >= 5 && month <= 9)) {
      shouldTrigger = true;
    } else if (template.id === 'transport_fuel_strike' && inflationRate > 3.8) {
      shouldTrigger = true;
    } else if (template.id === 'university_medical_students_boycott' && (month === 2 || month === 6)) {
      // Exam months
      const rabat = regions.find(r => r.id === 'rabat_sale_kenitra');
      const fes = regions.find(r => r.id === 'fez_meknes');
      if ((rabat && rabat.socialTension > 45) || (fes && fes.socialTension > 45)) {
        shouldTrigger = true;
      }
    } else if (template.id === 'regional_border_tensions' && (gameMode === 'hard' || Math.random() < 0.05)) {
      const oriental = regions.find(r => r.id === 'oriental');
      if (oriental && oriental.socialTension > 52) shouldTrigger = true;
    } else if (template.id === 'ocp_phosphate_windfall' && Math.random() < 0.08) {
      shouldTrigger = true;
    } else if (template.id === 'foreign_investment_gigafactory_deal' && Math.random() < 0.07) {
      shouldTrigger = true;
    } else if (template.id === 'sahara_buffer_zone_clash') {
      const laayoune = regions.find(r => r.id === 'laayoune_sakia_el_hamra');
      if (laayoune && (laayoune.socialTension > 40 || Math.random() < 0.06)) {
        shouldTrigger = true;
      }
    } else if (template.id === 'world_cup_2030_stadiums_tender' && elapsedMonths >= 4) {
      shouldTrigger = true;
    } else if (template.id === 'social_dialogue_april_round' && (month === 4 || month === 9) && elapsedMonths >= 3) {
      shouldTrigger = true;
    } else if (template.id === 'imf_fcl_review_warning' && inflationRate > 3.2 && elapsedMonths >= 6 && Math.random() < 0.25) {
      shouldTrigger = true;
    } else if (template.id === 'global_energy_price_shock' && inflationRate > 3.0 && Math.random() < 0.14) {
      shouldTrigger = true;
    } else if (template.id === 'maritime_fisheries_port_modernization' && (month === 3 || month === 10) && Math.random() < 0.35) {
      shouldTrigger = true;
    }

    if (shouldTrigger) {
      newCrises.push({
        ...template,
        monthOccurred: elapsedMonths
      });
      break; // Only trigger one new crisis per month
    }
  }

  return newCrises;
}

/**
 * City-Level Civic Protests & Local Demands Generator
 * Triggers authentic, localized civic flashpoints when local tension/stress peaks
 */
export function checkForTriggeredCityProtests(
  regions: RegionData[],
  cities: CityData[],
  activeProtests: CityProtest[],
  month: number,
  elapsedMonths: number
): CityProtest[] {
  // Cap active city protests at 4 max to maintain focus and game balance
  if (activeProtests.length >= 4) return [];

  const existingCityIds = new Set(activeProtests.map(p => p.cityId));
  const newProtests: CityProtest[] = [];

  // Potential protest templates based on real Moroccan socio-economic flashpoints
  const protestPrototypes: Array<{
    cityId: string;
    cityNameEn: string;
    cityNameAr: string;
    regionId: string;
    demographicGroup: string;
    demandsEn: string[];
    demandsAr: string[];
    condition: () => boolean;
    intensity: 'mild' | 'intense' | 'critical';
  }> = [
    {
      cityId: 'fes',
      cityNameEn: 'Fez',
      cityNameAr: 'فاس',
      regionId: 'fez_meknes',
      demographicGroup: 'students_youth',
      intensity: 'intense',
      demandsEn: [
        'Cancel reduction of medical training years from 7 to 6',
        'Upgrade university hospital medical equipment and internship wards',
        'Guarantee competitive fellowship positions in public health centers'
      ],
      demandsAr: [
        'التراجع عن تقليص سنوات التكوين الطبي من 7 إلى 6 سنوات',
        'تأهيل التجهيزات الطبية بمصالح المستشفى الجامعي الحسن الثاني بفاس',
        'توفير بيئة تدريبية لائقة ومناصب إقامة كافية بالقطاع العام'
      ],
      condition: () => {
        const reg = regions.find(r => r.id === 'fez_meknes');
        return Boolean(reg && reg.socialTension >= 32);
      }
    },
    {
      cityId: 'oujda',
      cityNameEn: 'Oujda',
      cityNameAr: 'وجدة',
      regionId: 'oriental',
      demographicGroup: 'unemployed_informal',
      intensity: 'intense',
      demandsEn: [
        'Establish economic alternatives to informal border trade',
        'Accelerate hiring in Nador West Med and Oujda Technopole',
        'Urgent microcredit subsidies for youth entrepreneurship'
      ],
      demandsAr: [
        'إيجاد بدائل اقتصادية وتنموية حقيقية بعد إغلاق منافذ التجارة المعيشية',
        'تسريع وتيرة التشغيل بمشاريع ميناء الناظور غرب المتوسط والقطب التكنولوجي بوجدة',
        'تخصيص قروض شرفية ودعم مالي مباشر للشباب حاملي المشاريع'
      ],
      condition: () => {
        const reg = regions.find(r => r.id === 'oriental');
        return Boolean(reg && reg.unemploymentRate >= 16.0);
      }
    },
    {
      cityId: 'casablanca',
      cityNameEn: 'Casablanca',
      cityNameAr: 'الدار البيضاء',
      regionId: 'casablanca_settat',
      demographicGroup: 'urban_working_class',
      intensity: 'mild',
      demandsEn: [
        'Freeze professional diesel fuel price hikes for taxis & trucks',
        'Lower municipal transport tolls and regulate parking guardians',
        'Reinforce consumer purchasing power protections in wholesale markets'
      ],
      demandsAr: [
        'دعم الكازوال المهني لسيارات الأجرة والشاحنات للحد من غلاء المعيشة',
        'تنظيم رسوم التنقل الحضري ومراقبة حراس السيارات العشوائيين',
        'محاربة المضاربات بأسواق الجملة لحماية القدرة الشرائية للطبقة العاملة'
      ],
      condition: () => {
        const reg = regions.find(r => r.id === 'casablanca_settat');
        return Boolean(reg && reg.socialTension >= 38);
      }
    },
    {
      cityId: 'rabat',
      cityNameEn: 'Rabat',
      cityNameAr: 'الرباط',
      regionId: 'rabat_sale_kenitra',
      demographicGroup: 'civil_servants',
      intensity: 'mild',
      demandsEn: [
        'Resolve higher education and university professors wage agreements',
        'Alleviate Bouregreg bridge and inter-city commuter train saturation',
        'Revalue administrative staff pension indexation against inflation'
      ],
      demandsAr: [
        'أجرأة اتفاقات الحوار الاجتماعي لأساتذة التعليم العالي والباحثين',
        'معالجة الاكتظاظ بمحاور الربط الطرقي والسككي بين سلا والرباط والقنيطرة',
        'تحيين معاشات التقاعد لموظفي الإدارات المركزية لمواكبة التضخم'
      ],
      condition: () => {
        const reg = regions.find(r => r.id === 'rabat_sale_kenitra');
        return Boolean(reg && reg.socialTension >= 30);
      }
    },
    {
      cityId: 'marrakesh',
      cityNameEn: 'Marrakesh',
      cityNameAr: 'مراكش',
      regionId: 'marrakech_safi',
      demographicGroup: 'informal_services',
      intensity: 'intense',
      demandsEn: [
        'Speed up reconstruction aid disbursement for High Atlas earthquake survivors',
        'Strictly ration luxury resort and golf water consumption during drought',
        'Safeguard traditional artisans in Jemaa El-Fnaa from speculative rent surges'
      ],
      demandsAr: [
        'تسريع صرف دفعات الدعم وإعادة إعمار مساكن المتضررين من زلزال الحوز',
        'ترشيد استهلاك مياه السقي بالمنتجعات وملاعب الغولف خلال فترات الجفاف',
        'حماية صناع الحرف التقليدية بساحة جامع الفنا من غلاء السومات الكرائية'
      ],
      condition: () => {
        const reg = regions.find(r => r.id === 'marrakech_safi');
        return Boolean(reg && reg.socialTension >= 34);
      }
    },
    {
      cityId: 'beni_mellal',
      cityNameEn: 'Beni Mellal',
      cityNameAr: 'بني ملال',
      regionId: 'beni_mellal_khenifra',
      demographicGroup: 'rural_farmers',
      intensity: 'intense',
      demandsEn: [
        'Subsidize sugar beet and olive growers facing Oum Er-Rbia water rationing',
        'Upgrade emergency trauma wards at Beni Mellal Regional Hospital',
        'Emergency feed subsidies for Atlas livestock and transhumant breeders'
      ],
      demandsAr: [
        'دعم فلاحي الشمندر السكري والزيتون بتادلة بسبب تقليص حصص سد بين الويدان',
        'تأهيل مصلحة المستعجلات والإنعاش بالمركز الاستشفائي الجهوي ببني ملال',
        'توفير الأعلاف المدعومة لمربي الماشية بالمناطق الجبلية المتضررة من الجفاف'
      ],
      condition: () => {
        const reg = regions.find(r => r.id === 'beni_mellal_khenifra');
        return Boolean(reg && (reg.socialTension >= 35 || reg.waterStressIndex >= 65));
      }
    },
    {
      cityId: 'errachidia',
      cityNameEn: 'Errachidia',
      cityNameAr: 'الرشيدية',
      regionId: 'draa_tafilalet',
      demographicGroup: 'rural_farmers',
      intensity: 'critical',
      demandsEn: [
        'Urgent potable water delivery & drilling deep groundwater wells',
        'Construct small retention dams to preserve oasis palm groves',
        'Compensate date farmers for severe drought crop losses'
      ],
      demandsAr: [
        'تأمين مياه الشرب وتزويد الدواوير بالصهاريج وحفر آبار استكشافية عاجلة',
        'بناء سدود تلية لحماية الواحات وسواقي تافيلالت من الجفاف',
        'تعويض فلاحي التمور عن الأضرار الناجمة عن توالي سنوات الجفاف'
      ],
      condition: () => {
        const reg = regions.find(r => r.id === 'draa_tafilalet');
        return Boolean(reg && reg.waterStressIndex >= 65);
      }
    },
    {
      cityId: 'al_hoceima',
      cityNameEn: 'Al Hoceima',
      cityNameAr: 'الحسيمة',
      regionId: 'tangier_tetouan_al_hoceima',
      demographicGroup: 'civil_servants',
      intensity: 'mild',
      demandsEn: [
        'Staff regional hospital with missing oncology & cardiology specialists',
        'Complete rural road connectivity in the Rif mountain spine',
        'Support local coastal fishermen facing fuel surges'
      ],
      demandsAr: [
        'تزويد المركز الاستشفائي الإقليمي بأطباء الاختصاص وتجهيزات الأورام والقلب',
        'استكمال المسالك القروية لفك العزلة عن مداشر جبال الريف',
        'دعم بحارة الصيد التقليدي والساحلي لمواجهة تكاليف الوقود'
      ],
      condition: () => {
        const reg = regions.find(r => r.id === 'tangier_tetouan_al_hoceima');
        return Boolean(reg && reg.socialTension >= 36);
      }
    },
    {
      cityId: 'taroudant',
      cityNameEn: 'Taroudant',
      cityNameAr: 'تارودانت',
      regionId: 'souss_massa',
      demographicGroup: 'rural_farmers',
      intensity: 'intense',
      demandsEn: [
        'Subsidize agricultural electricity tariffs for water pumping',
        'Speed up irrigation pipeline links from Chtouka desalination plant',
        'Provide disaster recovery aid for remote mountain douars'
      ],
      demandsAr: [
        'دعم تسعيرة الكهرباء الفلاحية لضخ المياه في سهل سوس',
        'تسريع ربط شبكات السقي بمحطة تحلية مياه البحر باشتوكة',
        'مواصلة برنامج إعادة إعمار وتأهيل الدواوير الجبلية'
      ],
      condition: () => {
        const reg = regions.find(r => r.id === 'souss_massa');
        return Boolean(reg && reg.waterStressIndex >= 60);
      }
    },
    {
      cityId: 'guelmim',
      cityNameEn: 'Guelmim',
      cityNameAr: 'كلميم',
      regionId: 'guelmim_oued_noun',
      demographicGroup: 'unemployed_informal',
      intensity: 'mild',
      demandsEn: [
        'Complete Oued Oum El Achar seasonal flood dykes and drainage basins',
        'Open vocational training quotas for local youth in green hydrogen projects',
        'Equip Tan-Tan and Sidi Ifni ports for offshore artisanal fisheries'
      ],
      demandsAr: [
        'استكمال منشآت الحماية من فيضانات واد أم العشار والمجاري المائية بكلميم',
        'تخصيص كوطا تشغيل وتكوين لأبناء الإقليم في مشاريع الهيدروجين والطاقات المتجددة',
        'تأهيل موانئ طانطان وسيدي إفني لدعم أسطول الصيد الساحلي والتقليدي'
      ],
      condition: () => {
        const reg = regions.find(r => r.id === 'guelmim_oued_noun');
        return Boolean(reg && (reg.socialTension >= 32 || reg.unemploymentRate >= 15.0));
      }
    },
    {
      cityId: 'laayoune',
      cityNameEn: 'Laayoune',
      cityNameAr: 'العيون',
      regionId: 'laayoune_sakia_el_hamra',
      demographicGroup: 'students_youth',
      intensity: 'mild',
      demandsEn: [
        'Integrate Sahrawi university and institute graduates into Phosboucraa & public services',
        'Accelerate specialized medical clinics and CHU Laayoune operating capacity',
        'Subsidize local transport and air connectivity to northern industrial hubs'
      ],
      demandsAr: [
        'إدماج خريجي المعاهد والجامعات بالأقاليم الجنوبية في فوسبوكراع والقطاع العام',
        'تسريع تشغيل كافة الأقسام التخصصية بالمركز الاستشفائي الجامعي بالعيون',
        'تعزيز دعم الرحلات الجوية والربط اللوجستي مع الأقطاب الاقتصادية الشمالية'
      ],
      condition: () => {
        const reg = regions.find(r => r.id === 'laayoune_sakia_el_hamra');
        return Boolean(reg && reg.socialTension >= 30);
      }
    },
    {
      cityId: 'dakhla',
      cityNameEn: 'Dakhla',
      cityNameAr: 'الداخلة',
      regionId: 'dakhla_oued_ed_dahab',
      demographicGroup: 'informal_services',
      intensity: 'mild',
      demandsEn: [
        'Regulate traditional artisanal fishing quotas in Lassarga & Labouir bays',
        'Speed up construction of Guerguerat logistics zone amenities',
        'Expand seawater reverse-osmosis supply for southern agricultural greenhouse perimeters'
      ],
      demandsAr: [
        'تنظيم كوطا رخص الصيد التقليدي بنقاط التفريغ في لاساركا ولابوير بالداخلة',
        'تسريع إنجاز المرافق اللوجستية والخدماتية بالمنطقة الحرة للكركرات',
        'توسيع شبكة مياه التحلية للمحيطات الفلاحية الموجهة للبيوت المغطاة'
      ],
      condition: () => {
        const reg = regions.find(r => r.id === 'dakhla_oued_ed_dahab');
        return Boolean(reg && reg.socialTension >= 26);
      }
    }
  ];

  for (const proto of protestPrototypes) {
    if (existingCityIds.has(proto.cityId)) continue;
    if (proto.condition()) {
      newProtests.push({
        id: `protest_${proto.cityId}_${elapsedMonths}`,
        cityId: proto.cityId,
        cityNameEn: proto.cityNameEn,
        cityNameAr: proto.cityNameAr,
        regionId: proto.regionId,
        demographicGroup: proto.demographicGroup,
        demandsEn: proto.demandsEn,
        demandsAr: proto.demandsAr,
        intensity: proto.intensity,
        monthStarted: elapsedMonths
      });
      break; // At most one new protest triggered per month
    }
  }

  return newProtests;
}

