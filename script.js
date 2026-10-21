// ============================================================
//  Список картинок (без расширения). Лежат в папке images/
//  Если добавишь новую — просто допиши имя в массив.
// ============================================================
const IMAGE_NAMES = [
  "ball", "boat", "boy", "car", "cat", "computer",
  "dog", "doll", "fan", "fish", "game", "girl", "hat", "man", "mat",
  "teddy", "train", "van",
  
  "very_big", "big", "small", "very_small",
  
  "pink", "green", "brown", "orange", "purple", "yellow", "black", "white", "blue", "gray", "red"
];

// Папки (относительно index.html)
const IMAGES_DIR = "images";
const AUDIO_DIR  = "audio";

// Расширения, которые пробуем для аудио (по порядку)
const AUDIO_EXTS = ["mp3", "m4a"];
const IMAGE_EXTS  = ["png", "jpg"];

// ============================================================
//  DOM
// ============================================================
const startScreen = document.getElementById("startScreen");
const playScreen  = document.getElementById("playScreen");
const endScreen   = document.getElementById("endScreen");
const cardImage   = document.getElementById("cardImage");
const timerBox    = document.getElementById("timerBox");
const timerValue  = document.getElementById("timerValue");
const secondsInput= document.getElementById("secondsInput");
const soundHint   = document.getElementById("soundHint");

// ============================================================
//  Состояние
// ============================================================
let queue = [];           // перемешанная очередь имён на раунд
let currentIndex = -1;    // индекс текущей картинки
let phase = "start";      // start | waiting | counting | audio | ready | end
let countdownTimer = null;
let audioEl = null;

// ============================================================
//  Настройка таймера (сохраняется в localStorage)
// ============================================================
const LS_KEY = "grammar.secondsToAnswer";
const saved = localStorage.getItem(LS_KEY);
if (saved) secondsInput.value = saved;

secondsInput.addEventListener("change", () => {
  let v = parseInt(secondsInput.value, 10);
  if (isNaN(v) || v < 1) v = 1;
  if (v > 60) v = 60;
  secondsInput.value = v;
  localStorage.setItem(LS_KEY, v);
});

function getSeconds() {
  const v = parseInt(secondsInput.value, 10);
  return isNaN(v) || v < 1 ? 5 : v;
}

// ============================================================
//  Утилиты
// ============================================================
function shuffle(arr) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function showScreen(el) {
  [startScreen, playScreen, endScreen].forEach(s => s.classList.remove("active"));
  el.classList.add("active");
}

function showTimer(show) {
  timerBox.classList.toggle("hidden", !show);
}

function setTimerText(text, warning = false) {
  timerValue.textContent = text;
  timerValue.classList.toggle("warning", warning);
}

// ============================================================
//  Логика раунда
// ============================================================
function startRound() {
  queue = shuffle(IMAGE_NAMES);
  currentIndex = -1;
  
  // Скачиваем ВСЕ картинки в фоне (under the hood).
  // Они загрузятся в кэш браузера, но на экране не появятся.
  IMAGE_NAMES.forEach(name => {
    IMAGE_EXTS.forEach(ext => {
      const img = new Image();
      img.src = `${IMAGES_DIR}/${name}.${ext}`; // Браузер скачает, если файл существует
    });
  });

  // Ждем полсекунды, чтобы первые картинки успели скачаться, 
  // и запускаем раунд
  setTimeout(() => {
    nextCard();
  }, 500); 
}

function nextCard() {
  currentIndex++;
  if (currentIndex >= queue.length) {
    endRound();
    return;
  }

  const name = queue[currentIndex];
  showScreen(playScreen);
  
  // Сначала прячем картинку и таймер (чтобы не было мигания)
  cardImage.style.opacity = "0";
  showTimer(false);

  // Запускаем загрузку и ЖДЕМ её окончания
  loadImage(name, 0, () => {
    // Эта функция сработает ТОЛЬКО когда картинка загрузится
    cardImage.style.opacity = "1"; // Показываем картинку
    startCountdown(name);          // И только теперь запускаем таймер!
  });
}

