import { useState } from "react";
import { supabase } from "../services/supabase";
import "./CardTransactions.css";
import { money } from "../utils/money";

function formatarDataCurta(data) {
  if (!data) return "";

  const [ano, mes, dia] = data.split("-");
  return `${dia}/${mes}/${ano.slice(2)}`;
}

export default function CardTransactions({ transactions = [] }) {
  const [openId, setOpenId] = useState(null);
  const [loadingId, setLoadingId] = useState(null);
console.log("transactions em CardTransactions", transactions);

  async function marcarComoPago(id) {
    setLoadingId(id);

    const { error } = await supabase
      .from("transactions")
      .update({ status: "Pago" })
      .eq("id", id);

    if (error) {
      alert("Erro ao marcar como pago");
      console.error(error);
    } else {
      setOpenId(null);

      // remove visualmente suavemente
      setTimeout(() => {
        const node = document.getElementById(`txn-${id}`);
        if (node) node.style.display = "none";
      }, 200);
    }

    setLoadingId(null);
  }

  if (!transactions.length) {
    return <div className="empty-extract">Sem compras neste mês</div>;
  }

  return (
    <div className="transactions-list">

      {transactions.map(t => {
        const aberto = openId === t.id;

        return (
          <div
            key={t.id}
            id={`txn-${t.id}`}
            className={`transaction-card ${aberto ? "open" : ""}`}
            onClick={() => setOpenId(aberto ? null : t.id)}
          >

            {/* ===== LINHA COMPACTA ===== */}
            <div className="txn-row">
              <div>
                <strong>{t.descricao}</strong>
                <span className="txn-sub">
                  {formatarDataCurta(t.data_real)} • {t.origem} • {t.mes}
                </span>
              </div>

              <div className={`txn-value ${t.status === "Pago" ? "pago" : "pendente"}`}>
                {money(t.valor)}
              </div>
            </div>

            {/* ===== DETALHES ===== */}
            {aberto && (
              <div className="txn-details">

                <div>
                  <span>Categoria</span>
                  <strong>
                    {t.categories?.name || "—"}
                  </strong>
                </div>

                <div>
                  <span>Parcelas</span>
                  <strong>{t.parcelas}</strong>
                </div>

                <div>
                  <span>Quem</span>
                  <strong>{t.quem}</strong>
                </div>

                <div>
                  <span>Status</span>
                  <strong className={t.status === "Pago" ? "pago" : "pendente"}>
                    {t.status}
                  </strong>
                </div>

                {t.status === "Pendente" && (
                  <button
                    className="mark-paid-btn"
                    onClick={e => {
                      e.stopPropagation(); 
                      marcarComoPago(t.id);
                    }}
                    disabled={loadingId === t.id}
                  >
                    {loadingId === t.id ? "Marcando..." : "Marcar como pago"}
                  </button>
                )}

              </div>
            )}

          </div>
        );
      })}

    </div>
  );
}



