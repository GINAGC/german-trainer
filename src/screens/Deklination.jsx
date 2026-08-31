import { GENDER } from "../lib/colors";

const th = { background: "#f3f0ff", color: "#3c3489", fontWeight: 600, fontSize: 12, padding: "8px 10px", textAlign: "center", border: "1px solid #e0dbfa" };
const td = { fontSize: 12, padding: "7px 10px", border: "1px solid #e5e5e5", verticalAlign: "top", lineHeight: 1.5 };
const tdC = { ...td, textAlign: "center", fontWeight: 500 };
const rowH = { fontSize: 12, padding: "7px 10px", border: "1px solid #e5e5e5", fontWeight: 600, background: "#fafafa", color: "#444" };
const kasusRow = { fontSize: 11, padding: "6px 9px", border: "1px solid #e5e5e5", fontWeight: 700, background: "#f1f1f4", color: "#55555c", letterSpacing: 0.5, textAlign: "left" };
const sectionLabel = { fontSize: 11, fontWeight: 600, color: "#888", letterSpacing: 1, textTransform: "uppercase", margin: "0 0 8px" };
const tip = { fontSize: 12, background: "#fafafb", borderLeft: "3px solid #d8d8dd", padding: "9px 12px", margin: "8px 0 0", borderRadius: "0 6px 6px 0", lineHeight: 1.55, color: "#555" };
const example = { fontSize: 12.5, margin: "10px 0 0", color: "#444", lineHeight: 1.7 };
const exampleNote = { color: "#aaa", fontSize: 11, marginLeft: 6 };

const genderTh = (g) => ({ ...th, background: GENDER[g].bg, color: GENDER[g].text });
const genderTd = (g, sig) => ({ ...tdC, color: GENDER[g].text, ...(sig ? { fontWeight: 700, background: GENDER[g].bg } : {}) });