// Обновленная функция загрузки картинки (добавили колбэк onSuccess)
function loadImage(name, extIndex, onSuccess) {
  if (extIndex >= IMAGE_EXTS.length) {
    console.warn("Не найдена картинка для:", name);
    if (onSuccess) onSuccess(); 
    return;
  }

  const ext = IMAGE_EXTS[extIndex];
  const src = `${IMAGES_DIR}/${name}.${ext}`;

  const img = new Image();
  
  img.onload = () => {
    cardImage.src = src;
    cardImage.alt = name;

    // Даем браузеру время перерисовать кадр с новой картинкой
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        if (onSuccess) onSuccess();
      });
    });
  };

  img.onerror = () => {
    loadImage(name, extIndex + 1, onSuccess);
  };

  img.src = src;
}


function startCountdown(name) {

  // останавливаем предыдущий таймер, если он был
  if (countdownTimer) clearInterval(countdownTimer);
  
  phase = "counting";
  const total = getSeconds();
  let left = total;

  showTimer(true);
  setTimerText(String(left), false);

  countdownTimer = setInterval(() => {
    left--;
    if (left > 0) {
      setTimerText(String(left), left <= 3);
    } else {
      setTimerText("00", true);
      clearInterval(countdownTimer);
      countdownTimer = null;
      playAudio(name);
    }
  }, 1000);
}

// ============================================================
//  Аудио: пробуем mp3, потом m4a; если нет — молча пропускаем
// ============================================================
function playAudio(name) {
  phase = "audio";

  const tryExt = (i) => {
    if (i >= AUDIO_EXTS.length) {
      // аудио нет — переходим в состояние готовности
      phase = "ready";
      return;
    }
    const src = `${AUDIO_DIR}/${name}.${AUDIO_EXTS[i]}`;
    const audio = new Audio();
    audio.preload = "auto";

    const onError = () => tryExt(i + 1);
    const onCanPlay = () => {
      audioEl = audio;
      audio.play().then(() => {
        // playing
      }).catch(() => {
        // Chrome может блокировать без жеста — покажем подсказку
        showSoundHint();
        phase = "ready";
      });
    };

    audio.addEventListener("error", onError, { once: true });
    audio.addEventListener("canplaythrough", onCanPlay, { once: true });
    audio.addEventListener("ended", () => { phase = "ready"; });
    audio.src = src;
    audio.load();
  };

  tryExt(0);
}

function showSoundHint() {
  soundHint.classList.remove("hidden");
  soundHint.onclick = () => {
    soundHint.classList.add("hidden");
    // повторная попытка проиграть текущее аудио
    if (audioEl) {
      audioEl.play().catch(() => {});
    }
  };
}

// ============================================================
//  Завершение раунда
// ============================================================
function endRound() {
  phase = "end";
  showTimer(false);
  setTimerText("00", false);
  showScreen(endScreen);
}

// ============================================================
//  Управление (Пробел для ПК, Тап для телефона)
// ============================================================

// Единая функция для запуска действий
function handleAction() {
  if (phase === "start") {
    startRound();
  } else if (phase === "ready") {
    nextCard();
  } else if (phase === "end") {
    startRound();
  }
}

// 1. Обработка клавиатуры (Пробел)
document.addEventListener("keydown", (e) => {
  if (e.code !== "Space") return;
  e.preventDefault(); // чтобы страница не скроллилась

  // Если фокус в поле ввода секунд — не мешаем
  if (document.activeElement === secondsInput) return;

  handleAction();
});

// 2. Обработка касаний и кликов (для телефона и мышки)
document.addEventListener("pointerdown", (e) => {
  // Игнорируем клики по полю ввода и по подсказке звука
  if (e.target.tagName === "INPUT" || e.target.id === "soundHint") return;

  handleAction();
});

// ============================================================
//  Инициализация
// ============================================================
showScreen(startScreen);
showTimer(false);
