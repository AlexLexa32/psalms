import { execFileSync } from "node:child_process";
import { readFileSync, writeFileSync, existsSync, mkdirSync } from "node:fs";
import vm from "node:vm";

const base = "https://azbyka.ru/otechnik/Pavel_Yungerov/psaltir-proroka-davida-v-russkom-perevode-p-jungerova/";
const context = { window: {} };
vm.runInNewContext(readFileSync(new URL("../data.js", import.meta.url), "utf8"), context);
const kathismas = context.window.PSALTER_APP_DATA.kathismas.churchSlavonic;
const cache = "/private/tmp/psalms-yungerov-cache";
mkdirSync(cache, { recursive: true });
const psalms = {};
function clean(html) {
  return html.replace(/<sup\b[^>]*>[\s\S]*?<\/sup>/gi, "").replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/g, " ").replace(/&amp;/g, "&").replace(/&quot;/g, '"')
    .replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(Number(n))).replace(/\s+/g, " ").trim();
}
for (let number = 1; number <= 150; number++) {
  const file = cache + "/" + number + ".html";
  if (!existsSync(file)) writeFileSync(file, execFileSync("curl", ["-sSL", "--fail", "--retry", "2", "--max-time", "40", base + number], { maxBuffer: 5000000 }));
  const html = readFileSync(file, "utf8").split('class="after-text-vignette"')[0].split('<svg class="dummy">')[1];
  if (!html) throw new Error("Missing psalm " + number);
  const paragraphs = [...html.matchAll(/<p class="txt"[^>]*>([\s\S]*?)<\/p>/g)].map(m => clean(m[1]));
  if (paragraphs.length < 2) throw new Error("Empty psalm " + number);
  let heading = paragraphs.shift();
  if ([50, 51, 53, 59].includes(number)) heading += " " + paragraphs.shift();
  psalms[number] = { heading, verses: paragraphs.map((text, i) => ({ number: i + 1, text })) };
  console.log(number + ": " + psalms[number].verses.length);
}
const result = kathismas.map(k => ({ ...k, segments: k.segments.map(s => ({ ...s, psalms: s.psalms.map(p => {
  const source = psalms[p.number];
  const occurrences = kathismas.flatMap(k => k.segments.flatMap(s => s.psalms)).filter(item => item.number === p.number);
  const first = Number(p.verses[0].number);
  const last = Number(p.verses.at(-1).number);
  const verses = occurrences.length > 1 ? source.verses.filter(v => v.number >= first && v.number <= last) : source.verses;
  if (!verses.length) throw new Error("Empty segment " + p.number);
  return { ...p, subtitle: "", heading: source.heading, verses };
}) })) }));
writeFileSync(new URL("../yungerov.js", import.meta.url), "window.PSALTER_APP_DATA.kathismas.yungerov = " + JSON.stringify(result, null, 2) + ";\n");
