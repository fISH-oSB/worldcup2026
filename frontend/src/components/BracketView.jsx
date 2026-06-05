import React from 'react';
import { TeamName } from '../utils/flags.jsx';

// ── Layout constants ──────────────────────────────────────────────────────────
const SH  = 50;   // slot height (px)
const SW  = 124;  // slot width (px)
const CG  = 18;   // column gap used for connector lines
const COL = SW + CG; // column step (142px)

// ── R32 vertical positions (left side, 8 slots top→bottom) ───────────────────
// Spacing: pair_inner=4, pair_sep=14, qf_group_sep=30
const R32Y = [
  0,                    // pair A, match 0
  SH + 4,              // pair A, match 1       = 54
  SH + 4 + SH + 14,   // pair B, match 0       = 118
  SH + 4 + SH + 14 + SH + 4,  // pair B m1    = 172
  // --- QF group gap 30px ---
  SH + 4 + SH + 14 + SH + 4 + SH + 30, // pair C m0 = 252
  SH + 4 + SH + 14 + SH + 4 + SH + 30 + SH + 4, // = 306
  SH + 4 + SH + 14 + SH + 4 + SH + 30 + SH + 4 + SH + 14, // pair D m0 = 370
  SH + 4 + SH + 14 + SH + 4 + SH + 30 + SH + 4 + SH + 14 + SH + 4, // = 424
];
// Verify: R32Y = [0, 54, 118, 172, 252, 306, 370, 424]

// Derived R16 Y (centered over pairs)
function centerY(topA, topB) {
  return Math.round((topA + topB + SH) / 2 - SH / 2);
}
const R16Y = [
  centerY(R32Y[0], R32Y[1]),  // = centerY(0,54)  = (0+54+50)/2-25 = 52-25 = 27
  centerY(R32Y[2], R32Y[3]),  // = centerY(118,172)= (118+172+50)/2-25 = 170-25 = 145
  centerY(R32Y[4], R32Y[5]),  // = centerY(252,306)= (252+306+50)/2-25 = 304-25 = 279
  centerY(R32Y[6], R32Y[7]),  // = centerY(370,424)= (370+424+50)/2-25 = 447-25 = 397
];
const QFY = [
  centerY(R16Y[0], R16Y[1]),  // = centerY(27,145) = (27+145+50)/2-25 = 111-25 = 86
  centerY(R16Y[2], R16Y[3]),  // = centerY(279,397)= (279+397+50)/2-25 = 363-25 = 338
];
const SFY = centerY(QFY[0], QFY[1]); // = centerY(86,338) = (86+338+50)/2-25 = 237-25 = 212
const TOTAL_H = R32Y[7] + SH;        // 424 + 50 = 474

// Final / 3rd slots are taller because they contain a label header (~12px)
// plus two team rows (~24px each) + divider = ~62px total
const LABELED_SH = 64;

// Final vertically centered (use LABELED_SH so it's truly centered)
const FINAL_Y  = Math.round((TOTAL_H - LABELED_SH) / 2); // ≈ 205
const THIRD_Y  = FINAL_Y + LABELED_SH + 10;              // gap below Final

// ── X positions ───────────────────────────────────────────────────────────────
// Left: R32@0, R16@142, QF@284, SF@426
// Center gap = 36
// Final starts at: 426 + SW + 36 = 586
// Right (mirror): right-SF@586+SW+36=760, right-QF@902, right-R16@1044, right-R32@1186
const CENTER_GAP = 36;
const FINAL_X    = 4 * COL + CENTER_GAP;
const RIGHT_BASE = FINAL_X + SW + CENTER_GAP; // x of right SF

const TOTAL_W    = RIGHT_BASE + 4 * COL;

// ── Bracket structure ─────────────────────────────────────────────────────────
// Left bracket: 4 groups, each group has { r32: [id,id], r16: id, qfIdx, sfId }
const LEFT_GROUPS = [
  { r32: [73, 75], r16: 90, r32Idx: 0 },
  { r32: [74, 77], r16: 89, r32Idx: 2 },
  { r32: [83, 84], r16: 93, r32Idx: 4 },
  { r32: [81, 82], r16: 94, r32Idx: 6 },
];
const LEFT_QF   = [97, 98];  // QF[0] gets R16[0,1]; QF[1] gets R16[2,3]
const LEFT_SF   = 101;

