import { mkdir, writeFile } from "node:fs/promises";
import { execFile } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { promisify } from "node:util";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "..");
const outputFile = path.join(rootDir, "data.js");

const AZBYKA_BASE = "https://azbyka.ru/biblia/";
const execFileAsync = promisify(execFile);
const MATTHEW_CHAPTER_COUNT = 28;
const GOSPEL_CYCLE_START_DATE = "2026-06-16";
const GOSPEL_CYCLE_START_ZACHALO = 4;
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
const SYNODAL_HEADING_MARKERS = [
  "[",
  "псалом",
  "песнь восхождения",
  "начальнику хора",
  "учение",
  "молитва",
  "хвала",
  "аллилу",
  "давида",
  "соломона",
  "асафа",
  "сынов кореевых",
  "сынов кореовых",
  "аггея",
  "захарии",
  "иеремии",
  "иезекииля",
  "моисея"
];
const SYNODAL_COMMENTARY_MARKERS = [
  "содержание псалма",
  "псалом представляет",
  "псалмопевец",
  "пораженный",
  "при возвращении",
  "жизнь в единении",
  "надеющийся",
  "ходящий",
  "много теснили",
  "если бы не господь",
  "без бога",
  "господи, ты знаешь",
  "во время бедствий",
  "когда я взывал",
  "я постоянно обращаюсь",
  "я возрадовался",
  "только к тебе",
  "при реках вавилона"
];
const SYNODAL_HEADING_REPAIRS = {
  88: "Учение Ефама Езрахита.",
  119: "Песнь восхождения.",
  120: "Песнь восхождения.",
  121: "Песнь восхождения. Давида.",
  122: "Песнь восхождения.",
  123: "Песнь восхождения. Давида.",
  124: "Песнь восхождения.",
  125: "Песнь восхождения.",
  126: "Песнь восхождения. Соломона.",
  127: "Песнь восхождения.",
  128: "Песнь восхождения.",
  129: "Песнь восхождения.",
  130: "Песнь восхождения. Давида.",
  131: "Песнь восхождения.",
  132: "Песнь восхождения. Давида.",
  133: "Песнь восхождения.",
  138: "Начальнику хора. Псалом Давида.",
  139: "Начальнику хора. Псалом Давида.",
  140: "Псалом Давида.",
  141: "Учение Давида. Молитва его, когда он был в пещере.",
  142: "Псалом Давида, [когда он преследуем был сыном своим Авессаломом]."
};

const people = [
  { id: "nataliya-vsehoroshonatash", name: "Наталии", handle: "@vsehoroshonatash", startKathisma: 1, group: "Основной круг" },
  { id: "ioann-zosyadelya", name: "Иоанна", handle: "@ZOsyaDelya", startKathisma: 2, group: "Основной круг" },
  { id: "alexander-radyou", name: "Александра", handle: "@Aleksander_Radyou", startKathisma: 3, group: "Основной круг" },
  { id: "maria-omswams", name: "Марии", handle: "@omswams", startKathisma: 4, group: "Основной круг" },
  { id: "maria-marypiv7", name: "Марии", handle: "@marypiv7", startKathisma: 5, group: "Основной круг" },
  { id: "vladimir-yavno-ne-prizer", name: "Владимира", handle: "@yavno_ne_prizer", startKathisma: 6, group: "Основной круг" },
  { id: "ioanna-nugmanova-d", name: "Иоанны", handle: "@nugmanova_d", startKathisma: 7, group: "Основной круг" },
  { id: "mikhail-micky-plus", name: "Михаила", handle: "@micky_plus", startKathisma: 8, group: "Основной круг" },
  { id: "maria-spellboundpudding", name: "Марии", handle: "@SpellboundPudding", startKathisma: 9, group: "Основной круг" },
  { id: "sergey", name: "Сергея", handle: "", startKathisma: 10, group: "Основной круг" },
  { id: "nikita-sputnik-haa", name: "Никиты", handle: "@sputnik_haa", startKathisma: 11, group: "Основной круг" },
  { id: "darya-dariampi", name: "Дарьи", handle: "@dariampi", startKathisma: 12, group: "Основной круг" },
  { id: "kaleriya-kaleriia-k", name: "Калерии", handle: "@kaleriia_k", startKathisma: 13, group: "Основной круг" },
  { id: "maria-maria-g23", name: "Марии", handle: "@maria_g23", startKathisma: 14, group: "Основной круг" },
  { id: "gleb-gi90m", name: "Глеба", handle: "@gi90m", startKathisma: 15, group: "Основной круг" },
  { id: "veniamin-cauchy333", name: "Вениамина", handle: "@Cauchy333", startKathisma: 16, group: "Основной круг" },
  { id: "matfey-kwakasu", name: "Матфея", handle: "@kwakasu", startKathisma: 17, group: "Основной круг" },
  { id: "elizaveta-elizavetanazirova", name: "Елизаветы", handle: "@ElizavetaNazirova", startKathisma: 18, group: "Основной круг" },
  { id: "alexiy-alekoturtle", name: "Алексия", handle: "@AlekoTurtle", startKathisma: 19, group: "Основной круг" },
  { id: "maria-melisseya", name: "Марии", handle: "@melisseya", startKathisma: 20, group: "Основной круг" },
  { id: "varvara-varvarad", name: "Варвары", handle: "@VarvaraD", startKathisma: 1, group: "Дополнительный круг" },
  { id: "yuriy-slstyu", name: "Юрия", handle: "@slstYu", startKathisma: 2, group: "Дополнительный круг" },
  { id: "maria-marieloskutova", name: "Марии", handle: "@marieloskutova", startKathisma: 3, group: "Дополнительный круг" },
  { id: "mikhail-mrmhlvrn", name: "Михаила", handle: "@mrmhlvrn", startKathisma: 4, group: "Дополнительный круг" }
];

