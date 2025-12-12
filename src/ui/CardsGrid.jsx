import "./CardsGrid.css";
import { money } from "../utils/money";

export default function CardsGrid({ mensal, dividas, onToggleDebts }) {

  const [amanda, celso] = mensal.porPessoa;

  return (
    <>
      {/* CARDS SUPERIORES */}
      <div className="hero-total">

        <div className="hero-card amanda">
          <h3>Amanda</h3>
          <p>Pessoais <span>{money(amanda.pessoais)}</span></p>
          <p>Contas <span>{money(amanda.contas)}</span></p>
          <p>Empréstimos <span>{money(amanda.emprestimos)}</span></p>
          <p className="total-row">
            Total
            <strong>{money(amanda.total)}</strong>
          </p>
        </div>

        <div className="hero-card celso">
          <h3>Celso</h3>
          <p>Pessoais <span>{money(celso.pessoais)}</span></p>
          <p>Contas <span>{money(celso.contas)}</span></p>
          <p>Empréstimos <span>{money(celso.emprestimos)}</span></p>
          <p className="total-row">
            Total
            <strong>{money(celso.total)}</strong>
          </p>
        </div>

        <div className="hero-card divida">
          <h3>Dívida</h3>

          {dividas?.devedor ? (
            <>
              <p className="debt-label">
                <span>{dividas.devedor}</span> deve para <span>{dividas.credor}</span>
              </p>
              <p className="debt-value">{money(dividas.valor)}</p>

              <button
  className="debt-btn"
  onClick={onToggleDebts}
>
  Ver detalhes
</button>

            </>
          ) : (
            <p className="debt-ok">Sem dívidas 🎉</p>
          )}
        </div>

      </div>

      
    </>
  );
}
