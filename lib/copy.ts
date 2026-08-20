// Only the question set and section titles are client-approved.
// All surrounding copy is placeholder pending review.

// TODO(client): confirm event date and venue before launch
export const EVENT_DATE = "";
export const EVENT_CITY = "";

export type Question = {
  index: string;
  tag: string;
  prompt: string;
  options: string[];
  correct: number;
};

export type Copy = {
  eyebrow: string;
  presents: string;
  wordmark: string;
  lede: string;
  meta: string;
  cta: string;
  scrollHint: string;
  langLabel: string;
  progressLabel: string;
  analysing: string;
  interstitial: string;
  questions: Question[];
  resultEyebrow: string;
  resultPerfect: string;
  resultPartial: string;
  scoreLabel: string;
  invitationLabel: string;
  issued: string;
  arCta: string;
  restart: string;
  footer: string;
};

export const COPY: Record<"en" | "bn", Copy> = {
  en: {
    eyebrow: "GRAMEENPHONE",
    presents: "GRAMEENPHONE PRESENTS",
    wordmark: "Ai&i",
    lede: "A short calibration on how you think about AI.",
    meta: "Three questions · Two minutes · One invitation",
    cta: "Begin calibration",
    scrollHint: "SCROLL",
    langLabel: "বাং",
    progressLabel: "CALIBRATION",
    analysing: "ANALYSING RESPONSE",
    interstitial:
      "Thank you for calibrating. Your answers help us design conversations that meet people where they are.",
    questions: [
      {
        index: "01",
        tag: "Understanding AI Use case",
        prompt:
          "Your team spends three hours every week preparing the same performance report. What should AI be used for first?",
        options: [
          "Designing prettier PowerPoint slides.",
          "Automating data collection and report generation.",
          "Writing motivational emails to stakeholders.",
          "Replacing the report owner.",
        ],
        correct: 1,
      },
      {
        index: "02",
        tag: "Understanding Responsible AI",
        prompt: "Which action reflects responsible AI use?",
        options: [
          "Uploading confidential customer data into any public AI tool.",
          "Using AI only with approved tools while protecting sensitive information.",
          "Assuming AI-generated answers are always accurate.",
          "Copying AI outputs without review.",
        ],
        correct: 1,
      },
      {
        index: "03",
        tag: "Understanding Cultural Adoption of AI",
        prompt:
          "An organization moves from AI experimentation toward AI adoption when...",
        options: [
          "Only the IT team uses AI regularly.",
          "AI becomes part of everyday work across multiple teams with measurable outcomes.",
          "Every employee becomes an AI engineer.",
          "The company purchases more AI software.",
        ],
        correct: 1,
      },
    ],
    resultEyebrow: "CALIBRATION COMPLETE",
    // TODO(client): approve result messaging
    resultPerfect: "You are operating with clarity.",
    resultPartial: "You are close. The event will fill in the rest.",
    scoreLabel: "SCORE",
    invitationLabel: "INVITATION",
    issued: "ISSUED",
    arCta: "Open AR invitation",
    restart: "Recalibrate",
    footer: "© 2026 Grameenphone. Ai&i is a Grameenphone initiative.",
  },

  bn: {
    eyebrow: "গ্রামীণফোন",
    presents: "গ্রামীণফোন উপস্থাপন করছে",
    wordmark: "Ai&i",
    lede: "AI নিয়ে আপনার ভাবনার একটি সংক্ষিপ্ত মূল্যায়ন।",
    meta: "তিনটি প্রশ্ন · দুই মিনিট · একটি আমন্ত্রণ",
    cta: "শুরু করুন",
    scrollHint: "স্ক্রল",
    langLabel: "EN",
    progressLabel: "মূল্যায়ন",
    analysing: "উত্তর বিশ্লেষণ চলছে",
    interstitial:
      "ধন্যবাদ। আপনার উত্তর আমাদের এমন আলোচনা সাজাতে সাহায্য করে যা আপনার অবস্থানের সঙ্গে মেলে।",
    questions: [
      {
        index: "০১",
        tag: "AI ব্যবহারের ক্ষেত্র বোঝা",
        prompt:
          "আপনার দল প্রতি সপ্তাহে একই পারফরম্যান্স রিপোর্ট তৈরি করতে তিন ঘণ্টা ব্যয় করে। AI প্রথমে কোন কাজে ব্যবহার করা উচিত?",
        options: [
          "পাওয়ারপয়েন্ট স্লাইড আরও সুন্দর করা।",
          "ডেটা সংগ্রহ ও রিপোর্ট তৈরি স্বয়ংক্রিয় করা।",
          "স্টেকহোল্ডারদের অনুপ্রেরণামূলক ইমেইল লেখা।",
          "রিপোর্ট মালিককে প্রতিস্থাপন করা।",
        ],
        correct: 1,
      },
      {
        index: "০২",
        tag: "দায়িত্বশীল AI বোঝা",
        prompt: "কোন কাজটি দায়িত্বশীল AI ব্যবহারকে প্রতিফলিত করে?",
        options: [
          "যেকোনো পাবলিক AI টুলে গোপনীয় গ্রাহক তথ্য আপলোড করা।",
          "শুধুমাত্র অনুমোদিত টুল ব্যবহার করে AI ব্যবহার করা এবং সংবেদনশীল তথ্য সুরক্ষিত রাখা।",
          "AI-এর উত্তর সবসময় সঠিক ধরে নেওয়া।",
          "পর্যালোচনা ছাড়াই AI-এর আউটপুট কপি করা।",
        ],
        correct: 1,
      },
      {
        index: "০৩",
        tag: "AI-এর সাংস্কৃতিক গ্রহণ বোঝা",
        prompt:
          "একটি প্রতিষ্ঠান AI পরীক্ষা-নিরীক্ষা থেকে AI গ্রহণের দিকে এগিয়ে যায় যখন...",
        options: [
          "শুধুমাত্র IT দল নিয়মিত AI ব্যবহার করে।",
          "একাধিক দলের দৈনন্দিন কাজে AI যুক্ত হয় এবং তার ফলাফল পরিমাপযোগ্য হয়।",
          "প্রতিটি কর্মী AI ইঞ্জিনিয়ার হয়ে ওঠে।",
          "প্রতিষ্ঠান আরও AI সফটওয়্যার কেনে।",
        ],
        correct: 1,
      },
    ],
    resultEyebrow: "মূল্যায়ন সম্পন্ন",
    // TODO(client): approve result messaging
    resultPerfect: "আপনার বোঝাপড়া স্পষ্ট।",
    resultPartial: "আপনি কাছাকাছি। বাকিটা ইভেন্টে পূর্ণ হবে।",
    scoreLabel: "স্কোর",
    invitationLabel: "আমন্ত্রণ",
    issued: "ইস্যু",
    arCta: "AR আমন্ত্রণ দেখুন",
    restart: "আবার শুরু",
    footer: "© ২০২৬ গ্রামীণফোন। Ai&i একটি গ্রামীণফোন উদ্যোগ।",
  },
};