const readerPrayerNames = people.map((person) => person.name);

const prayers = {
  commonBeginning: [
    "Во имя Отца, и Сына, и Святого Духа. Аминь.",
    "Слава Тебе, Боже наш, слава Тебе.",
    "Царю Небесный, Утешителю, Душе истины, Иже везде сый и вся исполняяй, Сокровище благих и жизни Подателю, прииди и вселися в ны, и очисти ны от всякия скверны, и спаси, Блаже, души наша.",
    "Святый Боже, Святый Крепкий, Святый Безсмертный, помилуй нас. (Трижды.)",
    "Слава Отцу, и Сыну, и Святому Духу, и ныне, и присно, и во веки веков. Аминь.",
    "Пресвятая Троице, помилуй нас; Господи, очисти грехи наша; Владыко, прости беззакония наша; Святый, посети и исцели немощи наша, имени Твоего ради.",
    "Господи, помилуй. (Трижды.)",
    "Слава Отцу, и Сыну, и Святому Духу, и ныне, и присно, и во веки веков. Аминь.",
    "Отче наш, Иже еси на небесех! Да святится имя Твое, да приидет Царствие Твое, да будет воля Твоя, яко на небеси и на земли. Хлеб наш насущный даждь нам днесь; и остави нам долги наша, якоже и мы оставляем должником нашим; и не введи нас во искушение, но избави нас от лукаваго.",
    "Господи Иисусе Христе, Сыне Божий, молитв ради Пречистыя Твоея Матере и всех святых, помилуй нас. Аминь.",
    "Приидите, поклонимся Цареви нашему Богу.",
    "Приидите, поклонимся и припадем Христу, Цареви нашему Богу.",
    "Приидите, поклонимся и припадем Самому Христу, Цареви и Богу нашему."
  ],
  slava: [
    "Слава Отцу и Сыну и Святому Духу, и ныне и присно и во веки веков. Аминь",
    "Аллилуия, аллилуия, аллилуия. Слава Тебе, Боже (трижды)",
    "Господи, помилуй (трижды)",
    "Слава Отцу и Сыну и Святому Духу, и ныне и присно и во веки веков. Аминь"
  ],
  livingPrayer: {
    intro: "Молитва о живых",
    text: "Спаси, Господи, и помилуй отца моего духовного (имя), родителей моих (имя), ближних (имя), и вся ближния рода моего, и други, и всех православных христиан. Подай им Твои земные и небесные блага, и не лиши их милостей Твоих, посети их, укрепи, и силою Твоею даруй им здравие и спасение души: ибо Ты Благой и Человеколюбивый. Аминь.",
    namesLabel: "О здравии",
    names: [
      "Иулии", "Анатолия", "Олега", "Андрея", "Алексея", "младенца Саввы", "Виктории", "Людмилы",
      "Алексея", "Владимира", "Натальи", "Марии", "Ирины", "Иларии", "диакона Александра", "Матфея",
      "Наталии", "Антония", "Анастасии", "Елены", "Ирины", "Ирины", "Лии", "Софии", "Всеволода",
      "Марии", "Юлии", "Иулиании", "отрока Михаила", "Сергия", "мл. Луки", "Надежды", "Арсения",
      "Елены", "Наталии", "Ангелины", "Александры", "т. болящего Виктора", "Нила", "Марины", "Олега",
      "Ольги", "тяжело болящей младенца Евы", "Фаниля", "Ильвины",
      "Геннадия",
      "Николая", "Дарии",
      ...readerPrayerNames,
    ]
  },
  departedPrayer: {
    intro: "Молитва об усопших",
    text: [
      "Упокой, Господи, души усопших рабов Твоих: родителей моих (имя), ближних (имя), и вся ближния рода моего, и други, и всех православных христиан, и прости им все их грехи, вольные и невольные, и даруй им Царствие Небесное.",
      "Со святыми упокой, Христе, души рабов Твоих: праотцов, отцов и братьев наших, там где нет ни болезней, ни печалей, ни душевных страданий, но жизнь бесконечная."
    ],
    namesLabel: "Об упокоении",
    names: [
      "Романа", "Надежды", "Валентина", "Федора", "Сергия", "воина Георгия (Егор)", "иерея Алексия",
      "Михаила", "Татьяны", "Виктора", "Софии", "Ольги", "Игоря", "Галины"
    ]
  },
  afterKathisma: [
    "Благословен Ты Господи, воплотившийся от Девы и образ раба принявший для спасения рода человеческого!",
    "Благодарим Тебя за все Твои благодеяния, на нас совершаемые, за добрых людей, что нас окружают, и за трудности, которые Ты нам попускаешь преодолевать для возрастания в любви и всяческой добродетели.",
    "О Всемилостивый Владыко, Господи Иисусе Христе! Приими наше соборное к Тебе моление, с верою и любовью приносимое. Укрепи Твою святую Церковь и раны на Теле Твоем уврачуй.",
    "Наше молодёжное сообщество \"Воскресение\" благослови и умножь, от всяческих раздоров и нестроений избави, в мире и единомыслии всех нас управи.",
    "Всех, за кого мы молимся, благодатью Твоею покрой. Всех, тьмою греха помраченных и от Истины удаленных, светом Евангелия Твоего просвети и в Церковь Твою святую приведи.",
    "Всех от века усопших рабов Твоих со святыми упокой. Ты, Господи, Пастырь есть овцам, всегда пекущийся о нас, о стаде Твоем, и Тебе славу воссылаем со Безначальным Твоим Отцом и Пресвятым Духом, ныне и присно, и во веки веков. Аминь."
  ]
};

