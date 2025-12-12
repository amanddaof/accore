import { useState } from "react";

function getBankClass(card = {}) {
  const texto = `${card.banco || ""} ${card.nome || ""}`.toLowerCase();

  if (texto.includes("nu") || texto.includes("nubank")) return "credit-nu";
  if (texto.includes("bb") || texto.includes("brasil")) return "credit-bb";
  if (texto.includes("si") || texto.includes("sicredi")) return "credit-si";

  return "credit-default";
}

export default function CreditCardFull({
  card,
  transactions = [],
  pendentesGlobais = [],
  onNext,
  onPrev
}) {
	console.log("CLASSES DO CARTÃO:", getBankClass(card));
console.log("CLASSE FINAL:", `credit-card-full ${getBankClass(card)}`);


  const bankClass = getBankClass(card);
  const limite = Number(card.limite || 0);

  // FATURA DO MÊS (pendente + Ambos em dobro)
  const fatura = transactions
    .filter(t => (t.status || "").toLowerCase() === "pendente")
    .reduce((sum, t) => {
      const v = Number(t.valor);
      if (isNaN(v)) return sum;
      const quem = (t.quem || "").toLowerCase();
      const multiplicador = quem === "ambos" ? 2 : 1;
      return sum + v * multiplicador;
    }, 0);

  // LIMITE USADO GLOBAL (para disponível) – aqui NÃO duplica Ambos
  const usadoGlobal = pendentesGlobais.reduce((sum, t) => {
    const v = Number(t.valor);
    if (isNaN(v)) return sum;
    return sum + v;
  }, 0);

  const disponivel = Math.max(limite - usadoGlobal, 0);
  const pct = limite ? Math.round((usadoGlobal / limite) * 100) : 0;

  // POR PESSOA (Amanda / Celso), só mês atual
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

  // 🔹 Swipe / arrastar
  const [startX, setStartX] = useState(null);
  const SWIPE_MIN = 40;

  function handleTouchStart(e) {
    setStartX(e.touches[0].clientX);
  }

  function handleTouchEnd(e) {
    if (startX == null) return;
    const endX = e.changedTouches[0].clientX;
    const delta = endX - startX;

    if (delta < -SWIPE_MIN && onNext) onNext();   // arrastou para esquerda → próximo
    if (delta > SWIPE_MIN && onPrev) onPrev();    // arrastou para direita → anterior

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

      {/* TOPO */}
      <div className="card-header">
        <div>
          <span className="bank">{card.banco || "Banco"}</span>
          <h2 className="title">{card.nome}</h2>
        </div>

        <div className="badge">{pct}% usado</div>
      </div>

      {/* BARRA */}
      <div className="limit-bar">
        <div className="fill" style={{ width: `${pct}%` }} />
      </div>

      {/* VALORES */}
      <div className="values-grid">
        <Metric label="Limite" value={limite} />
        <Metric label="Disponível" value={disponivel} />
        <Metric label="Fatura" value={fatura} highlight />
      </div>

      {/* GASTO POR PESSOA */}
      <div className="people">
        {porPessoa.map(p => (
          <div key={p.nome} className="person">
            <span>{p.nome}</span>
            <strong>R$ {p.valor.toLocaleString("pt-BR")}</strong>
          </div>
        ))}
      </div>

    </div>
  );
}

/* BLOQUINHO DE VALOR */
function Metric({ label, value, highlight }) {
  return (
    <div className={highlight ? "metric highlight" : "metric"}>
      <span>{label}</span>
      <strong>R$ {Number(value).toLocaleString("pt-BR")}</strong>
    </div>
  );
}
