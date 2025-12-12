export default function EmptyState({ title, text, action }) {
  return (
    <div className="empty-state">
      <h3>{title}</h3>
      <p>{text}</p>

      {action && (
        <button className="empty-btn" onClick={action.onClick}>
          {action.label}
        </button>
      )}
    </div>
  );
}