const kathismaBlueprint = [
  { id: 1, title: "Кафизма 1", segments: [{ psalmStart: 1, psalmEnd: 3 }, { psalmStart: 4, psalmEnd: 6 }, { psalmStart: 7, psalmEnd: 8 }] },
  { id: 2, title: "Кафизма 2", segments: [{ psalmStart: 9, psalmEnd: 10 }, { psalmStart: 11, psalmEnd: 13 }, { psalmStart: 14, psalmEnd: 16 }] },
  { id: 3, title: "Кафизма 3", segments: [{ psalmStart: 17, psalmEnd: 17 }, { psalmStart: 18, psalmEnd: 20 }, { psalmStart: 21, psalmEnd: 23 }] },
  { id: 4, title: "Кафизма 4", segments: [{ psalmStart: 24, psalmEnd: 26 }, { psalmStart: 27, psalmEnd: 29 }, { psalmStart: 30, psalmEnd: 31 }] },
  { id: 5, title: "Кафизма 5", segments: [{ psalmStart: 32, psalmEnd: 33 }, { psalmStart: 34, psalmEnd: 35 }, { psalmStart: 36, psalmEnd: 36 }] },
  { id: 6, title: "Кафизма 6", segments: [{ psalmStart: 37, psalmEnd: 39 }, { psalmStart: 40, psalmEnd: 42 }, { psalmStart: 43, psalmEnd: 45 }] },
  { id: 7, title: "Кафизма 7", segments: [{ psalmStart: 46, psalmEnd: 48 }, { psalmStart: 49, psalmEnd: 50 }, { psalmStart: 51, psalmEnd: 54 }] },
  { id: 8, title: "Кафизма 8", segments: [{ psalmStart: 55, psalmEnd: 57 }, { psalmStart: 58, psalmEnd: 60 }, { psalmStart: 61, psalmEnd: 63 }] },
  { id: 9, title: "Кафизма 9", segments: [{ psalmStart: 64, psalmEnd: 66 }, { psalmStart: 67, psalmEnd: 67 }, { psalmStart: 68, psalmEnd: 69 }] },
  { id: 10, title: "Кафизма 10", segments: [{ psalmStart: 70, psalmEnd: 71 }, { psalmStart: 72, psalmEnd: 73 }, { psalmStart: 74, psalmEnd: 76 }] },
  { id: 11, title: "Кафизма 11", segments: [{ psalmStart: 77, psalmEnd: 77 }, { psalmStart: 78, psalmEnd: 80 }, { psalmStart: 81, psalmEnd: 84 }] },
  { id: 12, title: "Кафизма 12", segments: [{ psalmStart: 85, psalmEnd: 87 }, { psalmStart: 88, psalmEnd: 88 }, { psalmStart: 89, psalmEnd: 90 }] },
  { id: 13, title: "Кафизма 13", segments: [{ psalmStart: 91, psalmEnd: 93 }, { psalmStart: 94, psalmEnd: 96 }, { psalmStart: 97, psalmEnd: 100 }] },
  { id: 14, title: "Кафизма 14", segments: [{ psalmStart: 101, psalmEnd: 102 }, { psalmStart: 103, psalmEnd: 103 }, { psalmStart: 104, psalmEnd: 104 }] },
  { id: 15, title: "Кафизма 15", segments: [{ psalmStart: 105, psalmEnd: 105 }, { psalmStart: 106, psalmEnd: 106 }, { psalmStart: 107, psalmEnd: 108 }] },
  { id: 16, title: "Кафизма 16", segments: [{ psalmStart: 109, psalmEnd: 111 }, { psalmStart: 112, psalmEnd: 114 }, { psalmStart: 115, psalmEnd: 117 }] },
  { id: 17, title: "Кафизма 17", segments: [{ psalm: 118, verseStart: 1, verseEnd: 72 }, { psalm: 118, verseStart: 73, verseEnd: 131 }, { psalm: 118, verseStart: 132, verseEnd: 176 }] },
  { id: 18, title: "Кафизма 18", segments: [{ psalmStart: 119, psalmEnd: 123 }, { psalmStart: 124, psalmEnd: 128 }, { psalmStart: 129, psalmEnd: 133 }] },
  { id: 19, title: "Кафизма 19", segments: [{ psalmStart: 134, psalmEnd: 136 }, { psalmStart: 137, psalmEnd: 139 }, { psalmStart: 140, psalmEnd: 142 }] },
  { id: 20, title: "Кафизма 20", segments: [{ psalmStart: 143, psalmEnd: 144 }, { psalmStart: 145, psalmEnd: 147 }, { psalmStart: 148, psalmEnd: 150 }] }
];

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function toTitleCase(value) {
  return value.slice(0, 1).toUpperCase() + value.slice(1);
}

