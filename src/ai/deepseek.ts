import { GameState, Policy, CityProtest, GameEvent } from '../types/game';

export const DEFAULT_DEEPSEEK_MODEL = 'deepseek-chat';

/**
 * Resolves the active DeepSeek API key from user Settings or Vite environment variables.
 * No API key is ever hardcoded in the client bundle.
 */
export function getConfiguredDeepSeekKey(stateKey?: string): string {
  const viteMeta = import.meta as unknown as { env?: Record<string, string | undefined> };
  const envKey = viteMeta?.env?.VITE_DEEPSEEK_API_KEY;
  return (stateKey || envKey || '').trim();
}

export async function callDeepSeekChat(
  messages: { role: 'system' | 'user' | 'assistant'; content: string }[],
  apiKey?: string,
  model: string = DEFAULT_DEEPSEEK_MODEL
): Promise<string> {
  const effectiveKey = getConfiguredDeepSeekKey(apiKey);
  if (!effectiveKey) {
    throw new Error('MISSING_API_KEY');
  }
  const effectiveModel = model || DEFAULT_DEEPSEEK_MODEL;

  try {
    const res = await fetch('https://api.deepseek.com/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${effectiveKey}`
      },
      body: JSON.stringify({
        model: effectiveModel,
        messages,
        temperature: 0.7,
        max_tokens: 2500
      })
    });

    if (!res.ok) {
      const errText = await res.text();
      if (effectiveModel !== 'deepseek-chat') {
        console.warn('DeepSeek model error, retrying with deepseek-chat:', errText);
        return callDeepSeekChat(messages, effectiveKey, 'deepseek-chat');
      }
      throw new Error(`DeepSeek API error ${res.status}: ${errText}`);
    }

    const data = await res.json();
    const msg = data.choices?.[0]?.message;
    return msg?.content || msg?.reasoning_content || '';
  } catch (err: any) {
    console.error('DeepSeek invocation error:', err);
    throw err;
  }
}

