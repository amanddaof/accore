// logica/calcularContasCasa.js

export function calcularContasCasa(contasMes) {

  let totalAmanda = 0;
  let totalCelso = 0;

  let gruposAmanda = { casa: 0 };
  let gruposCelso = { casa: 0 };

  contasMes.forEach(c => {
    const valorReal = Number(c.valor_real || 0);
    const valorPrevisto = Number(c.valor_previsto || 0);
    const valor = valorReal > 0 ? valorReal : valorPrevisto;
    const metade = valor / 2;

    totalAmanda += metade;
    totalCelso += metade;

    gruposAmanda.casa += metade;
    gruposCelso.casa += metade;
  });

  return {
    totalAmanda,
    totalCelso,
    gruposAmanda,
    gruposCelso
  };
}