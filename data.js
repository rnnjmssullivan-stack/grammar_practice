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
  // Когда появится Урок 2, добавь сюда: unit2: { titleRu: "Урок 2", ... }
};

// ============================================================
//  СПИСОК УПРАЖНЕНИЙ
// ============================================================
const EXERCISES = [
  { id: "words",     titleRu: "1. Слова",         titleEn: "1. Words" },
  { id: "sentences", titleRu: "2. Предложения",   titleEn: "2. Sentences" },
  { id: "answers",   titleRu: "3. Ответы",        titleEn: "3. Answers" }
];

// ============================================================
//  ГЕНЕРАТОР ПРЕДЛОЖЕНИЙ И ОТВЕТОВ
//  Автоматически создает фразы для всех слов.
// ============================================================
const ARTICLES = ["a", "an"]; 
const VOWELS = ["a", "e", "i", "o", "u"];

function getArticle(word) {
  return VOWELS.includes(word[0].toLowerCase()) ? "an" : "a";
}

// Для цветов и размеров ("big", "red") артикль не нужен
const ADJECTIVES = ["very_big", "big", "small", "very_small", "pink", "green", "brown", "orange", "purple", "yellow", "black", "white", "blue", "gray", "red"];

function buildGrammarData(word) {
  const isAdj = ADJECTIVES.includes(word);
  const art = getArticle(word);
  
  // 1. Утверждение (Affirmative)
  const affirmative = isAdj ? `It's ${word.replace('_', ' ')}.` : `It's ${art} ${word}.`;
  
  // 2. Отрицание (Negative)
  const negative = isAdj ? `It isn't ${word.replace('_', ' ')}.` : `It isn't ${art} ${word}.`;
  
  // 3. Вопрос (Question)
  const question = isAdj ? `Is it ${word.replace('_', ' ')}?` : `Is it ${art} ${word}?`;
  
  return {
    affirmative,
    negative,
    question,
    // Для 3-го упражнения (ответы) нужен пример "Нет, это не X, это Y".
    // Мы будем брать случайное слово из словаря для второй части.
    answerTemplate: isAdj 
      ? `No, it isn't ${word.replace('_', ' ')}.`
      : `No, it isn't ${art} ${word}.`
  };
}

// Собираем базу для всех слов из всех уроков
const GRAMMAR_DB = {};
Object.values(LESSONS).forEach(lesson => {
  lesson.words.forEach(word => {
    GRAMMAR_DB[word] = buildGrammarData(word);
  });
});

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