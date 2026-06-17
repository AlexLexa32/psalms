const DATA = window.PSALTER_APP_DATA;

const STORAGE_KEYS = {
  translation: "psalter.translation.v2",
  kathisma: "psalter.kathisma",
  prayerVersion: "psalter.prayerVersion.v2"
};

const MOSCOW_TIMEZONE = "Europe/Moscow";
const PSALM_HEADING_START_MARKERS = [
  "в конец",
  "псалом",
  "песнь",
  "молитва",
  "разум",
  "аллилу",
  "о наследствующем",
  "о точилех",
  "о точилах",
  "о осмом",
  "о тайных",
  "о заступлении",
  "в воспоминание",
  "идифуму",
  "сынов кореевых",
  "сынов кореовых",
  "асафу",
  "еману",
  "ефаму",
  "моисея",
  "соломону",
  "начальнику хора",
  "плачевная песнь",
  "при обновлении",
  "раба господня"
];
const PSALM_HEADING_CONTINUATIONS = ["егда", "внегда", "яже", "еже", "жене", "сына", "при", "когда", "после", "о "];

const state = {
  translation: "churchSlavonic",
  kathismaId: 1,
  prayerVersion: "full"
};

const translationToggle = document.getElementById("translation-toggle");
const prayerVersionToggle = document.getElementById("prayer-version-toggle");
const kathismaSelect = document.getElementById("kathisma-select");
const kathismaGrid = document.getElementById("kathisma-grid");
const summaryView = document.getElementById("today-summary");
const readingView = document.getElementById("reading-view");
const readingNav = document.getElementById("reading-nav");

const PRAYER_VERSION_OPTIONS = [
  {
    id: "short",
    label: "Краткая"
  },
  {
    id: "full",
    label: "Полная"
  }
];

const FULL_GOSPEL_PRAYER = {
  churchSlavonic:
    "Возсия́й в сердца́х на́ших, Человеколю́бче Го́споди, Твоего́ богове́дения нетле́нный све́т, и мы́сленная на́ша отве́рзи о́чи во ева́нгельских Твои́х пропове́даний разуме́ние, вложи́ в на́с и блаже́нных Твои́х за́поведей стра́х, да плотски́я по́хоти вся́ попра́вше, духо́вное жи́тельство про́йдем, вся́ я́же ко благоугожде́нию Твоему́ и му́дрствующе и де́юще. Ты́ бо еси́ просвеще́ние ду́ш и теле́с на́ших, Христе́ Бо́же, и Тебе́ сла́ву возсыла́ем, со Безнача́льным Твои́м Отце́м и Всесвяты́м, и Благи́м, и Животворя́щим Твои́м Ду́хом, ны́не и при́сно, и во ве́ки веко́в, ами́нь.",
  synodal:
    "Зажги в сердцах наших, человеколюбивый Господи, Твоего Богопознания нетленный свет и открой очи ума нашего для уразумения евангельской Твоей проповеди! Вложи в нас и страх пред блаженными Твоими заповедями, дабы мы, все плотские влечения поправ, проводили духовную жизнь, о всём, что ко благоугождению Тебе, мысля и то совершая. Ибо Ты – просвещение душ и тел наших, Христе Боже, и Тебе славу возсылаем, со Безначальным Твоим Отцом и Всесвятым, и Благим, и Животворящим Твоим Духом ныне, и всегда, и во веки веков. Аминь."
};

const SHORT_GOSPEL_PRAYER =
  "Го́споди Иису́се Христе́! Отве́рзи мои́ о́чи серде́чные, что́бы услышать мне́ сло́во Твое́ и уразуметь его́ и исполнить во́лю Твою́.";

const GOSPEL_AFTER_PRAYER =
  "Спаси, Господи и помилуй рабов Твоих (имена) словами Божественного Евангелия, читаемыми во спасение. Попали, Господи, терние всех наших согрешений, и да вселится в нас благодать Твоя очищающая, освящающая всего человека, во имя Отца и Сына и Святого Духа. Аминь.";

const SHORT_BEFORE_KATHISMA_ENDING = [
  "Го́споди, поми́луй. (12 раз.)",
  "Слава Отцу, и Сыну, и Святому Духу, и ныне, и присно, и во веки веков. Аминь."
];

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function createElement(tagName, className, textContent) {
  const node = document.createElement(tagName);

  if (className) {
    node.className = className;
  }

  if (typeof textContent === "string") {
    node.textContent = textContent;
  }

  return node;
}

