// All 2026 FIFA World Cup matches - groups + knockout structure
// Times are US Eastern Time

const GROUP_MATCHES = [
  // ── GROUP A ──────────────────────────────────────────────
  { id: 1,  group: 'A', home: 'Mexico',       away: 'South Africa', datetime: '2026-06-11T15:00:00-04:00', venue: 'Mexico City' },
  { id: 2,  group: 'A', home: 'South Korea',  away: 'Czechia',      datetime: '2026-06-11T22:00:00-04:00', venue: 'Guadalajara' },
  { id: 3,  group: 'A', home: 'Czechia',      away: 'South Africa', datetime: '2026-06-18T12:00:00-04:00', venue: 'Atlanta' },
  { id: 4,  group: 'A', home: 'Mexico',       away: 'South Korea',  datetime: '2026-06-18T21:00:00-04:00', venue: 'Guadalajara' },
  { id: 5,  group: 'A', home: 'Czechia',      away: 'Mexico',       datetime: '2026-06-24T21:00:00-04:00', venue: 'Mexico City' },
  { id: 6,  group: 'A', home: 'South Africa', away: 'South Korea',  datetime: '2026-06-24T21:00:00-04:00', venue: 'Monterrey' },

  // ── GROUP B ──────────────────────────────────────────────
  { id: 7,  group: 'B', home: 'Canada',             away: 'Bosnia-Herzegovina', datetime: '2026-06-12T15:00:00-04:00', venue: 'Toronto' },
  { id: 8,  group: 'B', home: 'Qatar',              away: 'Switzerland',        datetime: '2026-06-13T15:00:00-04:00', venue: 'San Francisco Bay Area' },
  { id: 9,  group: 'B', home: 'Switzerland',        away: 'Bosnia-Herzegovina', datetime: '2026-06-18T15:00:00-04:00', venue: 'Los Angeles' },
  { id: 10, group: 'B', home: 'Canada',             away: 'Qatar',              datetime: '2026-06-18T18:00:00-04:00', venue: 'Vancouver' },
  { id: 11, group: 'B', home: 'Switzerland',        away: 'Canada',             datetime: '2026-06-24T15:00:00-04:00', venue: 'Vancouver' },
  { id: 12, group: 'B', home: 'Bosnia-Herzegovina', away: 'Qatar',              datetime: '2026-06-24T15:00:00-04:00', venue: 'Seattle' },

  // ── GROUP C ──────────────────────────────────────────────
  { id: 13, group: 'C', home: 'Brazil',   away: 'Morocco',  datetime: '2026-06-13T18:00:00-04:00', venue: 'New York / New Jersey' },
  { id: 14, group: 'C', home: 'Haiti',    away: 'Scotland', datetime: '2026-06-13T21:00:00-04:00', venue: 'Boston' },
  { id: 15, group: 'C', home: 'Scotland', away: 'Morocco',  datetime: '2026-06-19T18:00:00-04:00', venue: 'Boston' },
  { id: 16, group: 'C', home: 'Brazil',   away: 'Haiti',    datetime: '2026-06-19T21:00:00-04:00', venue: 'Philadelphia' },
  { id: 17, group: 'C', home: 'Scotland', away: 'Brazil',   datetime: '2026-06-24T18:00:00-04:00', venue: 'Miami' },
  { id: 18, group: 'C', home: 'Morocco',  away: 'Haiti',    datetime: '2026-06-24T18:00:00-04:00', venue: 'Atlanta' },

  // ── GROUP D ──────────────────────────────────────────────
  { id: 19, group: 'D', home: 'USA',       away: 'Paraguay',  datetime: '2026-06-12T21:00:00-04:00', venue: 'Los Angeles' },
  { id: 20, group: 'D', home: 'Australia', away: 'Türkiye',   datetime: '2026-06-13T00:00:00-04:00', venue: 'Vancouver' },
  { id: 21, group: 'D', home: 'USA',       away: 'Australia', datetime: '2026-06-19T15:00:00-04:00', venue: 'Seattle' },
  { id: 22, group: 'D', home: 'Türkiye',   away: 'Paraguay',  datetime: '2026-06-19T00:00:00-04:00', venue: 'San Francisco Bay Area' },
  { id: 23, group: 'D', home: 'Türkiye',   away: 'USA',       datetime: '2026-06-25T22:00:00-04:00', venue: 'Los Angeles' },
  { id: 24, group: 'D', home: 'Paraguay',  away: 'Australia', datetime: '2026-06-25T22:00:00-04:00', venue: 'San Francisco Bay Area' },

  // ── GROUP E ──────────────────────────────────────────────
  { id: 25, group: 'E', home: 'Germany',       away: 'Curacao',        datetime: '2026-06-14T13:00:00-04:00', venue: 'Houston' },
  { id: 26, group: 'E', home: "Côte d'Ivoire", away: 'Ecuador',        datetime: '2026-06-14T19:00:00-04:00', venue: 'Philadelphia' },
  { id: 27, group: 'E', home: 'Germany',       away: "Côte d'Ivoire",  datetime: '2026-06-20T16:00:00-04:00', venue: 'Toronto' },
  { id: 28, group: 'E', home: 'Ecuador',       away: 'Curacao',        datetime: '2026-06-20T20:00:00-04:00', venue: 'Kansas City' },
  { id: 29, group: 'E', home: 'Curacao',       away: "Côte d'Ivoire",  datetime: '2026-06-25T16:00:00-04:00', venue: 'Philadelphia' },
  { id: 30, group: 'E', home: 'Ecuador',       away: 'Germany',        datetime: '2026-06-25T16:00:00-04:00', venue: 'New York / New Jersey' },

  // ── GROUP F ──────────────────────────────────────────────
  { id: 31, group: 'F', home: 'Netherlands', away: 'Japan',   datetime: '2026-06-14T16:00:00-04:00', venue: 'Dallas' },
  { id: 32, group: 'F', home: 'Sweden',      away: 'Tunisia', datetime: '2026-06-14T22:00:00-04:00', venue: 'Monterrey' },
  { id: 33, group: 'F', home: 'Netherlands', away: 'Sweden',  datetime: '2026-06-20T13:00:00-04:00', venue: 'Houston' },
  { id: 34, group: 'F', home: 'Tunisia',     away: 'Japan',   datetime: '2026-06-20T00:00:00-04:00', venue: 'Monterrey' },
  { id: 35, group: 'F', home: 'Japan',       away: 'Sweden',  datetime: '2026-06-25T19:00:00-04:00', venue: 'Dallas' },
  { id: 36, group: 'F', home: 'Tunisia',     away: 'Netherlands', datetime: '2026-06-25T19:00:00-04:00', venue: 'Kansas City' },

  // ── GROUP G ──────────────────────────────────────────────
  { id: 37, group: 'G', home: 'Belgium',     away: 'Egypt',       datetime: '2026-06-15T15:00:00-04:00', venue: 'Seattle' },
  { id: 38, group: 'G', home: 'IR Iran',     away: 'New Zealand', datetime: '2026-06-15T21:00:00-04:00', venue: 'Los Angeles' },
  { id: 39, group: 'G', home: 'Belgium',     away: 'IR Iran',     datetime: '2026-06-21T15:00:00-04:00', venue: 'Los Angeles' },
  { id: 40, group: 'G', home: 'New Zealand', away: 'Egypt',       datetime: '2026-06-21T21:00:00-04:00', venue: 'Vancouver' },
  { id: 41, group: 'G', home: 'Egypt',       away: 'IR Iran',     datetime: '2026-06-26T23:00:00-04:00', venue: 'Seattle' },
  { id: 42, group: 'G', home: 'New Zealand', away: 'Belgium',     datetime: '2026-06-26T23:00:00-04:00', venue: 'Vancouver' },

  // ── GROUP H ──────────────────────────────────────────────
  { id: 43, group: 'H', home: 'Spain',       away: 'Cabo Verde',   datetime: '2026-06-15T12:00:00-04:00', venue: 'Atlanta' },
  { id: 44, group: 'H', home: 'Saudi Arabia', away: 'Uruguay',     datetime: '2026-06-15T18:00:00-04:00', venue: 'Miami' },
  { id: 45, group: 'H', home: 'Spain',       away: 'Saudi Arabia', datetime: '2026-06-21T12:00:00-04:00', venue: 'Atlanta' },
  { id: 46, group: 'H', home: 'Uruguay',     away: 'Cabo Verde',   datetime: '2026-06-21T18:00:00-04:00', venue: 'Miami' },
  { id: 47, group: 'H', home: 'Cabo Verde',  away: 'Saudi Arabia', datetime: '2026-06-26T20:00:00-04:00', venue: 'Houston' },
  { id: 48, group: 'H', home: 'Uruguay',     away: 'Spain',        datetime: '2026-06-26T20:00:00-04:00', venue: 'Guadalajara' },

  // ── GROUP I ──────────────────────────────────────────────
  { id: 49, group: 'I', home: 'France',  away: 'Senegal', datetime: '2026-06-16T15:00:00-04:00', venue: 'New York / New Jersey' },
  { id: 50, group: 'I', home: 'Iraq',    away: 'Norway',  datetime: '2026-06-16T18:00:00-04:00', venue: 'Boston' },
  { id: 51, group: 'I', home: 'France',  away: 'Iraq',    datetime: '2026-06-22T17:00:00-04:00', venue: 'Philadelphia' },
  { id: 52, group: 'I', home: 'Norway',  away: 'Senegal', datetime: '2026-06-22T20:00:00-04:00', venue: 'New York / New Jersey' },
  { id: 53, group: 'I', home: 'Norway',  away: 'France',  datetime: '2026-06-26T15:00:00-04:00', venue: 'Boston' },
  { id: 54, group: 'I', home: 'Senegal', away: 'Iraq',    datetime: '2026-06-26T15:00:00-04:00', venue: 'Toronto' },

  // ── GROUP J ──────────────────────────────────────────────
  { id: 55, group: 'J', home: 'Argentina', away: 'Algeria',  datetime: '2026-06-16T21:00:00-04:00', venue: 'Kansas City' },
  { id: 56, group: 'J', home: 'Austria',   away: 'Jordan',   datetime: '2026-06-16T00:00:00-04:00', venue: 'San Francisco Bay Area' },
  { id: 57, group: 'J', home: 'Argentina', away: 'Austria',  datetime: '2026-06-22T13:00:00-04:00', venue: 'Dallas' },
  { id: 58, group: 'J', home: 'Jordan',    away: 'Algeria',  datetime: '2026-06-22T23:00:00-04:00', venue: 'San Francisco Bay Area' },
  { id: 59, group: 'J', home: 'Algeria',   away: 'Austria',  datetime: '2026-06-27T22:00:00-04:00', venue: 'Kansas City' },
  { id: 60, group: 'J', home: 'Jordan',    away: 'Argentina', datetime: '2026-06-27T22:00:00-04:00', venue: 'Dallas' },

  // ── GROUP K ──────────────────────────────────────────────
  { id: 61, group: 'K', home: 'Portugal',  away: 'Congo DR',   datetime: '2026-06-17T13:00:00-04:00', venue: 'Houston' },
  { id: 62, group: 'K', home: 'Uzbekistan', away: 'Colombia',  datetime: '2026-06-17T22:00:00-04:00', venue: 'Mexico City' },
  { id: 63, group: 'K', home: 'Portugal',  away: 'Uzbekistan', datetime: '2026-06-23T13:00:00-04:00', venue: 'Houston' },
  { id: 64, group: 'K', home: 'Colombia',  away: 'Congo DR',   datetime: '2026-06-23T22:00:00-04:00', venue: 'Guadalajara' },
  { id: 65, group: 'K', home: 'Colombia',  away: 'Portugal',   datetime: '2026-06-27T19:30:00-04:00', venue: 'Miami' },
  { id: 66, group: 'K', home: 'Congo DR',  away: 'Uzbekistan', datetime: '2026-06-27T19:30:00-04:00', venue: 'Atlanta' },

  // ── GROUP L ──────────────────────────────────────────────
  { id: 67, group: 'L', home: 'England',  away: 'Croatia', datetime: '2026-06-17T16:00:00-04:00', venue: 'Dallas' },
  { id: 68, group: 'L', home: 'Ghana',    away: 'Panama',  datetime: '2026-06-17T19:00:00-04:00', venue: 'Toronto' },
  { id: 69, group: 'L', home: 'England',  away: 'Ghana',   datetime: '2026-06-23T16:00:00-04:00', venue: 'Boston' },
  { id: 70, group: 'L', home: 'Panama',   away: 'Croatia', datetime: '2026-06-23T19:00:00-04:00', venue: 'Toronto' },
  { id: 71, group: 'L', home: 'Panama',   away: 'England', datetime: '2026-06-27T17:00:00-04:00', venue: 'New York / New Jersey' },
  { id: 72, group: 'L', home: 'Croatia',  away: 'Ghana',   datetime: '2026-06-27T17:00:00-04:00', venue: 'Philadelphia' },
];