export default function Deklination() {
  return (
    <div style={{ padding: "12px 16px 40px" }}>
      <p style={{ fontSize: 11, color: "#aaa", margin: "0 0 20px" }}>
        Farben nach Grammatikon: <span style={{ color: GENDER.der.text, fontWeight: 600 }}>der</span> · <span style={{ color: GENDER.die.text, fontWeight: 600 }}>die</span> · <span style={{ color: GENDER.das.text, fontWeight: 600 }}>das</span> · <span style={{ color: GENDER.plural.text, fontWeight: 600 }}>Plural</span>.
        Hinterlegte Felder = das Adjektiv trägt das Genus-Signal.
      </p>

      {/* 1. Muster */}
      <p style={sectionLabel}>Welches Wort folgt welchem Muster</p>
      <div style={{ overflowX: "auto", marginBottom: 8 }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
          <thead>
            <tr>
              <th style={th}>Muster 1 · der-Wörter</th>
              <th style={th}>Muster 2 · ein-Wörter</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style={{ ...td, textAlign: "left", lineHeight: 1.8 }}>
                der · dies<b>er</b> · jed<b>er</b><br />welch<b>er</b> · manch<b>er</b> · solch<b>er</b><br />all<b>e</b> <span style={{ color: "#aaa" }}>(nur Plural)</span>
              </td>
              <td style={{ ...td, textAlign: "left", lineHeight: 1.8 }}>
                ein · kein<br />mein · dein · sein<br />ihr · unser · euer · Ihr
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <p style={tip}>Alle Wörter einer Spalte werden gleich dekliniert. <i>dieser</i> geht wie <i>der</i>, <i>keiner</i> wie <i>ein</i> — du musst nur zwei Muster lernen, nicht zwölf Wörter.</p>

      {/* 2. Endungen der der-Wörter */}
      <p style={{ ...sectionLabel, marginTop: 28 }}>Endungen der der-Wörter</p>
      <div style={{ overflowX: "auto", marginBottom: 8 }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
          <thead>
            <tr>
              <th style={{ ...th, background: "#f5f5f5", color: "#555" }}>Kasus</th>
              <th style={genderTh("der")}>Mask.</th>
              <th style={genderTh("die")}>Fem.</th>
              <th style={genderTh("das")}>Neut.</th>
              <th style={genderTh("plural")}>Plural</th>
            </tr>
          </thead>
          <tbody>
            <tr><td style={rowH}>Nominativ</td><td style={genderTd("der")}>dies<b>er</b></td><td style={genderTd("die")}>dies<b>e</b></td><td style={genderTd("das")}>dies<b>es</b></td><td style={genderTd("plural")}>dies<b>e</b></td></tr>
            <tr><td style={rowH}>Akkusativ</td><td style={genderTd("der")}>dies<b>en</b></td><td style={genderTd("die")}>dies<b>e</b></td><td style={genderTd("das")}>dies<b>es</b></td><td style={genderTd("plural")}>dies<b>e</b></td></tr>
            <tr><td style={rowH}>Dativ</td><td style={genderTd("der")}>dies<b>em</b></td><td style={genderTd("die")}>dies<b>er</b></td><td style={genderTd("das")}>dies<b>em</b></td><td style={genderTd("plural")}>dies<b>en</b></td></tr>
          </tbody>
        </table>
      </div>
      <p style={tip}>
        Das sind die <b>starken Endungen</b>. <i>der/die/das</i> folgen ihnen fast genau: d<b>er</b>, d<b>en</b>, d<b>em</b>, di<b>e</b> — nur <i>das</i> tanzt aus der Reihe.<br />
        Diese Endungen tauchen unten wieder auf, wenn kein Artikel da ist.
      </p>
      <p style={example}>
        <b>Dieser</b> Hund ist alt. · <b>Welches</b> Buch liest du? <span style={exampleNote}>Nom Mask · Akk Neut</span><br />
        Ich helfe <b>jedem</b> Kind. <span style={exampleNote}>Dat Neut</span>
      </p>

      {/* 3. Adjektivendungen alle drei Muster */}
      <p style={{ ...sectionLabel, marginTop: 28 }}>Adjektivendungen · alle drei Muster</p>
      <div style={{ overflowX: "auto", marginBottom: 8 }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12, minWidth: 460 }}>
          <thead>
            <tr>
              <th style={{ ...th, background: "#f5f5f5", color: "#555" }}>Muster</th>
              <th style={genderTh("der")}>Mask.</th>
              <th style={genderTh("die")}>Fem.</th>
              <th style={genderTh("das")}>Neut.</th>
              <th style={genderTh("plural")}>Plural</th>
            </tr>
          </thead>
          <tbody>
            <tr><td style={kasusRow} colSpan={5}>NOMINATIV</td></tr>
            <tr><td style={rowH}>der-Wörter</td><td style={genderTd("der")}>der alt<b>e</b></td><td style={genderTd("die")}>die alt<b>e</b></td><td style={genderTd("das")}>das alt<b>e</b></td><td style={genderTd("plural")}>die alt<b>en</b></td></tr>
            <tr><td style={rowH}>ein-Wörter</td><td style={genderTd("der", true)}>ein alt<b>er</b></td><td style={genderTd("die")}>eine alt<b>e</b></td><td style={genderTd("das", true)}>ein alt<b>es</b></td><td style={genderTd("plural")}>meine alt<b>en</b></td></tr>
            <tr><td style={rowH}>ohne Artikel</td><td style={genderTd("der", true)}>alt<b>er</b></td><td style={genderTd("die", true)}>alt<b>e</b></td><td style={genderTd("das", true)}>alt<b>es</b></td><td style={genderTd("plural", true)}>alt<b>e</b></td></tr>

            <tr><td style={kasusRow} colSpan={5}>AKKUSATIV</td></tr>
            <tr><td style={rowH}>der-Wörter</td><td style={genderTd("der")}>den alt<b>en</b></td><td style={genderTd("die")}>die alt<b>e</b></td><td style={genderTd("das")}>das alt<b>e</b></td><td style={genderTd("plural")}>die alt<b>en</b></td></tr>
            <tr><td style={rowH}>ein-Wörter</td><td style={genderTd("der")}>einen alt<b>en</b></td><td style={genderTd("die")}>eine alt<b>e</b></td><td style={genderTd("das", true)}>ein alt<b>es</b></td><td style={genderTd("plural")}>meine alt<b>en</b></td></tr>
            <tr><td style={rowH}>ohne Artikel</td><td style={genderTd("der", true)}>alt<b>en</b></td><td style={genderTd("die", true)}>alt<b>e</b></td><td style={genderTd("das", true)}>alt<b>es</b></td><td style={genderTd("plural", true)}>alt<b>e</b></td></tr>

            <tr><td style={kasusRow} colSpan={5}>DATIV</td></tr>
            <tr><td style={rowH}>der-Wörter</td><td style={genderTd("der")}>dem alt<b>en</b></td><td style={genderTd("die")}>der alt<b>en</b></td><td style={genderTd("das")}>dem alt<b>en</b></td><td style={genderTd("plural")}>den alt<b>en</b></td></tr>
            <tr><td style={rowH}>ein-Wörter</td><td style={genderTd("der")}>einem alt<b>en</b></td><td style={genderTd("die")}>einer alt<b>en</b></td><td style={genderTd("das")}>einem alt<b>en</b></td><td style={genderTd("plural")}>meinen alt<b>en</b></td></tr>
            <tr><td style={rowH}>ohne Artikel</td><td style={genderTd("der", true)}>alt<b>em</b></td><td style={genderTd("die", true)}>alt<b>er</b></td><td style={genderTd("das", true)}>alt<b>em</b></td><td style={genderTd("plural", true)}>alt<b>en</b></td></tr>
          </tbody>
        </table>
      </div>
      <p style={tip}>
        <b>Ein Prinzip für alle drei Zeilen:</b> das Genus-Signal wird <u>genau einmal</u> gezeigt.<br />
        · Der Artikel zeigt es schon → Adjektiv bekommt nur <b>-e</b> oder <b>-en</b>.<br />
        · Der Artikel hat keine Endung (<span style={{ color: "#aaa" }}>ein</span> / <span style={{ color: "#aaa" }}>kein</span> im Nom Mask und Nom + Akk Neut) → das Adjektiv springt ein.<br />
        · Gar kein Artikel → das Adjektiv übernimmt die ganze Endungsreihe von oben (dies<b>er</b> → alt<b>er</b>).<br />
        Dativ Plural: das Nomen bekommt zusätzlich ein <b>-n</b>. <i>ein</i> hat keinen Plural.
      </p>
      <p style={example}>
        <b>Der alte Hund</b> schläft. · <b>Ein alter Hund</b> schläft. <span style={exampleNote}>Nom Mask — der Unterschied in einer Zeile</span><br />
        Ich sehe <b>einen alten Hund</b> und trinke <b>kalten Kaffee</b>. <span style={exampleNote}>Akk Mask, mit und ohne Artikel</span><br />
        Sie spielt mit <b>den alten Kindern</b>. <span style={exampleNote}>Dat Plural — Nomen mit -n</span>
      </p>

      {/* 4. Possessiv */}
      <p style={{ ...sectionLabel, marginTop: 28 }}>Possessiv · Artikel und Pronomen</p>
      <div style={{ overflowX: "auto", marginBottom: 8 }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
          <thead>
            <tr>
              <th style={{ ...th, background: "#f5f5f5", color: "#555" }}></th>
              <th style={genderTh("der")}>Mask.</th>
              <th style={genderTh("die")}>Fem.</th>
              <th style={genderTh("das")}>Neut.</th>
              <th style={genderTh("plural")}>Plural</th>
            </tr>
          </thead>
          <tbody>
            <tr><td style={rowH}>Artikel Nom</td><td style={genderTd("der")}>mein Hund</td><td style={genderTd("die")}>mein<b>e</b> Katze</td><td style={genderTd("das")}>mein Buch</td><td style={genderTd("plural")}>mein<b>e</b> Bücher</td></tr>
            <tr><td style={rowH}>Pronomen Nom</td><td style={genderTd("der", true)}>mein<b>er</b></td><td style={genderTd("die")}>mein<b>e</b></td><td style={genderTd("das", true)}>mein<b>s</b></td><td style={genderTd("plural")}>mein<b>e</b></td></tr>
            <tr><td style={rowH}>Pronomen Akk</td><td style={genderTd("der", true)}>mein<b>en</b></td><td style={genderTd("die")}>mein<b>e</b></td><td style={genderTd("das", true)}>mein<b>s</b></td><td style={genderTd("plural")}>mein<b>e</b></td></tr>
            <tr><td style={rowH}>Pronomen Dat</td><td style={genderTd("der", true)}>mein<b>em</b></td><td style={genderTd("die", true)}>mein<b>er</b></td><td style={genderTd("das", true)}>mein<b>em</b></td><td style={genderTd("plural", true)}>mein<b>en</b></td></tr>
          </tbody>
        </table>
      </div>
      <p style={tip}>Steht ein Nomen direkt dahinter, ist es ein <b>Artikel</b>. Steht es allein, ist es ein <b>Pronomen</b> — und bekommt genau die Endung, die dem Artikel gefehlt hat: mein → mein<b>er</b>, mein<b>s</b>. Dasselbe Prinzip wie oben.</p>
      <p style={example}>
        <b>Mein Buch</b> ist dieses hier. <span style={exampleNote}>Artikel — Nomen folgt</span><br />
        <b>Meins</b> ist dieses hier. <span style={exampleNote}>Pronomen — steht allein</span><br />
        Ich fahre mit <b>meinem</b>. <span style={exampleNote}>Dat Mask</span>
      </p>
    </div>
  );
}
