<div align="center">

# 🇲🇦 محاكي الدولة والحكومة المغربية | Morocco: State & Government Simulator

**محاكاة سياسية واقتصادية واجتماعية ومائية شاملة لإدارة الدولة المغربية خلال ولاية دستورية مدتها 5 سنوات (60 شهراً).**

**A comprehensive political, macroeconomic, social, diplomatic, and hydraulic statecraft simulator for governing Morocco across a 5-year constitutional mandate (60 months).**

[🇸🇦 الدليل الكامل بالعربية](#-الدليل-الكامل-بالعربية) • [🇬🇧 Full English Guide](#-full-english-guide) • [📦 البيانات المفتوحة (MoroccoAPI)](#-تكامل-البيانات-المفتوحة-moroccoapi) • [🛠️ التشغيل والاختبارات](#️-التثبيت-والتشغيل--installation--commands)

</div>

---

## 🇸🇦 الدليل الكامل بالعربية

### نظرة عامة على اللعبة
**محاكي الدولة والحكومة المغربية** لعبة محاكاة استراتيجية تعتمد على الدور الشهري (Turn-Based Monthly Simulation) واجهة ثنائية اللغة (**العربية RTL** افتراضياً و**الإنجليزية LTR**). تنطلق اللعبة في **يناير 2026** على رأس ائتلاف حكومي يضم **270 مقعداً** من أصل **395** في مجلس النواب (أغلبية الفصل الدستوري تتطلب **198 مقعداً**)، وتضع بين يديك إدارة الملفات الاقتصادية، والمالية العمومية، والأمن المائي، والتوازنات الحزبية، والجهوية، والسياسة الخارجية، والأزمات الوطنية عبر **60 شهراً**.

---

### أوضاع اللعب (Game Modes)
يمكن التبديل أو البدء بأحد الأوضاع الثلاثة من شاشة الإعدادات (`SettingsView`):
- **الوضع العادي (`normal`):** محاكاة واقعية متوازنة للأحداث والضغوط المالية والاجتماعية.
- **الوضع الصعب (`hard`):** ضغوط أشد على العجز المالي، والتضخم، وتصاعد الاحتقان والأزمات.
- **الوضع التجريبي الحر (`sandbox`):** يرفع قيود الاستقرار والميزانية لتجربة الإصلاحات والسياسات بحرية.

---

### ركائز المحاكاة والواجهات داخل اللعبة

#### 1. الخريطة الاستراتيجية (`map`)
- خريطة تفاعلية لـ **12 جهة مغربية** و**34 مدينة وحاضرة** مع دعم التكبير والتصغير وسحب الخريطة (`Pan & Drag`).
- طبقة اختيارية لعرض **48 ميناءً مغربياً** بإحداثياتها الجغرافية وتصنيفاتها (تجارية، صيد، ترفيهية...) انطلاقاً من بيانات `MoroccoAPI`.
- **تدخلات جهوية مستهدفة** لكل جهة (تحفيز الشغل والصناعة `job_stimulus`، الماء وفك العزلة `water_roads`، الصحة والدعم الاجتماعي `social_health`) مع فترة انتظار (**شهران** لكل جهة) لمنع الاستغلال.

#### 2. الحكومة والبرلمان والأحزاب والانتخابات (`government`, `parliament`, `parties`, `elections`)
- **مجلس الوزراء (13 حقيبة وزارية):** لكل وزير مؤشرات الكفاءة (`competence`)، والولاء (`loyalty`)، والشعبية (`publicApproval`)، ومؤشر مخاطر الحكامة والفساد (`corruptionRisk`)، مع إمكانية التعديل الوزاري واختيار مرشحي أحزاب الائتلاف أو مستقلين.
- **مراقبة المجلس الأعلى للحسابات:** عند ارتفاع `corruptionRisk >= 55` لدى أحد الوزراء قد يندلع حدث افتحاص ومطالب بالمساءلة.
- **9 أحزاب سياسية و395 مقعداً:** حساب **مؤشر انسجام الائتلاف** (`calculateCoalitionHarmony`) انطلاقاً من مصفوفة التوافق بين الأحزاب المشاركة، وتأثيره المباشر على الاستقرار وتصويت النواب داخل البرلمان.
- **ملتمس الرقابة (الفصل 105 من الدستور):** عند تدهور الاستقرار أقل من `22` أو الرضا الشعبي أقل من `20%` أو فقدان الأغلبية البرلمانية (`< 198` مقعداً)، تتقدم المعارضة بملتمس رقابة يمكن أن يفضي إلى استقالة الحكومة أو انتخابات مبكرة أو سقوط الحكومة.
- **الانتخابات التشريعية (`elections.ts`, `governmentFormation.ts`):** إجراء الانتخابات العامة أو المبكرة وإعادة تشكيل الأغلبية الحكومية عبر التفاوض على الحقائب وتوافق الأحزاب.

#### 3. المالية العامة والاقتصاد الكلي والتشريعات (`budget`, `economy`, `decisions`)
- **منزلقات الميزانية الحية (`FiscalLevers`):** تعديل الضريبة على الشركات (`corporateTax`)، الضريبة على الدخل (`incomeTax`)، الضريبة على القيمة المضافة (`vat`)، وصندوق المقاصة، وميزانيات الصحة، والتعليم، والدفاع، والبنية التحتية، وكتلة الأجور العمومية.
- **توازن البداية وحماية الخزينة:** تنطلق الميزانية بإيرادات `47.7 مليار درهم/شهر` ونفقات `51.9 مليار درهم/شهر` (عجز `-4.2 مليار/شهر`)، واحتياطي خزينة `85.0 مليار درهم`، ودين عمومي `1045.0 مليار درهم` (`68.7%` من الناتج الداخلي الخام البالغ `1520.0 مليار درهم`). عند نفاد السيولة يتم إصدار سندات خزينة طارئة تلقائياً مع انعكاس على كلفة الدين والتصنيف السيادي (`AAA` حتى `CCC`).
- **35 إصلاحاً ومرسوماً وطنياً + مراسيم مخصصة:** تفعيل السياسات عبر البرلمان أو بمراسيم تنظيمية وفق طبيعة المشروع، مع إمكانية صياغة **مراسيم مخصصة** تحفظ داخل `state.policies` ولا يتكرر تنفيذها، وتخضع لفحص كفاية احتياطي الخزينة.
- **الاقتصاد الكلي ومرجع الأسعار:** نمو الناتج الداخلي الحقيقي، البطالة العامة وبطالة الشباب، سعر الفائدة لبنك المغرب (`2.75%`)، الاستثمار الخاص والأجنبي (`fdiBillionMAD`)، تقلبات أسعار النفط والفوسفاط عالمياً، وجدول مرجعي لمؤشر أسعار الاستهلاك **HCP CPI** لـ **13 قسماً استهلاكياً و19 مدينة**.

#### 4. الأمن المائي والسدود والجهات والحواضر (`water`, `regions`, `cities`)
- **متابعة 25 سداً عبر 9 أحواض مائية** (سبو، أم الربيع، أبي رقراق، ملوية، اللوكوس، تانسيفت، سوس-ماسة، درعة-واد نون، كير-زيز-غريس) مع نسب الملء والحجم المخزن بالمليون متر مكعب وإمكانية التصفية حسب الحوض.
- **تحلية مياه البحر والطريق السيار المائي:** قدرة بداية `350,000 م³/يوم` عبر `9` محطات مع آلية تمنع تكرار احتساب قدرة مشاريع التحلية المنجزة شهرياً (`appliedDesalinationPolicyIds`).
- **الاحتجاجات الميدانية بالمدن:** ترقب الوقفات والمطالب المحلية (`CityProtestModal`) في المدن الـ 34 ومعالجتها ميدانياً أو عبر المراسيم.

#### 5. الصحراء المغربية والدبلوماسية والمجتمع والأزمات (`foreign`, `society`)
- **16 ملفاً وعلاقة خارجية:** تعزيز الاعتراف بمغربية الصحراء، اتفاقيات التجارة الحرة (`sign_trade`)، الشراكات الدفاعية (`sign_defense`)، وخفض التوتر (`deescalate`) مع أقفال تمنع توقيع الاتفاقيات المفعلة مسبقاً وفترة انتظار شهرية لكل دولة.
- **مشاريع استراتيجية سيادية (لمرة واحدة):** تسريع ميناء الداخلة الأطلسي (`sahara_dakhla_port`)، الطريق السريع تيزنيت-الداخلة (`sahara_tiznit_highway`)، والتحرك الدبلوماسي داخل الاتحاد الإفريقي (`sahara_au_expulsion`).
- **11 فئة مجتمعية و12 أزمة وطنية (`events.json`):** إدارة الأزمات الاقتصادية والمناخية والسياسية عبر خيارات متعددة تؤثر على الميزانية، التضخم، النمو، الرضا الجهوي، والعلاقات الدولية.
- **اللقاءات والندوات الصحفية (`EncounterModal`):** التصريح الإعلامي والحوار المباشر مع الصحافة والرأي العام مع تقييم فوري لتأثير التصريح.

#### 6. غرفة العمليات، الأهداف الاستراتيجية الخمس، وحصيلة النهاية (`dashboard`, `statistics`, `news`, `history`)
تقيس اللعبة أداءك شهرياً عبر **5 أهداف استراتيجية كبرى**:
1. **الحصانة المائية الوطنية:** بلوغ نسبة ملء السدود `≥ 45%` أو قدرة تحلية `≥ 550,000 م³/يوم`.
2. **الاستدامة المالية وتقليص العجز:** الرصيد الشهري `≥ -2.5 مليار درهم` ونسبة الدين إلى الناتج `≤ 68%`.
3. **ميثاق تشغيل الشباب:** تقليص بطالة الشباب إلى `≤ 25%`.
4. **إقلاع اقتصادي مستقر الأسعار:** نمو حقيقي `≥ 4.2%` مع إبقاء التضخم `≤ 2.4%`.
5. **ثقة المواطنين وتماسك الأغلبية:** رضا شعبي `≥ 64%` واستقرار حكومي `≥ 75/100`.

تنتهي الجولة وتُعرض **بطاقة التقييم النهائية (`S / A / B / C / D / F`)** في ثلاث حالات:
- إتمام الولاية الدستورية (**60 شهراً**).
- سقوط الحكومة بملتمس الرقابة (**الفصل 105**).
- تجاوز الدين العمومي عتبة **110%** من الناتج الداخلي الخام (تعثر مالي هيكلي).

---

### المستشار الذكي (DeepSeek AI — اختياري)
- لا يحتوي الكود المصدري على أي مفتاح API مضمن؛ ويمكنك اختيارياً إدخال مفتاح **DeepSeek API** واسم النموذج في تبويب **الإعدادات** (يُحفظ محلياً في `localStorage` داخل متصفحك فقط).
- عند تفعيل المفتاح تحصل على إحاطات استراتيجية، تحليل وتوليد لمراسيمك المخصصة، وتقييم للتصريحات الصحفية.
- في حال عدم إدخال مفتاح، تعمل اللعبة بشكل كامل بالاعتماد على **بدائل محلية ذكية (Offline Fallbacks)**.

### نظام الحفظ والاسترجاع (`saveManager.ts`)
- **4 خانات حفظ يدوية + خانة حفظ تلقائي (`autosave`)** في المتصفح.
- تصدير واستيراد ملفات الحفظ بصيغة `JSON` مع دالة `hydrateGameState` لضمان توافق ملفات الحفظ القديمة مع التحديثات الجديدة.

---

## 🇬🇧 Full English Guide

### Overview
**Morocco: State & Government Simulator** is a bilingual (**Arabic RTL** default & **English LTR**), turn-based monthly political and macroeconomic strategy game. Starting in **January 2026**, you lead a governing coalition holding **270 of 395 seats** in the House of Representatives (constitutional majority threshold: **198 seats**) across a **60-month (5-year)** constitutional mandate.

---

### Game Modes
Switchable anytime or before starting in `SettingsView`:
- **Normal (`normal`):** Balanced macroeconomic, fiscal, and social pressures.
- **Hard (`hard`):** Heightened fiscal deficits, inflation shocks, and social tension dynamics.
- **Sandbox (`sandbox`):** Relaxes fiscal and stability constraints for unrestricted policy experimentation.

---

### Core Systems & Modules

1. **Interactive Strategic Map (`StrategicMapCanvas.tsx`, `MoroccoMapView.tsx`):**
   - Covers all **12 Moroccan regions** and **34 cities**, with zoom and pointer pan/drag controls.
   - Toggleable overlay of **48 Moroccan ports** synced from MoroccoAPI.
   - Targeted regional interventions (`job_stimulus`, `water_roads`, `social_health`) with a **2-month regional cooldown**.

2. **Governance, Parliament, Parties & Elections (`GovernmentView`, `ParliamentView`, `PartiesView`, `ElectionsView`):**
   - **13 Cabinet Ministries:** Manage ministers with individual `competence`, `loyalty`, `publicApproval`, and `corruptionRisk`, plus coalition party candidate picks.
   - **Court of Accounts Audits:** Ministers with `corruptionRisk >= 55` can trigger public procurement audit scandals.
   - **9 Political Parties & 395 Seats:** Coalition ideological harmony (`calculateCoalitionHarmony`) directly affects cabinet stability and legislative vote passage (`simulateParliamentVote`).
   - **Constitutional Article 105:** If stability `< 22`, public approval `< 20%`, or coalition seats drop below `198`, the opposition files a Motion of No Confidence that can force concessions, snap elections, or cabinet collapse.

3. **Public Finance, Macroeconomy & Legislation (`BudgetView`, `EconomyView`, `DecisionsView`):**
   - **Live Fiscal Sliders (`FiscalLevers`):** Tune corporate/income/VAT taxes alongside Maqassa subsidies, healthcare, education, defense, infrastructure, and public wages.
   - **Calibrated Baseline & T-Bill Protection:** Starts at `47.7B MAD/mo` revenue vs `51.9B MAD/mo` expense (`-4.2B MAD/mo`), `85.0B MAD` treasury reserves, `1045.0B MAD` public debt (`68.7%` of `1520.0B MAD` GDP), and `BBB` sovereign rating. Discretionary spending checks treasury reserves; mandatory/emergency shortfalls automatically trigger emergency T-bill bond issuance.
   - **35 Policies + Custom Decrees:** Enact legislative bills or executive decrees, or author custom decrees stored directly in `state.policies` with duplicate-enactment guards.
   - **Macro Benchmarks:** Tracks GDP growth, unemployment, youth unemployment, Bank Al-Maghrib interest rate (`2.75%`), FDI (`fdiBillionMAD`), oil & phosphate price cycles, and an **HCP CPI** benchmark table (**13 divisions & 19 cities**).

4. **Water Security, Regions & Cities (`WaterView`, `RegionsView`, `CitiesView`):**
   - Monitors **25 major dams across 9 hydraulic basins** (`souss-massa`, `tensift`, `oum-er-rbia`, `sebou`, `loukkos`, `guir-ziz-gheris`, `moulouya`, `draa-oued-noun`, `bouregreg`) synced from MoroccoAPI.
   - Tracks desalination capacity (`350,000 m³/day` baseline across `9` plants) with one-time capacity application (`appliedDesalinationPolicyIds`), Sebou-Bouregreg water highway flow, drought stages, and city protests (`CityProtestModal`).

5. **Sahara Sovereignty, Foreign Relations & Crises (`ForeignAffairsView`, `SocietyView`, `CrisisModal`, `EncounterModal`):**
   - **16 International Dossiers:** Advance Sahara sovereignty recognition, sign FTA (`sign_trade`) and defense (`sign_defense`) pacts, or de-escalate tensions with duplicate-pact locks and monthly diplomatic cooldowns.
   - **One-Time Sovereign Megaprojects:** Dakhla Atlantic Port (`sahara_dakhla_port`), Tiznit–Dakhla Dual Carriageway (`sahara_tiznit_highway`), and AU diplomatic offensive (`sahara_au_expulsion`).
   - **11 Demographic Groups & 12 Crisis Events:** Resolve multi-choice national crises applying full regional, inflationary, GDP, fiscal, and diplomatic impacts.
   - **Press Encounters (`EncounterModal`):** Respond to journalists and public pressure with instant statement evaluation and cooldown protection.

6. **5-Year Strategic Goals & End-of-Term Scorecard (`DashboardView`, `App.tsx`):**
   - **National Hydraulic Immunity:** Dam fill `≥ 45%` OR Desalination `≥ 550k m³/day`.
   - **Macro-Fiscal Sustainability:** Monthly balance `≥ -2.5B MAD` AND Debt/GDP `≤ 68%`.
   - **Youth Employment Charter:** Youth unemployment `≤ 25%`.
   - **Balanced Economic Takeoff:** Real GDP growth `≥ 4.2%` AND Inflation `≤ 2.4%`.
   - **Public Trust & Governing Mandate:** Approval `≥ 64%` AND Stability `≥ 75/100`.
   - **End-of-Game Grading (`S / A / B / C / D / F`):** Triggered upon completing the **60-month term**, **Article 105 Vote of No Confidence collapse**, or **Debt/GDP exceeding 110%**.

---

## 📦 تكامل البيانات المفتوحة (MoroccoAPI)

تعتمد اللعبة على بنية **Offline-First** لجلب بيانات مغربية حقيقية من مشروع **[MoroccoAPI](https://github.com/MoroccoAPI/MoroccoAPI)** (`https://moroccoapi.dev`) وحفظها محلياً لتعمل اللعبة بكفاءة حتى دون اتصال بالإنترنت:

| المكون / Dataset | المحتوى المدمج في اللعبة | الملف المستهدف |
| :--- | :--- | :--- |
| **السدود والأحواض المائية (Dams)** | **25 سداً** موزعة على **9 أحواض مائية** (الحجم، السعة، نسبة الملء) | `src/data/moroccoApiData.json` |
| **الموانئ المغربية (Ports)** | **48 ميناءً** بإحداثياتها الجغرافية وتصنيفاتها للعرض على الخريطة | `src/data/moroccoApiData.json` |
| **الإحصاء العام للسكان 2024 (RGPH)** | السكان القانونيون للجهات الـ **12** (إجمالي وطني: `36,828,330` نسمة) | `src/data/regions.json` & `moroccoApiData.json` |
| **مؤشر أسعار الاستهلاك (HCP CPI)** | **13 قسماً** استهلاكياً و**19 مدينة** (مرجع `2026-08`) | `src/data/moroccoApiData.json` |
| **مؤشرات البنك الدولي (World Bank)** | 5 سلاسل اقتصادية مرجعية (النمو، التضخم، البطالة، الاستثمار الأجنبي) | `src/data/moroccoApiData.json` |

لتحديث لقطة البيانات من MoroccoAPI مباشرة:
```bash
npm run sync-data
```

---

## 🛠️ التثبيت والتشغيل | Installation & Commands

### المتطلبات | Prerequisites
- **Node.js** `>= 18`
- **npm**

### خطوات التشغيل | Quick Start
```bash
# 1. تثبيت التبعيات / Install dependencies
npm install

# 2. تشغيل الخادم المحلي للمعاينة / Start local dev server (http://localhost:3000)
npm run dev

# 3. تشغيل اختبارات الوحدة / Run Vitest simulation unit tests
npm test

# 4. فحص الأنواع وبناء نسخة الإنتاج / Typecheck & production build
npm run build

# 5. معاينة نسخة الإنتاج محلياً / Preview production bundle
npm run preview

# 6. تحديث بيانات MoroccoAPI محلياً / Sync MoroccoAPI offline snapshot
npm run sync-data
```

---

## 🗂️ هيكل المشروع | Project Architecture

```text
morocco-simulator/
├── scripts/
│   └── sync-morocco-api.mjs        # مزامنة بيانات MoroccoAPI إلى ملفات JSON محلية
├── src/
│   ├── ai/
│   │   └── deepseek.ts             # واجهة DeepSeek الاختيارية + بدائل محلية دون اتصال
│   ├── data/
│   │   ├── moroccoApiData.json     # لقطة السدود والموانئ ومؤشرات CPI والبنك الدولي
│   │   ├── regions.json            # الجهات الـ 12 (بسكان RGPH 2024)
│   │   ├── cities.json             # 34 مدينة مغربية
│   │   ├── parties.json            # 9 أحزاب سياسية ومصفوفة التوافق الائتلافي
│   │   ├── ministers.json          # 13 حقيبة وزارية
│   │   ├── policies.json           # 35 سياسة ومشروع قانون إصلاحي
│   │   ├── events.json             # 12 أزمة وحدثاً وطنياً
│   │   ├── countries.json          # 16 علاقة وشراكة دبلوماسية
│   │   └── demographics.json       # 11 فئة مجتمعية
│   ├── locales/                    # ملفات الترجمة (ar.json, en.json, i18n.ts)
│   ├── simulation/
│   │   ├── engine.ts               # المحرك الشهري الرئيسي، الأهداف الاستراتيجية، وحصيلة النهاية
│   │   ├── actions.ts              # مخففات الأفعال الصافية (المراسيم، الأزمات، التدخلات، الدبلوماسية)
│   │   ├── economy.ts              # الاقتصاد الكلي، الاستثمار الأجنبي، ودورات النفط والفوسفاط
│   │   ├── budget.ts               # حساب الميزانية، الخزينة، وإصدار السندات الطارئة
│   │   ├── water.ts                # محاكاة السدود والتحلية دون تكرار حساب المشاريع
│   │   ├── government.ts           # الاستقرار الحكومي، انسجام الائتلاف، ومخاطر الفساد
│   │   ├── parliament.ts           # تصويت مجلس النواب ومناقشة مشاريع القوانين
│   │   ├── elections.ts            # حساب نتائج الانتخابات التشريعية وتوزيع المقاعد
│   │   ├── governmentFormation.ts  # تشكيل الحكومة وتوزيع الحقائب الوزارية
│   │   ├── opinion.ts              # الرأي العام الجهوي والاحتقان الاجتماعي
│   │   ├── tension.ts              # فحص الأزمات الوطنية والوقفات الاحتجاجية بالمدن
│   │   ├── foreign.ts              # تطور العلاقات الخارجية والاتفاقيات
│   │   ├── attribution.ts          # تفسير أسباب تغير المؤشرات شهرياً
│   │   └── __tests__/
│   │       └── simulation.test.ts  # اختبارات Vitest لنواة المحاكاة والتكامل
│   ├── storage/
│   │   └── saveManager.ts          # الحفظ التلقائي، الخانات الـ 4، الاستيراد/التصدير، و hydrateGameState
│   ├── types/
│   │   └── game.ts                 # تعريفات TypeScript الشاملة لحالة اللعبة
│   └── ui/
│       ├── TopBar.tsx              # الشريط العلوي (المؤشرات، التاريخ، السرعة، اللغة)
│       ├── CommandDock.tsx         # شريط المراكز الاستراتيجية والتنقل
│       ├── components/             # الخريطة التفاعلية ونوافذ الأزمات واللقاء الصحفي والمستشار
│       └── views/                  # 18 شاشة متخصصة لإدارة قطاعات الدولة
├── package.json
├── tsconfig.json
└── vite.config.ts
```

---

## ⚙️ التقنيات المستخدمة | Tech Stack
- **Frontend:** React 18, TypeScript 5.7, Vite 6
- **Styling & UI:** Tailwind CSS 3.4, Lucide React Icons, Cairo & Inter Fonts
- **Charts:** Recharts 2.15
- **Testing:** Vitest 5.1
- **Data Integration:** MoroccoAPI (`https://moroccoapi.dev`)
