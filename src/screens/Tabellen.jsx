import { GENDER, CASE } from "../lib/colors";

const th = { background: "#f3f0ff", color: "#3c3489", fontWeight: 600, fontSize: 12, padding: "8px 10px", textAlign: "center", border: "1px solid #e0dbfa" };
const td = { fontSize: 12, padding: "7px 10px", border: "1px solid #e5e5e5", verticalAlign: "top", lineHeight: 1.5 };
const tdC = { ...td, textAlign: "center", fontWeight: 500 };
const thAkk = { ...th, background: CASE.Akk.bg, color: CASE.Akk.text };
const thDat = { ...th, background: CASE.Dat.bg, color: CASE.Dat.text };
const rowH = { fontSize: 12, padding: "7px 10px", border: "1px solid #e5e5e5", fontWeight: 600, background: "#fafafa", color: "#444" };

const genderTh = (g) => ({ ...th, background: GENDER[g].bg, color: GENDER[g].text });
const genderTd = (g, extra) => ({ ...tdC, color: GENDER[g].text, ...extra });

export default function Tabellen() {
  return (
    <div style={{ padding: "12px 16px 40px" }}>
      <p style={{ fontSize: 11, fontWeight: 600, color: "#888", letterSpacing: 1, textTransform: "uppercase", margin: "0 0 8px" }}>Artikel nach Kasus</p>
      <div style={{ overflowX: "auto", marginBottom: 8 }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
          <thead>
            <tr>
              <th style={{ ...th, background: "#f5f5f5", color: "#555" }}></th>
              <th style={genderTh("der")}>Maskulin</th>
              <th style={genderTh("die")}>Feminin</th>
              <th style={genderTh("das")}>Neutrum</th>
            </tr>
          </thead>
          <tbody>
            <tr><td style={rowH}>Nominativ</td><td style={genderTd("der")}>der</td><td style={genderTd("die")}>die</td><td style={genderTd("das")}>das</td></tr>
            <tr><td style={rowH}>Akkusativ</td><td style={genderTd("der", { fontWeight: 700, background: GENDER.der.bg })}>den</td><td style={genderTd("die")}>die</td><td style={genderTd("das")}>das</td></tr>
            <tr><td style={rowH}>Dativ</td><td style={genderTd("der", { fontWeight: 700, background: GENDER.der.bg })}>dem</td><td style={genderTd("die", { fontWeight: 700, background: GENDER.die.bg })}>der</td><td style={genderTd("das", { fontWeight: 700, background: GENDER.das.bg })}>dem</td></tr>
          </tbody>
        </table>
      </div>
      <p style={{ fontSize: 11, color: "#aaa", margin: "0 0 24px" }}>
        Farben nach Grammatikon: <span style={{ color: GENDER.der.text, fontWeight: 600 }}>der</span> · <span style={{ color: GENDER.die.text, fontWeight: 600 }}>die</span> · <span style={{ color: GENDER.das.text, fontWeight: 600 }}>das</span> · <span style={{ color: GENDER.plural.text, fontWeight: 600 }}>Plural</span>. Hinterlegte Felder = geänderte Form.
      </p>

      <p style={{ fontSize: 11, fontWeight: 600, color: "#888", letterSpacing: 1, textTransform: "uppercase", margin: "0 0 8px" }}>Personalpronomen</p>
      <div style={{ overflowX: "auto", marginBottom: 8 }}>
        <table style={{ borderCollapse: "collapse", fontSize: 11, minWidth: 480 }}>
          <thead>
            <tr>
              <th style={{ ...th, background: "#f5f5f5", color: "#555", textAlign: "left" }}></th>
              <th style={thAkk} colSpan={2}>Personalpronomen</th>
              <th style={thDat} colSpan={2}>Reflexiv</th>
              <th style={{ ...th, background: "#eeedfe", color: "#3c3489" }} colSpan={2}>Possessivartikel</th>
            </tr>
            <tr>
              <th style={{ ...rowH, border: "1px solid #e5e5e5" }}></th>
              <th style={thAkk}>Akk</th>
              <th style={thAkk}>Dat</th>
              <th style={thDat}>Akk</th>
              <th style={thDat}>Dat</th>
              <th style={{ ...th, background: "#eeedfe", color: "#3c3489" }}>M/N</th>
              <th style={{ ...th, background: "#eeedfe", color: "#3c3489" }}>F/PL</th>
            </tr>
          </thead>
          <tbody>
            {[
              ["ich", "yo", "mich", "mir", "mich", "mir", "mein", "meine"],
              ["du", "tú", "dich", "dir", "dich", "dir", "dein", "deine"],
              ["er", "él", "ihn", "ihm", "sich", "sich", "sein", "seine"],
              ["es", "ello", "es", "ihm", "sich", "sich", "sein", "seine"],
              ["sie", "ella", "sie", "ihr", "sich", "sich", "ihr", "ihre"],
              ["wir", "nosotros", "uns", "uns", "uns", "uns", "unser", "unsere"],
              ["ihr", "ustedes", "euch", "euch", "euch", "euch", "euer", "eure"],
              ["Sie/sie", "usted(es) / ellos", "sie/Sie", "ihnen", "sich", "sich", "ihr", "ihre"],
            ].map(([sub, es, ...rest]) => (
              <tr key={sub}>
                <td style={{ ...rowH, border: "1px solid #e5e5e5" }}>
                  {sub}
                  <br />
                  <span style={{ fontSize: 10, color: "#888", fontWeight: 400 }}>{es}</span>
                </td>
                {rest.map((v, i) => <td key={i} style={tdC}>{v}</td>)}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p style={{ fontSize: 11, color: "#aaa", margin: "0 0 24px" }}>Tipp: Sie/sie (formal/plural) teilen viele Formen.</p>

      <p style={{ fontSize: 11, fontWeight: 600, color: "#888", letterSpacing: 1, textTransform: "uppercase", margin: "0 0 8px" }}>Akkusativ vs. Dativ</p>
      <div style={{ overflowX: "auto", marginBottom: 16 }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 11, minWidth: 480 }}>
          <thead>
            <tr>
              <th style={{ ...th, background: "#f5f5f5", color: "#555", width: 90 }}></th>
              <th style={thAkk}>Akkusativ · Wohin? / Wen?</th>
              <th style={thDat}>Dativ · Wo? / Wem?</th>
            </tr>
          </thead>
          <tbody>
            <tr><td style={rowH}>Frage</td><td style={td}><b>Wohin?</b> (Bewegung)<br /><b>Wen/Was?</b> (Objekt)</td><td style={td}><b>Wo?</b> (Position)<br /><b>Wem?</b> (indir. Objekt)</td></tr>
            <tr><td style={rowH}>Beispiel</td><td style={td}>Ich gehe <b>in die Stadt.</b><br />Ich kaufe <b>den Kaffee.</b></td><td style={td}>Ich bin <b>in der Stadt.</b><br />Ich gebe <b>dem Mann</b> das Buch.</td></tr>
            <tr><td style={rowH}>Immer Akk</td><td style={td} colSpan={2}>bis, durch, entlang, für, gegen, ohne, um</td></tr>
            <tr><td style={rowH}>Immer Dat</td><td style={td} colSpan={2}>ab, aus, bei, mit, nach, von, seit, zu, gegenüber</td></tr>
            <tr><td style={rowH}>Wechselpräp.</td><td style={td} colSpan={2}>in, auf, an, hinter, neben, über, unter, vor, zwischen<br /><span style={{ color: CASE.Akk.text }}>→ wohin? = Akk.</span> · <span style={{ color: CASE.Dat.text }}>wo? = Dat.</span></td></tr>
            <tr><td style={rowH}>Personen</td><td style={td}><b>zu + Dat:</b> Ich gehe <b>zum</b> Arzt.</td><td style={td}><b>bei + Dat:</b> Ich bin <b>beim</b> Arzt.</td></tr>
            <tr><td style={rowH}>Länder</td><td style={td}><b>nach</b> (kein Artikel): nach München</td><td style={td}><b>in + Dat:</b> in München</td></tr>
            <tr><td style={rowH}>Gebäude</td><td style={td}><b>in + Akk:</b> ins Kino</td><td style={td}><b>in + Dat:</b> im Kino</td></tr>
            <tr><td style={rowH}>Meer/See</td><td style={td}><b>an + Akk:</b> ans Meer</td><td style={td}><b>an + Dat:</b> am Meer</td></tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
