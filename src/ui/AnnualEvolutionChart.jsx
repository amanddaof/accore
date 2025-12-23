export default function AnnualEvolutionChart({ pessoa = "Ambos" }) {
  // ... TODO O SEU CÓDIGO DE CÁLCULO FICA IGUAL
  // 👆 nada do que você mandou acima muda até o return

  return (
    <div>
      <div style={{ marginBottom: 10 }}>
        <label>Ano:</label>
        <select value={ano} onChange={(e) => setAno(Number(e.target.value))}>
          {anos.map((y) => (
            <option key={y}>{y}</option>
          ))}
        </select>
      </div>

      <AnnualSummaryCards data={data} pessoa={pessoa} />

      <ResponsiveContainer width="100%" height={280}>
        <LineChart data={data}>
          <XAxis dataKey="mes" />
          <YAxis />
          <Tooltip formatter={(v) => money(v)} />
          <Legend />

          {(pessoa === "Amanda" || pessoa === "Ambos") && (
            <Line
              type="monotone"
              dataKey="amanda"
              name="Amanda"
              stroke="#A78BFA"
            />
          )}

          {(pessoa === "Celso" || pessoa === "Ambos") && (
            <Line
              type="monotone"
              dataKey="celso"
              name="Celso"
              stroke="#38BDF8"
            />
          )}

          {pessoa === "Ambos" && (
            <Line
              type="monotone"
              dataKey="total"
              name="Total"
              stroke="#FBBF24"
              strokeDasharray="5 5"
            />
          )}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
