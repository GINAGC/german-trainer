import { useRef, useState } from "react";
import { pill, primaryBtn } from "./sprechenUi";

// Import a private JSON file on this device: file picker or pasted text.
export default function JsonImport({ validate, onImport, accent = "#D4537E", okText }) {
  const [text, setText] = useState("");
  const [msg, setMsg] = useState(null);
  const fileRef = useRef(null);

  function load(raw) {
    try {
      const obj = JSON.parse(raw);
      const err = validate(obj);
      if (err) { setMsg({ ok: false, t: err }); return; }
      onImport(obj);
      setMsg({ ok: true, t: okText ? okText(obj) : "Importiert." });
      setText("");
    } catch {
      setMsg({ ok: false, t: "Das ist keine gültige JSON-Datei." });
    }
  }

  async function onFile(e) {
    const f = e.target.files?.[0];
    if (!f) return;
    load(await f.text());
    e.target.value = "";
  }

  return (
    <div>
      <button onClick={() => fileRef.current?.click()} style={primaryBtn(accent)}>📂 Datei wählen</button>
      <input ref={fileRef} type="file" accept=".json,application/json,text/plain" onChange={onFile} style={{ display: "none" }} />
      <details style={{ marginTop: 12 }}>
        <summary style={{ fontSize: 12, color: "#888", cursor: "pointer" }}>Oder Text einfügen</summary>
        <textarea
          value={text} onChange={(e) => setText(e.target.value)} rows={6} placeholder="JSON hier einfügen …"
          style={{ width: "100%", marginTop: 8, border: "1px solid #ccc", borderRadius: 8, padding: 8, fontSize: 12, fontFamily: "monospace", boxSizing: "border-box" }}
        />
        <button disabled={!text.trim()} onClick={() => load(text)} style={{ ...pill(false), marginTop: 6, opacity: text.trim() ? 1 : 0.4 }}>Importieren</button>
      </details>
      {msg && <p style={{ fontSize: 12.5, margin: "10px 0 0", color: msg.ok ? "#15803d" : "#b91c1c" }}>{msg.t}</p>}
    </div>
  );
}
