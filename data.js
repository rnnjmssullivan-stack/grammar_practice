// ============================================================
//  УРОКИ И СЛОВА
// ============================================================
const LESSONS = {
  unit1: {
    titleRu: "Урок 1",
    titleEn: "Unit 1",
    words: [
      "ball", "boat", "boy", "car", "cat", "computer",
      "dog", "doll", "fan", "fish", "game", "girl", "hat", "man", "mat",
      "teddy", "train", "van",
      "very_big", "big", "small", "very_small",
      "pink", "green", "brown", "orange", "purple", "yellow", "black", "white", "blue", "gray", "red"
    ]
  }
};

// ============================================================
//  СПИСОК УПРАЖНЕНИЙ
// ============================================================
// ============================================================
//  СПИСОК УПРАЖНЕНИЙ
// ============================================================
const EXERCISES = [
  { id: "words",     titleRu: "1. Слова",              titleEn: "1. Words" },
  
  // Разделенное второе упражнение
  { id: "sent_long", titleRu: "2.1 It is (длинная)",   titleEn: "2.1 It is (long)" },
  { id: "sent_short",titleRu: "2.2 It's (короткая)",   titleEn: "2.2 It's (short)" },
  { id: "sent_neg",  titleRu: "2.3 It isn't (минус)",  titleEn: "2.3 It isn't (minus)" },
  { id: "sent_quest",titleRu: "2.4 Is it (вопрос)",    titleEn: "2.4 Is it (question)" },
  { id: "sent_mix",  titleRu: "2.5 Всё вместе",        titleEn: "2.5 Mixed" },
  
  { id: "answers",   titleRu: "3. Ответы",             titleEn: "3. Answers" }
];

// ============================================================
//  ТЕКСТЫ И ПРАВИЛЬНЫЕ ОТВЕТЫ
// ============================================================

const AFFIRMATIVE_SHORT = {
  "ball": "It's a ball.", "boat": "It's a boat.", "boy": "It's a boy.", "car": "It's a car.", "cat": "It's a cat.",
  "computer": "It's a computer.", "dog": "It's a dog.", "doll": "It's a doll.", "fan": "It's a fan.", "fish": "It's a fish.",
  "game": "It's a game.", "girl": "It's a girl.", "hat": "It's a hat.", "man": "It's a man.", "mat": "It's a mat.",
  "teddy": "It's a teddy.", "train": "It's a train.", "van": "It's a van.",
  "very_big": "It's very big.", "big": "It's big.", "small": "It's small.", "very_small": "It's very small.",
  "pink": "It's pink.", "green": "It's green.", "brown": "It's brown.", "orange": "It's orange.", "purple": "It's purple.",
  "yellow": "It's yellow.", "black": "It's black.", "white": "It's white.", "blue": "It's blue.", "gray": "It's gray.", "red": "It's red."
};

const AFFIRMATIVE_LONG = {
  "ball": "It is a ball.", "boat": "It is a boat.", "boy": "It is a boy.", "car": "It is a car.", "cat": "It is a cat.",
  "computer": "It is a computer.", "dog": "It is a dog.", "doll": "It is a doll.", "fan": "It is a fan.", "fish": "It is a fish.",
  "game": "It is a game.", "girl": "It is a girl.", "hat": "It is a hat.", "man": "It is a man.", "mat": "It is a mat.",
  "teddy": "It is a teddy.", "train": "It is a train.", "van": "It is a van.",
  "very_big": "It is very big.", "big": "It is big.", "small": "It is small.", "very_small": "It is very small.",
  "pink": "It is pink.", "green": "It is green.", "brown": "It is brown.", "orange": "It is orange.", "purple": "It is purple.",
  "yellow": "It is yellow.", "black": "It is black.", "white": "It is white.", "blue": "It is blue.", "gray": "It is gray.", "red": "It is red."
};

const NEGATIVE = {
  "ball": "It isn't a ball.", "boat": "It isn't a boat.", "boy": "It isn't a boy.", "car": "It isn't a car.", "cat": "It isn't a cat.",
  "computer": "It isn't a computer.", "dog": "It isn't a dog.", "doll": "It isn't a doll.", "fan": "It isn't a fan.", "fish": "It isn't a fish.",
  "game": "It isn't a game.", "girl": "It isn't a girl.", "hat": "It isn't a hat.", "man": "It isn't a man.", "mat": "It isn't a mat.",
  "teddy": "It isn't a teddy.", "train": "It isn't a train.", "van": "It isn't a van.",
  "very_big": "It isn't very big.", "big": "It isn't big.", "small": "It isn't small.", "very_small": "It isn't very small.",
  "pink": "It isn't pink.", "green": "It isn't green.", "brown": "It isn't brown.", "orange": "It isn't orange.", "purple": "It isn't purple.",
  "yellow": "It isn't yellow.", "black": "It isn't black.", "white": "It isn't white.", "blue": "It isn't blue.", "gray": "It isn't gray.", "red": "It isn't red."
};

const QUESTION = {
  "ball": "Is it a ball?", "boat": "Is it a boat?", "boy": "Is it a boy?", "car": "Is it a car?", "cat": "Is it a cat?",
  "computer": "Is it a computer?", "dog": "Is it a dog?", "doll": "Is it a doll?", "fan": "Is it a fan?", "fish": "Is it a fish?",
  "game": "Is it a game?", "girl": "Is it a girl?", "hat": "Is it a hat?", "man": "Is it a man?", "mat": "Is it a mat?",
  "teddy": "Is it a teddy?", "train": "Is it a train?", "van": "Is it a van?",
  "very_big": "Is it very big?", "big": "Is it big?", "small": "Is it small?", "very_small": "Is it very small?",
  "pink": "Is it pink?", "green": "Is it green?", "brown": "Is it brown?", "orange": "Is it orange?", "purple": "Is it purple?",
  "yellow": "Is it yellow?", "black": "Is it black?", "white": "Is it white?", "blue": "Is it blue?", "gray": "Is it gray?", "red": "Is it red?"
};

// ============================================================
//  ПЕРЕВОДЫ ИНТЕРФЕЙСА
// ============================================================
const UI_TEXT = {
  ru: {
    menu: "Меню",
    exercises: "Упражнения",
    words: "Слова",
    settings: "Настройки",
    seconds: "Секунд:",
    showText: "Показывать текст",
    allWords: "Все слова",
    startHint: "Нажми <b>Пробел</b> или коснись экрана, чтобы начать",
    endHint: "Начать новый раунд? Нажми на экран",
    timerLabel: "сек"
  },
  en: {
    menu: "Menu",
    exercises: "Exercises",
    words: "Words",
    settings: "Settings",
    seconds: "Seconds:",
    showText: "Show text",
    allWords: "All words",
    startHint: "Press <b>Space</b> or tap the screen to start",
    endHint: "Start a new round? Tap the screen",
    timerLabel: "sec"
  }
};
