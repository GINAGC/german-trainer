export default function SegmentedControl({ options, value, onChange }) {
  return (
    <div style={{ display: "flex", background: "#f0f0f0", borderRadius: 10, padding: 3 }}>
      {options.map(([id, label]) => {
        const on = value === id;
        return (
          <button
            key={id}
            onClick={() => onChange(id)}
            style={{ flex: 1, border: "none", cursor: "pointer", borderRadius: 8, padding: "6px 4px", fontSize: 13, background: on ? "#fff" : "transparent", fontWeight: on ? 600 : 400, color: on ? "#111" : "#555", boxShadow: on ? "0 1px 3px rgba(0,0,0,0.12)" : "none" }}
          >
            {label}
          </button>
        );
      })}
    </div>
  );
}
