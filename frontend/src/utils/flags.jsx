// Maps team names → emoji flags + optional PNG path from the zip
// PNG files live in /flags/World_Cup_Flags/PNG/
const TEAM_FLAGS = {
  // ── Group A ──
  'Mexico':           { emoji: '🇲🇽', png: '/flags/World_Cup_Flags/PNG/Mexico.png' },
  'South Africa':     { emoji: '🇿🇦', png: null },
  'South Korea':      { emoji: '🇰🇷', png: '/flags/World_Cup_Flags/PNG/Korea_Republic.png' },
  'Czechia':          { emoji: '🇨🇿', png: '/flags/World_Cup_Flags/PNG/Czech_Republic.png' },

  // ── Group B ──
  'Canada':           { emoji: '🇨🇦', png: null },
  'Bosnia-Herzegovina': { emoji: '🇧🇦', png: null },
  'Qatar':            { emoji: '🇶🇦', png: null },
  'Switzerland':      { emoji: '🇨🇭', png: '/flags/World_Cup_Flags/PNG/Switzerland.png' },

  // ── Group C ──
  'Brazil':           { emoji: '🇧🇷', png: '/flags/World_Cup_Flags/PNG/Brazil.png' },
  'Morocco':          { emoji: '🇲🇦', png: null },
  'Haiti':            { emoji: '🇭🇹', png: null },
  'Scotland':         { emoji: '🏴󠁧󠁢󠁳󠁣󠁴󠁿', png: null },

  // ── Group D ──
  'USA':              { emoji: '🇺🇸', png: '/flags/World_Cup_Flags/PNG/USA.png' },
  'Paraguay':         { emoji: '🇵🇾', png: '/flags/World_Cup_Flags/PNG/Paraguay.png' },
  'Australia':        { emoji: '🇦🇺', png: '/flags/World_Cup_Flags/PNG/Australia.png' },
  'Türkiye':          { emoji: '🇹🇷', png: null },

  // ── Group E ──
  'Germany':          { emoji: '🇩🇪', png: '/flags/World_Cup_Flags/PNG/Germany.png' },
  'Curacao':          { emoji: '🇨🇼', png: null },
  "Côte d'Ivoire":    { emoji: '🇨🇮', png: '/flags/World_Cup_Flags/PNG/Cote_dIvoire.png' },
  'Ecuador':          { emoji: '🇪🇨', png: '/flags/World_Cup_Flags/PNG/Ecuador.png' },

  // ── Group F ──
  'Netherlands':      { emoji: '🇳🇱', png: '/flags/World_Cup_Flags/PNG/Netherlands.png' },
  'Japan':            { emoji: '🇯🇵', png: '/flags/World_Cup_Flags/PNG/Japan.png' },
  'Sweden':           { emoji: '🇸🇪', png: '/flags/World_Cup_Flags/PNG/Sweden.png' },
  'Tunisia':          { emoji: '🇹🇳', png: '/flags/World_Cup_Flags/PNG/Tunisia.png' },

  // ── Group G ──
  'Belgium':          { emoji: '🇧🇪', png: null },
  'Egypt':            { emoji: '🇪🇬', png: null },
  'IR Iran':          { emoji: '🇮🇷', png: '/flags/World_Cup_Flags/PNG/Iran.png' },
  'New Zealand':      { emoji: '🇳🇿', png: null },

  // ── Group H ──
  'Spain':            { emoji: '🇪🇸', png: '/flags/World_Cup_Flags/PNG/Spain.png' },
  'Cabo Verde':       { emoji: '🇨🇻', png: null },
  'Saudi Arabia':     { emoji: '🇸🇦', png: '/flags/World_Cup_Flags/PNG/Saudi_Arabia.png' },
  'Uruguay':          { emoji: '🇺🇾', png: null },

  // ── Group I ──
  'France':           { emoji: '🇫🇷', png: '/flags/World_Cup_Flags/PNG/France.png' },
  'Senegal':          { emoji: '🇸🇳', png: null },
  'Iraq':             { emoji: '🇮🇶', png: null },
  'Norway':           { emoji: '🇳🇴', png: null },

  // ── Group J ──
  'Argentina':        { emoji: '🇦🇷', png: '/flags/World_Cup_Flags/PNG/Argentina.png' },
  'Algeria':          { emoji: '🇩🇿', png: null },
  'Austria':          { emoji: '🇦🇹', png: null },
  'Jordan':           { emoji: '🇯🇴', png: null },

  // ── Group K ──
  'Portugal':         { emoji: '🇵🇹', png: '/flags/World_Cup_Flags/PNG/Portugal.png' },
  'Congo DR':         { emoji: '🇨🇩', png: null },
  'Uzbekistan':       { emoji: '🇺🇿', png: null },
  'Colombia':         { emoji: '🇨🇴', png: null },

  // ── Group L ──
  'England':          { emoji: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', png: '/flags/World_Cup_Flags/PNG/England.png' },
  'Croatia':          { emoji: '🇭🇷', png: '/flags/World_Cup_Flags/PNG/Croatia.png' },
  'Ghana':            { emoji: '🇬🇭', png: '/flags/World_Cup_Flags/PNG/Ghana.png' },
  'Panama':           { emoji: '🇵🇦', png: null },
};

export function getFlag(teamName) {
  return TEAM_FLAGS[teamName] || { emoji: '🏳️', png: null };
}

// Returns a small flag image element or emoji span
export function FlagImg({ team, size = 20, className = '' }) {
  const flag = getFlag(team);
  if (flag.png) {
    return (
      <img
        src={flag.png}
        alt={team}
        width={size}
        height={size}
        className={`inline-block object-cover rounded-sm ${className}`}
        onError={e => { e.target.style.display = 'none'; e.target.nextSibling && (e.target.nextSibling.style.display = 'inline'); }}
      />
    );
  }
  return <span className={`text-base leading-none ${className}`} title={team}>{flag.emoji}</span>;
}

export function TeamName({ name, size = 18, className = '' }) {
  const flag = getFlag(name);
  return (
    <span className={`inline-flex items-center gap-1.5 ${className}`}>
      {flag.png
        ? <img src={flag.png} alt="" width={size} height={size} className="inline-block rounded-sm flex-shrink-0"
            onError={e => { e.target.replaceWith(Object.assign(document.createElement('span'), { textContent: flag.emoji })); }} />
        : <span className="text-sm leading-none flex-shrink-0">{flag.emoji}</span>
      }
      <span>{name}</span>
    </span>
  );
}
