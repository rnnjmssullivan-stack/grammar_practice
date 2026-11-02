// ============================================================
//  УРОКИ И СЛОВА
// ============================================================
const LESSONS = {
  unit1: {
    titleRu: "Урок 1",
    titleEn: "Unit 1",
    words: [
      "a_ball", "a_boat", "a_boy", "a_car", "a_cat", "a_computer",
      "a_dog", "a_doll", "a_fan", "a_fish", "a_game", "a_girl", "a_hat", "a_man", "a_mat",
      "a_teddy", "a_train", "a_van",
      "very_big", "big", "small", "very_small",
      "pink", "green", "brown", "orange", "purple", "yellow", "black", "white", "blue", "gray", "red"
    ]
  },
  additional: {
    titleRu: "Доп. слова",
    titleEn: "Additional",
    words: [
      "an_apple", "an_orange", "an_umbrella", "a_bus", "a_jug",
      "a_lemon", "a_pen", "a_pony", "a_taxi", "a_zebra"
    ]
  }
};

// ============================================================
//  СПИСОК УПРАЖНЕНИЙ
// ============================================================
const EXERCISES = [
  { id: "words",      titleRu: "0. Слова",               titleEn: "0. Words" },
  { id: "sent_long",  titleRu: "1.1 It is (длинная)",    titleEn: "1.1 It is (long)" },
  { id: "sent_short", titleRu: "1.2 It's (короткая)",    titleEn: "1.2 It's (short)" },
  { id: "sent_neg",   titleRu: "1.3 It isn't (минус)",   titleEn: "1.3 It isn't (minus)" },
  { id: "sent_quest", titleRu: "1.4 Is it (вопрос)",     titleEn: "1.4 Is it (question)" },
  { id: "sent_mix",   titleRu: "1.5 Всё вместе",         titleEn: "1.5 Mixed" },
  { id: "confusables",titleRu: "2. Confusables",         titleEn: "2. Confusables" },
  { id: "ans_yes",    titleRu: "3.1 Ответ: Да",          titleEn: "3.1 Answer: Yes" },
  { id: "ans_no",     titleRu: "3.2 Ответ: Нет",         titleEn: "3.2 Answer: No" },
  { id: "ans_chain",  titleRu: "3.3 Нарастающие",        titleEn: "3.3 Negations" }
];

// ============================================================
//  ПАРЫ ДЛЯ CONFUSABLES
//  Ключ — правильная картинка, значения — неправильные слова
// ============================================================
const CONFUSABLES_PAIRS = {
  "a_bag": ["a_ball", "a_hat"],
  "a_boy": ["a_girl"],
  "a_girl": ["a_boy"],
  "a_train": ["a_van"],
  "a_van": ["a_train"],
  "a_car": ["a_boat"],
  "a_boat": ["a_car"],
  "a_cat": ["a_dog"],
  "a_dog": ["a_cat"],
  "a_doll": ["a_teddy"],
  "a_teddy": ["a_doll"],
  "a_hat_1": ["a_ball"],
  "a_hat_2": ["a_fan"],
  "a_fish": ["a_horse"],
  "a_mat": ["a_fish"]
};

// ============================================================
//  ТЕКСТЫ
// ============================================================
const AFFIRMATIVE_SHORT = {
  "a_ball": "It's a ball.", "a_boat": "It's a boat.", "a_boy": "It's a boy.",
  "a_car": "It's a car.", "a_cat": "It's a cat.", "a_computer": "It's a computer.",
  "a_dog": "It's a dog.", "a_doll": "It's a doll.", "a_fan": "It's a fan.",
  "a_fish": "It's a fish.", "a_game": "It's a game.", "a_girl": "It's a girl.",
  "a_hat": "It's a hat.", "a_man": "It's a man.", "a_mat": "It's a mat.",
  "a_teddy": "It's a teddy.", "a_train": "It's a train.", "a_van": "It's a van.",
  "very_big": "It's very big.", "big": "It's big.", "small": "It's small.", "very_small": "It's very small.",
  "pink": "It's pink.", "green": "It's green.", "brown": "It's brown.", "orange": "It's orange.",
  "purple": "It's purple.", "yellow": "It's yellow.", "black": "It's black.", "white": "It's white.",
  "blue": "It's blue.", "gray": "It's gray.", "red": "It's red.",
  "an_apple": "It's an apple.", "an_orange": "It's an orange.", "an_umbrella": "It's an umbrella.",
  "a_bus": "It's a bus.", "a_jug": "It's a jug.", "a_lemon": "It's a lemon.",
  "a_pen": "It's a pen.", "a_pony": "It's a pony.", "a_taxi": "It's a taxi.", "a_zebra": "It's a zebra.",
  "a_horse": "It's a horse."
};

