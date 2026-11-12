#!/usr/bin/env node
/**
 * Offline-first data synchronization script from MoroccoAPI (https://moroccoapi.dev).
 * Fetches official Moroccan datasets (Dams, Ports, RGPH 2024 Regional Population,
 * HCP CPI breakdown, World Bank macro indicators) and writes static snapshots to src/data/.
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');
const DATA_DIR = path.join(ROOT_DIR, 'src', 'data');

const BASE_URL = 'https://moroccoapi.dev';

const REGION_ID_TO_API_CODE = {
  tangier_tetouan_al_hoceima: 'tanger-tetouan-al-hoceima',
  oriental: 'oriental',
  fez_meknes: 'fes-meknes',
  rabat_sale_kenitra: 'rabat-sale-kenitra',
  beni_mellal_khenifra: 'beni-mellal-khenifra',
  casablanca_settat: 'casablanca-settat',
  marrakech_safi: 'marrakech-safi',
  draa_tafilalet: 'draa-tafilalet',
  souss_massa: 'souss-massa',
  guelmim_oued_noun: 'guelmim-oued-noun',
  laayoune_sakia_el_hamra: 'laayoune-sakia-el-hamra',
  dakhla_oued_ed_dahab: 'dakhla-oued-ed-dahab'
};

const BASIN_LABELS = {
  'loukkos': { ar: 'حوض اللوكوس', en: 'Loukkos Basin' },
  'moulouya': { ar: 'حوض ملوية', en: 'Moulouya Basin' },
  'sebou': { ar: 'حوض سبو', en: 'Sebou Basin' },
  'bou-regreg': { ar: 'حوض أبي رقراق', en: 'Bou Regreg Basin' },
  'bouregreg': { ar: 'حوض أبي رقراق', en: 'Bou Regreg Basin' },
  'oum-er-rbia': { ar: 'حوض أم الربيع', en: 'Oum Er-Rbia Basin' },
  'tensift': { ar: 'حوض تانسيفت', en: 'Tensift Basin' },
  'souss-massa': { ar: 'حوض سوس ماسة', en: 'Souss-Massa Basin' },
  'draa-oued-noun': { ar: 'حوض درعة واد نون', en: 'Drâa-Oued Noun Basin' },
  'guir-ziz-rheris': { ar: 'حوض كير زيز غريس', en: 'Guir-Ziz-Rheris Basin' },
  'sakiet-el-hamra-oued-ed-dahab': { ar: 'حوض الساقية الحمراء ووادي الذهب', en: 'Sakiet El Hamra Basin' }
};

const CPI_DIVISION_AR = {
  'GR': 'المؤشر العام للأثمان',
  '01': 'المواد الغذائية والمشروبات غير الكحولية',
  '02': 'المشروبات الكحولية والتبغ',
  '03': 'الملابس والأحذية',
  '04': 'السكن والماء والكهرباء والوقود',
  '05': 'الأثاث والأدوات المنزلية',
  '06': 'الصحة',
  '07': 'النقل',
  '08': 'الاتصالات',
  '09': 'الترفيه والثقافة',
  '10': 'التعليم',
  '11': 'المطاعم والفنادق',
  '12': 'سلع وخدمات مختلفة'
};

async function fetchJson(endpoint) {
  const url = `${BASE_URL}${endpoint}`;
  const res = await fetch(url, {
    headers: { Accept: 'application/json', 'User-Agent': 'morocco-simulator-sync/1.0' }
  });
  if (!res.ok) {
    throw new Error(`HTTP ${res.status} for ${url}`);
  }
  return res.json();
}

function classifyPortType(rawType = '') {
  const lower = rawType.toLowerCase();
  if (lower.includes('commerce') || lower.includes('hydrocarbure') || lower.includes('phosphat') || lower.includes('miner')) {
    return 'commercial';
  }
  if (lower.includes('passager') || lower.includes('croisi')) {
    return 'passenger';
  }
  if (lower.includes('plaisance') && !lower.includes('pêche')) {
    return 'marina';
  }
  return 'fishing';
}

function titleCaseBasin(slug = '') {
  if (BASIN_LABELS[slug]) return BASIN_LABELS[slug];
  const formatted = slug
    .split('-')
    .map(w => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
  return { ar: formatted, en: formatted };
}

async function syncDams() {
  const payload = await fetchJson('/api/v1/dams?limit=150');
  const dams = (payload.data || []).map(d => {
    const basinMeta = titleCaseBasin(d.basin || 'other');
    const level = d.latest_level || {};
    const nameFr = d.name?.fr || d.id.split('-').map(s => s.charAt(0).toUpperCase() + s.slice(1)).join(' ');
    const nameAr = d.name?.ar || nameFr;
    return {
      id: d.id,
      nameAr,
      nameEn: nameFr,
      basin: d.basin || 'other',
      basinAr: basinMeta.ar,
      basinEn: basinMeta.en,
      capacityMm3: level.capacity_mm3 ?? null,
      volumeMm3: level.volume_mm3 ?? null,
      fillingRatePct: typeof level.filling_rate_pct === 'number' ? Number(level.filling_rate_pct.toFixed(1)) : 0,
      prevYearFillingRatePct:
        typeof level.previous_year_filling_rate_pct === 'number'
          ? Number(level.previous_year_filling_rate_pct.toFixed(1))
          : null,
      date: level.date || null
    };
  });
  return {
    meta: {
      retrievedAt: payload.meta?.retrieved_at || new Date().toISOString().slice(0, 10),
      total: dams.length
    },
    dams
  };
}

async function syncPorts() {
  const payload = await fetchJson('/api/v1/ports?limit=100');
  const ports = (payload.data || [])
    .filter(p => typeof p.Latitude === 'number' && typeof p.Longitude === 'number')
    .map(p => ({
      name: p['Nom du port'],
      type: p['Type de ports'] || '',
      category: classifyPortType(p['Type de ports']),
      connectivity: p['Connectivité'] || '',
      lat: Number(p.Latitude),
      lng: Number(p.Longitude),
      status: p.Etat || 'Existant'
    }));
  return {
    meta: {
      retrievedAt: payload.meta?.retrieved_at || new Date().toISOString().slice(0, 10),
      total: ports.length
    },
    ports
  };
}

async function syncPopulation() {
  const nationalPayload = await fetchJson('/api/v2/population/national/indicators');
  const nationalInds = nationalPayload.data?.indicators || [];
  const natLegal = nationalInds.find(i => i.id === 'legal-population')?.both_sexes || null;

  const regionalPopulations = {};
  for (const [gameRegionId, apiCode] of Object.entries(REGION_ID_TO_API_CODE)) {
    try {
      const regPayload = await fetchJson(`/api/v2/population/regions/${apiCode}/indicators`);
      const inds = regPayload.data?.indicators || [];
      const legalPop = inds.find(i => i.id === 'legal-population')?.both_sexes;
      const households = inds.find(i => i.id === 'households')?.both_sexes ?? null;
      if (typeof legalPop === 'number' && legalPop > 0) {
        regionalPopulations[gameRegionId] = {
          apiCode,
          hcpCode: regPayload.data?.territory?.hcp_code || null,
          legalPopulation: legalPop,
          households
        };
      }
    } catch (err) {
      console.warn(`Warning: failed to fetch RGPH population for ${apiCode}: ${err.message}`);
    }
  }

  return {
    nationalLegalPopulation: natLegal,
    regions: regionalPopulations
  };
}

async function syncCpi() {
  const citiesPayload = await fetchJson('/api/v2/prices/cpi/cities');
  const latestMonth = citiesPayload.data?.[0]?.last_month || '2026-08';

  const nationalSeries = await fetchJson(`/api/v2/prices/cpi?city=national&from=${latestMonth}&limit=200`);
  const divisionLatest = new Map();
  for (const row of nationalSeries.data || []) {
    if (row.level === 'general' || row.level === 'division') {
      const existing = divisionLatest.get(row.product_code);
      if (!existing || row.month >= existing.month) {
        divisionLatest.set(row.product_code, row);
      }
    }
  }

  const divisions = Array.from(divisionLatest.values())
    .sort((a, b) => (a.product_code === 'GR' ? -1 : b.product_code === 'GR' ? 1 : a.product_code.localeCompare(b.product_code)))
    .map(row => ({
      code: row.product_code,
      nameFr: row.product_name,
      nameAr: CPI_DIVISION_AR[row.product_code] || row.product_name,
      level: row.level,
      month: row.month,
      index: row.index
    }));

  const generalByCity = await fetchJson(`/api/v2/prices/cpi?product=GR&from=${latestMonth}&limit=100`);
  const cityNamesMap = new Map((citiesPayload.data || []).map(c => [c.code, c]));
  const cities = (generalByCity.data || []).map(row => ({
    code: row.city_code,
    name: cityNamesMap.get(row.city_code)?.name || row.city_code,
    regionCode: cityNamesMap.get(row.city_code)?.region_code || null,
    month: row.month,
    index: row.index
  }));

  return {
    latestMonth,
    divisions,
    cities
  };
}

async function syncWorldBank() {
  const indicators = [
    { code: 'NY.GDP.MKTP.KD.ZG', key: 'gdpGrowthAnnualPct', labelEn: 'GDP Growth (%)', labelAr: 'نمو الناتج المحلي (%)' },
    { code: 'FP.CPI.TOTL.ZG', key: 'inflationAnnualPct', labelEn: 'CPI Inflation (%)', labelAr: 'التضخم السنوي (%)' },
    { code: 'SL.UEM.TOTL.ZS', key: 'unemploymentTotalPct', labelEn: 'Unemployment Total (%)', labelAr: 'معدل البطالة العام (%)' },
    { code: 'SL.UEM.1524.ZS', key: 'youthUnemploymentPct', labelEn: 'Youth Unemployment (%)', labelAr: 'بطالة الشباب (%)' },
    { code: 'BX.KLT.DINV.WD.GD.ZS', key: 'fdiInflowsPctGdp', labelEn: 'FDI Inflows (% GDP)', labelAr: 'الاستثمار الأجنبي المباشر (% من الناتج)' }
  ];

  const macro = {};
  for (const ind of indicators) {
    try {
      const payload = await fetchJson(`/api/v2/world-bank/indicators/${ind.code}`);
      const values = (payload.data?.values || []).filter(v => v.value !== null).slice(-4);
      const latest = values[values.length - 1] || null;
      macro[ind.key] = {
        code: ind.code,
        labelEn: ind.labelEn,
        labelAr: ind.labelAr,
        latestYear: latest?.year || null,
        latestValue: latest ? Number(latest.value.toFixed(2)) : null,
        recentSeries: values.map(v => ({ year: v.year, value: Number(v.value.toFixed(2)) }))
      };
    } catch (err) {
      console.warn(`Warning: failed to fetch World Bank ${ind.code}: ${err.message}`);
    }
  }
  return macro;
}

function updateRegionsJsonPopulation(populationData) {
  const regionsPath = path.join(DATA_DIR, 'regions.json');
  const regions = JSON.parse(fs.readFileSync(regionsPath, 'utf8'));
  let updatedCount = 0;

  const updated = regions.map(region => {
    const census = populationData.regions[region.id];
    if (census && typeof census.legalPopulation === 'number') {
      updatedCount++;
      return {
        ...region,
        population: census.legalPopulation
      };
    }
    return region;
  });

  fs.writeFileSync(regionsPath, JSON.stringify(updated, null, 2) + '\n', 'utf8');
  return updatedCount;
}

async function main() {
  console.log('Syncing datasets from MoroccoAPI (https://moroccoapi.dev)...');
  const [dams, ports, population, cpi, worldBank] = await Promise.all([
    syncDams(),
    syncPorts(),
    syncPopulation(),
    syncCpi(),
    syncWorldBank()
  ]);

  const snapshot = {
    source: BASE_URL,
    syncedAt: new Date().toISOString(),
    dams,
    ports,
    population,
    cpi,
    worldBank
  };

  const outPath = path.join(DATA_DIR, 'moroccoApiData.json');
  fs.writeFileSync(outPath, JSON.stringify(snapshot, null, 2) + '\n', 'utf8');
  const regionsUpdated = updateRegionsJsonPopulation(population);

  console.log(`Done!`);
  console.log(`- Dams synced: ${dams.dams.length}`);
  console.log(`- Ports synced: ${ports.ports.length}`);
  console.log(`- Regions RGPH 2024 updated in regions.json: ${regionsUpdated}/12`);
  console.log(`- CPI divisions: ${cpi.divisions.length}, cities: ${cpi.cities.length} (latest ${cpi.latestMonth})`);
  console.log(`- World Bank indicators: ${Object.keys(worldBank).length}`);
}

main().catch(err => {
  console.error('Sync failed:', err);
  process.exit(1);
});
