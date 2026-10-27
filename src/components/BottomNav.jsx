const ACCENT = "#D4537E";

// `ready: false` entries stay hidden until their screens exist.
export const SECTIONS = [
  { id: "heute", label: "Heute", icon: "🏠" },
  { id: "sammlung", label: "Sammlung", icon: "📚" },
  { id: "verben", label: "Verben", icon: "🔤", ready: false },
  { id: "sprechen", label: "Sprechen", icon: "🗣" },
  { id: "grammatik", label: "Grammatik", icon: "📖" },
];

export default function BottomNav({ section, onSelect }) {
  const items = SECTIONS.filter((s) => s.ready !== false);
  return (
    <nav style={{ position: "fixed", left: 0, right: 0, bottom: 0, zIndex: 1000, background: "#fff", borderTop: "1px solid #e5e5e5" }}>
      <div style={{ maxWidth: 900, margin: "0 auto", display: "flex", padding: "6px 4px", paddingBottom: "calc(8px + env(safe-area-inset-bottom))" }}>
        {items.map((s) => {
          const on = section === s.id;
          return (
            <button
              key={s.id}
              onClick={() => onSelect(s.id)}
              aria-current={on ? "page" : undefined}
              style={{ flex: 1, background: "none", border: "none", cursor: "pointer", padding: "2px 0", color: on ? ACCENT : "#888", fontWeight: on ? 600 : 400, fontSize: 10 }}
            >
              <span style={{ display: "block", fontSize: 20, lineHeight: 1.2, filter: on ? "none" : "grayscale(1) opacity(0.7)" }}>{s.icon}</span>
              {s.label}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
