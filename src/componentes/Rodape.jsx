import "./estilos/Rodape.css";

export default function Rodape() {
  return (
    <footer className="rodape">
      <div className="rodape-conteudo">
               
        <div className="rodape-linha-principal">
          <img src="/img/logo-accore-quadrada.png" alt="ACCORE" className="rodape-logo" />
          <span className="rodape-nome">AC•CORE</span>
          <span className="rodape-separador">—</span>
          <span className="rodape-slogan">
            Clareza. Controle. Evolução.
          </span>
        </div>

        <div className="rodape-linha-secundaria">
          <span>Versão 3.0</span>
          <span className="rodape-bolinha">•</span>
          <span>© 2026 ACCORE</span>
        </div>

      </div>
    </footer>
  );
}