function buildOfflineBriefing(state: GameState): string {
  const isAr = state.language === 'ar';
  const latest = state.history[state.history.length - 1];
  const tension = latest?.socialTension ?? 35;
  const gov = state.government;
  const econ = state.economy;
  const budget = state.budget;
  const water = state.water;

  if (isAr) {
    const risks: string[] = [];
    if (water.overallDamFillRate < 35) {
      risks.push(`• إجهاد مائي حاد: حقينة السدود عند ${water.overallDamFillRate.toFixed(1)}% (${water.droughtLevel}) مما يهدد الإنتاج الفلاحي والتزود بالماء الصالح للشرب.`);
    }
    if (budget.monthlyBalance < -5) {
      risks.push(`• ضغط مالي شهري: العجز الشهري عند ${budget.monthlyBalance.toFixed(1)} مليار درهم والدين العمومي ${budget.debtToGdpRatio.toFixed(1)}% من الناتج.`);
    }
    if (tension > 50 || state.activeCityProtests.length > 0) {
      risks.push(`• احتقان اجتماعي: مؤشر التوتر عند ${tension.toFixed(1)}/100 مع ${state.activeCityProtests.length} احتجاجات ميدانية نشطة.`);
    }
    if (risks.length === 0) {
      risks.push(`• التوازنات الكبرى مستقرة نسبياً مع ضرورة مراقبة التضخم (${econ.inflationRate.toFixed(1)}%) وبطالة الشباب (${econ.youthUnemploymentRate.toFixed(1)}%).`);
    }

    return [
      '📋 إحاطة استراتيجية محلية (وضع عدم الاتصال):',
      `الوضعية الحالية (${state.currentMonth}/${state.currentYear}): الاستقرار الحكومي ${gov.stability.toFixed(0)}/100، الرضا الشعبي ${gov.approvalRating.toFixed(0)}%، النمو الاقتصادي ${econ.realGdpGrowthRate.toFixed(1)}%.`,
      '',
      '⚠️ أبرز المخاطر المرصودة:',
      ...risks.slice(0, 3),
      '',
      '💡 توصيات تنفيذية:',
      `1. حماية احتياطي الخزينة (${budget.treasuryReservesBillionMAD.toFixed(1)} مليار درهم) وضبط العجز الشهري لتفادي تراجع التصنيف السيادي.`,
      '2. تسريع مشاريع تحلية المياه والربط بين الأحواض المائية لتعزيز الأمن المائي الحضري.',
      '3. تفعيل الحوار القطاعي ودعم الجهات ذات التوتر المرتفع (يمكنك إضافة مفتاح DeepSeek في الإعدادات لتفعيل التحليل بالذكاء الاصطناعي).'
    ].join('\n');
  }

  const risks: string[] = [];
  if (water.overallDamFillRate < 35) {
    risks.push(`• Severe Water Stress: National dam fill at ${water.overallDamFillRate.toFixed(1)}% threatens agriculture and municipal water security.`);
  }
  if (budget.monthlyBalance < -5) {
    risks.push(`• Fiscal Pressure: Monthly deficit at ${budget.monthlyBalance.toFixed(1)}B MAD with public debt at ${budget.debtToGdpRatio.toFixed(1)}% of GDP.`);
  }
  if (tension > 50 || state.activeCityProtests.length > 0) {
    risks.push(`• Civic Unrest: Tension at ${tension.toFixed(1)}/100 with ${state.activeCityProtests.length} active city protests.`);
  }
  if (risks.length === 0) {
    risks.push(`• Macro indicators are relatively stable; monitor inflation (${econ.inflationRate.toFixed(1)}%) and youth unemployment (${econ.youthUnemploymentRate.toFixed(1)}%).`);
  }

  return [
    '📋 Local Executive Diagnostic (Offline Mode):',
    `Current Snapshot (${state.currentMonth}/${state.currentYear}): Stability ${gov.stability.toFixed(0)}/100, Approval ${gov.approvalRating.toFixed(0)}%, Real GDP Growth ${econ.realGdpGrowthRate.toFixed(1)}%.`,
    '',
    '⚠️ Key Monitored Risks:',
    ...risks.slice(0, 3),
    '',
    '💡 Executive Recommendations:',
    `1. Keep the monthly balance controlled to safeguard treasury reserves (${budget.treasuryReservesBillionMAD.toFixed(1)}B MAD).`,
    '2. Prioritize desalination capacity and inter-basin transfers to buffer drought cycles.',
    '3. Address high-tension regions early (add a DeepSeek API key in Settings to enable live AI analysis).'
  ].join('\n');
}

/**
 * AI Strategic Advisor:
 * Generates an executive diagnostic briefing for the Head of Government.
 */
