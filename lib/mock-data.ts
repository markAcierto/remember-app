/**
 * Shared mock data for the REMEMBER framework so the app renders
 * without a live Supabase backend. Swap these out for real queries
 * once the tables exist.
 */

export type Pillar = {
  slug: string;
  letter: string;
  name: string;
  tagline: string;
  affirmation: string;
  checkinQuestion: string;
  lessonTitles: string[];
};

export type Progress = {
  status: "completed" | "in-progress" | "locked";
  lessonIndex: number;
};

export type FeedPost = {
  id: string;
  author: string;
  time: string;
  text: string;
  type: "breakthrough" | "checkin";
  pillar?: string;
};

/**
 * The full REMEMBER framework — 8 pillars:
 * R — Recognize
 * E — Evaluate
 * M — Manage
 * E — Express
 * M — Monitor
 * B — Bridge
 * E — Evaluate (self)
 * R — Repeat
 */
export const PILLARS: Pillar[] = [
  {
    slug: "recognize",
    letter: "R",
    name: "Recognize your triggers",
    tagline: "Name the moment before the reaction.",
    affirmation: "I can see the trigger before it drives the wheel.",
    checkinQuestion: "What was the one moment today where you noticed a trigger before it got the best of you?",
    lessonTitles: [
      "What a trigger actually is",
      "Your top 3 recurring triggers",
      "Body cues that come first",
      "The difference between trigger and threat",
      "Mapping your trigger timeline",
    ],
  },
  {
    slug: "evaluate",
    letter: "E",
    name: "Evaluate the response",
    tagline: "Is it for you or for them?",
    affirmation: "I choose the response that serves who I want to be.",
    checkinQuestion: "Which response today served your longer-term goal instead of the moment's emotion?",
    lessonTitles: [
      "Short-term vs long-term payoff",
      "Who you want to be in 10 minutes",
      "A quick cost/benefit check",
      "The 10-10-10 rule for hard moments",
    ],
  },
  {
    slug: "manage",
    letter: "M",
    name: "Manage the energy",
    tagline: "Regulate before you respond.",
    affirmation: "My body and mind are on my side, even in the heat of it.",
    checkinQuestion: "What did you do in the pause that helped you stay grounded?",
    lessonTitles: [
      "The 5-second rule",
      "A physical anchor for the pause",
      "Breathing patterns that actually work",
      "Naming the emotion out loud",
      "When a walk beats a reply",
    ],
  },
  {
    slug: "express",
    letter: "E",
    name: "Express with intention",
    tagline: "Choose words that fit the goal.",
    affirmation: "My words carry my values, not just my mood.",
    checkinQuestion: "Write down one sentence you'd say differently if it happened again.",
    lessonTitles: [
      "I-statements that land",
      "Soft openers, firm asks",
      "Knowing when to stay silent",
      "The tone check before you hit send",
    ],
  },
  {
    slug: "monitor",
    letter: "M",
    name: "Monitor the aftermath",
    tagline: "Two minutes of honest review.",
    affirmation: "I learn from the echo, not just the shout.",
    checkinQuestion: "What actually happened after your response — and did it match your intention?",
    lessonTitles: [
      "What actually happened",
      "What you would repeat",
      "One small change for next time",
      "The 2-minute journal prompt",
    ],
  },
  {
    slug: "bridge",
    letter: "B",
    name: "Bridge the gap",
    tagline: "Reconnect after the storm.",
    affirmation: "A hard conversation can still leave the door open.",
    checkinQuestion: "Where did you repair or reconnect today, even a little?",
    lessonTitles: [
      "The repair conversation",
      "What 'I hear you' actually sounds like",
      "Timing the make-up",
      "When not to bridge (yet)",
    ],
  },
  {
    slug: "evaluate-self",
    letter: "E",
    name: "Evaluate yourself",
    tagline: "Be a kind, honest coach.",
    affirmation: "I treat myself with the same patience I'd offer a friend.",
    checkinQuestion: "What would you say to a friend who had your hardest moment today?",
    lessonTitles: [
      "The self-review that isn't self-flagellation",
      "Separating identity from behaviour",
      "What's within your control",
      "The 3-2-1 debrief (three wins, two misses, one lesson)",
    ],
  },
  {
    slug: "repeat",
    letter: "R",
    name: "Repeat the pattern",
    tagline: "Carry the skill into the next day.",
    affirmation: "Small reps, done daily, become the new default.",
    checkinQuestion: "Which one habit from the framework are you carrying into tomorrow?",
    lessonTitles: [
      "A 1-minute morning reset",
      "Checking in mid-conversation",
      "Evening debrief that doesn't spiral",
      "Building the 21-day loop",
    ],
  },
];

export const MOCK_PROGRESS: Record<string, Progress> = {
  recognize: { status: "completed", lessonIndex: 5 },
  evaluate: { status: "completed", lessonIndex: 4 },
  manage: { status: "in-progress", lessonIndex: 2 },
  express: { status: "locked", lessonIndex: 0 },
  monitor: { status: "locked", lessonIndex: 0 },
  bridge: { status: "locked", lessonIndex: 0 },
  "evaluate-self": { status: "locked", lessonIndex: 0 },
  repeat: { status: "locked", lessonIndex: 0 },
};

export const DAILY_PROMPTS = [
  "What was the one moment today where you chose a response instead of reacting?",
  "Which trigger showed up most often, and what was its body cue?",
  "Write down one sentence you'd say differently if it happened again.",
  "What did you do in the pause that helped?",
];

export const COMMUNITY_FEED: FeedPost[] = [
  {
    id: "c1",
    author: "Dana",
    time: "2h",
    text: "Used the 5-second rule in a meeting today. Felt weird. Worked great.",
    type: "breakthrough",
    pillar: "manage",
  },
  {
    id: "c2",
    author: "Marcus",
    time: "5h",
    text: "My top trigger is being interrupted. Now I say 'let me finish one thought.'",
    type: "checkin",
    pillar: "recognize",
  },
  {
    id: "c3",
    author: "Priya",
    time: "1d",
    text: "Evening debrief kept me from replaying an argument for an hour. Huge.",
    type: "breakthrough",
    pillar: "monitor",
  },
  {
    id: "c4",
    author: "Jordan",
    time: "1d",
    text: "Tried the 10-10-10 rule before sending a tense email. Deleted it. Wrote a better one.",
    type: "checkin",
    pillar: "evaluate",
  },
  {
    id: "c5",
    author: "Sam",
    time: "2d",
    text: "First repair conversation with my partner this month. It wasn't perfect but the door is open again.",
    type: "breakthrough",
    pillar: "bridge",
  },
];