const RIGHT_GROUPS = [
  { r32: [76, 78], r16: 91, r32Idx: 0 },
  { r32: [79, 80], r16: 92, r32Idx: 2 },
  { r32: [85, 87], r16: 96, r32Idx: 4 },
  { r32: [86, 88], r16: 95, r32Idx: 6 },
];
const RIGHT_QF  = [99, 100];
const RIGHT_SF  = 102;
const FINAL_ID  = 104;
const THIRD_ID  = 103;

// ── Build absolute position map ───────────────────────────────────────────────
function buildPositions() {
  const p = {};

  // LEFT
  LEFT_GROUPS.forEach(({ r32, r16, r32Idx }) => {
    p[r32[0]] = { x: 0,       y: R32Y[r32Idx] };
    p[r32[1]] = { x: 0,       y: R32Y[r32Idx + 1] };
    p[r16]    = { x: COL,     y: R16Y[r32Idx / 2] };
  });
  LEFT_QF.forEach((id, i) => { p[id] = { x: 2 * COL, y: QFY[i] }; });
  p[LEFT_SF] = { x: 3 * COL, y: SFY };

  // Final & 3rd (centered)
  p[FINAL_ID] = { x: FINAL_X, y: FINAL_Y };
  p[THIRD_ID] = { x: FINAL_X, y: THIRD_Y };

  // RIGHT (mirror — R32 outermost, columns go inward)
  RIGHT_GROUPS.forEach(({ r32, r16, r32Idx }) => {
    p[r32[0]] = { x: RIGHT_BASE + 3 * COL, y: R32Y[r32Idx] };
    p[r32[1]] = { x: RIGHT_BASE + 3 * COL, y: R32Y[r32Idx + 1] };
    p[r16]    = { x: RIGHT_BASE + 2 * COL, y: R16Y[r32Idx / 2] };
  });
  RIGHT_QF.forEach((id, i) => { p[id] = { x: RIGHT_BASE + COL, y: QFY[i] }; });
  p[RIGHT_SF] = { x: RIGHT_BASE, y: SFY };

  return p;
}

const POSITIONS = buildPositions();

// ── SVG connector paths ───────────────────────────────────────────────────────
// Left connectors: lines go RIGHT (from match's right edge to parent's left edge)
function leftPaths() {
  const paths = [];

  const connect = (feedA, feedB, parent) => {
    const midX = POSITIONS[feedA].x + SW + CG / 2;
    const ay   = POSITIONS[feedA].y + SH / 2;
    const by   = POSITIONS[feedB].y + SH / 2;
    const py   = POSITIONS[parent].y + SH / 2;
    const px   = POSITIONS[parent].x;
    paths.push(`M${POSITIONS[feedA].x + SW},${ay}H${midX}M${POSITIONS[feedB].x + SW},${by}H${midX}M${midX},${ay}V${by}M${midX},${py}H${px}`);
  };

  // R32 → R16
  LEFT_GROUPS.forEach(({ r32, r16 }) => connect(r32[0], r32[1], r16));
  // R16 → QF
  connect(LEFT_GROUPS[0].r16, LEFT_GROUPS[1].r16, LEFT_QF[0]);
  connect(LEFT_GROUPS[2].r16, LEFT_GROUPS[3].r16, LEFT_QF[1]);
  // QF → SF
  connect(LEFT_QF[0], LEFT_QF[1], LEFT_SF);
  // SF → Final
  const sfMidX = POSITIONS[LEFT_SF].x + SW + (FINAL_X - POSITIONS[LEFT_SF].x - SW) / 2;
  const sfY = POSITIONS[LEFT_SF].y + SH / 2;
  const fy  = POSITIONS[FINAL_ID].y + SH / 2;
  paths.push(`M${POSITIONS[LEFT_SF].x + SW},${sfY}H${sfMidX}M${sfMidX},${sfY}V${fy}M${sfMidX},${fy}H${FINAL_X}`);

  return paths.join(' ');
}

