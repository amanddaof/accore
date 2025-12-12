import "./DebtsInline.css";
import { money } from "../utils/money";
import { useState, useMemo } from "react";

export default function DebtsInline({ dividas }) {

  const detalhes =
    dividas?.lancamentos ||
    dividas?.itens ||
    dividas?.lista ||
    dividas?.detalhes ||
    dividas?.rows ||
    [];

  // === FILTROS ===
  const [origem, setOrigem] = useState("Todas");
  const [pessoa, setPessoa] = useState("Todas");

  // Origens disponíveis dinamicamente
  const origensDisponiveis = useMemo(() => {
    const set = new Set(detalhes.map(d => d.origem).filter(Boolean));
    return ["Todas", ...Array.from(set)];
  }, [detalhes]);

  const pessoasDisponiveis = ["Todas", "Amanda", "Celso"];

  // Aplica filtros
  const filtradas = useMemo(() => {
    return detalhes.filter(d => {
      const matchOrigem =
        origem === "Todas" || d.origem === origem;

      const quemDeve = d.quem_deve || d.devedor;

      const matchPessoa =
        pessoa === "Todas" || quemDeve === pessoa;

      return matchOrigem && matchPessoa;
    });
  }, [detalhes, origem, pessoa]);

  // Total filtrado
  const totalFiltrado = useMemo(() => {
    return filtradas.reduce((sum, d) => sum + Number(d.valor || 0), 0);
  }, [filtradas]);

  return (
    <div className="debts-inline-box">

      {/* FILTROS */}
      <header className="debts-toolbar">
        <div>
          <label>Origem:</label>
          <select value={origem} onChange={e => setOrigem(e.target.value)}>
            {origensDisponiveis.map(o => (
              <option key={o} value={o}>{o}</option>
            ))}
          </select>
        </div>

        <div>
          <label>Pessoa:</label>
          <select value={pessoa} onChange={e => setPessoa(e.target.value)}>
            {pessoasDisponiveis.map(p => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>
        </div>
      </header>

      {/* RESULTADO */}
      {filtradas.length === 0 ? (
        <p>Nenhuma dívida encontrada.</p>
      ) : (
        <>
          {/* RESUMO */}
          <div className="debts-summary">
            <span>Registros: <strong>{filtradas.length}</strong></span>
            <span>Total filtrado: <strong>{money(totalFiltrado)}</strong></span>
          </div>

          {/* TABELA */}
          <table>
            <thead>
              <tr>
                <th>Origem</th>
                <th>Descrição</th>
                <th>Quem deve</th>
                <th>Quem recebe</th>
                <th>Valor</th>
              </tr>
            </thead>
            <tbody>
              {filtradas.map((d, i) => (
                <tr key={i}>
                  <td>{d.origem}</td>
                  <td>{d.descricao || d.nome || "-"}</td>
                  <td>{d.quem_deve || d.devedor}</td>
                  <td>{d.quem_recebe || d.credor}</td>
                  <td>{money(d.valor)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}
    </div>
  );
}
