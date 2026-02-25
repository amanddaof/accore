import { useEffect, useState } from "react";
import { supabase } from "../../servicos/supabase";
import { buscarTodos } from "../../servicos/banco";
import { useMes } from "../../contextos/MesContexto";
import { calcularResumo } from "./logica/calcularResumo";
import { calcularImpactoAnual } from "./logica/calcularImpactoAnual";
import { buscarResumoMes } from "./logica/buscarResumoMes";
import "./estilos/dashboard.css";

export default function Dashboard() {
  const { mesSelecionado } = useMes();

  const [dados, setDados] = useState(null);
  const [expandirAmanda, setExpandirAmanda] = useState(false);
  const [expandirCelso, setExpandirCelso] = useState(false);
  const [expandirDividas, setExpandirDividas] = useState(false);
  const [impactoAnual, setImpactoAnual] = useState([]);
  const [mesExpandido, setMesExpandido] = useState(null);

  useEffect(() => {
    carregar();
  }, [mesSelecionado]);

  async function carregar() {
  try {

    /* ===============================
       RESUMO DO MÊS ATUAL
    =============================== */

    const resultado = await buscarResumoMes(mesSelecionado);

    setDados(resultado);

    /* ===============================
       IMPACTO ANUAL
    =============================== */

    const anoAtual = Number(mesSelecionado.split("/")[1]) + 2000;

    const impacto = await calcularImpactoAnual(anoAtual);

    setImpactoAnual(impacto);

  } catch (err) {
    console.error("Erro ao carregar dashboard:", err);
  }
}

  if (!dados) return null;

  return (
    <div className="dashboard-container">
      <div className="dashboard-grid">

        {/* ================= AMANDA ================= */}

        <div
          className="card-dashboard card-resumo card-amanda"
          onClick={() => setExpandirAmanda(v => !v)}
          style={{ cursor: "pointer" }}
        >
          <h2 className="nome-amanda">Amanda</h2>

          <div className="resumo-linha">
            <span>Salário</span>
            <span className="resumo-valor">
              R$ {dados.salarioAmanda.toFixed(2)}
            </span>
          </div>

          <div className="resumo-linha">
            <span>Comprometido</span>
            <span className="resumo-valor">
              R$ {dados.comprometidoAmanda.toFixed(2)}
            </span>
          </div>

          <div className="resumo-linha resumo-sobra">
            <span>Sobra</span>
            <span
              className={`valor-sobra ${
                dados.sobraAmanda >= 0 ? "positivo" : "negativo"
              }`}
            >
              R$ {dados.sobraAmanda.toFixed(2)}
            </span>
          </div>

          {expandirAmanda && (
            <div className="resumo-expandido">
              <div className="linha-expandida">
                <span>Cartões</span>
                <span className="resumo-valor">
                  R$ {dados.gruposAmanda.cartoes.toFixed(2)}
                </span>
              </div>

              <div className="linha-expandida">
                <span>Externo</span>
                <span className="resumo-valor">
                  R$ {dados.gruposAmanda.externo.toFixed(2)}
                </span>
              </div>

              <div className="linha-expandida">
                <span>Reservas</span>
                <span className="resumo-valor">
                  R$ {dados.gruposAmanda.reservas.toFixed(2)}
                </span>
              </div>

              <div className="linha-expandida">
                <span>Contas da casa</span>
                <span className="resumo-valor">
                  R$ {dados.gruposAmanda.casa.toFixed(2)}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* ================= CELSO ================= */}

        <div
          className="card-dashboard card-resumo card-celso"
          onClick={() => setExpandirCelso(v => !v)}
          style={{ cursor: "pointer" }}
        >
          <h2 className="nome-celso">Celso</h2>

          <div className="resumo-linha">
            <span>Salário</span>
            <span className="resumo-valor">
              R$ {dados.salarioCelso.toFixed(2)}
            </span>
          </div>

          <div className="resumo-linha">
            <span>Comprometido</span>
            <span className="resumo-valor">
              R$ {dados.comprometidoCelso.toFixed(2)}
            </span>
          </div>

          <div className="resumo-linha resumo-sobra">
            <span>Sobra</span>
            <span
              className={`valor-sobra ${
                dados.sobraCelso >= 0 ? "positivo" : "negativo"
              }`}
            >
              R$ {dados.sobraCelso.toFixed(2)}
            </span>
          </div>

          {expandirCelso && (
            <div className="resumo-expandido">
              <div className="linha-expandida">
                <span>Cartões</span>
                <span className="resumo-valor">
                  R$ {dados.gruposCelso.cartoes.toFixed(2)}
                </span>
              </div>

              <div className="linha-expandida">
                <span>Externo</span>
                <span className="resumo-valor">
                  R$ {dados.gruposCelso.externo.toFixed(2)}
                </span>
              </div>

              <div className="linha-expandida">
                <span>Reservas</span>
                <span className="resumo-valor">
                  R$ {dados.gruposCelso.reservas.toFixed(2)}
                </span>
              </div>

              <div className="linha-expandida">
                <span>Contas da casa</span>
                <span className="resumo-valor">
                  R$ {dados.gruposCelso.casa.toFixed(2)}
                </span>
              </div>

              <div className="linha-expandida">
                <span>Empréstimos</span>
                <span className="resumo-valor">
                  R$ {dados.gruposCelso.emprestimos.toFixed(2)}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* ================= ACERTO DO MÊS ================= */}

        {dados.dividas?.saldoFinal?.valor > 0 && (
          <div
            className="acerto-linha-unica full-width"
            onClick={() => setExpandirDividas(v => !v)}
          >
            <span className="acerto-texto">
              {dados.dividas.saldoFinal.quemDeve}
              {" deve pagar "}
              <span
                className={`acerto-valor ${
                  dados.dividas.saldoFinal.quemDeve === "Amanda"
                    ? "valor-amanda"
                    : "valor-celso"
                }`}
              >
                R$ {dados.dividas.saldoFinal.valor.toFixed(2)}
              </span>
              {" para "}
              {dados.dividas.saldoFinal.quemRecebe}
            </span>

            {expandirDividas && (
              <div className="acerto-detalhes">
                {dados.dividas.detalhamento.map((item, i) => (
                  <div key={i} className="linha-expandida">
                    <span>
                      {item.tipo} - {item.descricao}
                      <small>
                        {" "}({item.quem} → {item.quem_paga})
                      </small>
                    </span>

                    <span className="resumo-valor">
                      R$ {item.valor.toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ================= VISÃO ANUAL ================= */}

<div className="card-dashboard full-width">

  <div className="visao-anual-header">
    <h3>
      Visão Anual {impactoAnual[0]?.mes?.split("/")[1]}
    </h3>
  </div>

  <div className="visao-anual-tabela">

    <div className="linha-anual-cabecalho">
      <span className="mes-coluna">Mês</span>
      <span className="valor-coluna nome-amanda">Amanda</span>
      <span className="valor-coluna nome-celso">Celso</span>
      <span className="valor-coluna total-coluna">Total</span>
    </div>

    {impactoAnual.map((item, index) => {

      const mesNome = item.mes.split("/")[0];

      return (
        <div key={index} className="linha-anual">

          <div
            className="linha-anual-resumo"
            onClick={() =>
              setMesExpandido(
                mesExpandido === index ? null : index
              )
            }
          >

            <span className="mes-coluna">
              {mesNome}
            </span>

            <span
              className={`valor-coluna ${
                item.amanda.sobra >= 0
                  ? "positivo"
                  : "negativo"
              }`}
            >
              {item.amanda.sobra.toFixed(2)}
            </span>

            <span
              className={`valor-coluna ${
                item.celso.sobra >= 0
                  ? "positivo"
                  : "negativo"
              }`}
            >
              {item.celso.sobra.toFixed(2)}
            </span>

            <span
              className={`valor-coluna total-coluna ${
                item.total.sobra >= 0
                  ? "positivo"
                  : "negativo"
              }`}
            >
              {item.total.sobra.toFixed(2)}
            </span>

          </div>

          {mesExpandido === index && (

            <div className="linha-anual-detalhe">

              <div className="detalhe-bloco detalhe-amanda">
                <h4>Amanda</h4>
                <div className="detalhe-linha">
                  <span>Salário</span>
                  <span>R$ {item.amanda.salario.toFixed(2)}</span>
                </div>
                <div className="detalhe-linha">
                  <span>Gastos</span>
                  <span>R$ {item.amanda.gasto.toFixed(2)}</span>
                </div>
                <div className="detalhe-linha destaque">
                  <span>Sobra</span>
                  <span className={item.amanda.sobra >= 0 ? "positivo" : "negativo"}>
                    R$ {item.amanda.sobra.toFixed(2)}
                  </span>
                </div>
              </div>

              <div className="detalhe-bloco detalhe-celso">
                <h4>Celso</h4>
                <div className="detalhe-linha">
                  <span>Salário</span>
                  <span>R$ {item.celso.salario.toFixed(2)}</span>
                </div>
                <div className="detalhe-linha">
                  <span>Gastos</span>
                  <span>R$ {item.celso.gasto.toFixed(2)}</span>
                </div>
                <div className="detalhe-linha destaque">
                  <span>Sobra</span>
                  <span className={item.celso.sobra >= 0 ? "positivo" : "negativo"}>
                    R$ {item.celso.sobra.toFixed(2)}
                  </span>
                </div>
              </div>

            </div>

          )}

        </div>
      );
    })}

  </div>

</div>

      </div>
    </div>
  );
}