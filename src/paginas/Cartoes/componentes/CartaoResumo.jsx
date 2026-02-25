import { useEffect, useState } from "react";
import { supabase } from "../../../servicos/supabase";
import money from "../../../utils/money";
import "../estilos/cartoes.css";

function classeBanco(nome = "") {
  const n = nome.toLowerCase();

  if (n.includes("nu")) return "banco-nu";
  if (n.includes("bb")) return "banco-bb";
  if (n.includes("si")) return "banco-si";

  return "banco-default";
}

function obterLogo(nome = "") {
  const n = nome.toLowerCase();

  if (n.includes("nu")) return "/logo-nu.png";
  if (n.includes("bb")) return "/logo-bb.png";
  if (n.includes("si")) return "/logo-si.png";

  return null;
}

export default function CartaoResumo({ cartao, mesFiltro, onClick }) {
  const [faturaMes, setFaturaMes] = useState(0);
  const [usadoGlobal, setUsadoGlobal] = useState(0);
  const [porPessoa, setPorPessoa] = useState({ Amanda: 0, Celso: 0 });

  useEffect(() => {
    async function calcular() {
      const { data: fatura } = await supabase
        .from("transactions")
        .select("valor, quem")
        .eq("origem", cartao.nome)
        .eq("mes", mesFiltro)
        .eq("status", "Pendente");

      let totalMes = 0;
      let amanda = 0;
      let celso = 0;

      fatura?.forEach(t => {
        const valor = Number(t.valor || 0);

        if (t.quem === "Ambos") {
          totalMes += valor * 2;
          amanda += valor;
          celso += valor;
        } else {
          totalMes += valor;
          if (t.quem === "Amanda") amanda += valor;
          if (t.quem === "Celso") celso += valor;
        }
      });

      setFaturaMes(totalMes);
      setPorPessoa({ Amanda: amanda, Celso: celso });

      const { data: pendentes } = await supabase
        .from("transactions")
        .select("valor, quem")
        .eq("origem", cartao.nome)
        .eq("status", "Pendente");

      let totalGlobal = 0;

      pendentes?.forEach(t => {
        const valor = Number(t.valor || 0);
        totalGlobal += t.quem === "Ambos" ? valor * 2 : valor;
      });

      setUsadoGlobal(totalGlobal);
    }

    calcular();
  }, [cartao.nome, mesFiltro]);

  const limite = Number(cartao.limite || 0);
  const disponivel = limite - usadoGlobal;
  const percentual = limite
    ? Math.round((usadoGlobal / limite) * 100)
    : 0;

  const logo = obterLogo(cartao.nome);

  return (
    <div
      className={`cartao-card ${classeBanco(cartao.nome)}`}
      onClick={onClick}
    >
      {/* TOPO CORRIGIDO */}
      <div className="topo-card">
        <h3>{cartao.nome}</h3>

        <div className="topo-direita">
          <div className="percentual-badge">
            {percentual}% usado
          </div>

          {logo && (
            <img
              src={logo}
              alt="logo banco"
              className="logo-banco"
            />
          )}
        </div>
      </div>

      <div>
        <div className="info-label">Disponível</div>
        <div className="info-value">{money(disponivel)}</div>
      </div>

      <div className="fatura-bloco">
        <div className="info-label">Fatura do mês</div>
        <div className="info-value">{money(faturaMes)}</div>
      </div>

      <div className="pessoas-bloco">
        <div className="pessoa-item">
          <span>Amanda</span>
          <strong>{money(porPessoa.Amanda)}</strong>
        </div>

        <div className="pessoa-item">
          <span>Celso</span>
          <strong>{money(porPessoa.Celso)}</strong>
        </div>
      </div>

      <div className="barra">
        <div
          className="barra-fill"
          style={{ width: `${Math.min(percentual, 100)}%` }}
        />
      </div>
    </div>
  );
}
