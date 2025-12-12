import "./MonthSummary.css";

function fmt(valor) {
  return Number(valor || 0).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 2
  });
}

export default function MonthSummary({ categorias, pessoa, categoriasMesAnterior = [] }) {

  const listaAtual = categorias?.[pessoa?.toLowerCase()] || [];
  if (!Array.isArray(listaAtual) || !listaAtual.length) return null;

  // ----- ATUAL -----
  const ordenadas = [...listaAtual].sort((a, b) => b.valor - a.valor);
  const top1 = ordenadas[0];
  const top2 = ordenadas[1];
  const menor = ordenadas.at(-1);

  // ----- ANTERIOR (para comparação) -----
  const mapaAnterior = {};
  categoriasMesAnterior.forEach(c => {
    mapaAnterior[c.categoria] = Number(c.valor || 0);
  });

  // encontra variações relevantes
  const variacoes = ordenadas
    .map(c => {
      const antes = mapaAnterior[c.categoria] || 0;
      const agora = Number(c.valor || 0);
      const diff = agora - antes;
      const perc = antes ? (diff / antes) : (agora ? 1 : 0);
      return { ...c, diff, perc, antes };
    })
    .sort((a, b) => Math.abs(b.diff) - Math.abs(a.diff));

  const maiorAlta = variacoes.find(v => v.diff > 0 && v.antes > 0);
  const maiorQueda = variacoes.find(v => v.diff < 0 && v.antes > 0);

  // ----- TEXTO HUMANIZADO -----
  function fraseDeTopos() {
    if (top1 && top2) {
      return `Os maiores gastos foram com ${top1.categoria} e ${top2.categoria}.`;
    }
    if (top1) return `O maior gasto foi em ${top1.categoria}.`;
    return "";
  }

  function fraseDeMenor() {
    if (!menor) return "";
    return `A categoria com menor impacto foi ${menor.categoria}.`;
  }

  function fraseDeComparacao() {
    const frases = [];

    if (maiorAlta) {
      frases.push(
        `${maiorAlta.categoria} aumentou (${fmt(maiorAlta.antes)} → ${fmt(maiorAlta.valor)}).`
      );
    }

    if (maiorQueda) {
      frases.push(
        `${maiorQueda.categoria} caiu (${fmt(maiorQueda.antes)} → ${fmt(maiorQueda.valor)}).`
      );
    }

    if (!frases.length) {
      return "Não houve mudanças relevantes em relação ao mês anterior.";
    }

    return frases.join(" ");
  }

  return (
    <div className="month-summary">

      <h3>📊 Resumo do mês — {pessoa}</h3>

      <p>{fraseDeTopos()}</p>

      <p>{fraseDeMenor()}</p>

      <p className="comparison">{fraseDeComparacao()}</p>

    </div>
  );
}
