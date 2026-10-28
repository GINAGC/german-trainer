import { useCallback, useEffect, useMemo, useState } from "react";
import categories from "../data/categories.json";
import { loadChunkUses, saveChunkUses } from "../lib/storage";
import { rankRelated, subTopic } from "../lib/related";
import { GRAMMAR_TOPICS, VERB_TOPICS, dayNumber } from "../lib/practiceTopics";

export const USE_TARGET = 5;
export const SET_SIZES = [10, 15, 20];
const KEY = "german_daily_practice_v1";
const NEWEST_POOL = 40;
const CAT_LABEL = Object.fromEntries(categories.map((c) => [c.id, c.label]));
// Not coherent topics (grab-bags with their own place in the app); they still show up in "Gemischt".
const NO_TOPIC = new Set(["all", "grammar", "aussprache", "verben", "nvv", "umgang"]);
export const MIX = "mix";

const dateKey = (d = new Date()) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

// Whole sentences with a translation that work in every drill.
const drillable = (c) => !c.mastered && c.cat !== "grammar" && !!c.en && !c.de.includes(" / ") && !/→| vs\. /.test(c.de);

function sample(arr, n) {
  const a = [...arr];
  const out = [];
  while (a.length && out.length < n) out.push(a.splice(Math.floor(Math.random() * a.length), 1)[0]);
  return out;
}

function eligibleTopics(chunks) {
  const counts = {};
  for (const c of chunks) if (drillable(c)) counts[c.cat] = (counts[c.cat] || 0) + 1;
  return categories
    .filter((c) => !NO_TOPIC.has(c.id) && (counts[c.id] || 0) >= 10)
    .map((c) => ({ id: c.id, label: c.label, n: counts[c.id] }));
}

// The 3 chunks of the day: one fresh addition plus its two closest relatives
// in the topic, so the day's set hangs together.
function pickIds3(chunks, topic, uses) {
  const inTopic = chunks.filter((c) => drillable(c) && (topic === MIX || c.cat === topic));
  const fresh = inTopic.filter((c) => (uses[c.id] || 0) < USE_TARGET);
  const pool = fresh.length >= 3 ? fresh : inTopic;
  const newest = [...pool].sort((a, b) => Number(b.id) - Number(a.id)).slice(0, NEWEST_POOL);
  const [seed] = sample(newest, 1);
  if (!seed) return [];
  const rest = topic === MIX
    ? sample(pool.filter((c) => c !== seed), 2)
    : rankRelated([seed], pool.filter((c) => c !== seed), 1.5).slice(0, 2);
  return [seed, ...rest].map((c) => c.id);
}

// The practice set: the 3 daily chunks plus the closest relatives from the topic.
function buildSet(chunks, topic, ids3, size) {
  const by = new Map(chunks.map((c) => [c.id, c]));
  const base = ids3.map((id) => by.get(id)).filter(Boolean);
  const baseIds = new Set(base.map((c) => c.id));
  const pool = chunks.filter((c) => drillable(c) && !baseIds.has(c.id));
  const need = Math.max(0, size - base.length);
  let extra;
  if (topic === MIX) {
    extra = sample(pool, need);
  } else {
    extra = rankRelated(base, pool.filter((c) => c.cat === topic)).slice(0, need);
    if (extra.length < need) extra = extra.concat(sample(pool.filter((c) => !extra.includes(c)), need - extra.length));
  }
  return [...base, ...extra].map((c) => c.id);
}

function fresh(chunks, uses, topic, size) {
  const ids3 = pickIds3(chunks, topic, uses);
  return { ids3, setIds: buildSet(chunks, topic, ids3, size), used: [], steps: {}, gDone: false, vDone: false, gOff: 0, vOff: 0 };
}

function newDay(chunks, uses, size) {
  const el = eligibleTopics(chunks);
  const topic = el.length ? el[dayNumber() % el.length].id : MIX;
  return { date: dateKey(), topic, size, ...fresh(chunks, uses, topic, size) };
}

function load() {
  try { return JSON.parse(localStorage.getItem(KEY)); } catch { return null; }
}

