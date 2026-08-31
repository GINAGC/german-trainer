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
              ["ihr", "vosotros", "euch", "euch", "euch", "euch", "euer", "eure"],
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

      <p style={{ fontSize: 11, fontWeight: 600, color: "#888", letterSpacing: 1, textTransform: "uppercase", margin: "0 0 8px" }}>Adjektivendungen (nach ein / kein / mein…)</p>
      <div style={{ overflowX: "auto", marginBottom: 8 }}>
        <table style={{ borderCollapse: "collapse", fontSize: 11, minWidth: 520 }}>
          <thead>
            <tr>
              <th style={{ ...th, background: "#f5f5f5", color: "#555" }}>Kasus</th>
              <th style={genderTh("der")}>Mask. (der)</th>
              <th style={genderTh("die")}>Fem. (die)</th>
              <th style={genderTh("das")}>Neut. (das)</th>
              <th style={genderTh("plural")}>Plural (die)</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style={rowH}>Nom (definit)</td>
              <td style={genderTd("der")}>der alt<b>e</b></td>
              <td style={genderTd("die")}>die alt<b>e</b></td>
              <td style={genderTd("das")}>das alt<b>e</b></td>
              <td style={genderTd("plural")}>die alt<b>en</b></td>
            </tr>
            <tr>
              <td style={rowH}>Akk (definit)</td>
              <td style={genderTd("der", { fontWeight: 700, background: GENDER.der.bg })}>den alt<b>en</b></td>
              <td style={genderTd("die")}>die alt<b>e</b></td>
              <td style={genderTd("das")}>das alt<b>e</b></td>
              <td style={genderTd("plural")}>die alt<b>en</b></td>
            </tr>
            <tr>
              <td style={rowH}>Dat (definit)</td>
              <td style={genderTd("der", { fontWeight: 700, background: GENDER.der.bg })}>dem alt<b>en</b></td>
              <td style={genderTd("die", { fontWeight: 700, background: GENDER.die.bg })}>der alt<b>en</b></td>
              <td style={genderTd("das", { fontWeight: 700, background: GENDER.das.bg })}>dem alt<b>en</b></td>
              <td style={genderTd("plural", { fontWeight: 700, background: GENDER.plural.bg })}>den alt<b>en</b></td>
            </tr>
            <tr>
              <td style={{ ...rowH, background: "#fafafa", borderTop: "2px solid #ddd" }}>Nom (ein/mein)</td>
              <td style={genderTd("der", { fontWeight: 700, background: GENDER.der.bg })}>ein alt<b>er</b></td>
              <td style={genderTd("die")}>eine alt<b>e</b></td>
              <td style={genderTd("das", { fontWeight: 700, background: GENDER.das.bg })}>ein alt<b>es</b></td>
              <td style={genderTd("plural")}>— alt<b>en</b></td>
            </tr>
            <tr>
              <td style={rowH}>Akk (ein/mein)</td>
              <td style={genderTd("der", { fontWeight: 700, background: GENDER.der.bg })}>einen alt<b>en</b></td>
              <td style={genderTd("die")}>eine alt<b>e</b></td>
              <td style={genderTd("das", { fontWeight: 700, background: GENDER.das.bg })}>ein alt<b>es</b></td>
              <td style={genderTd("plural")}>— alt<b>en</b></td>
            </tr>
            <tr>
              <td style={rowH}>Dat (ein/mein)</td>
              <td style={genderTd("der", { fontWeight: 700, background: GENDER.der.bg })}>einem alt<b>en</b></td>
              <td style={genderTd("die", { fontWeight: 700, background: GENDER.die.bg })}>einer alt<b>en</b></td>
              <td style={genderTd("das", { fontWeight: 700, background: GENDER.das.bg })}>einem alt<b>en</b></td>
              <td style={genderTd("plural", { fontWeight: 700, background: GENDER.plural.bg })}>— alt<b>en</b></td>
            </tr>
          </tbody>
        </table>
      </div>
      <p style={{ fontSize: 11, color: "#aaa", margin: "0 0 8px" }}>Hinterlegte Felder = Form ändert sich. Farben = Genus (Grammatikon-System).</p>
      <p style={{ fontSize: 11, color: "#aaa", margin: "0 0 8px" }}>Faustregel: Nach ein/kein/mein → Adjektiv zeigt das Genus (-er/-e/-es im Nom/Akk Neut). Danach fast immer <b>-en</b>.</p>

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

      <p style={{ fontSize: 11, fontWeight: 600, color: "#888", letterSpacing: 1, textTransform: "uppercase", margin: "0 0 8px" }}>Verben die verwirren — sein / haben / wollen / werden</p>
      <div style={{ overflowX: "auto", marginBottom: 8 }}>
        <table style={{ borderCollapse: "collapse", fontSize: 11, minWidth: 480, width: "100%" }}>
          <thead>
            <tr>
              <th style={{ ...th, background: "#f5f5f5", color: "#555", textAlign: "left" }}>Form</th>
              <th style={th}>Deutsch</th>
              <th style={{ ...th, background: "#fdf4e7", color: "#7a4f00" }}>Español</th>
              <th style={{ ...th, background: "#f5f5f5", color: "#555" }}>Beispiel</th>
            </tr>
          </thead>
          <tbody>
            {[
              ["sein – Präsens", "ich bin", "yo soy / estoy", "Ich bin müde."],
              ["sein – Präteritum", "ich war", "yo era / estuve", "Ich war sehr müde."],
              ["haben – Präsens", "ich habe", "yo tengo", "Ich habe Hunger."],
              ["wollen – Präsens", "ich will", "yo quiero", "Ich will Deutsch lernen."],
              ["wollen – Präteritum", "ich wollte", "yo quería", "Ich wollte spazieren gehen."],
              ["werden – Präsens (ich)", "ich werde", "yo seré / me convierto", "Ich werde es machen."],
              ["werden – Präsens (er/sie)", "er/sie wird", "él/ella será / se convierte", "Er wird Arzt."],
              ["würde – Konjunktiv II", "ich würde", "yo haría / viajaría", "Ich würde gern reisen."],
              ["wurde – Präteritum", "ich wurde", "yo me convertí / fui (pasiva)", "Das Haus wurde verkauft."],
            ].map(([form, de, es, bsp]) => (
              <tr key={form}>
                <td style={rowH}>{form}</td>
                <td style={{ ...tdC, fontWeight: 600, color: "#222" }}>{de}</td>
                <td style={{ ...tdC, color: "#7a4f00", background: "#fdf4e7" }}>{es}</td>
                <td style={{ ...td, fontSize: 11, color: "#666", fontStyle: "italic" }}>{bsp}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p style={{ fontSize: 11, color: "#aaa", margin: "0 0 24px" }}>⚠️ würde (condicional) ≠ wurde (pasado). ¡Una letra, significado totalmente diferente!</p>

      <p style={{ fontSize: 11, fontWeight: 600, color: "#888", letterSpacing: 1, textTransform: "uppercase", margin: "0 0 8px" }}>Zeiten — Tiempos verbales</p>
      <div style={{ overflowX: "auto", marginBottom: 16 }}>
        <table style={{ borderCollapse: "collapse", fontSize: 11, minWidth: 520, width: "100%" }}>
          <thead>
            <tr>
              <th style={{ ...th, background: "#f5f5f5", color: "#555", textAlign: "left" }}>Zeitform</th>
              <th style={th}>Formel</th>
              <th style={{ ...th, background: "#fdf4e7", color: "#7a4f00" }}>Español</th>
              <th style={{ ...th, background: "#f5f5f5", color: "#555" }}>Beispiel</th>
            </tr>
          </thead>
          <tbody>
            {[
              ["Präsens", "Verb (Präsens)", "Presente", "Ich lerne Deutsch.", "Aprendo alemán.", false],
              ["Perfekt", "haben/sein + Partizip II", "Pretérito perfecto (hablado)", "Ich habe Deutsch gelernt.", "He aprendido alemán.", false],
              ["Präteritum", "Verb (Präteritum)", "Pretérito (escrito / sein+haben)", "Ich war müde. · Ich hatte Zeit.", "Estaba cansado. · Tenía tiempo.", false],
              ["Plusquamperfekt", "hatte/war + Partizip II", "Pluscuamperfecto", "Ich hatte gegessen, bevor du kamst.", "Había comido antes de que llegaras.", false],
              ["Futur I", "werden + Infinitiv", "Futuro simple", "Ich werde Deutsch lernen.", "Aprenderé alemán.", false],
              ["Konjunktiv II (Gegenwart)", "würde + Infinitiv", "Condicional presente", "Ich würde gern reisen.", "Me gustaría viajar.", false],
              ["Konjunktiv II (Vergangenheit)", "hätte/wäre + Partizip II", "Condicional pasado", "Ich hätte mehr gelernt.", "Habría aprendido más.", false],
              ["Futur II ⬡", "werden + Partizip II + haben/sein", "Futuro perfecto", "Ich werde es gelernt haben.", "Lo habré aprendido.", true],
              ["Passiv Präsens ⬡", "werden + Partizip II", "Pasiva presente", "Die Tür wird geöffnet.", "La puerta está siendo abierta.", true],
              ["Passiv Präteritum ⬡", "wurde + Partizip II", "Pasiva pasado", "Das Haus wurde verkauft.", "La casa fue vendida.", true],
            ].map(([zeit, formel, es, bsp, bspEs, advanced]) => (
              <tr key={zeit} style={{ opacity: advanced ? 0.55 : 1 }}>
                <td style={{ ...rowH, color: advanced ? "#aaa" : "#444" }}>
                  {zeit.replace(" ⬡", "")}
                  {advanced && <span style={{ fontSize: 9, marginLeft: 4, color: "#bbb" }}>avanzado</span>}
                </td>
                <td style={{ ...td, fontSize: 11 }}>{formel}</td>
                <td style={{ ...td, fontSize: 11, color: "#7a4f00", background: "#fdf4e7" }}>{es}</td>
                <td style={{ ...td, fontSize: 11 }}>
                  <span style={{ color: "#555", fontStyle: "italic" }}>{bsp}</span>
                  <br />
                  <span style={{ color: "#7a4f00", fontSize: 10 }}>{bspEs}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p style={{ fontSize: 11, color: "#aaa", margin: "0 0 8px" }}>⬡ Avanzado — referencia, no es prioritario para B1.</p>

      <p style={{ fontSize: 11, fontWeight: 600, color: "#888", letterSpacing: 1, textTransform: "uppercase", margin: "0 0 8px" }}>Modalverben — Modal verbs — Verbos modales</p>
      <p style={{ fontSize: 11, color: "#aaa", margin: "0 0 8px" }}>Muster: ich = er/sie (keine Endung!) · Plural kehrt zum Infinitiv zurück.</p>
      <div style={{ overflowX: "auto", marginBottom: 8 }}>
        <table style={{ borderCollapse: "collapse", fontSize: 11, minWidth: 520, width: "100%" }}>
          <thead>
            <tr>
              <th style={{ ...th, background: "#f5f5f5", color: "#555", textAlign: "left" }}>Verb</th>
              {["ich", "du", "er/sie", "wir", "ihr", "Sie/sie"].map((p) => (
                <th key={p} style={th}>{p}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {[
              ["wollen", "want / querer", "will", "willst", "will", "wollen", "wollt", "wollen"],
              ["dürfen", "may / poder", "darf", "darfst", "darf", "dürfen", "dürft", "dürfen"],
              ["müssen", "must / tener que", "muss", "musst", "muss", "müssen", "müsst", "müssen"],
              ["können", "can / poder", "kann", "kannst", "kann", "können", "könnt", "können"],
              ["sollen", "should / deber", "soll", "sollst", "soll", "sollen", "sollt", "sollen"],
              ["möchten", "would like / quisiera", "möchte", "möchtest", "möchte", "möchten", "möchtet", "möchten"],
            ].map(([verb, transl, ...forms]) => (
              <tr key={verb}>
                <td style={{ ...rowH, border: "1px solid #e5e5e5" }}>
                  <span style={{ fontWeight: 600 }}>{verb}</span>
                  <br />
                  <span style={{ fontSize: 10, color: "#888", fontWeight: 400 }}>{transl}</span>
                </td>
                {forms.map((f, i) => (
                  <td key={i} style={{ ...tdC, fontWeight: i === 0 || i === 2 ? 700 : 400, color: i === 0 || i === 2 ? "#7F77DD" : "#222" }}>{f}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p style={{ fontSize: 11, color: "#aaa", margin: "0 0 24px" }}>Lila = ich &amp; er/sie sind identisch — kein -t wie bei normalen Verben!</p>
    </div>
  );
}
