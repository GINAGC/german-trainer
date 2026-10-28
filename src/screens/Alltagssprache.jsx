const th = { background: "#f3f0ff", color: "#3c3489", fontWeight: 600, fontSize: 12, padding: "8px 10px", textAlign: "center", border: "1px solid #e0dbfa" };
const td = { fontSize: 12, padding: "6px 8px", border: "1px solid #e5e5e5", verticalAlign: "top", lineHeight: 1.5 };
const rowH = { fontSize: 12, padding: "6px 8px", border: "1px solid #e5e5e5", fontWeight: 600, background: "#fafafa", color: "#444" };
const sectionLabel = { fontSize: 11, fontWeight: 600, color: "#888", letterSpacing: 1, textTransform: "uppercase", margin: "26px 0 8px" };
const lead = { fontSize: 12, color: "#666", lineHeight: 1.55, margin: "0 0 10px" };
const tip = { fontSize: 12, background: "#fafafb", borderLeft: "3px solid #d8d8dd", padding: "9px 12px", margin: "8px 0 0", borderRadius: "0 6px 6px 0", lineHeight: 1.55, color: "#555" };
const es = { color: "#7a4f00" };
const head = (extra) => ({ ...th, background: "#f5f5f5", color: "#555", ...extra });

function Table({ cols, rows, min = 300 }) {
  return (
    <div style={{ overflowX: "auto", marginBottom: 8 }}>
      <table style={{ borderCollapse: "collapse", fontSize: 11, minWidth: min, width: "100%" }}>
        <thead>
          <tr>{cols.map(([label, style], i) => <th key={i} style={head(style)}>{label}</th>)}</tr>
        </thead>
        <tbody>
          {rows.map((r, ri) => (
            <tr key={ri}>
              {r.map((cell, i) => <td key={i} style={i === 0 ? rowH : td}>{cell}</td>)}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function Alltagssprache() {
  return (
    <div style={{ padding: "12px 16px 40px" }}>
      <p data-topic="register" style={{ ...sectionLabel, marginTop: 0 }}>Drei Register</p>
      <p style={lead}>Im Kurs lernst du Standardsprache. Auf der Straße, im Büro und unter Freunden hörst du etwas anderes. Entscheidend ist, <b>wann</b> du welche Form benutzt.</p>
      <Table
        cols={[["Register"], ["Wann?"], ["Beispiel: um Hilfe bitten"]]}
        rows={[
          [<span key="a">Formell<br /><span style={{ ...es, fontWeight: 400, fontSize: 10 }}>formal</span></span>, "Behörde, Bewerbung, Präsentation, E-Mail an Fremde", "Könnten Sie mir bitte kurz helfen?"],
          [<span key="b">Neutral<br /><span style={{ ...es, fontWeight: 400, fontSize: 10 }}>neutro</span></span>, "Kollegen, Smalltalk, Arzt, Nachbarn", "Kannst du mir kurz helfen?"],
          [<span key="c">Umgangssprachlich<br /><span style={{ ...es, fontWeight: 400, fontSize: 10 }}>coloquial</span></span>, "Freunde, Familie, WhatsApp, entspannte Kollegen", "Hilfst du mir mal 'ne Sekunde?"],
        ]}
      />
      <p style={tip}>
        <b>Goldene Regel:</b> Umgangssprache musst du <b>verstehen</b> – aber nicht immer <b>benutzen</b>. Das Ziel für C1: bewusst zwischen den Registern wechseln können.<br />
        <span style={es}>Entender el registro coloquial es obligatorio; usarlo, no siempre.</span>
      </p>

      <p data-topic="verkuerzung" style={sectionLabel}>Verkürzungen beim Sprechen</p>
      <p style={lead}>Muttersprachler „verschlucken“ Laute. Wer die Formen kennt, versteht plötzlich viel mehr – und klingt selbst flüssiger.</p>
      <Table
        cols={[["Standard"], ["Gesprochen"], ["Hinweis", { textAlign: "left" }]]}
        rows={[
          ["ich habe", "ich hab", "überall üblich, auch im Büro"],
          ["es gibt", "es gibt's / gibt's", "Gibt's noch Kaffee?"],
          ["Wie geht es dir?", "Wie geht's dir?", "völlig neutral"],
          ["ein / eine", "'n / 'ne", "Ich hab 'ne Frage."],
          ["nicht", "nich / net", "net = Süddeutschland"],
          ["Hast du …?", "Haste …?", "nur sehr locker"],
          ["Ich weiß es nicht.", "Weiß ich nicht. / Keine Ahnung.", "das Subjekt fällt oft weg"],
          ["so ein", "so'n / so'ne", "So'n Quatsch!"],
          ["Nicht wahr?", "…, ne? / …, oder?", "am Satzende: Zustimmung holen"],
        ]}
      />

      <p data-topic="alltagswoerter" style={sectionLabel}>Standard und Alltag</p>
      <Table
        cols={[["Standard"], ["Alltagssprache"], ["Español", { background: "#fdf4e7", color: "#7a4f00" }]]}
        rows={[
          ["Das ist sehr gut.", "Das ist super / klasse / mega.", "genial, está padrísimo"],
          ["Ich bin müde.", "Ich bin total kaputt / platt.", "estoy hecho/a polvo"],
          ["Ich verstehe das nicht.", "Ich check das nicht. / Ich steh auf dem Schlauch.", "no lo capto"],
          ["Das ist mir egal.", "Ist mir wurscht. / Ist mir Banane.", "me da igual, me vale"],
          ["Das kostet viel Geld.", "Das kostet 'ne Stange Geld.", "cuesta un dineral"],
          ["Ich habe keine Lust.", "Ich hab null Bock.", "no tengo ganas (muy coloq.)"],
          ["Das funktioniert nicht.", "Das klappt nicht. / Das haut nicht hin.", "no funciona, no sale"],
          ["Ich arbeite viel.", "Ich hab viel um die Ohren.", "ando hasta el cuello de trabajo"],
          ["Einverstanden.", "Passt! / Geht klar! / Alles klar!", "va, de acuerdo"],
        ]}
      />

      <p data-topic="satzbau" style={sectionLabel}>Satzbau im gesprochenen Deutsch</p>
      <p style={lead}>Beim Sprechen ist der Satzbau flexibler als in der Grammatik. Diese Muster hörst du jeden Tag:</p>
      <div style={{ display: "grid", gap: 6 }}>
        {[
          ["weil + Hauptsatz", "Ich bin spät dran, weil – der Bus ist ausgefallen."],
          ["Thema nach vorn", "Der neue Chef, der ist echt nett."],
          ["Nachtrag am Ende", "Hab ich dir doch gesagt, das mit dem Schlüssel."],
          ["Pronomen weglassen", "Kenn ich. · Weiß ich nicht. · Mach ich."],
          ["Rückfrage am Satzende", "Du kommst mit, oder?"],
        ].map(([name, bsp]) => (
          <div key={name} style={{ border: "1px solid #e5e5e5", borderRadius: 8, padding: "7px 10px", display: "flex", alignItems: "baseline", gap: 8, flexWrap: "wrap" }}>
            <span style={{ fontSize: 12, fontWeight: 700, color: "#3c3489" }}>{name}</span>
            <span style={{ fontSize: 12, color: "#444", fontStyle: "italic", marginLeft: "auto" }}>{bsp}</span>
          </div>
        ))}
      </div>
      <p style={tip}>
        <b>In Prüfungen</b> (telc, Goethe, TestDaF) sprichst du neutral bis formell. Kurze Formen wie <i>gibt's</i> oder <i>hab</i> sind okay – <i>null Bock</i> oder <i>Haste …?</i> nicht.
      </p>
      <p style={tip}>
        <b>Übung – Register wechseln:</b> Sag jeden Satz in drei Versionen und nimm dich dabei auf.<br />
        <i>Leider habe ich heute keine Zeit.</i> → <i>Ich hab heute leider keine Zeit.</i> → <i>Heute passt's echt nicht, sorry.</i>
      </p>

      <p data-topic="smalltalk" style={sectionLabel}>Smalltalk wie ein Muttersprachler</p>
      <p style={lead}>Smalltalk ist schnell, hat kein Skript – und Pausen machen Angst. Mit einer festen Struktur wird er leicht:</p>
      <div style={{ display: "grid", gap: 6, marginBottom: 10 }}>
        {[
          ["1", "Eröffnen", "Starte mit der Situation, in der ihr gerade seid: Wetter, Wochenende, der Ort."],
          ["2", "Am Laufen halten", "Antwort + Detail + Gegenfrage. Nie nur „Gut.“"],
          ["3", "Thema wählen", "Sichere Themen nutzen, Tabus vermeiden (siehe unten)."],
          ["4", "Elegant beenden", "Einen Grund nennen, etwas Positives sagen, verabschieden."],
        ].map(([n, name, text]) => (
          <div key={n} style={{ border: "1px solid #e5e5e5", borderRadius: 8, padding: "8px 10px", display: "flex", gap: 10, alignItems: "baseline" }}>
            <span style={{ fontSize: 12, fontWeight: 700, color: "#D4537E", width: 14 }}>{n}</span>
            <span style={{ fontSize: 12, color: "#444", lineHeight: 1.5 }}><b>{name}</b> – {text}</span>
          </div>
        ))}
      </div>
      <p style={{ ...tip, marginTop: 0 }}>
        <b>Die Formel in Aktion:</b> „Wie war dein Wochenende?“ – „Richtig schön, danke! Ich war wandern. Und du, hast du etwas Schönes gemacht?“
      </p>
      <Table
        cols={[["Gute Themen", { background: "#e8f5e9", color: "#1b5e20" }], ["Eher vermeiden", { background: "#fdeaea", color: "#a33" }]]}
        rows={[
          ["Wetter, Wochenende, Urlaub", "Gehalt und Geld"],
          ["Essen, Restaurants, Kochen", "Politik und Religion (beim ersten Gespräch)"],
          ["Die Stadt, Ausflüge, Events", "Gewicht, Aussehen, Alter"],
          ["Sport, Hobbys, Serien", "Sehr Privates (Kinderwunsch, Beziehung)"],
          ["Arbeit allgemein, Projekte", "Kritik an Chef oder Kollegen"],
        ]}
      />
      <p style={tip}>
        <b>Kulturtipp:</b> Deutsche Gespräche sind oft kürzer und direkter als in anderen Kulturen. Wenn jemand schnell zum Thema kommt, ist das nicht unhöflich – das ist normal.<br />
        <span style={es}>Aquí se va al grano más rápido; no es descortesía.</span>
      </p>
      <p style={tip}>
        Die passenden Sätze findest du als Chunks in der Kategorie <b>Smalltalk</b> (Sammlung). Zum Üben: Sprechen → 4/3/2 → Thema „Smalltalk“.
      </p>
    </div>
  );
}
