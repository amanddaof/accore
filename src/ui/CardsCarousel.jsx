export default function CardsCarousel({ cards, activeIndex, onChange }) {
  return (
    <div className="cards-carousel">
      {cards.map((card, index) => (
        <div
          key={card.id}
          className={index === activeIndex ? "carousel-item active" : "carousel-item"}
          onClick={() => onChange(index)}
        >
          {card.nome}
        </div>
      ))}
    </div>
  );
}