function normalizeMatchingText(value) {
  return String(value)
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .replace(/ѣ/gi, "е")
    .replace(/і/gi, "и")
    .replace(/ѳ/gi, "ф")
    .replace(/ѵ/gi, "и")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();
}

function looksLikePsalmHeadingStart(text) {
  const normalized = normalizeMatchingText(text);
  return PSALM_HEADING_START_MARKERS.some((marker) => normalized.startsWith(marker) || normalized.includes(` ${marker}`));
}

function looksLikePsalmHeadingContinuation(text) {
  const normalized = normalizeMatchingText(text);
  return PSALM_HEADING_CONTINUATIONS.some((marker) => normalized.startsWith(marker));
}

function normalizePsalmHeading(psalm) {
  if (!psalm || !Array.isArray(psalm.verses) || psalm.verses.length === 0) {
    return;
  }

  const headingParts = [];

  if (psalm.heading) {
    headingParts.push(psalm.heading);
  }

  while (psalm.verses.length > 0) {
    const firstVerse = psalm.verses[0];

    if (headingParts.length === 0 && looksLikePsalmHeadingStart(firstVerse.text)) {
      headingParts.push(firstVerse.text);
      psalm.verses.shift();
      continue;
    }

    if (headingParts.length > 0 && looksLikePsalmHeadingContinuation(firstVerse.text)) {
      headingParts.push(firstVerse.text);
      psalm.verses.shift();
      continue;
    }

    break;
  }

  psalm.heading = headingParts.join(" ").trim();
}

function normalizeLoadedData() {
  if (!DATA?.kathismas) {
    return;
  }

  for (const translationId of Object.keys(DATA.kathismas)) {
    for (const kathisma of DATA.kathismas[translationId]) {
      for (const segment of kathisma.segments) {
        for (const psalm of segment.psalms) {
          normalizePsalmHeading(psalm);
        }
      }
    }
  }
}

function getDateStringForTimezone(timeZone) {
  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit"
  });

  const parts = formatter.formatToParts(new Date());
  const values = Object.fromEntries(parts.map((part) => [part.type, part.value]));
  return `${values.year}-${values.month}-${values.day}`;
}

function formatRussianDate(dateString) {
  const [year, month, day] = dateString.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));

  return new Intl.DateTimeFormat("ru-RU", {
    timeZone: "UTC",
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric"
  }).format(date);
}

function getTroparionData() {
  const dateString = getDateStringForTimezone(MOSCOW_TIMEZONE);
  const url = `https://azbyka.ru/days/${dateString}#tropari`;

  return {
    dateString,
    formattedDate: formatRussianDate(dateString),
    url
  };
}

function getMatthewZachaloForToday() {
  const gospel = DATA.gospelMatthew;

  if (!gospel?.zachala?.length) {
    return null;
  }

  const currentDateString = getDateStringForTimezone(MOSCOW_TIMEZONE);
  const startDate = new Date(`${gospel.cycleStartDate}T00:00:00Z`);
  const currentDate = new Date(`${currentDateString}T00:00:00Z`);
  const diffDays = Math.floor((currentDate - startDate) / 86400000);
  const startIndex = gospel.zachala.findIndex((item) => item.number === gospel.cycleStartZachalo);
  const safeStartIndex = startIndex >= 0 ? startIndex : 0;
  const cycleIndex = ((safeStartIndex + diffDays) % gospel.zachala.length + gospel.zachala.length) % gospel.zachala.length;

  return {
    ...gospel.zachala[cycleIndex],
    formattedDate: formatRussianDate(currentDateString)
  };
}

function getKathismaList() {
  return DATA.kathismas[DATA.translations[0].id];
}

function getKathismaData(translationId, kathismaId) {
  return DATA.kathismas[translationId][kathismaId - 1];
}

function buildTranslationToggle() {
  translationToggle.innerHTML = "";

  for (const translation of DATA.translations) {
    const button = createElement("button", "translation-button");
    button.type = "button";
    button.dataset.translation = translation.id;

    const title = createElement("strong", "", translation.label);
    const description = createElement(
      "span",
      "",
      translation.id === "churchSlavonic"
        ? "Церковнославянский текст, показанный удобным гражданским шрифтом."
        : "Современный синодальный текст с привычной русской подачей."
    );

    button.append(title, description);

    if (translation.id === state.translation) {
      button.classList.add("active");
    }

    button.addEventListener("click", () => {
      state.translation = translation.id;
      localStorage.setItem(STORAGE_KEYS.translation, state.translation);
      render();
    });

    translationToggle.append(button);
  }
}

