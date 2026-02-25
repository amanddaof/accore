// logica/calcularResumo.js

import { calcularSalarios } from "./calcularSalarios";
import { calcularTransacoes } from "./calcularTransacoes";
import { calcularReservas } from "./calcularReservas";
import { calcularContasCasa } from "./calcularContasCasa";
import { calcularEmprestimos } from "./calcularEmprestimos";
import { calcularDividas } from "./calcularDividas";

export function calcularResumo(dados) {

  const salarios = calcularSalarios(
    dados.historicoSalarios,
    dados.mesSelecionado
  );

  const transacoes = calcularTransacoes(dados.transacoesMes);

  const reservas = calcularReservas(
    dados.reservas,
    dados.transacoesMes,
    dados.mesSelecionado
  );

  const casa = calcularContasCasa(dados.contasMes);

  const emprestimos = calcularEmprestimos(dados.emprestimosMes);

  const totalAmanda =
    transacoes.totalAmanda +
    reservas.totalAmanda +
    casa.totalAmanda;

  const totalCelso =
    transacoes.totalCelso +
    reservas.totalCelso +
    casa.totalCelso +
    emprestimos.totalCelso;

    const dividas = calcularDividas({
      transacoesMes: dados.transacoesMes,
      contasMes: dados.contasMes,
      emprestimosMes: dados.emprestimosMes
    });

  return {
    salarioAmanda: salarios.salarioAmanda,
    salarioCelso: salarios.salarioCelso,
    comprometidoAmanda: totalAmanda,
    comprometidoCelso: totalCelso,
    sobraAmanda: salarios.salarioAmanda - totalAmanda,
    sobraCelso: salarios.salarioCelso - totalCelso,
    gruposAmanda: {
      ...transacoes.gruposAmanda,
      ...reservas.gruposAmanda,
      ...casa.gruposAmanda
    },
    gruposCelso: {
      ...transacoes.gruposCelso,
      ...reservas.gruposCelso,
      ...casa.gruposCelso,
      ...emprestimos.gruposCelso
    },
    dividas
  };
}