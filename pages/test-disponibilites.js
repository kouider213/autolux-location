export default function TestDisponibilites() {
  const vehicles = [
    {
      name: "Jumpy",
      available: false,
      blocked: { from: "08/05/2025", to: "17/05/2025" },
    },
    { name: "Berlingo", available: true },
    { name: "Clio 5", available: true },
  ];

  return (
    <div style={{ fontFamily: "sans-serif", maxWidth: 600, margin: "60px auto", padding: "0 20px" }}>
      <h1 style={{ fontSize: 28, fontWeight: "bold", marginBottom: 32 }}>
        Test disponibilités véhicules
      </h1>

      <ul style={{ listStyle: "none", padding: 0 }}>
        {vehicles.map((v) => (
          <li
            key={v.name}
            style={{
              backgroundColor: v.available ? "#d1fae5" : "#fee2e2",
              border: `2px solid ${v.available ? "#10b981" : "#ef4444"}`,
              borderRadius: 10,
              padding: "16px 20px",
              marginBottom: 16,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <span style={{ fontWeight: "bold", fontSize: 18, color: v.available ? "#065f46" : "#991b1b" }}>
              {v.name}
            </span>
            <span style={{ fontSize: 14, color: v.available ? "#047857" : "#b91c1c" }}>
              {v.available
                ? "✅ Disponible"
                : `❌ Indisponible — bloqué du ${v.blocked.from} au ${v.blocked.to}`}
            </span>
          </li>
        ))}
      </ul>

      <p style={{ marginTop: 40, color: "#6b7280", fontSize: 13 }}>
        Page de test — Dzaryx · {new Date().toLocaleDateString("fr-FR")}
      </p>
    </div>
  );
}
