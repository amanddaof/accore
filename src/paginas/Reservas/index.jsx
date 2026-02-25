import { useEffect, useState } from "react";
import { buscarTodos, inserir, atualizar, remover } from "../../servicos/banco";
import LinhaReserva from "./componentes/LinhaReserva";
import {
  avancarDataReserva,
  avancarMesReserva,
  avancarParcelaReserva
} from "./logica/recorrenciaReserva";
import ModalNovaReserva from "./componentes/ModalNovaReserva";
import "./estilos/reservas.css";

export default function Reservas() {

  const [reservas, setReservas] = useState([]);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [modoEdicao, setModoEdicao] = useState(false);
  const [idEdicao, setIdEdicao] = useState(null);

  useEffect(() => {
    carregar();
  }, []);

  async function carregar() {
    const dados = await buscarTodos("reservas");

    const ativas = dados
      .filter(r => r.recorrencia !== "Concluída")
      .sort((a, b) => new Date(a.data_real) - new Date(b.data_real));

    setReservas(ativas);
  }

  async function salvarReserva(dados) {

    if (modoEdicao) {

      const atualizada = await atualizar("reservas", idEdicao, {
        ...dados,
        valor: Number(dados.valor)
      });

      setReservas(prev =>
        prev.map(r => r.id === idEdicao ? atualizada : r)
      );

      setModoEdicao(false);
      setIdEdicao(null);
      setMostrarFormulario(false);
      return;
    }

    const nova = await inserir("reservas", {
      ...dados,
      valor: Number(dados.valor)
    });

    setReservas(prev =>
      [...prev, nova].sort(
        (a, b) => new Date(a.data_real) - new Date(b.data_real)
      )
    );

    setMostrarFormulario(false);
  }

  function iniciarEdicao(reserva) {
    setModoEdicao(true);
    setIdEdicao(reserva.id);
    setMostrarFormulario(true);
  }

  async function excluirReserva(reserva) {
    const confirmar = window.confirm(
      `Deseja excluir ${reserva.descricao}?`
    );

    if (!confirmar) return;

    await remover("reservas", reserva.id);

    setReservas(prev =>
      prev.filter(r => r.id !== reserva.id)
    );
  }

  async function processarReserva(reserva) {

    await inserir("transacoes", [{
      descricao: reserva.descricao,
      valor: Number(reserva.valor),
      data_real: reserva.data_real,
      mes: reserva.mes,
      parcelas: reserva.recorrencia === "Parcelado" ? reserva.parcelas : "1/1",
      quem: reserva.quem,
      quem_paga: reserva.quem_paga,
      status: "Pendente",
      category_id: reserva.category_id,
      origem: reserva.origem
    }]);

    const novaData = avancarDataReserva(reserva.data_real, reserva.recorrencia);
    const novoMes = avancarMesReserva(reserva.mes, reserva.recorrencia);
    const novaParcela = avancarParcelaReserva(reserva);

    const payload = novaData && novoMes
      ? {
          data_real: novaData,
          mes: novoMes,
          parcelas: novaParcela
        }
      : {
          recorrencia: "Concluída"
        };

    const atualizada = await atualizar("reservas", reserva.id, payload);

    setReservas(prev =>
      prev
        .map(r => r.id === reserva.id ? atualizada : r)
        .filter(r => r.recorrencia !== "Concluída")
        .sort((a, b) => new Date(a.data_real) - new Date(b.data_real))
    );
  }

  const reservasAmanda = reservas.filter(r => r.quem === "Amanda");
  const reservasCelso = reservas.filter(r => r.quem === "Celso");
  const reservasAmbos = reservas.filter(r => r.quem === "Ambos");

  function total(lista) {
    return lista.reduce((acc, r) => acc + Number(r.valor), 0);
  }

  return (
    <div className="pagina-reservas">

      <div className="cabecalho-pagina">
        <h2>Reservas</h2>

        <button
          className="btn-primario"
          onClick={() => {
            setModoEdicao(false);
            setIdEdicao(null);
            setMostrarFormulario(true);
          }}
        >
          + Nova reserva
        </button>
      </div>

      <div className="grade-reservas">

        <ColunaReservas
          titulo="Amanda"
          reservas={reservasAmanda}
          total={total(reservasAmanda)}
          aoProcessar={processarReserva}
          aoEditar={iniciarEdicao}
          aoExcluir={excluirReserva}
        />

        <ColunaReservas
          titulo="Celso"
          reservas={reservasCelso}
          total={total(reservasCelso)}
          aoProcessar={processarReserva}
          aoEditar={iniciarEdicao}
          aoExcluir={excluirReserva}
        />

        <ColunaReservas
          titulo="Ambos"
          reservas={reservasAmbos}
          total={total(reservasAmbos)}
          aoProcessar={processarReserva}
          aoEditar={iniciarEdicao}
          aoExcluir={excluirReserva}
        />

      </div>

      {mostrarFormulario && (
        <ModalNovaReserva
          aoFechar={() => {
            setMostrarFormulario(false);
            setModoEdicao(false);
            setIdEdicao(null);
          }}
          aoSalvar={salvarReserva}
          reservaInicial={
            modoEdicao
              ? reservas.find(r => r.id === idEdicao)
              : null
          }
        />
      )}

    </div>
  );
}

function ColunaReservas({
  titulo,
  reservas,
  total,
  aoProcessar,
  aoEditar,
  aoExcluir
}) {
  if (!reservas.length) return null;

  return (
    <div className="coluna-reservas">
      <div className="titulo-coluna">
        <h3>{titulo}</h3>
        <span className="total-coluna">
          R$ {total.toFixed(2)}
        </span>
      </div>

      {reservas.map(r => (
        <LinhaReserva
          key={r.id}
          reserva={r}
          aoProcessar={aoProcessar}
          aoEditar={aoEditar}
          aoExcluir={aoExcluir}
        />
      ))}
    </div>
  );
}