export async function generateStrategicBriefing(state: GameState): Promise<string> {
  const isAr = state.language === 'ar';
  const gov = state.government;
  const econ = state.economy;
  const budget = state.budget;
  const water = state.water;

  // Build context summary
  const context = `
Morocco Simulation Date: Month ${state.currentMonth}, Year ${state.currentYear}
Prime Minister: ${gov.primeMinister}
Parliament Seats: ${gov.parliamentarySeats}/395
Government Stability: ${gov.stability}/100
Public Approval: ${gov.approvalRating}%
Social Tension: ${state.history[state.history.length - 1]?.socialTension || 35}/100
Real GDP Growth: ${econ.realGdpGrowthRate}%
Inflation CPI: ${econ.inflationRate}%
Unemployment: ${econ.unemploymentRate}% (Youth: ${econ.youthUnemploymentRate}%)
Dam Reservoir Fill Rate: ${water.overallDamFillRate}% (Drought: ${water.droughtLevel})
Monthly Budget Balance: ${budget.monthlyBalance}B MAD
Debt to GDP: ${budget.debtToGdpRatio}%
Treasury Reserves: ${budget.treasuryReservesBillionMAD}B MAD
Active City Protests: ${state.activeCityProtests.map(p => `${p.cityNameAr} (${p.demandsAr.join(', ')})`).join('; ') || 'None'}
  `.trim();

  const systemPrompt = isAr
    ? `أنت المستشار الاستراتيجي الأعلى لرئيس الحكومة المغربية. وظيفتك تقديم إحاطة تنفيذية استراتيجية وسيادية مباشرة، تشخص فيها بدقة واقع المملكة، وتحدد أكبر 3 مخاطر تهدد استقرار الحكومة، وتقدم 3 توصيات حاسمة وواقعية. اكتب بأسلوب رسمي مغربي رفيع ورصين بدون حشو.`
    : `You are the Chief Strategic Advisor to the Head of the Moroccan Government. Provide an executive sovereign intelligence briefing diagnosing the state of the Kingdom, outlining the top 3 critical risks to government stability, and delivering 3 actionable policy recommendations.`;

  const userPrompt = isAr
    ? `إليك بيانات الدولة والمؤشرات السيادية الحالية:\n${context}\n\nقدم تقرير الإحاطة الاستراتيجية لرئيس الحكومة مع توصيات التدخل العاجل.`
    : `Here is the current state data:\n${context}\n\nDeliver the executive briefing and urgent policy recommendations.`;

  try {
    return await callDeepSeekChat(
      [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      state.deepseekApiKey,
      state.deepseekModel
    );
  } catch {
    return buildOfflineBriefing(state);
  }
}

function buildOfflineCustomDecree(userText: string): Policy {
  const lower = userText.toLowerCase();
  const isWater = /ماء|مياه|سدود|تحلية|جفاف|water|dam|desalinat|drought/.test(lower);
  const isTax = /ضريب|جباي|رسوم|tax|fiscal|revenue|أرباح/.test(lower);
  const isJob = /شغل|توظيف|أجور|منحة|بطالة|employ|job|wage|salary/.test(lower);
  const isHealthEdu = /صحة|طب|مستشف|تعليم|مدرس|جامعة|health|medic|edu|school/.test(lower);

  const category: Policy['category'] = isWater
    ? 'water'
    : isTax
      ? 'taxation'
      : isJob
        ? 'employment'
        : isHealthEdu
          ? (lower.includes('صح') || lower.includes('health') || lower.includes('طب') ? 'healthcare' : 'education')
          : 'economy';

  return {
    id: `custom_${Date.now()}`,
    category,
    titleEn: userText.trim().slice(0, 65),
    titleAr: userText.trim().slice(0, 65),
    descriptionEn: `[Offline Legislative Draft] ${userText.trim()}`,
    descriptionAr: `[صياغة تشريعية محلية] ${userText.trim()}`,
    upfrontCostBillionMAD: isTax ? 0 : isWater ? 2.5 : isJob || isHealthEdu ? 1.5 : 1.0,
    monthlyCostBillionMAD: isTax ? 0 : 0.15,
    requiresParliamentApproval: isTax,
    implemented: false,
    expectedProsEn: isWater
      ? ['Strengthens water resilience', 'Boosts desalination capacity']
      : isTax
        ? ['Increases monthly state revenues', 'Supports deficit consolidation']
        : ['Addresses targeted citizen needs', 'Stimulates domestic confidence'],
    expectedProsAr: isWater
      ? ['تعزيز الأمن المائي', 'رفع القدرة على تحلية المياه']
      : isTax
        ? ['زيادة مداخيل الدولة الشهرية', 'دعم تقليص عجز الميزانية']
        : ['استجابة مباشرة لأولويات المواطنين', 'تحفيز الثقة والدينامية الاقتصادية'],
    expectedRisksEn: isTax
      ? ['Potential pushback from affected taxpayers', 'Requires parliamentary debate']
      : ['Adds recurring pressure on treasury reserves'],
    expectedRisksAr: isTax
      ? ['احتمال تحفظ الفئات المتضررة من الاقتطاع', 'يتطلب مصادقة برلمانية']
      : ['يرفع الالتزامات المالية الشهرية على الخزينة'],
    modifiers: {
      gdpGrowthDelta: isTax ? -0.15 : 0.25,
      inflationDelta: isJob ? 0.15 : isTax ? 0.1 : -0.05,
      unemploymentDelta: isJob ? -0.35 : -0.1,
      damFillDelta: isWater ? 1.2 : undefined,
      desalinationDelta: isWater ? 80000 : undefined,
      approvalDelta: isTax ? -2.5 : 3.5,
      socialTensionDelta: isTax ? 2.5 : -2.5,
      revenueDelta: isTax ? 0.65 : 0,
      expenseDelta: isTax ? 0 : 0.15
    }
  };
}

/**
 * Free-Form Custom Policy Decree:
 * Parses player's custom decree text, calculates costs and simulation modifiers, and returns a Policy object.
 */
export async function analyzeCustomDecree(
  userText: string,
  state: GameState
): Promise<Policy> {
  if (!getConfiguredDeepSeekKey(state.deepseekApiKey)) {
    return buildOfflineCustomDecree(userText);
  }

  const systemPrompt = `You are a Moroccan public finance and legislative expert engine.
Analyze the user's proposed government decree and output ONLY a valid JSON object (no markdown fences, no explanation) matching this schema:
{
  "id": "custom_decree_<timestamp>",
  "category": "economy" | "water" | "taxation" | "subsidies" | "employment" | "healthcare" | "education" | "infrastructure" | "housing" | "security",
  "titleEn": "Concise English Title",
  "titleAr": "عنوان رسمي موجز بالعربية",
  "descriptionEn": "Formal English description of the decree and implementation",
  "descriptionAr": "شرح رسمي بالعربية لمضمون المرسوم وكيفية تنزيله",
  "upfrontCostBillionMAD": number (realistic estimated cost in Billion MAD, e.g. 1.5, 0 if purely administrative, or negative if it raises new revenue),
  "monthlyCostBillionMAD": number (recurring monthly cost in Billion MAD, e.g. 0.1),
  "requiresParliamentApproval": boolean (true if taxation/budget law/major reform, false if executive decree),
  "expectedProsEn": ["point 1", "point 2"],
  "expectedProsAr": ["مكسب 1", "مكسب 2"],
  "expectedRisksEn": ["risk 1", "risk 2"],
  "expectedRisksAr": ["تحدي 1", "تحدي 2"],
  "modifiers": {
    "gdpGrowthDelta": number (between -1.5 and 1.5),
    "inflationDelta": number (between -1.0 and 1.5),
    "unemploymentDelta": number (between -1.5 and 1.0),
    "damFillDelta": number (if water related, 0.5 to 3.0),
    "approvalDelta": number (between -8.0 and 10.0),
    "socialTensionDelta": number (between -8.0 and 8.0),
    "revenueDelta": number (monthly revenue gain if tax),
    "expenseDelta": number (monthly expense if public spending)
  }
}`;

  const userPrompt = `Proposed Government Decree: "${userText}"\nEvaluate this decree realistically for Morocco's economy and society. Output only valid JSON.`;

  const rawJson = await callDeepSeekChat(
    [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt }
    ],
    state.deepseekApiKey,
    state.deepseekModel
  );

  // Clean JSON output from potential markdown code fences
  const cleaned = rawJson.replace(/```json/g, '').replace(/```/g, '').trim();
  const parsed = JSON.parse(cleaned);

  return {
    ...parsed,
    id: `custom_${Date.now()}`,
    implemented: false
  } as Policy;
}