const AFFIRMATIVE_LONG = {
  "a_ball": "It is a ball.", "a_boat": "It is a boat.", "a_boy": "It is a boy.",
  "a_car": "It is a car.", "a_cat": "It is a cat.", "a_computer": "It is a computer.",
  "a_dog": "It is a dog.", "a_doll": "It is a doll.", "a_fan": "It is a fan.",
  "a_fish": "It is a fish.", "a_game": "It is a game.", "a_girl": "It is a girl.",
  "a_hat": "It is a hat.", "a_man": "It is a man.", "a_mat": "It is a mat.",
  "a_teddy": "It is a teddy.", "a_train": "It is a train.", "a_van": "It is a van.",
  "very_big": "It is very big.", "big": "It is big.", "small": "It is small.", "very_small": "It is very small.",
  "pink": "It is pink.", "green": "It is green.", "brown": "It is brown.", "orange": "It is orange.",
  "purple": "It is purple.", "yellow": "It is yellow.", "black": "It is black.", "white": "It is white.",
  "blue": "It is blue.", "gray": "It is gray.", "red": "It is red.",
  "an_apple": "It is an apple.", "an_orange": "It is an orange.", "an_umbrella": "It is an umbrella.",
  "a_bus": "It is a bus.", "a_jug": "It is a jug.", "a_lemon": "It is a lemon.",
  "a_pen": "It is a pen.", "a_pony": "It is a pony.", "a_taxi": "It is a taxi.", "a_zebra": "It is a zebra.",
  "a_horse": "It is a horse."
};

const NEGATIVE = {
  "a_ball": "It isn't a ball.", "a_boat": "It isn't a boat.", "a_boy": "It isn't a boy.",
  "a_car": "It isn't a car.", "a_cat": "It isn't a cat.", "a_computer": "It isn't a computer.",
  "a_dog": "It isn't a dog.", "a_doll": "It isn't a doll.", "a_fan": "It isn't a fan.",
  "a_fish": "It isn't a fish.", "a_game": "It isn't a game.", "a_girl": "It isn't a girl.",
  "a_hat": "It isn't a hat.", "a_man": "It isn't a man.", "a_mat": "It isn't a mat.",
  "a_teddy": "It isn't a teddy.", "a_train": "It isn't a train.", "a_van": "It isn't a van.",
  "very_big": "It isn't very big.", "big": "It isn't big.", "small": "It isn't small.", "very_small": "It isn't very small.",
  "pink": "It isn't pink.", "green": "It isn't green.", "brown": "It isn't brown.", "orange": "It isn't orange.",
  "purple": "It isn't purple.", "yellow": "It isn't yellow.", "black": "It isn't black.", "white": "It isn't white.",
  "blue": "It isn't blue.", "gray": "It isn't gray.", "red": "It isn't red.",
  "an_apple": "It isn't an apple.", "an_orange": "It isn't an orange.", "an_umbrella": "It isn't an umbrella.",
  "a_bus": "It isn't a bus.", "a_jug": "It isn't a jug.", "a_lemon": "It isn't a lemon.",
  "a_pen": "It isn't a pen.", "a_pony": "It isn't a pony.", "a_taxi": "It isn't a taxi.", "a_zebra": "It isn't a zebra.",
  "a_horse": "It isn't a horse."
};

const QUESTION = {
  "a_ball": "Is it a ball?", "a_boat": "Is it a boat?", "a_boy": "Is it a boy?",
  "a_car": "Is it a car?", "a_cat": "Is it a cat?", "a_computer": "Is it a computer?",
  "a_dog": "Is it a dog?", "a_doll": "Is it a doll?", "a_fan": "Is it a fan?",
  "a_fish": "Is it a fish?", "a_game": "Is it a game?", "a_girl": "Is it a girl?",
  "a_hat": "Is it a hat?", "a_man": "Is it a man?", "a_mat": "Is it a mat?",
  "a_teddy": "Is it a teddy?", "a_train": "Is it a train?", "a_van": "Is it a van?",
  "very_big": "Is it very big?", "big": "Is it big?", "small": "Is it small?", "very_small": "Is it very small?",
  "pink": "Is it pink?", "green": "Is it green?", "brown": "Is it brown?", "orange": "Is it orange?",
  "purple": "Is it purple?", "yellow": "Is it yellow?", "black": "Is it black?", "white": "Is it white?",
  "blue": "Is it blue?", "gray": "Is it gray?", "red": "Is it red?",
  "an_apple": "Is it an apple?", "an_orange": "Is it an orange?", "an_umbrella": "Is it an umbrella?",
  "a_bus": "Is it a bus?", "a_jug": "Is it a jug?", "a_lemon": "Is it a lemon?",
  "a_pen": "Is it a pen?", "a_pony": "Is it a pony?", "a_taxi": "Is it a taxi?", "a_zebra": "Is it a zebra?",
  "a_horse": "Is it a horse?"
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
    endHint: "Начать новый раунд? Нажми на экран"
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
    endHint: "Start a new round? Tap the screen"
  }
};