function buildPrayerVersionToggle() {
  prayerVersionToggle.innerHTML = "";

  for (const option of PRAYER_VERSION_OPTIONS) {
    const button = createElement("button", "translation-button");
    button.type = "button";
    button.dataset.prayerVersion = option.id;

    const title = createElement("strong", "", option.label);
    button.append(title);

    if (option.id === state.prayerVersion) {
      button.classList.add("active");
    }

    button.addEventListener("click", () => {
      state.prayerVersion = option.id;
      localStorage.setItem(STORAGE_KEYS.prayerVersion, state.prayerVersion);
      render();
    });

    prayerVersionToggle.append(button);
  }
}

function getCommonBeginningLines() {
  const beforeKathisma = DATA.prayers.beforeKathisma;
  const shortTroparion = beforeKathisma.shortTroparion.replace(/^Сла́ва Отцу́ и Сы́ну и Свято́му Ду́ху\.\s*/u, "");

  if (state.prayerVersion === "short") {
    return [
      ...DATA.prayers.commonBeginning.slice(0, 10),
      shortTroparion,
      ...SHORT_BEFORE_KATHISMA_ENDING,
      ...DATA.prayers.commonBeginning.slice(10)
    ];
  }

  return [
    ...DATA.prayers.commonBeginning.slice(0, 9),
    beforeKathisma.full.intro,
    ...beforeKathisma.full.troparia,
    beforeKathisma.full.lordHaveMercy,
    beforeKathisma.full.prayer,
    ...DATA.prayers.commonBeginning.slice(10)
  ];
}

function getAfterKathismaModeLabel() {
  return state.prayerVersion === "full" ? "Полная версия молитв" : "Краткая версия молитв";
}

function getFullAfterKathismaBlock(kathismaId) {
  return DATA.prayers.afterKathismaFull?.find((item) => item.kathismaId === kathismaId) ?? null;
}

function getTrisagionAfterKathismaLines() {
  return DATA.prayers.commonBeginning.slice(3, 9);
}

function getGospelPreparationPrayer() {
  const gospelPrayers = DATA.prayers.gospelBeforeMatthew;

  if (state.prayerVersion === "short") {
    return gospelPrayers?.shortPrayer || SHORT_GOSPEL_PRAYER;
  }

  if (gospelPrayers?.fullPrayer) {
    return state.translation === "synodal" ? gospelPrayers.fullPrayer.synodal : gospelPrayers.fullPrayer.churchSlavonic;
  }

  return state.translation === "synodal" ? FULL_GOSPEL_PRAYER.synodal : FULL_GOSPEL_PRAYER.churchSlavonic;
}

function populateKathismaSelect() {
  kathismaSelect.innerHTML = "";

  for (const kathisma of getKathismaList()) {
    const option = document.createElement("option");
    option.value = String(kathisma.id);
    option.textContent = `${kathisma.id}-я кафизма`;
    kathismaSelect.append(option);
  }
}

function renderKathismaGrid() {
  kathismaGrid.innerHTML = "";

  for (const kathisma of getKathismaList()) {
    const button = createElement("button", "kathisma-chip", `${kathisma.id}`);
    button.type = "button";

    if (kathisma.id === state.kathismaId) {
      button.classList.add("active");
    }

    button.addEventListener("click", () => {
      state.kathismaId = kathisma.id;
      localStorage.setItem(STORAGE_KEYS.kathisma, String(state.kathismaId));
      render();
    });

    kathismaGrid.append(button);
  }
}

function renderSummary(kathismaNumber) {
  const translationLabel = DATA.translations.find((translation) => translation.id === state.translation)?.label ?? "";
  const prayerModeLabel = getAfterKathismaModeLabel();

  summaryView.innerHTML = `
    <div class="summary-grid">
      <div class="summary-line">
        <strong>${kathismaNumber}-я кафизма</strong>
        <span class="summary-date">${escapeHtml(translationLabel)}</span>
      </div>
      <div class="summary-kathisma">
        <span>Сейчас открыта</span>
        <strong>${kathismaNumber}-я кафизма</strong>
      </div>
      <p class="summary-meta">${escapeHtml(prayerModeLabel)}</p>
    </div>
  `;
}

