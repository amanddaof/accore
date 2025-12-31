// =============================
//   CREDIT CARD FULL — PREMIUM
// =============================
import { useState } from "react";
import "./CardsDrawer.css";
import { money } from "../utils/money";

function getBankClass(card = {}) {
  const texto = `${card.banco || ""} ${card.nome || ""}`.toLowerCase();

  if (texto.includes("nu") || texto.includes("nubank")) return "credit-nu";
  if (texto.includes("bb") || texto.includes("brasil")) return "credit-bb";
  if (texto.includes("si") || texto.includes("sicredi")) return "credit-si";

  return "credit-default";
}

const bankLogo = {
  nubank: "/logo-nu.png",
  si: "/logo-si.png",
  sicredi: "/logo-si.png",
  bb: "/logo-bb.png",
  brasil: "/logo-bb.png"
};

function getLogo(card = {}) {
  const texto = `${card.banco || ""} ${card.nome || ""}`.toLowerCase();

  if (texto.includes("nu")) return bankLogo.nubank;
  if (texto.includes("si") || texto.includes("sicredi")) return bankLogo.sicredi;
  if (texto.includes("bb") || texto.includes("brasil")) return bankLogo.bb;

  return null;
}

function getOwner(card = {}) {
  const nome = `${card.nome || ""}`.toLowerCase();
  if (nome.includes("amanda")) return "Amanda";
  if (nome.includes("celso")) return "Celso";
  return "";
}

export default function CreditCardFull({
  card,
  transactions = [],
  pendentesGlobais = [],
  onNext,
  onPrev
}) {
  const bankClass = getBankClass(card);
  const logo = getLogo(card);
  const owner = getOwner(card);

  const limite = Number(card.limite || 0);

  const fatura = transactions
    .filter(t => (t.status || "").toLowerCase() === "pendente")
    .reduce((sum, t) => {
      const v = Number(t.valor);
      if (isNaN(v)) return sum;
      const quem = (t.quem || "").toLowerCase();
      const multiplicador = quem === "ambos" ? 2 : 1;
      return sum + v * multiplicador;
    }, 0);

  const usadoGlobal = pendentesGlobais.reduce((sum, t) => {
    const v = Number(t.valor);
    if (isNaN(v)) return sum;
    return sum + v;
  }, 0);

  const disponivel = Math.max(limite - usadoGlobal, 0);
  const pct = limite ? Math.round((usadoGlobal / limite) * 100) : 0;

  const porPessoa = [
    { nome: "Amanda", chave: "amanda" },
    { nome: "Celso", chave: "celso" }
  ].map(p => {
    const total = transactions
      .filter(t => (t.status || "").toLowerCase() === "pendente")
      .reduce((sum, t) => {
        const v = Number(t.valor);
        if (isNaN(v)) return sum;

        const quem = (t.quem || "").toLowerCase();
        if (quem === p.chave) return sum + v;
        if (quem === "ambos") return sum + v;
        return sum;
      }, 0);

    return { nome: p.nome, valor: total };
  });

  // swipe — não alterado
  const [startX, setStartX] = useState(null);
  const SWIPE_MIN = 40;

  function handleTouchStart(e) {
    setStartX(e.touches[0].clientX);
  }

  function handleTouchEnd(e) {
    if (startX == null) return;
    const endX = e.changedTouches[0].clientX;
    const delta = endX - startX;

    if (delta < -SWIPE_MIN && onNext) onNext();
    if (delta > SWIPE_MIN && onPrev) onPrev();

    setStartX(null);
  }

  let mouseDownX = null;

  function handleMouseDown(e) {
    mouseDownX = e.clientX;
  }

  function handleMouseUp(e) {
    if (mouseDownX == null) return;
    const delta = e.clientX - mouseDownX;

    if (delta < -SWIPE_MIN && onNext) onNext();
    if (delta > SWIPE_MIN && onPrev) onPrev();

    mouseDownX = null;
  }

  return (
    <div
      className={`credit-card-full ${bankClass}`}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
    >

      {/* =========================
          CABEÇALHO PREMIUM
      ========================= */}
      <div className="card-header-premium">
        <div className="card-header-left">
          {logo && <img src={logo} alt="logo banco" className="bank-logo" />}

          <div className="bank-info">
            <span className="bank-name">{card.banco}</span>
            {owner && <span className="bank-owner">{owner}</span>}
          </div>
        </div>

        <div className="usage-badge">
          {pct}% usado
        </div>
      </div>


      {/* =========================
          BARRA DE UTILIZAÇÃO
      ========================= */}
      <div className="limit-bar-premium">
        <div className="fill" style={{ width: `${pct}%` }} />
      </div>


      {/* =========================
          VALORES PRINCIPAIS
      ========================= */}
      <div className="values-grid-premium">
        <Metric label="Limite" value={limite} />
        <Metric label="Disponível" value={disponivel} />
        <Metric label="Fatura" value={fatura} highlight />
      </div>


      {/* =========================
          POR PESSOA — AGORA DENTRO
      ========================= */}
      <div className="people-premium">
        {porPessoa.map(p => (
          <div key={p.nome} className="person-box">
            <span>{p.nome}</span>
            <strong>{money(p.valor)}</strong>
          </div>
        ))}
      </div>

    </div>
  );
}


// ==========================
// BLOCO DE VALOR
// ==========================
function Metric({ label, value, highlight }) {
  return (
    <div className={highlight ? "metric highlight" : "metric"}>
      <span className="metric-label">{label}</span>
      <strong className="metric-value">{money(value)}</strong>
    </div>
  );
}