/**
 * AI Protest Response Evaluator:
 * Evaluates citizen reaction to a governmental action taken in a protesting city.
 */
export async function evaluateProtestResponse(
  protest: CityProtest,
  actionType: 'dialogue' | 'grant_demands' | 'partial_aid' | 'police_enforce',
  state: GameState
): Promise<{ reactionText: string; tensionDelta: number; approvalDelta: number; costBillionMAD: number }> {
  const isAr = state.language === 'ar';

  const prompt = `
City: ${protest.cityNameAr} (${protest.cityNameEn})
Demographic Group: ${protest.demographicGroup}
Demands: ${protest.demandsAr.join(', ')}
Government Action Taken: ${actionType} (dialogue = فتح حوار, grant_demands = الاستجابة الكاملة وصرف ميزانية, partial_aid = دعم جزئي, police_enforce = فض الاحتجاج بالقوة العمومية)

Output a JSON object (no markdown):
{
  "reactionText": "Brief 1-2 sentence reaction of the protesters and local citizens in Arabic",
  "tensionDelta": number (e.g. -6 for grant_demands, +4 for police_enforce),
  "approvalDelta": number (e.g. +3 for concessions, -3 for police),
  "costBillionMAD": number (e.g. 0.8 for full budget, 0.3 for partial, 0.02 for dialogue, 0.01 for security)
}
  `.trim();

  try {
    const raw = await callDeepSeekChat(
      [
        { role: 'system', content: 'You are an objective Moroccan civic simulation evaluator. Output only valid JSON.' },
        { role: 'user', content: prompt }
      ],
      state.deepseekApiKey,
      state.deepseekModel
    );

    const cleaned = raw.replace(/```json/g, '').replace(/```/g, '').trim();
    return JSON.parse(cleaned);
  } catch {
    // Graceful fallback if offline
    if (actionType === 'grant_demands') {
      return {
        reactionText: isAr ? 'استقبل المحتجون قرار الحكومة بارتياح واسع مع تعليق الوقفات الاحتجاجية فوراً.' : 'Protesters welcomed government funding and suspended rallies.',
        tensionDelta: -7.0,
        approvalDelta: 4.5,
        costBillionMAD: 0.6
      };
    } else if (actionType === 'dialogue') {
      return {
        reactionText: isAr ? 'أبدى ممثلو التنسيقية ترحيباً مشروطاً بالحوار مع انتظار وفاء الحكومة بالتزاماتها.' : 'Representatives agreed to dialogue pending government commitments.',
        tensionDelta: -3.0,
        approvalDelta: 2.0,
        costBillionMAD: 0.05
      };
    } else if (actionType === 'partial_aid') {
      return {
        reactionText: isAr ? 'اعتبر المحتجون الدعم خطوة أولى إيجابية مع استمرار الترقب لتنزيل باقي المطالب.' : 'Protesters noted partial support as a positive first step.',
        tensionDelta: -4.0,
        approvalDelta: 3.0,
        costBillionMAD: 0.25
      };
    } else {
      return {
        reactionText: isAr ? 'أثار التدخل الأمني استنكاراً حقوقياً مع توتر في الأحياء المجاورة.' : 'Security dispersal triggered rights criticism and local tension.',
        tensionDelta: 5.0,
        approvalDelta: -3.5,
        costBillionMAD: 0.02
      };
    }
  }
}

