const DATA = window.PSALTER_APP_DATA;

const STORAGE_KEYS = {
  translation: "psalter.translation",
  kathisma: "psalter.kathisma"
};

const MOSCOW_TIMEZONE = "Europe/Moscow";

const state = {
  translation: "churchSlavonic",
  kathismaId: 1
};

const translationToggle = document.getElementById("translation-toggle");
const kathismaSelect = document.getElementById("kathisma-select");
const kathismaGrid = document.getElementById("kathisma-grid");
const summaryView = document.getElementById("today-summary");
const readingView = document.getElementById("reading-view");
const readingNav = document.getElementById("reading-nav");

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
    </div>
  `;
}

function renderReadingNav() {
  const navItems = [
    { id: "common-beginning", label: "Начало" },
    { id: "segment-1", label: "Слава 1" },
    { id: "segment-2", label: "Слава 2" },
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
          <div class="prayer-text">${renderPrayerLines(DATA.prayers.commonBeginning)}</div>
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

    <section class="reading-section" id="after-kathisma">
      <div class="section-header">
        <p class="card-kicker">По окончании</p>
        <h2>Молитва после кафизмы</h2>
      </div>
      <div class="prayer-flow">
        <div class="prayer-block">
          <div class="prayer-text">${renderPrayerLines(DATA.prayers.afterKathisma)}</div>
        </div>
      </div>
    </section>

    ${renderTroparionSection()}
  `;
}

function render() {
  buildTranslationToggle();
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

  populateKathismaSelect();

  state.translation = localStorage.getItem(STORAGE_KEYS.translation) || DATA.translations[0].id;

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
