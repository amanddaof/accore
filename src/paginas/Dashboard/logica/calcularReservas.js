// logica/calcularReservas.js

function mesParaNumero(mesStr) {
  const meses = {
    Jan: 0, Fev: 1, Mar: 2, Abr: 3, Mai: 4, Jun: 5,
    Jul: 6, Ago: 7, Set: 8, Out: 9, Nov: 10, Dez: 11
  };

  const [mes, ano] = mesStr.split("/");
  return new Date(2000 + Number(ano), meses[mes], 1);
}

function reservaImpactaMes(reserva, mesSelecionado) {
  if (!reserva.mes) return false;

  const dataInicio = mesParaNumero(reserva.mes);
  const dataSelecionada = mesParaNumero(mesSelecionado);

  if (dataSelecionada < dataInicio) return false;

  const diffMeses =
    (dataSelecionada.getFullYear() - dataInicio.getFullYear()) * 12 +
    (dataSelecionada.getMonth() - dataInicio.getMonth());

  switch (reserva.recorrencia) {
    case "Mensal": return true;
    case "Bimestral": return diffMeses % 2 === 0;
    case "Trimestral": return diffMeses % 3 === 0;
    case "Única": return diffMeses === 0;
    case "Parcelado": {
      const total = reserva.parcelas?.split("/")[1];
      return diffMeses < Number(total);
    }
    default: return false;
  }
}

export function calcularReservas(reservas, transacoesMes, mesSelecionado) {

  let totalAmanda = 0;
  let totalCelso = 0;

  let gruposAmanda = { reservas: 0 };
  let gruposCelso = { reservas: 0 };

  const reservasAmandaDetalhadas = [];
  const reservasCelsoDetalhadas = [];

  reservas.forEach(r => {

    if (!reservaImpactaMes(r, mesSelecionado)) return;

    const jaProcessada = transacoesMes.some(
      t =>
        t.descricao === r.descricao &&
        t.mes === mesSelecionado
    );

    if (jaProcessada) return;

    const valor = Number(r.valor || 0);

    if (r.quem === "Amanda") {
      totalAmanda += valor;
      gruposAmanda.reservas += valor;

      reservasAmandaDetalhadas.push({
        nome: r.descricao,
        valor
      });
    }

    if (r.quem === "Celso") {
      totalCelso += valor;
      gruposCelso.reservas += valor;

      reservasCelsoDetalhadas.push({
        nome: r.descricao,
        valor
      });
    }

    if (r.quem === "Ambos") {
      totalAmanda += valor;
      totalCelso += valor;

      gruposAmanda.reservas += valor;
      gruposCelso.reservas += valor;

      reservasAmandaDetalhadas.push({
        nome: r.descricao,
        valor
      });

      reservasCelsoDetalhadas.push({
        nome: r.descricao,
        valor
      });
    }
  });

  return {
    totalAmanda,
    totalCelso,
    gruposAmanda,
    gruposCelso,
    reservasAmandaDetalhadas,
    reservasCelsoDetalhadas
  };
}