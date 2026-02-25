import { useState } from "react";
import { inserir } from "../../servicos/banco";
import { buscarTodos, atualizar } from "../../servicos/banco";
import "./estilos/modalEconomia.css";

const MESES = [
  { label: "Janeiro", value: "01" },
  { label: "Fevereiro", value: "02" },
  { label: "Março", value: "03" },
  { label: "Abril", value: "04" },
  { label: "Maio", value: "05" },
  { label: "Junho", value: "06" },
  { label: "Julho", value: "07" },
  { label: "Agosto", value: "08" },
  { label: "Setembro", value: "09" },
  { label: "Outubro", value: "10" },
  { label: "Novembro", value: "11" },
  { label: "Dezembro", value: "12" }
];

const PESSOAS = [
  { label: "Amanda", value: "amanda" },
  { label: "Celso", value: "celso" }
];

export default function ModalNovoValor({ fechar, ano, aoSalvar }) {

  const [anoSelecionado, setAnoSelecionado] = useState(ano);
  const [mes, setMes] = useState("");
  const [pessoa, setPessoa] = useState("");
  const [valor, setValor] = useState("");

  async function salvar() {
  if (!mes || !pessoa || !valor) {
    alert("Preencha todos os campos.");
    return;
  }

  const todos = await buscarTodos("economia_anual");

  const existente = todos.find(r =>
    Number(r.ano) === Number(ano) &&
    r.mes === mes &&
    r.pessoa === pessoa
  );

  let resultado;

  if (existente) {
    // Atualiza se já existir
    resultado = await atualizar("economia_anual", existente.id, {
      economizado_real: Number(valor)
    });
  } else {
    // Insere se não existir
    resultado = await inserir("economia_anual", {
      ano: Number(ano),
      mes,
      pessoa,
      economizado_real: Number(valor)
    });
  }

  if (!resultado) {
    alert("Erro ao salvar.");
    return;
  }

  aoSalvar(resultado);
  fechar();
}

  return (
    <div className="modal-overlay">
      <div className="modal-container">
        <h2>Novo Valor Economizado</h2>

        <input
          type="number"
          placeholder="Ano (ex: 2026)"
          value={anoSelecionado}
          onChange={e => setAnoSelecionado(e.target.value)}
        />

        <select value={mes} onChange={e => setMes(e.target.value)}>
          <option value="">Selecione o mês</option>
          {MESES.map(m => (
            <option key={m.value} value={m.value}>
              {m.label}
            </option>
          ))}
        </select>

        <select value={pessoa} onChange={e => setPessoa(e.target.value)}>
          <option value="">Selecione a pessoa</option>
          {PESSOAS.map(p => (
            <option key={p.value} value={p.value}>
              {p.label}
            </option>
          ))}
        </select>

        <input
          type="number"
          placeholder="Valor economizado"
          value={valor}
          onChange={e => setValor(e.target.value)}
        />

        <div className="modal-botoes">
          <button onClick={fechar} className="botao-secundario">
            Cancelar
          </button>
          <button onClick={salvar} className="botao-primario">
            Salvar
          </button>
        </div>
      </div>
    </div>
  );
}
