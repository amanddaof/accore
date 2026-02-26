import { useEffect, useState } from "react";
import { supabase } from "../../servicos/supabase";
import { buscarTodos } from "../../servicos/banco";
import { useMes } from "../../contextos/MesContexto";
import { calcularResumo } from "./logica/calcularResumo";
import { calcularImpactoAnual } from "./logica/calcularImpactoAnual";
import { buscarResumoMes } from "./logica/buscarResumoMes";
import GraficoGastos from "./componentes/GraficoGastos";
import "./estilos/dashboard.css";

export default function Dashboard() {
  const { mesSelecionado } = useMes();

  const [dados, setDados] = useState(null);
  const [expandirAmanda, setExpandirAmanda] = useState(false);
  const [expandirCelso, setExpandirCelso] = useState(false);
  const [expandirDividas, setExpandirDividas] = useState(false);
  const [impactoAnual, setImpactoAnual] = useState([]);
  const [mesExpandido, setMesExpandido] = useState(null);
  const [filtroOrigem, setFiltroOrigem] = useState("Todas");
  const [filtroPessoa, setFiltroPessoa] = useState("Todas");

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

    const origensDisponiveis = [
    "Todas",
    ...new Set(dados.dividas.detalhamento.map(i => i.origem))
  ];

  const detalhamentoFiltrado = dados.dividas.detalhamento.filter(item => {

    const origemOk =
      filtroOrigem === "Todas" || item.origem === filtroOrigem;

    const pessoaOk =
      filtroPessoa === "Todas" || item.quem === filtroPessoa;

    return origemOk && pessoaOk;
  });

  const totalFiltrado = detalhamentoFiltrado.reduce(
  (acc, item) => acc + item.valor,
  0
);

function getStatus(percentual) {
  if (percentual < 75) return { label: "Saudável", classe: "status-saudavel" };
  if (percentual <= 90) return { label: "Atenção", classe: "status-atencao" };
  return { label: "Crítico", classe: "status-critico" };
}

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
            <span
              className={
                dados.dividas.saldoFinal.quemDeve === "Amanda"
                  ? "nome-amanda"
                  : "nome-celso"
              }
            >
              {dados.dividas.saldoFinal.quemDeve}
            </span>

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

            <span
              className={
                dados.dividas.saldoFinal.quemRecebe === "Amanda"
                  ? "nome-amanda"
                  : "nome-celso"
              }
            >
              {dados.dividas.saldoFinal.quemRecebe}
            </span>

            {expandirDividas && (
              <div className="acerto-detalhes">

                <div
  className="acerto-filtros"
  onClick={(e) => e.stopPropagation()}
>

  <div className="filtros-esquerda">

    <label>
      Origem:
      <select
  value={filtroOrigem}
  onClick={(e) => e.stopPropagation()}
  onChange={e => setFiltroOrigem(e.target.value)}
>
        {origensDisponiveis.map((origem, i) => (
          <option key={i} value={origem}>
            {origem}
          </option>
        ))}
      </select>
    </label>

    <label>
      Pessoa:
      <select
        value={filtroPessoa}
        onClick={(e) => e.stopPropagation()}
        onChange={e => setFiltroPessoa(e.target.value)}
      >
        <option value="Todas">Todas</option>
        <option value="Amanda">Amanda</option>
        <option value="Celso">Celso</option>
      </select>
    </label>

  </div>

  <div className="filtros-direita">
    <span>Registros: {detalhamentoFiltrado.length}</span>
    <span>
      Total filtrado: <strong>R$ {totalFiltrado.toFixed(2)}</strong>
    </span>
  </div>

</div>

  <div className="acerto-cabecalho">
    <span className="col-origem">Origem</span>
    <span className="col-descricao">Descrição</span>
    <span className="col-fluxo">De → Para</span>
    <span className="col-valor">Valor</span>
  </div>

  {detalhamentoFiltrado.map((item, i) => (
    <div key={i} className="linha-acerto">

      <span className="col-origem origem-badge">
        {item.origem || "-"}
      </span>

      <span className="col-descricao">
        {item.descricao}
      </span>

      <span className="col-fluxo">
        <span className={item.quem === "Amanda" ? "nome-amanda" : "nome-celso"}>
          {item.quem}
        </span>
        {" → "}
        <span className={item.quem_paga === "Amanda" ? "nome-amanda" : "nome-celso"}>
          {item.quem_paga}
        </span>
      </span>

      <span className="col-valor">
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

          {/* ================= AMANDA ================= */}
          <div className="bloco-pessoa">

            <div className="kpi-bloco">
              <h4 className="nome-amanda">Amanda</h4>

              <div className="detalhe-linha">
                <span>Salário</span>
                <span>R$ {item.amanda.salario.toFixed(2)}</span>
              </div>

              <div className="detalhe-linha">
                <span>Gastos</span>
                <span>R$ {item.amanda.gasto.toFixed(2)}</span>
              </div>

              {(() => {
                const salario = item.amanda.salario;
                const gasto = item.amanda.gasto;

                const percentual = salario > 0
                  ? (gasto / salario) * 100
                  : 0;

                const extrapolou = gasto > salario;
                const status = getStatus(percentual);

                return (
                  <>
                    <div className="detalhe-linha">
                      <span>% Comprometido</span>
                      <span className={extrapolou ? "negativo" : ""}>
                        {percentual.toFixed(1)}%
                      </span>
                    </div>

                    {!extrapolou && (
                      <div className={`detalhe-linha ${status.classe}`}>
                        <span>Status</span>
                        <span>{status.label}</span>
                      </div>
                    )}

                    {extrapolou && (
                      <div className="alerta-gasto">
                        🚨 Renda insuficiente para cobrir despesas
                      </div>
                    )}
                  </>
                );
              })()}

              <div className="detalhe-linha destaque">
                <span>Sobra</span>
                <span className={item.amanda.sobra >= 0 ? "positivo" : "negativo"}>
                  R$ {item.amanda.sobra.toFixed(2)}
                </span>
              </div>
            </div>

            <div className="grafico-bloco">
              <GraficoGastos dados={item.amanda} />
            </div>

          </div>

          {/* ================= CELSO ================= */}
          <div className="bloco-pessoa">

            <div className="kpi-bloco">
              <h4 className="nome-celso">Celso</h4>

              <div className="detalhe-linha">
                <span>Salário</span>
                <span>R$ {item.celso.salario.toFixed(2)}</span>
              </div>

              <div className="detalhe-linha">
                <span>Gastos</span>
                <span>R$ {item.celso.gasto.toFixed(2)}</span>
              </div>

              {(() => {
                const salario = item.celso.salario;
                const gasto = item.celso.gasto;

                const percentual = salario > 0
                  ? (gasto / salario) * 100
                  : 0;

                const extrapolou = gasto > salario;
                const status = getStatus(percentual);

                return (
                  <>
                    <div className="detalhe-linha">
                      <span>% Comprometido</span>
                      <span className={extrapolou ? "negativo" : ""}>
                        {percentual.toFixed(1)}%
                      </span>
                    </div>

                    {!extrapolou && (
                      <div className={`detalhe-linha ${status.classe}`}>
                        <span>Status</span>
                        <span>{status.label}</span>
                      </div>
                    )}

                    {extrapolou && (
                      <div className="alerta-gasto">
                        🚨 Renda insuficiente para cobrir despesas
                      </div>
                    )}
                  </>
                );
              })()}

              <div className="detalhe-linha destaque">
                <span>Sobra</span>
                <span className={item.celso.sobra >= 0 ? "positivo" : "negativo"}>
                  R$ {item.celso.sobra.toFixed(2)}
                </span>
              </div>
            </div>

            <div className="grafico-bloco">
              <GraficoGastos dados={item.celso} />
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
