/* ============================================================
   CASE CONTENT  —  EDIT TEXT HERE
   ------------------------------------------------------------
   This is the plain-language content file. A non-technical
   editor can change any wording below without touching the
   animation code. Keep lines short; the layout is tuned for
   brevity. Do not change the logic of the case, invent
   outcomes, or add hindsight.
   ============================================================ */

/** A phrase detached from the client's statement during GROUND. */
export interface Fragment {
  id: string
  text: string
  zone: 'facts' | 'opinions' | 'gaps'
  focal?: boolean
}

/* ---- SCENE 0 · OPENING CONTEXT ---------------------------- */
export const opening = {
  eyebrow: 'Transformation caselet',
  lines: [
    'A 130,000-person technology company is falling behind.',
    'A new CEO has taken over.',
    'The client believes the problem is strategy.',
  ],
  // Quiet fragments that drift around the frame.
  ambientWords: [
    'strategy',
    'ranking',
    'competition',
    'risk',
    'failure',
    'culture',
    'silos',
    'incentives',
  ],
  rule: 'No hindsight.', // amber
  ruleSub: 'Score the decision as if you are in the room today.',
}

/* ---- SCENE 1 · GROUND ------------------------------------- */
export const ground = {
  // The client's reply, condensed into readable lines.
  statement: [
    'We are losing to cloud competitors.',
    'Our people are ranked against each other.',
    'Teams do not share much.',
    'When a project fails, that team takes the hit.',
    'We should fix the strategy first, then worry about culture.',
  ],

  // Fragments that detach from the statement and sort themselves.
  // `zone` decides the destination column; `focal` marks the one
  // reclassification the viewer should notice.
  fragments: [
    { id: 'ranking', text: 'Annual ranking', zone: 'facts' },
    { id: 'noshare', text: 'Teams do not share', zone: 'facts' },
    { id: 'punish', text: 'Failure gets punished', zone: 'facts' },
    { id: 'reward', text: 'Top performers rewarded', zone: 'facts' },
    { id: 'fixstrat', text: 'Fix strategy first', zone: 'opinions', focal: true },
    { id: 'culturewait', text: 'Culture can wait', zone: 'opinions' },
    { id: 'reaction', text: 'How will top performers react?', zone: 'gaps' },
    { id: 'employees', text: 'What do employees say?', zone: 'gaps' },
    { id: 'outside', text: 'Evidence from outside leadership?', zone: 'gaps' },
  ] as Fragment[],

  zones: [
    { id: 'facts', label: 'Facts' },
    { id: 'opinions', label: 'Opinions' },
    { id: 'gaps', label: 'Gaps' },
  ],

  problemLabel: "Client's problem",
  problemBefore: 'Losing on strategy',
  // The rewrite. Amber words are marked with **double asterisks**.
  problemAfter: 'The **culture** will not let us **execute any strategy**.',

  flagTitle: 'Most of this story comes from new leadership.',
  flagSub: 'Check your sources.',
}

/* ---- SCENE 2 · BOARD -------------------------------------- */
export const board = {
  heading: 'Board',
  question: 'What has the least evidence against it?',

  // Order here is the INITIAL (unresolved) order.
  // `rank` is the final evidence-driven position (1 = top).
  options: [
    {
      id: 'perf',
      title: 'Change the performance system first',
      against: 'Very little.',
      level: 'low', // evidence against
      reason: 'It targets the root cause and can be reversed.',
      rank: 1,
      winner: true,
    },
    {
      id: 'culture',
      title: 'Run a top-down culture campaign',
      against: 'High.',
      level: 'high',
      reason: 'Slogans without reward changes can deepen cynicism.',
      rank: 4,
    },
    {
      id: 'reorg',
      title: 'Reorganize the divisions',
      against: 'Moderate.',
      level: 'moderate',
      reason: 'Change the boxes, keep the rewards, and silos return.',
      rank: 3,
    },
    {
      id: 'strategy',
      title: 'Fix strategy first, culture later',
      against: 'High.',
      level: 'high',
      reason: 'Culture is why strategy is failing.',
      rank: 2,
    },
  ] as const,

  winnerStatus: 'High confidence',
  winnerPills: ['Root cause', 'Low evidence against', 'Reversible'],

  beats: [
    'It did not choose the flashiest option.',
    'It did not choose the client’s option.',
    'It chose the root cause.',
  ],
}

/* ---- SCENE 3 · LOCK --------------------------------------- */
export const lock = {
  title: 'Change the performance system first',
  reason:
    'The current reward system reinforces internal competition and punishes risk.',

  payQuestion: 'Who pays if this fails?',
  payNodes: [
    'The CPO’s credibility',
    'Top performers who lose the system that rewarded them',
  ],

  undoQuestion: 'Can we undo the decision?',
  undoAnswer: 'Yes',
  undoSub: 'A performance system can be changed again.',

  recoverQuestion: 'Can they recover?',
  recoverAnswer: 'No', // amber
  recoverSub:
    'If leadership announces the change and then retreats, employees learn that nothing really changes.',

  asymmetry: {
    left: { label: 'Reversible for us', value: 'Yes' },
    right: { label: 'Recoverable for them', value: 'No' }, // amber
  },

  tripwireLabel: 'Tripwire',
  tripwireStart: 'Today',
  tripwireEnd: '6 months',
  tripwireMarker: 'Watch top talent',
  tripwireSub: 'Monitor resignation patterns in the first six months.',

  heldConstantLabel: 'Held constant',
  heldConstant: [
    'Leadership remains committed',
    'No major external shock',
    'Missing evidence remains missing',
  ],

  lockLineA: 'We can undo the decision.',
  // amber on "leadership blinked"
  lockLineB: 'We cannot undo teaching people that **leadership blinked**.',
}

/* ---- SCENE 4 · END CARD ----------------------------------- */
export const end = {
  headline: 'Five decisions stayed human.', // amber on "stayed human"
  decisions: [
    'The real problem.',
    'The options.',
    'Who pays.',
    'Can we undo it?',
    'Can they recover?',
  ],
  closing: 'Everything else happened while you watched.',
  closingSub: 'The sorting, ranking, and reasoning became visible in real time.',
}
