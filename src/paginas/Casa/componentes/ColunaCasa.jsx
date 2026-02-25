import ListaPendentes from "./ListaPendentes";
import ListaPagas from "./ListaPagas";
import BillAtual from "./BillAtual";

export default function ColunaCasa({ nome, bills, mesSelecionado, onUpdate }) {
  const pendentes = bills.filter(b => b.status !== "Pago");
  const pagas = bills.filter(b => b.status === "Pago");

  const contaDoMes = bills.find(b => b.mes === mesSelecionado);
  const proximas = pendentes.filter(b => b.mes !== mesSelecionado);

  return (
    <div className="casa-coluna">
      <h3>{nome}</h3>

      {contaDoMes && (
        <BillAtual bill={contaDoMes} onUpdate={onUpdate} />
      )}

      {proximas.length > 0 && (
        <ListaPendentes titulo="Próximas" bills={proximas} />
      )}

      {pagas.filter(p => p.mes !== mesSelecionado).length > 0 && (
        <ListaPagas
          titulo="Pagas"
          bills={pagas.filter(p => p.mes !== mesSelecionado)}
        />
      )}
    </div>
  );
}
