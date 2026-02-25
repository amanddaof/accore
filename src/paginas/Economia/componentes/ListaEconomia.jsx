import ItemMes from "./ItemMes";

export default function ListaEconomia({ registros, atualizarRegistro }) {

  const ordenados = [...registros].sort(
  (a, b) => Number(a.mes) - Number(b.mes)
);

  return (
    <div className="lista-economia">
      {ordenados.map(r => (
        <ItemMes
          key={r.id}
          registro={r}
          atualizarRegistro={atualizarRegistro}
        />
      ))}
    </div>
  );
}
