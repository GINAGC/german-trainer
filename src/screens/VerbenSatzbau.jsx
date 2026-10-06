import { GENDER } from "../lib/colors";

const th = { background: "#f3f0ff", color: "#3c3489", fontWeight: 600, fontSize: 12, padding: "8px 10px", textAlign: "center", border: "1px solid #e0dbfa" };
const td = { fontSize: 12, padding: "7px 10px", border: "1px solid #e5e5e5", verticalAlign: "top", lineHeight: 1.5 };
const tdC = { ...td, textAlign: "center", fontWeight: 500 };
const rowH = { fontSize: 12, padding: "7px 10px", border: "1px solid #e5e5e5", fontWeight: 600, background: "#fafafa", color: "#444" };
const sectionLabel = { fontSize: 11, fontWeight: 600, color: "#888", letterSpacing: 1, textTransform: "uppercase", margin: "0 0 8px" };
const tip = { fontSize: 12, background: "#fafafb", borderLeft: "3px solid #d8d8dd", padding: "9px 12px", margin: "8px 0 0", borderRadius: "0 6px 6px 0", lineHeight: 1.55, color: "#555" };

const genderTh = (g) => ({ ...th, background: GENDER[g].bg, color: GENDER[g].text });
const genderTd = (g, extra) => ({ ...tdC, color: GENDER[g].text, ...extra });