// Right connectors: lines go LEFT (from match's left edge to parent's right edge)
function rightPaths() {
  const paths = [];

  const connect = (feedA, feedB, parent) => {
    const midX = POSITIONS[feedA].x - CG / 2;
    const ay   = POSITIONS[feedA].y + SH / 2;
    const by   = POSITIONS[feedB].y + SH / 2;
    const py   = POSITIONS[parent].y + SH / 2;
    const px   = POSITIONS[parent].x + SW;
    paths.push(`M${POSITIONS[feedA].x},${ay}H${midX}M${POSITIONS[feedB].x},${by}H${midX}M${midX},${ay}V${by}M${midX},${py}H${px}`);
  };

  RIGHT_GROUPS.forEach(({ r32, r16 }) => connect(r32[0], r32[1], r16));
  connect(RIGHT_GROUPS[0].r16, RIGHT_GROUPS[1].r16, RIGHT_QF[0]);
  connect(RIGHT_GROUPS[2].r16, RIGHT_GROUPS[3].r16, RIGHT_QF[1]);
  connect(RIGHT_QF[0], RIGHT_QF[1], RIGHT_SF);
  // SF → Final
  const sfMidX = POSITIONS[RIGHT_SF].x - (POSITIONS[RIGHT_SF].x - FINAL_X - SW) / 2;
  const sfY = POSITIONS[RIGHT_SF].y + SH / 2;
  const fy  = POSITIONS[FINAL_ID].y + SH / 2;
  paths.push(`M${POSITIONS[RIGHT_SF].x},${sfY}H${sfMidX}M${sfMidX},${sfY}V${fy}M${sfMidX},${fy}H${FINAL_X + SW}`);

  return paths.join(' ');
}

// ── Match slot component ──────────────────────────────────────────────────────
function MatchSlot({ matchId, home, away, userPick, realWinner, onPick, label, highlight }) {
  const pos = POSITIONS[matchId];
  if (!pos) return null; // safety guard for unknown match IDs

  const teamsKnown = !!(home && away);
  const slotH = label ? LABELED_SH : SH;

  // TeamRow uses flex-1 so it always fills available space regardless of label
  function TeamRow({ team }) {
    if (!team) {
      return (
        <div className="flex-1 flex items-center px-2 text-gray-300 text-xs italic min-h-[22px]">
          TBD
        </div>
      );
    }
    const isRealWin = realWinner === team;
    const isPicked  = userPick   === team;
    return (
      <button
        onClick={() => teamsKnown && onPick?.(matchId, team)}
        className={`flex-1 flex items-center gap-1 px-1.5 min-h-[22px] w-full text-left transition-all text-xs font-medium
          ${isRealWin ? 'bg-green-50 text-green-700 font-bold' :
            isPicked  ? 'text-white font-bold' :
                        'text-gray-700 hover:bg-gray-50'}`}
        style={{
          background: isPicked && !isRealWin ? 'linear-gradient(135deg,#7B1D2E,#4A1060)' : undefined,
        }}
        title={team ? `Pick ${team}` : undefined}
      >
        <TeamName name={team} size={11} className="truncate" />
      </button>
    );
  }

  return (
    <div
      className="absolute overflow-hidden rounded border shadow-sm bg-white flex flex-col"
      style={{
        left: pos.x,
        top:  pos.y,
        width: SW,
        minHeight: slotH,
        borderColor: highlight ? '#7B1D2E' : '#e5e7eb',
        borderWidth: highlight ? 2 : 1,
      }}
    >
      {label && (
        <div
          className="text-white text-center leading-none font-bold flex-shrink-0"
          style={{ fontSize: 8, padding: '2px 0', background: 'linear-gradient(135deg,#7B1D2E,#4A1060)' }}
        >
          {label}
        </div>
      )}
      <TeamRow team={home} />
      <div className="border-t border-gray-100 flex-shrink-0" />
      <TeamRow team={away} />
    </div>
  );
}