// "Meine tägliche Übung": the day's topic, its 3 chunks to memorise, the set
// for Echo / Übersetzen / Sprechen, and one grammar and one verb topic.
export function useDailyPractice(chunks) {
  const [uses, setUses] = useState(() => loadChunkUses());
  const [day, setDay] = useState(() => {
    const saved = load();
    const u = loadChunkUses();
    if (saved && saved.date === dateKey() && Array.isArray(saved.setIds) && saved.setIds.length) return saved;
    return newDay(chunks, u, saved?.size || SET_SIZES[0]);
  });

  useEffect(() => {
    try { localStorage.setItem(KEY, JSON.stringify(day)); } catch { /* storage unavailable */ }
  }, [day]);

  // The app stayed open past midnight.
  useEffect(() => {
    function check() {
      setDay((d) => (d.date === dateKey() ? d : newDay(chunks, uses, d.size)));
    }
    document.addEventListener("visibilitychange", check);
    return () => document.removeEventListener("visibilitychange", check);
  }, [chunks, uses]);

  const byId = useMemo(() => new Map(chunks.map((c) => [c.id, c])), [chunks]);
  const topics = useMemo(() => eligibleTopics(chunks), [chunks]);
  const items = day.ids3.map((id) => byId.get(id)).filter(Boolean);
  const set = day.setIds.map((id) => byId.get(id)).filter(Boolean);
  const topicLabel = day.topic === MIX ? "Gemischt" : CAT_LABEL[day.topic] || day.topic;
  const sub = useMemo(() => subTopic(set), [set]);

  const gram = GRAMMAR_TOPICS[(dayNumber() + day.gOff) % GRAMMAR_TOPICS.length];
  const verb = VERB_TOPICS[(dayNumber() + day.vOff) % VERB_TOPICS.length];

  const toggleUsed = useCallback((id) => {
    const wasUsed = day.used.includes(id);
    setDay((d) => ({ ...d, used: wasUsed ? d.used.filter((x) => x !== id) : [...d.used, id] }));
    setUses((prev) => {
      const n = Math.max(0, (prev[id] || 0) + (wasUsed ? -1 : 1));
      const next = { ...prev, [id]: n };
      saveChunkUses(next);
      return next;
    });
  }, [day.used]);

  const setTopic = useCallback((topic) => {
    setDay((d) => ({ ...d, topic, ...fresh(chunks, uses, topic, d.size), steps: {}, gDone: d.gDone, vDone: d.vDone, gOff: d.gOff, vOff: d.vOff }));
  }, [chunks, uses]);

  const newSet = useCallback(() => {
    setDay((d) => ({ ...d, ...fresh(chunks, uses, d.topic, d.size), steps: {}, gDone: d.gDone, vDone: d.vDone, gOff: d.gOff, vOff: d.vOff }));
  }, [chunks, uses]);

  // Same 3 chunks, bigger or smaller set around them.
  const setSize = useCallback((size) => {
    setDay((d) => ({ ...d, size, setIds: buildSet(chunks, d.topic, d.ids3, size), steps: {} }));
  }, [chunks]);

  const markStep = useCallback((step) => setDay((d) => (d.steps[step] ? d : { ...d, steps: { ...d.steps, [step]: true } })), []);
  const toggleG = useCallback(() => setDay((d) => ({ ...d, gDone: !d.gDone })), []);
  const toggleV = useCallback(() => setDay((d) => ({ ...d, vDone: !d.vDone })), []);
  const nextGram = useCallback(() => setDay((d) => ({ ...d, gOff: d.gOff + 1, gDone: false })), []);
  const nextVerb = useCallback(() => setDay((d) => ({ ...d, vOff: d.vOff + 1, vDone: false })), []);

  return {
    topic: day.topic, topicLabel, sub, topics, size: day.size,
    items, set, used: new Set(day.used), uses, steps: day.steps,
    gram, verb, gDone: day.gDone, vDone: day.vDone,
    toggleUsed, setTopic, newSet, setSize, markStep, toggleG, toggleV, nextGram, nextVerb,
  };
}