function normalizeWhitespace(value) {
  return value.replace(/\r/g, "").replace(/\n+/g, " ").replace(/\s+/g, " ").trim();
}

function normalizeMatchingText(value) {
  return normalizeWhitespace(value)
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .replace(/ѣ/gi, "е")
    .replace(/і/gi, "и")
    .replace(/ѳ/gi, "ф")
    .replace(/ѵ/gi, "и")
    .toLowerCase();
}

function decodeHtml(value) {
  return value
    .replace(/&nbsp;/g, " ")
    .replace(/&quot;/g, "\"")
    .replace(/&laquo;/g, "«")
    .replace(/&raquo;/g, "»")
    .replace(/&ndash;/g, "–")
    .replace(/&mdash;/g, "—")
    .replace(/&rsquo;/g, "’")
    .replace(/&lsquo;/g, "‘")
    .replace(/&hellip;/g, "…")
    .replace(/&amp;/g, "&")
    .replace(/&#(\d+);/g, (_, code) => String.fromCodePoint(Number(code)))
    .replace(/&#x([0-9a-f]+);/gi, (_, code) => String.fromCodePoint(parseInt(code, 16)));
}

function stripTags(value) {
  return normalizeWhitespace(decodeHtml(value.replace(/<[^>]+>/g, " ")));
}

function sanitizeInlineHtml(value) {
  const normalized = decodeHtml(value)
    .replace(/\r/g, "")
    .replace(/\n+/g, " ")
    .replace(/<i>/g, "<em>")
    .replace(/<\/i>/g, "</em>")
    .trim();

  return normalized.replace(/\s+(<\/?em>)/g, "$1").replace(/(<\/?em>)\s+/g, "$1 ");
}

function looksLikePsalmHeadingStart(text) {
  const normalized = normalizeMatchingText(text);
  return PSALM_HEADING_START_MARKERS.some((marker) => normalized.startsWith(marker) || normalized.includes(` ${marker}`));
}

function looksLikePsalmHeadingContinuation(text) {
  const normalized = normalizeMatchingText(text);
  return PSALM_HEADING_CONTINUATIONS.some((marker) => normalized.startsWith(marker));
}

function looksLikeSynodalHeading(text) {
  const normalized = normalizeMatchingText(text);
  return SYNODAL_HEADING_MARKERS.some((marker) => normalized.startsWith(marker));
}

function looksLikeSynodalCommentary(text) {
  const cleaned = String(text).replace(/\s+/g, " ").trim();
  const normalized = normalizeMatchingText(cleaned);
  const numberedFragments = cleaned.match(/\b\d+\s+[А-Яа-яЁёA-Za-z]/gu) || [];

  if (/^\d+\s/u.test(cleaned) || numberedFragments.length >= 2) {
    return true;
  }

  if (/^\[[^\]]+\]\.?\s+\S/u.test(cleaned) && cleaned.length > 40) {
    return true;
  }

  if (!looksLikeSynodalHeading(cleaned) && cleaned.length > 40) {
    return true;
  }

  return SYNODAL_COMMENTARY_MARKERS.some((marker) => normalized.startsWith(marker));
}

function extractSynodalHeading(text) {
  const cleaned = String(text).replace(/\s+/g, " ").trim();

  if (!cleaned) {
    return "";
  }

  if (!looksLikeSynodalCommentary(cleaned) && looksLikeSynodalHeading(cleaned)) {
    return cleaned;
  }

  const prefixMatch = cleaned.match(/^\[[^\]]+\]\.?/u);
  if (prefixMatch) {
    return prefixMatch[0].trim();
  }

  const chunks = cleaned.match(/\[[^\]]+\]\.?|[^.?!]+[.?!]?/gu) || [cleaned];
  let suffix = "";

  for (let index = chunks.length - 1; index >= 0; index -= 1) {
    suffix = `${chunks[index].trim()} ${suffix}`.trim();

    if (suffix.length > 120) {
      break;
    }

    if (looksLikeSynodalHeading(suffix) && !looksLikeSynodalCommentary(suffix)) {
      return suffix;
    }
  }

  return "";
}