// ── Round labels ──────────────────────────────────────────────────────────────
const ROUND_LABELS = [
  { x: 0,            label: 'Round of 32', pts: 2 },
  { x: COL,          label: 'Round of 16', pts: 4 },
  { x: 2 * COL,      label: 'Quarter-finals', pts: 6 },
  { x: 3 * COL,      label: 'Semi-finals', pts: 8 },
  { x: FINAL_X,      label: 'Final', pts: 10 },
  { x: RIGHT_BASE,            label: 'Semi-finals', pts: 8 },
  { x: RIGHT_BASE + COL,      label: 'Quarter-finals', pts: 6 },
  { x: RIGHT_BASE + 2 * COL,  label: 'Round of 16', pts: 4 },
  { x: RIGHT_BASE + 3 * COL,  label: 'Round of 32', pts: 2 },
];

// ── Main component ────────────────────────────────────────────────────────────
export default function BracketView({ knockoutMatches, teamsFor, predictions, onPick }) {
  const matchMap = {};
  knockoutMatches.forEach(m => { matchMap[m.id] = m; });

  const allIds = [
    ...LEFT_GROUPS.flatMap(g => g.r32), ...LEFT_GROUPS.map(g => g.r16),
    ...LEFT_QF, LEFT_SF,
    ...RIGHT_GROUPS.flatMap(g => g.r32), ...RIGHT_GROUPS.map(g => g.r16),
    ...RIGHT_QF, RIGHT_SF,
    FINAL_ID, THIRD_ID,
  ];

  const STAGE_PTS = { r32: 2, r16: 4, qf: 6, sf: 8, final: 10, third: 8 };

  return (
    <div className="overflow-x-auto pb-4">
      {/* Round header labels */}
      <div className="relative mb-2" style={{ width: TOTAL_W, minWidth: TOTAL_W }}>
        {ROUND_LABELS.map(({ x, label, pts }) => (
          <div
            key={`${x}-${label}`}
            className="absolute text-center"
            style={{ left: x, width: SW, top: 0 }}
          >
            <div className="text-xs font-bold text-gray-600 truncate">{label}</div>
            <div className="text-xs text-gray-400">{pts}pts</div>
          </div>
        ))}
      </div>

      {/* Main bracket */}
      <div className="relative" style={{ width: TOTAL_W, minWidth: TOTAL_W, height: Math.max(TOTAL_H, THIRD_Y + LABELED_SH) + 20 }}>
        {/* SVG connector lines */}
        <svg
          style={{ position: 'absolute', inset: 0, pointerEvents: 'none', overflow: 'visible' }}
          width={TOTAL_W}
          height={TOTAL_H}
        >
          <path d={leftPaths()}  stroke="#d1d5db" strokeWidth="1.5" fill="none" />
          <path d={rightPaths()} stroke="#d1d5db" strokeWidth="1.5" fill="none" />
          {/* Final center connector dot */}
          <circle cx={FINAL_X + SW / 2} cy={FINAL_Y + SH / 2} r="3" fill="#7B1D2E" />
        </svg>

        {/* Match slots */}
        {allIds.map(id => {
          const m     = matchMap[id];
          if (!m) return null;
          const teams = teamsFor?.[id] ?? { home: m.home_team, away: m.away_team };
          const pts   = STAGE_PTS[m.stage];
          const isFinal = m.stage === 'final';
          const isThird = m.stage === 'third';

          return (
            <MatchSlot
              key={id}
              matchId={id}
              home={teams.home}
              away={teams.away}
              userPick={predictions[id]?.pred_winner}
              realWinner={m.winner}
              onPick={onPick}
              highlight={isFinal}
              label={
                isFinal ? '🏆 FINAL — 10pts'
                : isThird ? '🥉 3rd Place — 8pts'
                : null
              }
            />
          );
        })}

      </div>
    </div>
  );
}
