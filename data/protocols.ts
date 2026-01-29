
import { Protocol, EvidenceLevel } from '../types';
import { PT_PROTOCOLS_EXPANDED } from './protocols_pt';

// Standardized IDs ensure that switching languages keeps the same protocol selected if possible.
// Content is now fully separated by language.

const EN_PROTOCOLS: Protocol[] = [
  // --- FOCUS ---
  {
    id: "pomodoro-classic",
    title: "Pomodoro Technique (Standard)",
    description: "Work for 25 minutes, break for 5. Repeat 4 times, then take a long break.",
    mechanism: "Mitigates the brain's limbic resistance to starting tasks by shortening the commitment time. Regular breaks prevent cognitive fatigue by replenishing neurotransmitters.",
    evidenceLevel: EvidenceLevel.SILVER,
    tags: ["Focus", "Time Management", "Beginner", "Habits"],
    durationDays: 7,
    recommendedMetrics: ["Completed Cycles", "Focus Quality (1-10)", "Internal Distractions"],
    contraindications: ["Deep creative work requiring flow states > 60min"],
    steps: [
      { order: 1, title: "Pick One Task", description: "Choose exactly one task. No multitasking.", isMandatory: true },
      { order: 2, title: "Set Timer", description: "Set timer for 25 minutes.", isMandatory: true },
      { order: 3, title: "Work", description: "Work until the timer rings.", isMandatory: true },
      { order: 4, title: "Short Break", description: "5 minutes. Step away from the screen.", isMandatory: true }
    ],
    citations: [{ title: "The effect of time management training", author: "Häfner, A.", year: 2014 }]
  },
  {
    id: "deep-work-90",
    title: "Ultradian Deep Work Cycles",
    description: "90-minute blocks of uninterrupted cognitive work followed by 20 minutes of rest.",
    mechanism: "Aligns work bouts with the human Basic Rest-Activity Cycle (BRAC). The brain can sustain high-frequency beta-wave activity for approx 90 minutes.",
    evidenceLevel: EvidenceLevel.SILVER,
    tags: ["Focus", "Advanced", "Cognition", "Productivity"],
    durationDays: 14,
    recommendedMetrics: ["Hours of Deep Work", "Subjective Clarity", "Task Progress"],
    contraindications: [],
    steps: [
      { order: 1, title: "Eliminate Inputs", description: "Phone in another room, email closed.", isMandatory: true },
      { order: 2, title: "Work 90m", description: "Focus on a single complex problem.", isMandatory: true },
      { order: 3, title: "Active Recovery", description: "20 min walk or NSDR.", isMandatory: true }
    ],
    citations: [{ title: "Deep Work", author: "Cal Newport", year: 2016 }]
  },
  {
    id: "eat-frog",
    title: "Eat The Frog",
    description: "Completing the most difficult task immediately upon starting the day.",
    mechanism: "Leverages the morning Cortisol Awakening Response (CAR) for peak alertness and reduces cognitive load from procrastination.",
    evidenceLevel: EvidenceLevel.BRONZE,
    tags: ["Productivity", "Psychology", "Focus", "Habits"],
    durationDays: 7,
    recommendedMetrics: ["Daily Satisfaction", "Afternoon Stress Level"],
    contraindications: [],
    steps: [
      { order: 1, title: "Identify the Frog", description: "The task you are avoiding.", isMandatory: true },
      { order: 2, title: "Do It First", description: "Before checking email.", isMandatory: true }
    ],
    citations: [{ title: "Eat That Frog!", author: "Brian Tracy", year: 2001 }]
  },
  // --- SLEEP ---
  {
    id: "nsdr",
    title: "NSDR (Non-Sleep Deep Rest)",
    description: "20-minute guided relaxation protocol (Yoga Nidra).",
    mechanism: "Engages the parasympathetic nervous system via specific breathing and body scanning. Increases striatal dopamine.",
    evidenceLevel: EvidenceLevel.GOLD,
    tags: ["Recovery", "Sleep", "Stress", "Anxiety"],
    durationDays: 14,
    recommendedMetrics: ["Post-session Energy", "Nightly HRV", "Sleep Latency"],
    contraindications: ["Do not do while driving"],
    steps: [
      { order: 1, title: "Lie Down", description: "Find a quiet place.", isMandatory: true },
      { order: 2, title: "Listen", description: "Play a script (YouTube/App).", isMandatory: true },
      { order: 3, title: "Relax", description: "Follow instructions.", isMandatory: true }
    ],
    citations: [{ title: "Yoga Nidra as a complementary treatment of anxiety", author: "Ferreira-Vorkapic", year: 2018 }]
  },
  {
    id: "morning-sunlight",
    title: "Morning Sunlight Exposure",
    description: "Viewing outdoor sunlight within 60 minutes of waking.",
    mechanism: "Stimulates retinal ganglion cells to signal the SCN, triggering cortisol wake-up pulse and timing melatonin release.",
    evidenceLevel: EvidenceLevel.GOLD,
    tags: ["Sleep", "Circadian", "Energy", "Habits"],
    durationDays: 14,
    recommendedMetrics: ["Wake up energy", "Sleep Latency", "Mood"],
    contraindications: ["Do not stare directly at the sun"],
    steps: [
      { order: 1, title: "Go Outside", description: "Windows block UV/Blue light needed.", isMandatory: true },
      { order: 2, title: "Duration", description: "5-10 mins (sunny) or 15-20 mins (cloudy).", isMandatory: true }
    ],
    citations: [{ title: "Circadian rhythms and sleep", author: "Czeisler, C.A.", year: 2013 }]
  },
  {
    id: "physiological-sigh",
    title: "Physiological Sigh",
    description: "Double inhale through nose, long exhale through mouth.",
    mechanism: "Re-inflates collapsed alveoli and offloads CO2, activating the vagus nerve for immediate calm.",
    evidenceLevel: EvidenceLevel.GOLD,
    tags: ["Stress", "Anxiety", "Quick", "Calm"],
    durationDays: 7,
    recommendedMetrics: ["Acute Anxiety (1-10)", "Heart Rate"],
    contraindications: [],
    steps: [
      { order: 1, title: "Inhale Twice", description: "Deep inhale, then short top-up inhale.", isMandatory: true },
      { order: 2, title: "Exhale", description: "Long, slow exhale through mouth.", isMandatory: true }
    ],
    citations: [{ title: "Brief structured respiration practices enhance mood", author: "Balban, Huberman", year: 2023 }]
  },
  // --- HEALTH ---
  {
    id: "cold-shower",
    title: "Cold Exposure (Morning)",
    description: "1-3 minutes of cold water immersion.",
    mechanism: "Triggers massive norepinephrine/dopamine release. Improves metabolic flexibility and mental resilience.",
    evidenceLevel: EvidenceLevel.GOLD,
    tags: ["Energy", "Dopamine", "Resilience", "Habits", "Stress"],
    durationDays: 14,
    recommendedMetrics: ["Morning Energy", "Mood", "Cold Tolerance"],
    contraindications: ["Cardiovascular issues", "Pregnancy"],
    steps: [
      { order: 1, title: "Get In", description: "End shower with cold.", isMandatory: true },
      { order: 2, title: "Breathe", description: "Control your breath.", isMandatory: true },
      { order: 3, title: "Duration", description: "1-3 minutes.", isMandatory: true }
    ],
    citations: [{ title: "Human physiological responses to immersion", author: "Srámek P.", year: 2000 }]
  },
  {
    id: "zone2-cardio",
    title: "Zone 2 Cardio",
    description: "Steady state cardio where you can maintain a conversation.",
    mechanism: "Increases mitochondrial efficiency (Fat Oxidation) and lactate clearance capacity.",
    evidenceLevel: EvidenceLevel.GOLD,
    tags: ["Health", "Longevity", "Energy", "Habits"],
    durationDays: 30,
    recommendedMetrics: ["Resting Heart Rate", "HRV", "Energy Levels"],
    contraindications: [],
    steps: [
      { order: 1, title: "Activity", description: "Jog, cycle, or brisk walk.", isMandatory: true },
      { order: 2, title: "Intensity", description: "60-70% max HR (Conversational pace).", isMandatory: true },
      { order: 3, title: "Duration", description: "30-45 minutes.", isMandatory: true }
    ],
    citations: [{ title: "Zone 2 training for metabolic health", author: "San Millán, I.", year: 2020 }]
  },
  {
    id: "creatine-monohydrate",
    title: "Creatine for Cognition",
    description: "5g daily of Creatine Monohydrate.",
    mechanism: "Increases brain phosphocreatine stores, aiding ATP recycling during high cognitive demand.",
    evidenceLevel: EvidenceLevel.GOLD,
    tags: ["Supplements", "Cognition", "Focus"],
    durationDays: 30,
    recommendedMetrics: ["Working Memory", "Mental Endurance"],
    contraindications: ["Kidney disease (consult doctor)"],
    steps: [
      { order: 1, title: "Take 5g", description: "Any time of day.", isMandatory: true },
      { order: 2, title: "Consistency", description: "Daily use required.", isMandatory: true }
    ],
    citations: [{ title: "Effects of creatine supplementation on cognitive function", author: "Avgerinos", year: 2018 }]
  },
  {
    id: "gratitude-journaling",
    title: "Gratitude Journaling",
    description: "Writing down 3 things you are grateful for daily.",
    mechanism: "Shifts attentional bias away from threats. Consistently lowers cortisol and improves well-being.",
    evidenceLevel: EvidenceLevel.GOLD,
    tags: ["Mindset", "Happiness", "Stress", "Habits"],
    durationDays: 21,
    recommendedMetrics: ["Overall Mood", "Life Satisfaction"],
    contraindications: [],
    steps: [
      { order: 1, title: "Write", description: "List 3 specific things.", isMandatory: true },
      { order: 2, title: "Feel", description: "Feel the emotion for 20s.", isMandatory: true }
    ],
    citations: [{ title: "Counting blessings versus burdens", author: "Emmons & McCullough", year: 2003 }]
  },
  {
    id: "box-breathing",
    title: "Box Breathing",
    description: "Inhale 4s, Hold 4s, Exhale 4s, Hold 4s.",
    mechanism: "Balances the autonomic nervous system via equal ratio breathing and CO2 tolerance holds.",
    evidenceLevel: EvidenceLevel.SILVER,
    tags: ["Stress", "Focus", "Anxiety", "Calm"],
    durationDays: 7,
    recommendedMetrics: ["Calmness", "Focus"],
    contraindications: [],
    steps: [
      { order: 1, title: "Cycle", description: "Inhale 4, Hold 4, Exhale 4, Hold 4.", isMandatory: true },
      { order: 2, title: "Repeat", description: "4-5 minutes.", isMandatory: true }
    ],
    citations: [{ title: "Tactical Breathing", author: "Grossman", year: 2017 }]
  },
  {
    id: "phone-gray",
    title: "Grayscale Phone Mode",
    description: "Turning phone screen to Black & White.",
    mechanism: "Reduces visual salience and dopamine reward prediction error from colorful icons.",
    evidenceLevel: EvidenceLevel.SILVER,
    tags: ["Digital Wellbeing", "Habits", "Focus"],
    durationDays: 7,
    recommendedMetrics: ["Screen Time", "Unconscious Checks"],
    contraindications: [],
    steps: [
      { order: 1, title: "Settings", description: "Accessibility > Display > Grayscale.", isMandatory: true },
      { order: 2, title: "Keep On", description: "95% of the day.", isMandatory: true }
    ],
    citations: [{ title: "Center for Humane Technology", author: "Tristan Harris", year: 2020 }]
  }
];

export const PROTOCOLS_BY_LANG = {
  en: EN_PROTOCOLS,
  pt: PT_PROTOCOLS_EXPANDED
};

export const PROTOCOLS_DATA = EN_PROTOCOLS;