export default function VerbenSatzbau() {
  return (
    <div style={{ padding: "12px 16px 40px" }}>
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

      <p style={{ fontSize: 11, fontWeight: 600, color: "#888", letterSpacing: 1, textTransform: "uppercase", margin: "0 0 8px" }}>Modalpartikeln</p>
      <p style={{ fontSize: 12, color: "#666", lineHeight: 1.55, margin: "0 0 10px" }}>
        Kleine Wörter ohne eigene Bedeutung, die den Ton eines Satzes verändern. Ohne sie klingt gesprochenes Deutsch hart und wie aus dem Lehrbuch.
      </p>
      <div style={{ display: "grid", gap: 6, marginBottom: 8 }}>
        {[
          ["denn", "macht eine Frage freundlich", "Was machst du denn hier?"],
          ["ja", "drückt Überraschung aus", "Das ist ja eine Überraschung!"],
          ["mal", "macht Aufforderungen weich", "Meld dich mal! · Sag mal …"],
          ["doch", "freundlicher Vorschlag", "Schreib mir doch!"],
          ["eigentlich", "beiläufige Frage", "Was macht eigentlich Anna?"],
        ].map(([word, fn, bsp]) => (
          <div key={word} style={{ border: "1px solid #e5e5e5", borderRadius: 8, padding: "7px 10px", display: "flex", alignItems: "baseline", gap: 8, flexWrap: "wrap" }}>
            <span style={{ fontSize: 13, fontWeight: 700, color: "#3c3489" }}>{word}</span>
            <span style={{ fontSize: 11, color: "#999" }}>{fn}</span>
            <span style={{ fontSize: 12, color: "#444", fontStyle: "italic", marginLeft: "auto" }}>{bsp}</span>
          </div>
        ))}
      </div>
      <p style={{ fontSize: 12, background: "#fafafb", borderLeft: "3px solid #d8d8dd", padding: "9px 12px", margin: "8px 0 24px", borderRadius: "0 6px 6px 0", lineHeight: 1.55, color: "#555" }}>
        <b>Übung:</b> Sprich jeden Satz einmal ohne und einmal mit Partikel. Du hörst den Unterschied sofort.
      </p>

      <p style={{ ...sectionLabel, marginTop: 8 }}>Konzessivsätze — obwohl / trotzdem / trotz</p>
      <p style={{ fontSize: 12, color: "#666", lineHeight: 1.55, margin: "0 0 10px" }}>
        Konzessivsätze drücken etwas Unerwartetes aus: <i>Es ist kalt, trotzdem ziehe ich keine Jacke an.</i><br />
        <span style={{ color: "#7a4f00" }}>Algo inesperado: «hace frío, aun así no me pongo chaqueta».</span>
      </p>
      <div style={{ overflowX: "auto", marginBottom: 8 }}>
        <table style={{ borderCollapse: "collapse", fontSize: 11, minWidth: 560, width: "100%" }}>
          <thead>
            <tr>
              <th style={{ ...th, background: "#f5f5f5", color: "#555", textAlign: "left" }}>Wort</th>
              <th style={th}>Wortart</th>
              <th style={{ ...th, background: "#fdf4e7", color: "#7a4f00" }}>Español</th>
              <th style={th}>Verb</th>
              <th style={{ ...th, background: "#f5f5f5", color: "#555" }}>Beispiel</th>
            </tr>
          </thead>
          <tbody>
            {[
              ["obwohl / obgleich", "Konjunktion", "aunque, a pesar de que", "am Ende des Nebensatzes", "Obwohl Peter müde ist, geht er nicht ins Bett."],
              ["trotzdem / dennoch", "Adverb", "aun así, sin embargo", "Position 2 (direkt nach trotzdem)", "Das Wetter ist schön. Trotzdem bleibt Carola zu Hause."],
              ["trotz", "Präposition + Genitiv", "a pesar de", "– (kein Nebensatz)", "Trotz des Regens nimmt Sabine keinen Schirm mit."],
            ].map(([w, art, es, verb, bsp]) => (
              <tr key={w}>
                <td style={{ ...rowH, color: "#3c3489" }}>{w}</td>
                <td style={{ ...td, textAlign: "center" }}>{art}</td>
                <td style={{ ...td, color: "#7a4f00", background: "#fdf4e7" }}>{es}</td>
                <td style={{ ...td, textAlign: "center" }}>{verb}</td>
                <td style={{ ...td, fontStyle: "italic", color: "#555" }}>{bsp}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p style={tip}>
        <b>obwohl</b> zuerst → der Hauptsatz beginnt mit dem Verb: <i>Obwohl Peter müde ist, geht er …</i> (Verb, Komma, Verb).<br />
        <b>trotzdem</b> steht auf Position 1, das Verb direkt danach (vor dem Subjekt) — oder in der Mitte: <i>Carola bleibt trotzdem zu Hause.</i> <b>dennoch</b> = dasselbe, etwas formeller.<br />
        Nur <b>trotz</b> ist eine Präposition. <b>obwohl</b> ist eine Konjunktion, <b>trotzdem/dennoch</b> sind Adverbien — darum hat jedes seine eigene Wortstellung.
      </p>

      <p style={{ fontSize: 11, color: "#888", margin: "14px 0 6px", fontWeight: 600 }}>trotz + Genitiv</p>
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
            <tr><td style={rowH}>Genitiv</td><td style={genderTd("der")}>des Regen<b>s</b></td><td style={genderTd("die")}>der Kälte</td><td style={genderTd("das")}>des Wetter<b>s</b></td><td style={genderTd("plural")}>der Probleme</td></tr>
          </tbody>
        </table>
      </div>
      <p style={{ fontSize: 11, color: "#aaa", margin: "0 0 14px" }}>Maskulin/Neutrum: des + Nomen mit -s/-es. Gesprochen hört man oft den Dativ (<i>trotz dem Regen</i>), geschrieben gilt der Genitiv.</p>

      <div style={{ border: "1px solid #f3d6d6", background: "#fff8f8", borderRadius: 8, padding: "9px 12px", fontSize: 12, lineHeight: 1.8, color: "#555", marginBottom: 8 }}>
        <b style={{ color: "#a33" }}>Häufige Fehler</b><br />
        ❌ Obwohl es regnet, <u>trotzdem</u> gehe ich. → ✅ Obwohl es regnet, gehe ich. <span style={{ color: "#aaa" }}>(nur ein Verbinder)</span><br />
        ❌ Obwohl es regnet, <u>ich gehe</u>. → ✅ …, <b>gehe ich</b>.<br />
        ❌ <u>Trotzdem</u> es regnet, gehe ich. → ✅ <b>Obwohl</b> es regnet, gehe ich. <span style={{ color: "#aaa" }}>(trotzdem ist keine Konjunktion)</span>
      </div>
      <p style={{ fontSize: 11, color: "#aaa", margin: "0 0 12px" }}>⚠️ aunque = <b>obwohl</b> (Tatsache) · aber <b>auch wenn</b> (nur möglich: «aunque llueva»).</p>

      <div style={{ fontSize: 12.5, lineHeight: 1.6, color: "#444", marginBottom: 24 }}>
        {[
          ["Obwohl ich weit weg wohne, fahre ich gern ins Büro.", "Aunque vivo lejos, me gusta ir a la oficina."],
          ["Der Zug war voll. Trotzdem konnte ich arbeiten.", "El tren estaba lleno. Aun así pude trabajar."],
          ["Trotz der Verspätung war ich pünktlich.", "A pesar del retraso, llegué puntual."],
        ].map(([de, es]) => (
          <div key={de} style={{ marginBottom: 6 }}>
            <b>{de}</b><br /><span style={{ color: "#7a4f00", fontSize: 11 }}>{es}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
