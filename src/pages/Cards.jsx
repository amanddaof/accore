import { useState } from "react";
import CardsCarousel from "../ui/CardsCarousel";
import CreditCardFull from "../ui/CreditCardFull";

export default function Cards({ cards }) {

  const [activeIndex, setActiveIndex] = useState(0);

  if (!cards || cards.length === 0) {
    return (
      <div className="glass card">
        Nenhum cartão cadastrado.
      </div>
    );
  }

  const activeCard = cards[activeIndex];

  return (
    <div className="cards-page">

      {/* CARROSSEL */}
      <CardsCarousel
        cards={cards}
        activeIndex={activeIndex}
        onChange={setActiveIndex}
      />

      {/* CARTÃO GRANDE */}
      <CreditCardFull card={activeCard} />

    </div>
  );
}
