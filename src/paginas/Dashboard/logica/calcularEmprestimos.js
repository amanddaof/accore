// logica/calcularEmprestimos.js

export function calcularEmprestimos(emprestimosMes) {

  let totalCelso = 0;
  let gruposCelso = { emprestimos: 0 };

  emprestimosMes.forEach(e => {
    const valor = Number(e.valor || 0);
    totalCelso += valor;
    gruposCelso.emprestimos += valor;
  });

  return {
    totalAmanda: 0,
    totalCelso,
    gruposAmanda: {},
    gruposCelso
  };
}