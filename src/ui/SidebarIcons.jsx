export function SidebarIcon({ name }) {
  const icons = {
    salary: (
	  <svg viewBox="0 0 24 24" width="20">
		<rect x="3" y="6" width="18" height="12" rx="3" />
		<path d="M16 10c0-1.1-1.8-2-4-2s-4 .9-4 2 1.8 2 4 2 4 .9 4 2-1.8 2-4 2-4-.9-4-2" />
	  </svg>
	),

    cards: (
      <svg viewBox="0 0 24 24" width="20">
        <rect x="2" y="5" width="20" height="14" rx="3" />
        <rect x="2" y="9" width="20" height="2" />
      </svg>
    ),

    loans: (
  <svg viewBox="0 0 24 24" width="24">

    {/* CIFRÃO */}
    <text
      x="12"
      y="9"
      textAnchor="middle"
      fontSize="6"
      fontFamily="Arial, sans-serif"
      fill="white"
    >
      $
    </text>

    {/* PALMA DA MÃO (MAIOR) */}
    <path d="M3 15
             c0-2.5 2.5-4 4.5-4h9
             c2.5 0 4 1.6 4 3.4
             0 2.2-2.2 3.6-4.8 3.6H9
             c-2.8 0-6-1.5-6-3z" />

    {/* PULSO */}
    <path d="M2.8 17.8h9.5" />

  </svg>
),

    categories: (
      <svg viewBox="0 0 24 24" width="20">
        <rect x="3" y="3" width="7" height="7" />
        <rect x="14" y="3" width="7" height="7" />
        <rect x="3" y="14" width="7" height="7" />
        <rect x="14" y="14" width="7" height="7" />
      </svg>
    ),

    settings: (
      <svg viewBox="0 0 24 24" width="20">
        <circle cx="12" cy="12" r="3" />
        <path d="M19 12a7 7 0 00-.1-1l2.1-1.6-2-3.4-2.5 1a7.5 7.5 0 00-1.8-1L12 2 9.2 4a7.5 7.5 0 00-1.8 1l-2.5-1-2 3.4L5.1 11a7 7 0 000 2l-2.1 1.6 2 3.4 2.5-1c.5.4 1.1.8 1.8 1l2.8 2 2.8-2c.7-.2 1.3-.6 1.8-1l2.5 1 2-3.4L18.9 13a7 7 0 00.1-1z" />
      </svg>
    )
  };

  return (
    <span
      style={{
        width: 20,
        height: 20,
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center"
      }}
    >
      {icons[name]}
    </span>
  );
}