/**
 * AI Crisis Counselor:
 * Generates an instant high-level tactical recommendation for a specific crisis choices.
 */
export async function getAiCrisisAdvice(
  crisis: GameEvent,
  state: GameState
): Promise<string> {
  const isAr = state.language === 'ar';
  const systemPrompt = isAr
    ? `أنت المستشار الاستراتيجي الأول لرئيس الحكومة المغربية. وظيفتك تحليل الأزمة السيادية المعروضة وخيارات القرار الثلاثة. قدم توصية واضحة ومباشرة بأسلوب رصين واقعي (في 3 إلى 4 جمل فقط) ترشد فيها رئيس الحكومة إلى القرار الأقل خطراً على السلم الأهلي واحتياطيات الدولة.`
    : `You are the Chief Strategic Advisor to the Head of the Moroccan Government. Analyze this sovereign crisis and choices, providing a direct 3-4 sentence tactical recommendation identifying the option with the optimal balance of stability and fiscal prudence.`;

  const choicesText = crisis.choices
    .map((c, i) => `${i + 1}. [${isAr ? c.textAr : c.textEn}] - التكلفة: ${c.costBillionMAD}B MAD - النتائج: ${isAr ? c.consequencesAr.join('، ') : c.consequencesEn.join(', ')}`)
    .join('\n');

  const userPrompt = `الأزمة: ${isAr ? crisis.titleAr : crisis.titleEn}\nالسياق: ${isAr ? crisis.descriptionAr : crisis.descriptionEn}\nالخيارات الحكومية المطروحة:\n${choicesText}\n\nما هي توصيتك التكتيكية الحاسمة لرئيس الحكومة؟`;

  try {
    return await callDeepSeekChat(
      [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      state.deepseekApiKey,
      state.deepseekModel
    );
  } catch {
    return isAr
      ? `التوصية التكتيكية: الخيار الثاني يحقق التوازن المطلوب بين حماية الميزانية من النزيف وتخفيف حدة الاحتقان الشعبي، مع تفادي التبعات القانونية والسياسية للخيار الأكثر تشدداً.`
      : `Tactical recommendation: Option 2 delivers the required compromise between safeguarding treasury reserves and de-escalating civic tension while avoiding the heavy political blowback of extreme alternatives.`;
  }
}

/**
 * Evaluates a free-form press conference statement made by the Prime Minister.
 * Uses DeepSeek AI when configured, or falls back to local civic tone analysis offline.
 */
export async function evaluatePressStatement(
  statementText: string,
  state: GameState
): Promise<{
  approvalDelta: number;
  tensionDelta: number;
  headlineAr: string;
  headlineEn: string;
  feedbackAr: string;
  feedbackEn: string;
}> {
  const isAr = state.language === 'ar';
  const key = getConfiguredDeepSeekKey(state.deepseekApiKey);

  if (key) {
    try {
      const prompt = `Prime Minister press statement in Morocco (${state.currentMonth}/${state.currentYear}, approval ${state.government.approvalRating}%, inflation ${state.economy.inflationRate}%): "${statementText}"
Return strictly valid JSON (no markdown):
{
  "approvalDelta": number between -4 and 4,
  "tensionDelta": number between -4 and 4,
  "headlineAr": "عنوان صحفي مغربي قصير بالعربية",
  "headlineEn": "Concise English news headline",
  "feedbackAr": "رد فعل الشارع والإعلام بالعربية في جملة واحدة",
  "feedbackEn": "Public and media reaction in English in one sentence"
}`;
      const raw = await callDeepSeekChat(
        [
          { role: 'system', content: 'You are a Moroccan political communications evaluator. Return strictly valid JSON.' },
          { role: 'user', content: prompt }
        ],
        key,
        state.deepseekModel
      );
      const cleaned = raw.replace(/```json/g, '').replace(/```/g, '').trim();
      const parsed = JSON.parse(cleaned);
      return {
        approvalDelta: Math.max(-4, Math.min(4, Number(parsed.approvalDelta) || 0)),
        tensionDelta: Math.max(-4, Math.min(4, Number(parsed.tensionDelta) || 0)),
        headlineAr: String(parsed.headlineAr || 'تصريح لرئيس الحكومة حول الأوضاع الوطنية'),
        headlineEn: String(parsed.headlineEn || 'Prime Minister Issues Policy Statement'),
        feedbackAr: String(parsed.feedbackAr || 'تفاعلت الأوساط السياسية والإعلامية مع تصريح رئيس الحكومة.'),
        feedbackEn: String(parsed.feedbackEn || 'Political and media circles reacted to the Prime Minister’s address.')
      };
    } catch {
      // Fall through cleanly to local evaluation
    }
  }

  const trimmed = statementText.trim();
  const lower = trimmed.toLowerCase();
  const positiveSignals = /شفاف|إصلاح|حوار|تشغيل|دعم|التزام|عدالة|مواطن|استثمار|ماء|reform|dialog|job|support|invest|transparent|water/.test(lower);
  const harshSignals = /تقشف|ضرائب|فرض|أمني|صرام|رفض|austerity|tax|crackdown|reject|cut/.test(lower);
  const substantive = trimmed.length >= 25;

  const approvalDelta = Number(
    (
      (substantive ? 1.4 : 0.4) +
      (positiveSignals ? 1.5 : 0) -
      (harshSignals ? 2.2 : 0)
    ).toFixed(1)
  );
  const tensionDelta = Number(
    (
      (positiveSignals ? -1.8 : -0.4) +
      (harshSignals ? 2.1 : 0)
    ).toFixed(1)
  );

  return {
    approvalDelta,
    tensionDelta,
    headlineAr: substantive
      ? 'رئيس الحكومة يوجّه خطاباً مباشراً للرأي العام بشأن أولويات المرحلة'
      : 'تصريح مقتضب لرئيس الحكومة أمام الصحافة الوطنية',
    headlineEn: substantive
      ? 'Prime Minister Addresses Public Priorities in Live Briefing'
      : 'Prime Minister Offers Brief Remarks to National Press',
    feedbackAr: isAr
      ? approvalDelta >= 0
        ? `استقبل الشارع الرسالة بإيجابية حذرة (${approvalDelta >= 0 ? '+' : ''}${approvalDelta}% شعبية).`
        : `أثار الخطاب تحفظات لدى فئات متضررة (${approvalDelta}% شعبية).`
      : 'Public response recorded.',
    feedbackEn:
      approvalDelta >= 0
        ? `Citizens reacted with cautious optimism (${approvalDelta >= 0 ? '+' : ''}${approvalDelta}% approval).`
        : `The statement drew criticism from affected groups (${approvalDelta}% approval).`
  };
}
