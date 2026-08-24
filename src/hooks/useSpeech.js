import { useEffect, useState } from "react";

// Web Speech API player. Callers pass already speech-cleaned text (see
// lib/speechText.js) — this hook only owns TTS mechanics and playback state.
export function useSpeech() {
  const [speaking, setSpeaking] = useState(null);
  const [paused, setPaused] = useState(false);
  const [currentChunk, setCurrentChunk] = useState(null);
  const [repeatCount, setRepeatCount] = useState(1);
  const [voice, setVoice] = useState(null);
  const [voiceList, setVoiceList] = useState([]);

  // Voices load asynchronously — getVoices() is often empty on first call
  // (notably in Safari), so we also listen for "voiceschanged".
  useEffect(() => {
    function pick() {
      const all = window.speechSynthesis.getVoices();
      const de = all.filter((v) => v.lang && v.lang.toLowerCase().startsWith("de"));
      if (!de.length) return;
      setVoiceList(de);
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

  function makeUtterance(text) {
    const utt = new SpeechSynthesisUtterance(text);
    utt.lang = "de-DE";
    utt.rate = 0.9;
    const voices = window.speechSynthesis.getVoices();
    const deVoice = voice || voices.find((v) => v.lang.startsWith("de"));
    if (deVoice) utt.voice = deVoice;
    return utt;
  }

  function speak(id, text) {
    window.speechSynthesis.cancel();
    setPaused(false);
    if (speaking === id) {
      setSpeaking(null);
      setCurrentChunk(null);
      return;
    }
    const utt = makeUtterance(text);
    utt.onend = () => { setSpeaking(null); setCurrentChunk(null); setPaused(false); };
    utt.onerror = () => { setSpeaking(null); setCurrentChunk(null); setPaused(false); };
    setSpeaking(id);
    setCurrentChunk({ text, idx: null, total: null });
    window.speechSynthesis.speak(utt);
  }

  // list: [{ id, text }]
  function playAll(list) {
    window.speechSynthesis.cancel();
    setPaused(false);
    if (speaking === "all") {
      setSpeaking(null);
      setCurrentChunk(null);
      return;
    }
    setSpeaking("all");
    let i = 0;
    let rep = 0;
    function next() {
      if (i >= list.length) { setSpeaking(null); setCurrentChunk(null); setPaused(false); return; }
      const item = list[i];
      setCurrentChunk({ text: item.text, idx: i + 1, total: list.length, rep: rep + 1, repeatCount });
      const utt = makeUtterance(item.text);
      utt.onend = () => {
        rep++;
        if (rep < repeatCount) {
          setTimeout(next, 400);
        } else {
          rep = 0;
          i++;
          setTimeout(next, 700);
        }
      };
      utt.onerror = () => { rep = 0; i++; setTimeout(next, 700); };
      window.speechSynthesis.speak(utt);
    }
    next();
  }

  function stopAll() {
    window.speechSynthesis.cancel();
    setSpeaking(null);
    setCurrentChunk(null);
    setPaused(false);
  }

  function pauseResume() {
    if (paused) {
      window.speechSynthesis.resume();
      setPaused(false);
    } else {
      window.speechSynthesis.pause();
      setPaused(true);
    }
  }

  return {
    speaking, paused, currentChunk,
    repeatCount, setRepeatCount,
    voice, setVoice, voiceList,
    speak, playAll, stopAll, pauseResume,
  };
}