function repairKnownParsedPsalm(psalm, langCode) {
  if (langCode === "cs" && psalm.number === 4 && psalm.verses[0]?.number === 3) {
    psalm.heading = "В коне́ц, в пе́снех псало́м Дави́ду.";
    psalm.verses.unshift({
      number: 2,
      text: "Внегда́ призва́ти ми, услы́ша мя Бог пра́вды моея́, в ско́рби распространи́л мя еси́, уще́дри мя и услы́ши моли́тву мою́."
    });
  }

  if (langCode === "cs" && psalm.number === 28 && psalm.verses[0]?.number === 3) {
    psalm.heading = "Псало́м Дави́ду, исхо́да ски́нии.";
    psalm.verses.unshift({
      number: 2,
      text: "Принеси́те Го́сподеви сы́нове Бо́жии, принеси́те Го́сподеви, сы́ны о́вни, принеси́те Го́сподеви сла́ву и честь. Принеси́те Го́сподеви сла́ву и́мени Его́, поклони́теся Го́сподеви во дворе́ святе́м Его́."
    });
  }

  if (langCode === "r" && psalm.number === 4 && psalm.verses[0]?.number === 3) {
    psalm.heading = "Начальнику хора. На струнных орудиях. Псалом Давида.";
    psalm.verses.unshift({
      number: 2,
      text: "Когда я взываю, услышь меня, Боже правды моей! В тесноте Ты давал мне простор. Помилуй меня и услышь молитву мою."
    });
  }

  if (langCode === "r" && SYNODAL_HEADING_REPAIRS[psalm.number]) {
    psalm.heading = SYNODAL_HEADING_REPAIRS[psalm.number];
  }

  if (langCode === "r" && psalm.number === 125 && psalm.verses[0]?.number === 2) {
    psalm.verses.unshift({
      number: 1,
      text: "Когда возвращал Господь плен Сиона, мы были как бы видящие во сне:"
    });
  }

  if (langCode === "r" && psalm.number === 88 && psalm.verses[0]?.text.includes("Учение Ефама Езрахита")) {
    psalm.verses.shift();
  }

  if (langCode === "r" && psalm.number === 139 && psalm.verses[0]?.text.startsWith("Начальнику хора. Псалом Давида")) {
    psalm.verses.shift();
  }

  if (langCode === "r" && psalm.number === 141) {
    for (const verse of psalm.verses) {
      verse.text = verse.text.replace(/^\d+\s+/u, "").trim();
    }
  }

  return psalm;
}

