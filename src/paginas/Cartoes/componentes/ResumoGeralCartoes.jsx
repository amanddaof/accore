import money from "../../../utils/money";

export default function ResumoGeralCartoes({ resumo }) {
  if (!resumo) return null;

  return (
    <section className="resumo-geral-cartoes">
      <div>
        <span>Limite Total</span>
        <strong>{money(resumo.limiteTotal)}</strong>
      </div>

      <div>
        <span>Total Usado</span>
        <strong>{money(resumo.usadoTotal)}</strong>
      </div>

      <div>
        <span>Disponível</span>
        <strong>{money(resumo.disponivelTotal)}</strong>
      </div>

      <div>
        <span>Utilização</span>
        <strong>{resumo.percentualUso}%</strong>
      </div>
    </section>
  );
}
