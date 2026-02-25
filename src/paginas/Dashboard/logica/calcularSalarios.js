// logica/calcularSalarios.js

export function calcularSalarios(historicoSalarios, mesSelecionado) {

  function salarioDaPessoa(pessoa) {
    const [mesStr, anoStr] = mesSelecionado.split("/");

    const mapaMeses = {
      Jan: 0, Fev: 1, Mar: 2, Abr: 3, Mai: 4, Jun: 5,
      Jul: 6, Ago: 7, Set: 8, Out: 9, Nov: 10, Dez: 11,
    };

    const dataReferencia = new Date(
      2000 + Number(anoStr),
      mapaMeses[mesStr],
      1
    );

    const salarios = historicoSalarios
      .filter(
        s =>
          s.quem?.toLowerCase() === pessoa.toLowerCase() &&
          new Date(s.data) <= dataReferencia
      )
      .sort((a, b) => new Date(b.data) - new Date(a.data));

    return salarios.length ? Number(salarios[0].valor) : 0;
  }

  return {
    salarioAmanda: salarioDaPessoa("Amanda"),
    salarioCelso: salarioDaPessoa("Celso")
  };
}