async function fetchWithRetry(url, { mode = "json", retries = 4, timeoutMs = 35000 } = {}) {
  for (let attempt = 1; attempt <= retries; attempt += 1) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const response = await fetch(url, {
        signal: controller.signal,
        headers: {
          "user-agent": "Mozilla/5.0 (compatible; PsalterReaderBuilder/1.0)"
        }
      });

      clearTimeout(timeout);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status} for ${url}`);
      }

      if (mode === "text") {
        return await response.text();
      }

      return await response.json();
    } catch (error) {
      clearTimeout(timeout);

      if (attempt === retries) {
        throw error;
      }

      await sleep(attempt * 600);
    }
  }

  throw new Error(`Unable to fetch ${url}`);
}

async function fetchTextWithCurl(url, retries = 5) {
  for (let attempt = 1; attempt <= retries; attempt += 1) {
    try {
      const { stdout } = await execFileAsync(
        "curl",
        ["-L", "--compressed", "--silent", "--show-error", "--max-time", "60", url],
        { maxBuffer: 16 * 1024 * 1024 }
      );

      if (!stdout || !stdout.trim()) {
        throw new Error(`Пустой ответ от ${url}`);
      }

      return stdout;
    } catch (error) {
      if (attempt === retries) {
        throw error;
      }

      await sleep(attempt * 800);
    }
  }

  throw new Error(`Не удалось загрузить ${url}`);
}

async function mapWithConcurrency(items, concurrency, mapper) {
  const results = new Array(items.length);
  let cursor = 0;

  async function worker() {
    while (cursor < items.length) {
      const currentIndex = cursor;
      cursor += 1;
      results[currentIndex] = await mapper(items[currentIndex], currentIndex);
    }
  }

  await Promise.all(Array.from({ length: concurrency }, () => worker()));
  return results;
}

function cleanupAzbykaVerseHtml(html) {
  return html
    .replace(/<span class="info"[\s\S]*?<\/span>/gi, "")
    .replace(/<span class="icon-check checkbox"><\/span>/gi, "")
    .replace(/<wbr\s*\/?>/gi, "")
    .trim();
}

function parseAzbykaPsalm(html, number, langCode) {
  const title = `Псалом ${number}`;
  const versePattern = new RegExp(
    `<div[\\s\\S]*?data-line="(\\d+)"[\\s\\S]*?class="verse lang-${langCode}[^"]*"[^>]*>([\\s\\S]*?)<span class="icon-check checkbox"><\\/span>[\\s\\S]*?<\\/div>`,
    "gi"
  );

  const verseMatches = [...html.matchAll(versePattern)];
  const verses = [];
  const headingParts = [];

  for (const match of verseMatches) {
    const verseNumber = Number(match[1]);
    const verseHtml = cleanupAzbykaVerseHtml(match[2]);
    const verseText = stripTags(verseHtml);

    if (verseNumber === 0) {
      headingParts.push(verseText);
      continue;
    }

    if (verses.length === 0 && headingParts.length === 0 && looksLikePsalmHeadingStart(verseText)) {
      headingParts.push(verseText);
      continue;
    }

    if (verses.length === 0 && headingParts.length > 0 && looksLikePsalmHeadingContinuation(verseText)) {
      headingParts.push(verseText);
      continue;
    }

    verses.push({
      number: verseNumber,
      text: verseText
    });
  }

  if (verses.length === 0) {
    throw new Error(`Не удалось распарсить Псалом ${number} для языка ${langCode}`);
  }

  return repairKnownParsedPsalm({
    number,
    title,
    heading: langCode === "r" ? extractSynodalHeading(headingParts.join(" ").trim()) : headingParts.join(" ").trim(),
    verses
  }, langCode);
}

