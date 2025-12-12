export default function CardsBlock({ cards }) {
  return (
    <div className="cards-grid-premium">
      {cards.map(card => (
        <CreditCard key={card.id} card={card} />
      ))}
    </div>
  );
}

/* CARTÃO */

function CreditCard({ card }) {

  const usado = card.fatura || 0;
  const limite = card.limite || 1;
  const pct = Math.min((usado / limite) * 100, 100);

  return (
    <div className={`credit-card ${getBankClass(card.banco)}`}>

      <div className="label">{card.nome}</div>

      <div className="amount">
        R$ {usado.toFixed(2)}
      </div>

      <small>Limite: R$ {limite}</small>

      <div className="card-progress">
        <div
          className="card-progress-fill"
          style={{ width: `${pct}%` }}
        />
      </div>

    </div>
  );
}

function getBankClass(nome = "") {
  const n = nome.toLowerCase();

  if (n.includes("nubank")) return "credit-nu";
  if (n.includes("bb")) return "credit-bb";
  if (n.includes("sico")) return "credit-si";

  return "credit-default";
}