function renderReadingNav() {
  const navItems = [
    { id: "common-beginning", label: "Начало" },
    { id: "segment-1", label: "Слава 1" },
    { id: "segment-2", label: "Слава 2" },
    { id: "matthew-gospel", label: "Матфей" },
    { id: "segment-3", label: "Слава 3" },
    { id: "after-kathisma", label: "По окончании" },
    { id: "troparia-day", label: "Тропари дня" }
  ];

  readingNav.innerHTML = "";

  for (const item of navItems) {
    const link = document.createElement("a");
    link.href = `#${item.id}`;
    link.textContent = item.label;
    readingNav.append(link);
  }
}

function renderPrayerLines(lines) {
  return lines.map((line) => `<p>${escapeHtml(line)}</p>`).join("");
}

function renderPrayerText(text) {
  if (Array.isArray(text)) {
    return text.map((line) => `<p>${escapeHtml(line)}</p>`).join("");
  }

  return `<p>${escapeHtml(text)}</p>`;
}

function renderNameCloud(names) {
  return names.map((name) => `<span class="name-pill">${escapeHtml(name)}</span>`).join("");
}

function renderPsalmCard(psalm) {
  const heading = psalm.heading ? `<div class="psalm-heading">${escapeHtml(psalm.heading)}</div>` : "";
  const subtitle = psalm.subtitle ? `<span class="psalm-subtitle">${escapeHtml(psalm.subtitle)}</span>` : "";
  const textClass = state.translation === "churchSlavonic" ? "psalm-text church-slavonic" : "psalm-text";

  const verses = psalm.verses
    .map(
      (verse) => `
        <div class="verse">
          <div class="verse-number">${verse.number}</div>
          <div class="verse-text">${escapeHtml(verse.text)}</div>
        </div>
      `
    )
    .join("");

  return `
    <article class="psalm-card">
      <div class="psalm-title">
        <h4>${escapeHtml(psalm.title)}</h4>
        ${subtitle}
      </div>
      ${heading}
      <div class="${textClass}">${verses}</div>
    </article>
  `;
}

function renderPrayerCard(prayerType, segmentIndex) {
  const prayer = prayerType === "living" ? DATA.prayers.livingPrayer : DATA.prayers.departedPrayer;

  return `
    <article class="prayer-card">
      <h3>${escapeHtml(`После ${segmentIndex}-й славы`)}</h3>
      <div class="doxology">${renderPrayerLines(DATA.prayers.slava)}</div>
      <div class="prayer-text">${renderPrayerText(prayer.text)}</div>
      <div class="names-label">${escapeHtml(prayer.namesLabel)}</div>
      <div class="name-cloud">${renderNameCloud(prayer.names)}</div>
    </article>
  `;
}

function renderGospelAfterSecondSlava() {
  const zachalo = getMatthewZachaloForToday();

  if (!zachalo) {
    return "";
  }

  const verses = zachalo.verses
    .map(
      (verse) => `
        <div class="gospel-verse">
          <div class="gospel-verse-number">${escapeHtml(`${verse.chapter}:${verse.number}`)}</div>
          <div class="gospel-verse-text">${escapeHtml(verse.text)}</div>
        </div>
      `
    )
    .join("");

  const gospelTroparion =
    DATA.prayers.gospelBeforeMatthew?.troparion ||
    "Апо́столе святы́й Матфе́е, моли́ Ми́лостиваго Бо́га, да прегреше́ний оставле́ние пода́ст душа́м на́шим.";
  const preparationLines =
    state.prayerVersion === "full" ? [gospelTroparion, getGospelPreparationPrayer()] : [getGospelPreparationPrayer()];
  const afterGospelBlock =
    state.prayerVersion === "full"
      ? `
        <div class="prayer-block">
          <h3>Молитва после Евангелия</h3>
          <div class="prayer-text">${renderPrayerText(DATA.prayers.gospelBeforeMatthew?.afterPrayer || GOSPEL_AFTER_PRAYER)}</div>

          <div class="names-label">${escapeHtml(DATA.prayers.livingPrayer.namesLabel || "О здравии")}</div>
          <div class="name-cloud">${renderNameCloud(DATA.prayers.livingPrayer.names)}</div>

          <div class="names-label">${escapeHtml(DATA.prayers.departedPrayer.namesLabel || "Об упокоении")}</div>
          <div class="name-cloud">${renderNameCloud(DATA.prayers.departedPrayer.names)}</div>
        </div>
      `
      : "";

  return `
    <article class="prayer-card gospel-card" id="matthew-gospel">
      <h3>Евангелие после 2-й славы</h3>
      <div class="gospel-meta">
        <span class="gospel-badge">${escapeHtml(`${zachalo.number}-е зачало`)}</span>
        <span class="gospel-reference">${escapeHtml(zachalo.reference)}</span>
      </div>
      <p class="gospel-note">
        На ${escapeHtml(zachalo.formattedDate)} читается ${escapeHtml(`${zachalo.number}-е зачало`)}. Этот блок всегда
        приводится по синодальному переводу, независимо от выбранной версии Псалтири.
      </p>
      <div class="prayer-block">
        <h3>Перед Евангелием</h3>
        <div class="prayer-text">${renderPrayerLines(preparationLines)}</div>
      </div>
      <div class="gospel-text">${verses}</div>
      ${afterGospelBlock}
    </article>
  `;
}