async function fetchAzbykaPsalms(langCode) {
  const numbers = Array.from({ length: 150 }, (_, index) => index + 1);
  const psalms = {};

  const entries = await mapWithConcurrency(numbers, 4, async (number) => {
    const html = await fetchTextWithCurl(`${AZBYKA_BASE}?Ps.${number}&${langCode}`);
    return [String(number), parseAzbykaPsalm(html, number, langCode)];
  });

  for (const [key, value] of entries) {
    psalms[key] = value;
  }

  return psalms;
}

function extractZachaloNumber(html) {
  const match = decodeHtml(html).match(/Зач\.\s*(\d+)/i);
  return match ? Number(match[1]) : null;
}

function cleanupMatthewVerseHtml(html) {
  return cleanupAzbykaVerseHtml(html)
    .replace(/\[?\s*<span class="zachala">[\s\S]*?<\/span>\]?\s*/gi, "")
    .replace(/<span class="cuSnos"[\s\S]*?<\/span>/gi, "")
    .trim();
}

function parseAzbykaMatthewChapter(html, chapterNumber, langCode) {
  const versePattern = new RegExp(
    `<div[\\s\\S]*?data-lang="${langCode}"[\\s\\S]*?data-chapter="${chapterNumber}"[\\s\\S]*?data-line="(\\d+)"[\\s\\S]*?data-verse="Mt\\.${chapterNumber}:(\\d+)"[\\s\\S]*?class="verse lang-${langCode}[^"]*"[^>]*>([\\s\\S]*?)<span class="icon-check checkbox"><\\/span>[\\s\\S]*?<\\/div>`,
    "gi"
  );

  const verses = [];

  for (const match of html.matchAll(versePattern)) {
    const verseNumber = Number(match[2]);
    const verseHtml = match[3];
    const zachaloNumber = extractZachaloNumber(verseHtml);
    const verseText = stripTags(cleanupMatthewVerseHtml(verseHtml));

    verses.push({
      chapter: chapterNumber,
      number: verseNumber,
      text: verseText,
      zachaloNumber
    });
  }

  if (verses.length === 0) {
    throw new Error(`Не удалось распарсить Мф.${chapterNumber} для языка ${langCode}`);
  }

  return {
    chapter: chapterNumber,
    verses
  };
}

async function fetchAzbykaMatthewChapters(langCode) {
  const chapters = Array.from({ length: MATTHEW_CHAPTER_COUNT }, (_, index) => index + 1);

  return mapWithConcurrency(chapters, 4, async (chapterNumber) => {
    const html = await fetchTextWithCurl(`${AZBYKA_BASE}?Mt.${chapterNumber}&${langCode}`);
    return parseAzbykaMatthewChapter(html, chapterNumber, langCode);
  });
}

function buildMatthewReference(startVerse, endVerse) {
  if (startVerse.chapter === endVerse.chapter) {
    if (startVerse.number === endVerse.number) {
      return `Мф. ${startVerse.chapter}:${startVerse.number}`;
    }

    return `Мф. ${startVerse.chapter}:${startVerse.number}-${endVerse.number}`;
  }

  return `Мф. ${startVerse.chapter}:${startVerse.number} — ${endVerse.chapter}:${endVerse.number}`;
}

