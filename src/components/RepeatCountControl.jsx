export default function RepeatCountControl({ repeatCount, setRepeatCount }) {
  return (
    <div style={{ display: "flex", border: "1px solid #ddd", borderRadius: 20, overflow: "hidden", flexShrink: 0 }}>
      {[1, 2, 3].map((n) => (
        <button
          key={n}
          onClick={() => setRepeatCount(n)}
          style={{
            background: repeatCount === n ? "#f0f0f0" : "transparent",
            border: "none",
            borderRight: n < 3 ? "1px solid #ddd" : "none",
            cursor: "pointer", padding: "4px 8px", fontSize: 12,
            fontWeight: repeatCount === n ? 600 : 400,
            color: repeatCount === n ? "#111" : "#888",
          }}
        >
          {n}×
        </button>
      ))}
    </div>
  );
}