function renderAfterKathismaSection(kathismaId) {
  if (state.prayerVersion === "short") {
    return `
      <section class="reading-section" id="after-kathisma">
        <div class="section-header">
          <p class="card-kicker">По окончании</p>
          <h2>Молитва после кафизмы</h2>
          <p class="section-lead">В краткой версии после кафизмы остаётся только заключительная молитва.</p>
        </div>
        <div class="prayer-flow">
          <div class="prayer-block">
            <h3>Молитва после кафизмы</h3>
            <div class="prayer-text">${renderPrayerLines(DATA.prayers.afterKathisma)}</div>
          </div>
        </div>
      </section>
    `;
  }

  const fullBlock = getFullAfterKathismaBlock(kathismaId);

  if (!fullBlock) {
    return `
      <section class="reading-section" id="after-kathisma">
        <div class="section-header">
          <p class="card-kicker">По окончании</p>
          <h2>Молитва после кафизмы</h2>
        </div>
        <div class="prayer-flow">
          <div class="prayer-block">
            <h3>Трисвятое по Отче наш</h3>
            <div class="prayer-text">${renderPrayerLines(getTrisagionAfterKathismaLines())}</div>
          </div>
          <div class="prayer-block">
            <h3>Молитва после кафизмы</h3>
            <div class="prayer-text">${renderPrayerLines(DATA.prayers.afterKathisma)}</div>
          </div>
        </div>
      </section>
    `;
  }

  return `
    <section class="reading-section" id="after-kathisma">
      <div class="section-header">
        <p class="card-kicker">По окончании</p>
        <h2>Полный порядок после кафизмы</h2>
        <p class="section-lead">
          После кафизмы читается Трисвятое по Отче наш, затем тропари, 40-кратное «Господи, помилуй»,
          молитва по соглашению и последняя молитва этой кафизмы.
        </p>
      </div>
      <div class="prayer-flow">
        <div class="prayer-block">
          <h3>Трисвятое по Отче наш</h3>
          <div class="prayer-text">${renderPrayerLines(getTrisagionAfterKathismaLines())}</div>
        </div>
        <div class="prayer-block">
          <h3>Тропари после кафизмы</h3>
          <div class="prayer-text">
            <p><strong>${escapeHtml(fullBlock.intro)}</strong></p>
            ${renderPrayerLines(fullBlock.troparia)}
            <p>${escapeHtml(fullBlock.lordHaveMercy)}</p>
          </div>
        </div>
        <div class="prayer-block">
          <h3>Молитва по соглашению</h3>
          <div class="prayer-text">${renderPrayerLines(DATA.prayers.afterKathisma)}</div>
        </div>
        <div class="prayer-block">
          <h3>Последняя молитва после кафизмы</h3>
          <div class="prayer-text">${renderPrayerText(fullBlock.prayer)}</div>
        </div>
      </div>
    </section>
  `;
}

function renderTroparionSection() {
  const troparion = getTroparionData();

  return `
    <section class="reading-section troparion-section" id="troparia-day">
      <div class="section-header">
        <p class="card-kicker">На сегодня</p>
        <h2>Тропари дня</h2>
        <p class="section-lead">
          Открывается раздел «Тропари» на ${escapeHtml(troparion.formattedDate)} по московскому времени.
        </p>
      </div>
      <div class="troparion-actions">
        <a class="ghost-link-button" href="${escapeHtml(troparion.url)}" target="_blank" rel="noreferrer">
          Открыть отдельно
        </a>
      </div>
      <div class="troparion-frame-shell">
        <iframe
          class="troparion-frame"
          src="${escapeHtml(troparion.url)}"
          title="Тропари дня из Азбуки веры"
          loading="lazy"
          referrerpolicy="no-referrer"
        ></iframe>
      </div>
      <p class="troparion-source">
        Источник:
        <a href="${escapeHtml(troparion.url)}" target="_blank" rel="noreferrer">Азбука веры</a>
      </p>
    </section>
  `;
}