function buildMatthewZachala(chapters) {
  const orderedVerses = chapters.flatMap((chapter) => chapter.verses);
  const zachala = [];
  let current = null;

  for (const verse of orderedVerses) {
    if (verse.zachaloNumber !== null) {
      if (current) {
        zachala.push(current);
      }

      current = {
        number: verse.zachaloNumber,
        verses: []
      };
    }

    if (!current) {
      continue;
    }

    current.verses.push({
      chapter: verse.chapter,
      number: verse.number,
      text: verse.text
    });
  }

  if (current) {
    zachala.push(current);
  }

  return zachala.map((zachalo) => {
    const startVerse = zachalo.verses[0];
    const endVerse = zachalo.verses[zachalo.verses.length - 1];

    return {
      number: zachalo.number,
      reference: buildMatthewReference(startVerse, endVerse),
      verses: zachalo.verses
    };
  });
}

function clonePsalmSegment(psalm, verseStart = null, verseEnd = null) {
  const hasRange = verseStart !== null && verseEnd !== null;
  const verses = hasRange
    ? psalm.verses.filter((verse) => verse.number >= verseStart && verse.number <= verseEnd)
    : psalm.verses;

  return {
    number: psalm.number,
    title: psalm.title,
    heading: psalm.heading,
    subtitle: hasRange ? `Стихи ${verseStart}-${verseEnd}` : "",
    verses
  };
}

function buildKathismas(translatedPsalms) {
  return kathismaBlueprint.map((kathisma) => ({
    id: kathisma.id,
    title: kathisma.title,
    segments: kathisma.segments.map((segment, index) => {
      if (segment.psalm) {
        const psalm = translatedPsalms[String(segment.psalm)];

        return {
          id: `${kathisma.id}-${index + 1}`,
          label: `Слава ${index + 1}`,
          prayerType: index < 2 ? "living" : "departed",
          psalms: [clonePsalmSegment(psalm, segment.verseStart, segment.verseEnd)]
        };
      }

      const psalms = [];

      for (let psalmNumber = segment.psalmStart; psalmNumber <= segment.psalmEnd; psalmNumber += 1) {
        psalms.push(clonePsalmSegment(translatedPsalms[String(psalmNumber)]));
      }

      return {
        id: `${kathisma.id}-${index + 1}`,
        label: `Слава ${index + 1}`,
        prayerType: index < 2 ? "living" : "departed",
        psalms
      };
    })
  }));
}

async function buildData() {
  console.log("Скачиваю синодальный текст...");
  const synodalPsalms = await fetchAzbykaPsalms("r");

  console.log("Скачиваю церковнославянский текст...");
  const churchSlavonicPsalms = await fetchAzbykaPsalms("cs");

  console.log("Скачиваю зачала Евангелия от Матфея...");
  const matthewSynodalChapters = await fetchAzbykaMatthewChapters("r");

  console.log("Собираю кафизмы...");

  return {
    generatedAt: new Date().toISOString(),
    translations: [
      { id: "churchSlavonic", label: "Церковнославянский (гражданский шрифт)" },
      { id: "synodal", label: "Синодальный перевод" }
    ],
    sources: {
      synodal: "https://azbyka.ru/biblia/?Ps.1&r",
      churchSlavonic: "https://azbyka.ru/biblia/?Ps.1&cs",
      matthewSynodal: "https://azbyka.ru/biblia/?Mt.1&r"
    },
    prayers,
    gospelMatthew: {
      translationLabel: "Синодальный перевод",
      cycleStartDate: GOSPEL_CYCLE_START_DATE,
      cycleStartZachalo: GOSPEL_CYCLE_START_ZACHALO,
      zachala: buildMatthewZachala(matthewSynodalChapters)
    },
    kathismas: {
      churchSlavonic: buildKathismas(churchSlavonicPsalms),
      synodal: buildKathismas(synodalPsalms)
    }
  };
}

async function main() {
  await mkdir(rootDir, { recursive: true });
  const data = await buildData();
  const payload = `window.PSALTER_APP_DATA = ${JSON.stringify(data, null, 2)};\n`;
  await writeFile(outputFile, payload, "utf8");
  console.log(`Готово: ${path.relative(rootDir, outputFile)}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