// Group definitions
const GROUPS = {
  A: ['Mexico', 'South Africa', 'South Korea', 'Czechia'],
  B: ['Canada', 'Bosnia-Herzegovina', 'Qatar', 'Switzerland'],
  C: ['Brazil', 'Morocco', 'Haiti', 'Scotland'],
  D: ['USA', 'Paraguay', 'Australia', 'Türkiye'],
  E: ['Germany', 'Curacao', "Côte d'Ivoire", 'Ecuador'],
  F: ['Netherlands', 'Japan', 'Sweden', 'Tunisia'],
  G: ['Belgium', 'Egypt', 'IR Iran', 'New Zealand'],
  H: ['Spain', 'Cabo Verde', 'Saudi Arabia', 'Uruguay'],
  I: ['France', 'Senegal', 'Iraq', 'Norway'],
  J: ['Argentina', 'Algeria', 'Austria', 'Jordan'],
  K: ['Portugal', 'Congo DR', 'Uzbekistan', 'Colombia'],
  L: ['England', 'Croatia', 'Ghana', 'Panama'],
};

// Round of 32 slots - teams filled in after group stage
// home_slot / away_slot describe who plays here (e.g. "1st A" = winner of Group A)
const KNOCKOUT_MATCHES = [
  // ── ROUND OF 32 ──────────────────────────────────────────
  { id: 73, stage: 'r32', matchNum: 1,  home_slot: '2nd A', away_slot: '2nd B',   datetime: '2026-06-28T15:00:00-04:00', venue: 'Los Angeles' },
  { id: 74, stage: 'r32', matchNum: 3,  home_slot: '1st E', away_slot: '3rd *',   datetime: '2026-06-29T16:30:00-04:00', venue: 'Boston' },
  { id: 75, stage: 'r32', matchNum: 4,  home_slot: '1st F', away_slot: '2nd C',   datetime: '2026-06-29T21:00:00-04:00', venue: 'Monterrey' },
  { id: 76, stage: 'r32', matchNum: 2,  home_slot: '1st C', away_slot: '2nd F',   datetime: '2026-06-29T13:00:00-04:00', venue: 'Houston' },
  { id: 77, stage: 'r32', matchNum: 6,  home_slot: '1st I', away_slot: '3rd *',   datetime: '2026-06-30T17:00:00-04:00', venue: 'New York / New Jersey' },
  { id: 78, stage: 'r32', matchNum: 5,  home_slot: '2nd E', away_slot: '2nd I',   datetime: '2026-06-30T13:00:00-04:00', venue: 'Dallas' },
  { id: 79, stage: 'r32', matchNum: 7,  home_slot: '1st A', away_slot: '3rd *',   datetime: '2026-06-30T21:00:00-04:00', venue: 'Mexico City' },
  { id: 80, stage: 'r32', matchNum: 8,  home_slot: '1st L', away_slot: '3rd *',   datetime: '2026-07-01T12:00:00-04:00', venue: 'Atlanta' },
  { id: 81, stage: 'r32', matchNum: 10, home_slot: '1st D', away_slot: '3rd *',   datetime: '2026-07-01T20:00:00-04:00', venue: 'San Francisco Bay Area' },
  { id: 82, stage: 'r32', matchNum: 9,  home_slot: '1st G', away_slot: '3rd *',   datetime: '2026-07-01T16:00:00-04:00', venue: 'Seattle' },
  { id: 83, stage: 'r32', matchNum: 12, home_slot: '2nd K', away_slot: '2nd L',   datetime: '2026-07-02T19:00:00-04:00', venue: 'Toronto' },
  { id: 84, stage: 'r32', matchNum: 11, home_slot: '1st H', away_slot: '2nd J',   datetime: '2026-07-02T15:00:00-04:00', venue: 'Los Angeles' },
  { id: 85, stage: 'r32', matchNum: 13, home_slot: '1st B', away_slot: '3rd *',   datetime: '2026-07-02T23:00:00-04:00', venue: 'Vancouver' },
  { id: 86, stage: 'r32', matchNum: 15, home_slot: '1st J', away_slot: '2nd H',   datetime: '2026-07-04T18:00:00-04:00', venue: 'Miami' },
  { id: 87, stage: 'r32', matchNum: 16, home_slot: '1st K', away_slot: '3rd *',   datetime: '2026-07-03T21:30:00-04:00', venue: 'Kansas City' },
  { id: 88, stage: 'r32', matchNum: 14, home_slot: '2nd D', away_slot: '2nd G',   datetime: '2026-07-03T14:00:00-04:00', venue: 'Dallas' },

  // ── ROUND OF 16 ──────────────────────────────────────────
  { id: 89, stage: 'r16', matchNum: 2, home_slot: 'W74', away_slot: 'W77', datetime: '2026-07-04T17:00:00-04:00', venue: 'Philadelphia' },
  { id: 90, stage: 'r16', matchNum: 1, home_slot: 'W73', away_slot: 'W75', datetime: '2026-07-04T13:00:00-04:00', venue: 'Houston' },
  { id: 91, stage: 'r16', matchNum: 3, home_slot: 'W76', away_slot: 'W78', datetime: '2026-07-05T16:00:00-04:00', venue: 'New York / New Jersey' },
  { id: 92, stage: 'r16', matchNum: 4, home_slot: 'W79', away_slot: 'W80', datetime: '2026-07-05T20:00:00-04:00', venue: 'Mexico City' },
  { id: 93, stage: 'r16', matchNum: 5, home_slot: 'W83', away_slot: 'W84', datetime: '2026-07-06T15:00:00-04:00', venue: 'Dallas' },
  { id: 94, stage: 'r16', matchNum: 6, home_slot: 'W81', away_slot: 'W82', datetime: '2026-07-06T20:00:00-04:00', venue: 'Seattle' },
  { id: 95, stage: 'r16', matchNum: 7, home_slot: 'W86', away_slot: 'W88', datetime: '2026-07-07T12:00:00-04:00', venue: 'Atlanta' },
  { id: 96, stage: 'r16', matchNum: 8, home_slot: 'W85', away_slot: 'W87', datetime: '2026-07-07T16:00:00-04:00', venue: 'Vancouver' },

  // ── QUARTER-FINALS ───────────────────────────────────────
  { id: 97,  stage: 'qf', matchNum: 1, home_slot: 'W89', away_slot: 'W90', datetime: '2026-07-09T16:00:00-04:00', venue: 'Boston' },
  { id: 98,  stage: 'qf', matchNum: 2, home_slot: 'W93', away_slot: 'W94', datetime: '2026-07-10T15:00:00-04:00', venue: 'Los Angeles' },
  { id: 99,  stage: 'qf', matchNum: 3, home_slot: 'W91', away_slot: 'W92', datetime: '2026-07-11T17:00:00-04:00', venue: 'Miami' },
  { id: 100, stage: 'qf', matchNum: 4, home_slot: 'W95', away_slot: 'W96', datetime: '2026-07-11T21:00:00-04:00', venue: 'Kansas City' },

  // ── SEMI-FINALS ──────────────────────────────────────────
  { id: 101, stage: 'sf', matchNum: 1, home_slot: 'W97',  away_slot: 'W98',  datetime: '2026-07-14T15:00:00-04:00', venue: 'Dallas' },
  { id: 102, stage: 'sf', matchNum: 2, home_slot: 'W99',  away_slot: 'W100', datetime: '2026-07-15T15:00:00-04:00', venue: 'Atlanta' },

  // ── THIRD PLACE ──────────────────────────────────────────
  { id: 103, stage: 'third', matchNum: 1, home_slot: 'L101', away_slot: 'L102', datetime: '2026-07-18T17:00:00-04:00', venue: 'Miami' },

  // ── FINAL ────────────────────────────────────────────────
  { id: 104, stage: 'final', matchNum: 1, home_slot: 'W101', away_slot: 'W102', datetime: '2026-07-19T15:00:00-04:00', venue: 'New York / New Jersey' },
];

const USERS = ['Kenz', 'Brad', 'Teani', 'Fischer', 'JB', 'Bet', 'Ellle', 'Senna (Chat GPT)', 'Nelson', 'Ferg (Claude)'];

// Points per correct knockout winner by stage
const KNOCKOUT_POINTS = { r32: 2, r16: 4, qf: 6, sf: 8, third: 8, final: 10 };

module.exports = { GROUP_MATCHES, KNOCKOUT_MATCHES, GROUPS, USERS, KNOCKOUT_POINTS };
