import { useEffect, useRef, useState } from "react";

// Web Speech API player. Callers pass already speech-cleaned text (see
// lib/speechText.js) — this hook only owns TTS mechanics and playback state.
export function useSpeech() {
  const [speaking, setSpeaking] = useState(null);
  const [paused, setPaused] = useState(false);
  const [currentChunk, setCurrentChunk] = useState(null);
  const [repeatCount, setRepeatCount] = useState(1);
  const [voice, setVoice] = useState(null);
  // Bumped on every stop/new-playback so in-flight utterance callbacks from a
  // stopped session know to stop recursing instead of speaking the next item.
  // Needed because cancel() fires onerror on the current utterance, and
  // without this guard that handler would just advance to the next one.
  const sessionRef = useRef(0);
  // Gaps between utterances (echo "your turn" silence, pauses between chunks)
  // are plain timers, which speechSynthesis.pause() can't touch. We track the
  // pending one here so pauseResume can freeze and resume it too.
  const timerRef = useRef(null); // { id, fn, remaining, startedAt } | null
  const pausedRef = useRef(false);

  // Voices load asynchronously — getVoices() is often empty on first call
  // (notably in Safari), so we also listen for "voiceschanged".
  useEffect(() => {
    function pick() {
      const all = window.speechSynthesis.getVoices();
      const de = all.filter((v) => v.lang && v.lang.toLowerCase().startsWith("de"));
      if (!de.length) return;
      const score = (v) => {
        const n = (v.name || "").toLowerCase();
        if (n.includes("premium")) return 3;
        if (n.includes("erweitert") || n.includes("enhanced")) return 2;
        return 1;
      };
      const best = [...de].sort((a, b) => score(b) - score(a))[0];
      setVoice((prev) => prev || best);
    }
    pick();
    window.speechSynthesis.addEventListener("voiceschanged", pick);
    return () => window.speechSynthesis.removeEventListener("voiceschanged", pick);
  }, []);

  function clearTimer() {
    if (timerRef.current) clearTimeout(timerRef.current.id);
    timerRef.current = null;
  }

  function fireTimer() {
    const fn = timerRef.current && timerRef.current.fn;
    timerRef.current = null;
    if (fn) fn();
  }

  // Pausable replacement for setTimeout between utterances.
  function wait(fn, ms) {
    clearTimer();
    const t = { id: null, fn, remaining: ms, startedAt: Date.now() };
    timerRef.current = t;
    // Already paused (e.g. iOS ignored pause() and the utterance ended anyway):
    // hold the full delay until resume.
    if (!pausedRef.current) t.id = setTimeout(fireTimer, ms);
  }

  function makeUtterance(text) {
    const utt = new SpeechSynthesisUtterance(text);
    utt.lang = "de-DE";
    utt.rate = 0.9;
    const voices = window.speechSynthesis.getVoices();
    const deVoice = voice || voices.find((v) => v.lang.startsWith("de"));
    if (deVoice) utt.voice = deVoice;
    return utt;
  }

  function speak(id, text, subtitle, details) {
    const session = ++sessionRef.current;
    clearTimer();
    pausedRef.current = false;
    window.speechSynthesis.pause();
    window.speechSynthesis.cancel();
    setPaused(false);
    if (speaking === id) {
      setSpeaking(null);
      setCurrentChunk(null);
      return;
    }
    const utt = makeUtterance(text);
    utt.onend = () => { if (sessionRef.current !== session) return; setSpeaking(null); setCurrentChunk(null); setPaused(false); };
    utt.onerror = () => { if (sessionRef.current !== session) return; setSpeaking(null); setCurrentChunk(null); setPaused(false); };
    setSpeaking(id);
    setCurrentChunk({ text, subtitle, details, idx: null, total: null });
    window.speechSynthesis.speak(utt);
  }

  // list: [{ text, subtitle? }]. id distinguishes concurrent "play a
  // sequence" buttons (e.g. one per Genus-Regeln rule card) from the
  // screen-wide "▶ Alle". subtitle is the translation shown in the floating
  // player, when the caller has one (chunks: en, words: t, rules: none).
  function playAll(list, id = "all") {
    const session = ++sessionRef.current;
    clearTimer();
    pausedRef.current = false;
    window.speechSynthesis.pause();
    window.speechSynthesis.cancel();
    setPaused(false);
    if (speaking === id) {
      setSpeaking(null);
      setCurrentChunk(null);
      return;
    }
    setSpeaking(id);
    let i = 0;
    let rep = 0;
    function next() {
      if (sessionRef.current !== session) return;
      if (i >= list.length) { setSpeaking(null); setCurrentChunk(null); setPaused(false); return; }
      const item = list[i];
      setCurrentChunk({ text: item.text, subtitle: item.subtitle, details: item.details, idx: i + 1, total: list.length, rep: rep + 1, repeatCount });
      const utt = makeUtterance(item.text);
      utt.onend = () => {
        if (sessionRef.current !== session) return;
        rep++;
        if (rep < repeatCount) {
          wait(next, 400);
        } else {
          rep = 0;
          i++;
          wait(next, 700);
        }
      };
      utt.onerror = () => {
        if (sessionRef.current !== session) return;
        rep = 0;
        i++;
        wait(next, 700);
      };
      window.speechSynthesis.speak(utt);
    }
    next();
  }

  // Shadowing: speak an item, then stay silent for roughly as long as it took
  // (times gapFactor) so the learner can repeat it aloud, then move on.
  // list: [{ text, subtitle? }]
  function echoAll(list, gapFactor = 1.5, id = "echo") {
    const session = ++sessionRef.current;
    clearTimer();
    pausedRef.current = false;
    window.speechSynthesis.pause();
    window.speechSynthesis.cancel();
    setPaused(false);
    if (speaking === id) {
      setSpeaking(null);
      setCurrentChunk(null);
      return;
    }
    setSpeaking(id);
    let i = 0;
    function next() {
      if (sessionRef.current !== session) return;
      if (i >= list.length) { setSpeaking(null); setCurrentChunk(null); setPaused(false); return; }
      const item = list[i];
      const base = { text: item.text, subtitle: item.subtitle, details: item.details, idx: i + 1, total: list.length };
      setCurrentChunk({ ...base, phase: "listen" });
      const utt = makeUtterance(item.text);
      let startedAt = Date.now();
      utt.onstart = () => { startedAt = Date.now(); };
      utt.onend = () => {
        if (sessionRef.current !== session) return;
        const gap = Math.min(12000, Math.max(2000, (Date.now() - startedAt) * gapFactor + 800));
        setCurrentChunk({ ...base, phase: "repeat" });
        i++;
        wait(next, gap);
      };
      utt.onerror = () => {
        if (sessionRef.current !== session) return;
        i++;
        wait(next, 700);
      };
      window.speechSynthesis.speak(utt);
    }
    next();
  }

  function stopAll() {
    sessionRef.current++;
    clearTimer();
    pausedRef.current = false;
    window.speechSynthesis.pause();
    window.speechSynthesis.cancel();
    setSpeaking(null);
    setCurrentChunk(null);
    setPaused(false);
  }

  function pauseResume() {
    const t = timerRef.current;
    if (paused) {
      pausedRef.current = false;
      window.speechSynthesis.resume();
      if (t) {
        t.startedAt = Date.now();
        t.id = setTimeout(fireTimer, t.remaining);
      }
      setPaused(false);
    } else {
      pausedRef.current = true;
      window.speechSynthesis.pause();
      if (t) {
        clearTimeout(t.id);
        t.remaining = Math.max(0, t.remaining - (Date.now() - t.startedAt));
      }
      setPaused(true);
    }
  }

  return {
    speaking, paused, currentChunk,
    repeatCount, setRepeatCount,
    speak, playAll, echoAll, stopAll, pauseResume,
  };
}