function renderReading(kathismaNumber) {
  const kathisma = getKathismaData(state.translation, kathismaNumber);
  const translationLabel = DATA.translations.find((translation) => translation.id === state.translation)?.label ?? "";
  const prayerModeLabel = getAfterKathismaModeLabel();
  const uniquePsalmCount = new Set(kathisma.segments.flatMap((segment) => segment.psalms.map((psalm) => psalm.number))).size;

  let psalmWord = "псалмов";
  if (uniquePsalmCount % 10 === 1 && uniquePsalmCount % 100 !== 11) {
    psalmWord = "псалом";
  } else if (
    uniquePsalmCount % 10 >= 2 &&
    uniquePsalmCount % 10 <= 4 &&
    !(uniquePsalmCount % 100 >= 12 && uniquePsalmCount % 100 <= 14)
  ) {
    psalmWord = "псалма";
  }

  const segmentsHtml = kathisma.segments
    .map(
      (segment, index) => `
        <section class="segment-block" id="segment-${index + 1}">
          <div class="segment-header">
            <h3>${escapeHtml(segment.label)}</h3>
            <span class="segment-note">${
              segment.prayerType === "living" ? "После славы — молитва о живых" : "После славы — молитва об усопших"
            }</span>
          </div>
          ${segment.psalms.map(renderPsalmCard).join("")}
          ${renderPrayerCard(segment.prayerType, index + 1)}
          ${index === 1 ? renderGospelAfterSecondSlava() : ""}
        </section>
      `
    )
    .join("");

  readingView.innerHTML = `
    <section class="reading-section">
      <div class="section-header">
        <p class="card-kicker">Текст для чтения</p>
        <h2>${escapeHtml(kathisma.title)}</h2>
        <p class="section-lead">
          Выбран ${escapeHtml(translationLabel)}. Здесь уже собраны обычное начало, сама кафизма, славы и молитвы с
          именами о здравии и об упокоении.
        </p>
        <p class="section-lead">${escapeHtml(prayerModeLabel)}.</p>
        <p class="section-lead">
          В этой кафизме ${uniquePsalmCount} ${psalmWord}.
        </p>
      </div>
    </section>

    <section class="reading-section" id="common-beginning">
      <div class="section-header">
        <p class="card-kicker">Перед чтением</p>
        <h2>Обычное начало</h2>
      </div>
      <div class="prayer-flow">
        <div class="prayer-block">
          <div class="prayer-text">${renderPrayerLines(getCommonBeginningLines())}</div>
        </div>
      </div>
    </section>

    <section class="reading-section">
      <div class="section-header">
        <p class="card-kicker">Сама кафизма</p>
        <h2>${escapeHtml(kathisma.title)}</h2>
      </div>
      <div class="reading-stack">${segmentsHtml}</div>
    </section>

    ${renderAfterKathismaSection(kathismaNumber)}

    ${renderTroparionSection()}
  `;
}

function render() {
  buildTranslationToggle();
  buildPrayerVersionToggle();
  renderKathismaGrid();
  renderSummary(state.kathismaId);
  renderReadingNav();
  renderReading(state.kathismaId);
  kathismaSelect.value = String(state.kathismaId);
}

function initialize() {
  if (!DATA) {
    readingView.innerHTML = `
      <div class="loading-state">
        <p>Не удалось загрузить локальную базу Псалтири.</p>
      </div>
    `;
    return;
  }

  normalizeLoadedData();
  populateKathismaSelect();

  state.translation = localStorage.getItem(STORAGE_KEYS.translation) || DATA.translations[0].id;
  state.prayerVersion = localStorage.getItem(STORAGE_KEYS.prayerVersion) || "full";

  const savedKathisma = Number(localStorage.getItem(STORAGE_KEYS.kathisma) || 1);
  state.kathismaId = Number.isFinite(savedKathisma) && savedKathisma >= 1 && savedKathisma <= 20 ? savedKathisma : 1;

  kathismaSelect.addEventListener("change", (event) => {
    state.kathismaId = Number(event.target.value);
    localStorage.setItem(STORAGE_KEYS.kathisma, String(state.kathismaId));
    render();
  });

  render();
}

initialize();
