import { useState } from "react";
import genusData from "../data/genus-rules.json";

// Split "die Meinung" into article + stem + highlighted ending, per r.pattern.
function Word({ text, pattern, color, big }) {
  const sp = text.indexOf(" ");
  const art = text.slice(0, sp);
  const noun = text.slice(sp + 1);
  const isSuffix = pattern.startsWith("-");
  const suf = isSuffix ? pattern.slice(1) : null;
  const hit = suf && noun.toLowerCase().endsWith(suf.toLowerCase());
  const stem = hit ? noun.slice(0, noun.length - suf.length) : noun;
  const end = hit ? noun.slice(noun.length - suf.length) : "";
  return (
    <span style={{ fontSize: big ? 17 : 13.5, lineHeight: 1.6 }}>
      <span style={{ color: "#9a9a9a", fontWeight: 400 }}>{art} </span>
      <span style={{ color, fontWeight: big ? 600 : 500 }}>{stem}</span>
      {hit && (
        <span style={{ color, fontWeight: 800, borderBottom: `2px solid ${color}`, paddingBottom: 1 }}>{end}</span>
      )}
    </span>
  );
}

export default function GenusRegeln({ speaking, playAll }) {
  const [open, setOpen] = useState(genusData.groups[0].genus);
  const group = genusData.groups.find((g) => g.genus === open);

  function speakRule(rule, key) {
    const list = [rule.headword, ...rule.examples].map((text) => ({ text }));
    playAll(list, key);
  }

  return (
    <div style={{ padding: "12px 16px 100px" }}>
      <p style={{ fontSize: 11, color: "#aaa", margin: "0 0 12px" }}>
        Artikel an der Endung erkennen · {genusData.source}
      </p>

      <div style={{ display: "flex", gap: 6, marginBottom: 14, overflowX: "auto", paddingBottom: 4 }}>
        {genusData.groups.map((g) => {
          const on = open === g.genus;
          return (
            <button
              key={g.genus}
              onClick={() => setOpen(g.genus)}
              style={{
                cursor: "pointer", whiteSpace: "nowrap", flexShrink: 0,
                border: `1px solid ${on ? g.colors.text : "#e0e0e0"}`,
                background: on ? g.colors.bg : "transparent",
                color: on ? g.colors.text : "#777",
                borderRadius: 20, padding: "6px 14px", fontSize: 13,
                fontWeight: on ? 600 : 400, fontFamily: "inherit",
              }}
            >
              {g.article} <span style={{ opacity: 0.65, fontWeight: 400 }}>· {g.genus}</span>
            </button>
          );
        })}
      </div>

      <div style={{ background: group.colors.bg, borderRadius: 12, padding: "12px 14px", marginBottom: 14 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
          <span style={{ width: 12, height: 12, background: group.colors.text, borderRadius: 2, flexShrink: 0 }} />
          <span style={{ fontSize: 12, fontWeight: 700, color: group.colors.text, letterSpacing: 0.3 }}>
            {group.genus.toUpperCase()}
          </span>
          {group.level && (
            <span style={{ fontSize: 10, color: group.colors.text, opacity: 0.6, border: `1px solid ${group.colors.text}44`, borderRadius: 4, padding: "1px 5px" }}>
              {group.level}
            </span>
          )}
        </div>
        <p style={{ fontSize: 12.5, lineHeight: 1.55, color: group.colors.text, margin: 0, opacity: 0.9 }}>{group.summary}</p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: 10 }}>
        {group.rules.map((r, i) => {
          const key = `${group.genus}-${i}`;
          const isPlaying = speaking === key;
          return (
            <div key={key} style={{ border: "1px solid #ececec", borderRadius: 12, overflow: "hidden", background: "#fff" }}>
              <div style={{ background: "#f6f6f6", padding: "10px 12px 9px", textAlign: "center", position: "relative" }}>
                <button
                  onClick={() => speakRule(r, key)}
                  title="Vorlesen"
                  style={{
                    position: "absolute", top: 8, right: 8, background: isPlaying ? group.colors.bg : "none",
                    border: "none", cursor: "pointer", color: isPlaying ? group.colors.text : "#c4c4c4",
                    fontSize: 12, width: 24, height: 24, borderRadius: "50%", lineHeight: 1,
                  }}
                >
                  {isPlaying ? "⏹" : "▶"}
                </button>
                <div style={{ marginBottom: 7 }}>
                  <Word text={r.headword} pattern={r.pattern} color={group.colors.text} big />
                </div>
                {/* Grammatikon's article→noun square connector */}
                <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 0 }}>
                  <span style={{ width: 9, height: 9, background: "#c9c9c9", flexShrink: 0 }} />
                  <span style={{ width: 26, height: 1, background: "#d5d5d5" }} />
                  <span style={{ width: 15, height: 15, background: group.colors.text, flexShrink: 0 }} />
                </div>
                <p style={{ fontSize: 10.5, color: "#8a8a8a", margin: "7px 0 0", lineHeight: 1.4 }}>
                  {r.label}
                  {r.level && <span style={{ marginLeft: 5, border: "1px solid #d8d8d8", borderRadius: 3, padding: "0 4px", fontSize: 9 }}>{r.level}</span>}
                </p>
              </div>

              <div style={{ padding: "10px 12px 11px" }}>
                {r.examples.map((e, j) => (
                  <div key={j}>
                    <Word text={e} pattern={r.pattern} color={group.colors.text} />
                  </div>
                ))}
                {r.footnote && (
                  <p style={{ fontSize: 10, color: "#b4b4b4", margin: "8px 0 0", fontStyle: "italic" }}>{r.footnote}</p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
