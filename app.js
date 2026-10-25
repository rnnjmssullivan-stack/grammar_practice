// ============================================================
//  ГЛОБАЛЬНОЕ СОСТОЯНИЕ
// ============================================================
let state = {
  lang: 'ru',            // 'ru' или 'en'
  exercise: 'words',     // 'words', 'sentences', 'answers'
  lesson: 'all',         // 'all' или id урока (например, 'unit1')
  seconds: 5,
  showText: false,
  
  // Игровое состояние
  queue: [],
  currentIndex: -1,
  phase: 'start',        // start | waiting | counting | audio | ready | end
  countdownTimer: null,
  audioEl: null
};

// ============================================================
//  ПУТИ И РАСШИРЕНИЯ (перенесли сюда из старого кода)
// ============================================================
const IMAGES_DIR = "images";
const AUDIO_DIR  = "audio";
const IMAGE_EXTS = ["png", "jpg"];
const AUDIO_EXTS = ["mp3", "m4a"];

// ============================================================
//  DOM
// ============================================================
const dom = {
  sidebar: document.getElementById('sidebar'),
  overlay: document.getElementById('sidebarOverlay'),
  openBtn: document.getElementById('openSidebar'),
  closeBtn: document.getElementById('closeSidebar'),
  exerciseMenu: document.getElementById('exerciseMenu'),
  lessonMenu: document.getElementById('lessonMenu'),
  currentExerciseTitle: document.getElementById('currentExerciseTitle'),
  currentLessonTitle: document.getElementById('currentLessonTitle'),
  
  secondsInput: document.getElementById('secondsInput'),
  showTextToggle: document.getElementById('showTextToggle'),
  langSelect: document.getElementById('langSelect'),
  
  startScreen: document.getElementById('startScreen'),
  playScreen: document.getElementById('playScreen'),
  endScreen: document.getElementById('endScreen'),
  cardImage: document.getElementById('cardImage'),
  cardIcon: document.getElementById('cardIcon'),
  textDisplay: document.getElementById('textDisplay'),
  
  timerBox: document.getElementById('timerBox'),
  timerValue: document.getElementById('timerValue'),
  //timerLabel: document.querySelector('.timer-label'),
  soundHint: document.getElementById('soundHint')
};

// ============================================================
//  ИНИЦИАЛИЗАЦИЯ ИНТЕРФЕЙСА
// ============================================================
function initUI() {
  // Загружаем настройки
  const savedSeconds = localStorage.getItem('grammar.seconds');
  if (savedSeconds) state.seconds = parseInt(savedSeconds);
  dom.secondsInput.value = state.seconds;

  const savedLang = localStorage.getItem('grammar.lang');
  if (savedLang) {
    state.lang = savedLang;
    dom.langSelect.value = savedLang;
  }

  // Рендерим меню
  renderMenus();
  applyLanguage();
  updateCurrentInfo();
}

function renderMenus() {
  // Упражнения
  dom.exerciseMenu.innerHTML = '';
  EXERCISES.forEach(ex => {
    const btn = document.createElement('button');
    btn.className = `menu-item ${state.exercise === ex.id ? 'active' : ''}`;
    btn.textContent = state.lang === 'ru' ? ex.titleRu : ex.titleEn;
    btn.onclick = () => {
      state.exercise = ex.id;
      renderMenus();
      updateCurrentInfo();
      closeSidebar();
      resetToStart();
    };
    dom.exerciseMenu.appendChild(btn);
  });

  // Уроки (Слова)
  dom.lessonMenu.innerHTML = '';
  
  // Кнопка "Все слова"
  const allBtn = document.createElement('button');
  allBtn.className = `menu-item ${state.lesson === 'all' ? 'active' : ''}`;
  allBtn.textContent = UI_TEXT[state.lang].allWords;
  allBtn.onclick = () => {
    state.lesson = 'all';
    renderMenus();
    updateCurrentInfo();
    closeSidebar();
    resetToStart();
  };
  dom.lessonMenu.appendChild(allBtn);

  // Кнопки уроков
  Object.keys(LESSONS).forEach(unitId => {
    const unit = LESSONS[unitId];
    const btn = document.createElement('button');
    btn.className = `menu-item ${state.lesson === unitId ? 'active' : ''}`;
    btn.textContent = state.lang === 'ru' ? unit.titleRu : unit.titleEn;
    btn.onclick = () => {
      state.lesson = unitId;
      renderMenus();
      updateCurrentInfo();
      closeSidebar();
      resetToStart();
    };
    dom.lessonMenu.appendChild(btn);
  });
}

function applyLanguage() {
  const t = UI_TEXT[state.lang];
  document.querySelector('.sidebar-header h2').textContent = t.menu;
  document.querySelector('.menu-section:nth-of-type(1) h3').textContent = t.exercises;
  document.querySelector('.menu-section:nth-of-type(2) h3').textContent = t.words;
  document.querySelector('.bottom-settings h3').textContent = t.settings;
  document.querySelector('.setting span').textContent = t.seconds;
  document.querySelector('.checkbox-setting span').textContent = t.showText;
  
  // Обновляем подсказки на экранах
  dom.startScreen.querySelector('.hint').innerHTML = `${t.startHint}<br><span class="en">${t.startHint}</span>`;
  dom.endScreen.querySelector('.hint').innerHTML = `${t.endHint}<br><span class="en">${t.endHint}</span>`;
  
  
  renderMenus();
  updateCurrentInfo();
}

function updateCurrentInfo() {
  const ex = EXERCISES.find(e => e.id === state.exercise);
  const exTitle = state.lang === 'ru' ? ex.titleRu : ex.titleEn;
  
  let lessonTitle = UI_TEXT[state.lang].allWords;
  if (state.lesson !== 'all') {
    const unit = LESSONS[state.lesson];
    lessonTitle = state.lang === 'ru' ? unit.titleRu : unit.titleEn;
  }
  
  dom.currentExerciseTitle.textContent = exTitle;
  dom.currentLessonTitle.textContent = lessonTitle;
}

// ============================================================
//  НАСТРОЙКИ
// ============================================================
dom.secondsInput.addEventListener('change', () => {
  let v = parseInt(dom.secondsInput.value) || 5;
  if (v < 1) v = 1;
  if (v > 60) v = 60;
  state.seconds = v;
  dom.secondsInput.value = v;
  localStorage.setItem('grammar.seconds', v);
});

dom.showTextToggle.addEventListener('change', () => {
  state.showText = dom.showTextToggle.checked;
});

dom.langSelect.addEventListener('change', () => {
  state.lang = dom.langSelect.value;
  localStorage.setItem('grammar.lang', state.lang);
  applyLanguage();
});

// ============================================================
//  БОКОВАЯ ПАНЕЛЬ
// ============================================================
function openSidebar() {
  dom.sidebar.classList.add('open');
  dom.overlay.classList.add('active');
}
function closeSidebar() {
  dom.sidebar.classList.remove('open');
  dom.overlay.classList.remove('active');
}
dom.openBtn.onclick = openSidebar;
dom.closeBtn.onclick = closeSidebar;
dom.overlay.onclick = closeSidebar;

// ============================================================
//  ЛОГИКА РАУНДА
// ============================================================
function getActiveWords() {
  if (state.lesson === 'all') {
    // Собираем все слова из всех уроков
    let all = [];
    Object.values(LESSONS).forEach(u => all.push(...u.words));
    return all;
  } else {
    return LESSONS[state.lesson].words;
  }
}

function shuffle(arr) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function resetToStart() {
  state.phase = 'start';
  if (state.countdownTimer) clearInterval(state.countdownTimer);
  if (state.audioEl) { state.audioEl.pause(); state.audioEl = null; }
  
  dom.cardImage.src = '';
  dom.cardIcon.classList.add('hidden');
  dom.textDisplay.classList.add('hidden');
  
  showScreen('startScreen');
  showTimer(false);
}

function startRound() {
  const words = getActiveWords();
  
  if (words.length === 0) {
    alert("Нет слов для тренировки!");
    return;
  }

  // Перемешиваем и убираем дубликаты (если "all")
  state.queue = shuffle([...new Set(words)]);
  state.currentIndex = -1;
  
  // Прогрев кэша (Under the hood)
  state.queue.forEach(name => {
    IMAGE_EXTS.forEach(ext => {
      const img = new Image();
      img.src = `${IMAGES_DIR}/${name}.${ext}`;
    });
  });

  setTimeout(() => nextCard(), 300);
}

function nextCard() {
  state.currentIndex++;
  if (state.currentIndex >= state.queue.length) {
    endRound();
    return;
  }

  const name = state.queue[state.currentIndex];
  showScreen('playScreen');
  
  dom.cardImage.style.visibility = 'hidden';
  dom.cardImage.src = '';
  dom.cardIcon.classList.add('hidden');
  dom.textDisplay.classList.add('hidden');
  showTimer(false);

  // Логика в зависимости от упражнения
  if (state.exercise === 'words') {
    // Просто картинка
    loadImage(name, 0, () => {
      dom.cardImage.style.visibility = 'visible';
      startCountdown(name, 'words');
    });
    
  } else if (state.exercise === 'sentences') {
    // Картинка + значок, или аудио-интонация
    // В этой версии мы сделаем случайный выбор: значок (plus, minus, question)
    // (Позже можно добавить аудио-интонацию)
    
    const signs = ['plus', 'minus', 'question'];
    const sign = signs[Math.floor(Math.random() * signs.length)];
    
    loadImage(name, 0, () => {
      dom.cardImage.style.visibility = 'visible';
      
      // Показываем значок
      dom.cardIcon.textContent = sign === 'plus' ? '➕' : sign === 'minus' ? '➖' : '❓';
      dom.cardIcon.classList.remove('hidden');
      
      // Запускаем таймер
      startCountdown(name, 'sentences');
    });
    
  } else if (state.exercise === 'answers') {
    // Показываем картинку и играем вопрос (аудио)
    loadImage(name, 0, () => {
      dom.cardImage.style.visibility = 'visible';
      
      const data = GRAMMAR_DB[name];
      
      // Показываем текст вопроса (если включено)
      if (state.showText && data) {
        dom.textDisplay.textContent = data.question;
        dom.textDisplay.classList.remove('hidden');
      }
      
      // Воспроизводим аудио вопроса, затем запускаем таймер
      playAudio(`question_${name}`, () => {
        startCountdown(name, 'answers');
      });
    });
  }
}

// ============================================================
//  ТАЙМЕР
// ============================================================
function startCountdown(name, exerciseType, sign = null) {
  if (state.countdownTimer) clearInterval(state.countdownTimer);
  
  state.phase = 'counting';
  let left = state.seconds;

  showTimer(true);
  setTimerText(String(left), false);

  state.countdownTimer = setInterval(() => {
    left--;
    if (left > 0) {
      setTimerText(String(left), left <= 3);
    } else {
      setTimerText('00', true);
      clearInterval(state.countdownTimer);
      state.countdownTimer = null;
      
      let audioName = '';
      let textToShow = '';
      
      if (exerciseType === 'answers') {
        // 3-е упражнение (Ответы): пока играем вопрос
        audioName = `${name} - Is_it`;
        textToShow = QUESTION[name] || '';
      } else if (exerciseType === 'sentences') {
        // 2-е упражнение (Предложения): смотрим на знак
        if (sign === 'plus_long') {
          audioName = `${name} - It_is`;
          textToShow = AFFIRMATIVE_LONG[name] || '';
        } else if (sign === 'plus_short') {
          audioName = `${name} - Its`;
          textToShow = AFFIRMATIVE_SHORT[name] || '';
        } else if (sign === 'minus') {
          audioName = `${name} - It_isnt`;
          textToShow = NEGATIVE[name] || '';
        } else {
          audioName = `${name} - Is_it`;
          textToShow = QUESTION[name] || '';
        }
      } else {
        // 1-е упражнение (Слова)
        audioName = name;
        textToShow = name;
      }

      // Показываем текст на экране (если включена галочка)
      if (state.showText) {
        dom.textDisplay.textContent = textToShow;
        dom.textDisplay.classList.remove('hidden');
      }

      // Запускаем аудио
      playAudio(audioName, () => { 
        state.phase = 'ready'; 
      });
    }
  }, 1000);
}

// ============================================================
//  ЗАГРУЗКА КАРТИНОК
// ============================================================
function loadImage(name, extIndex, onSuccess) {
  if (extIndex >= IMAGE_EXTS.length) {
    if (onSuccess) onSuccess();
    return;
  }

  const ext = IMAGE_EXTS[extIndex];
  const src = `${IMAGES_DIR}/${name}.${ext}`;
  const img = new Image();
  
  img.onload = () => {
    dom.cardImage.src = src;
    dom.cardImage.alt = name;
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        if (onSuccess) onSuccess();
      });
    });
  };

  img.onerror = () => loadImage(name, extIndex + 1, onSuccess);
  img.src = src;
}

// ============================================================
//  АУДИО
// ============================================================
function playAudio(audioName, onFinish) {
  state.phase = 'audio';
  
  if (state.audioEl) {
    state.audioEl.pause();
    state.audioEl = null;
  }

  const tryExt = (i) => {
    if (i >= AUDIO_EXTS.length) {
      state.phase = 'ready';
      if (onFinish) onFinish();
      return;
    }

    const src = `${AUDIO_DIR}/${audioName}.${AUDIO_EXTS[i]}`;
    const audio = new Audio();
    
    const timeout = setTimeout(() => {
      tryExt(i + 1); // Пропускаем, если файл не загрузился
    }, 1000);

    audio.oncanplaythrough = () => {
      clearTimeout(timeout);
      state.audioEl = audio;
      audio.play().then(() => {
        audio.onended = () => {
          state.phase = 'ready';
          if (onFinish) onFinish();
        };
      }).catch(() => {
        showSoundHint();
        state.phase = 'ready';
        if (onFinish) onFinish();
      });
    };

    audio.onerror = () => {
      clearTimeout(timeout);
      tryExt(i + 1);
    };

    audio.src = src;
  };

  tryExt(0);
}

// ============================================================
//  УТИЛИТЫ ИНТЕРФЕЙСА
// ============================================================
function showScreen(id) {
  [dom.startScreen, dom.playScreen, dom.endScreen].forEach(s => s.classList.remove('active'));
  document.getElementById(id).classList.add('active');
}

function showTimer(show) {
  dom.timerBox.classList.toggle('hidden', !show);
}

function setTimerText(text, warning = false) {
  dom.timerValue.textContent = text;
  dom.timerValue.classList.toggle('warning', warning);
}

function endRound() {
  state.phase = 'end';
  showTimer(false);
  setTimerText('00', false);
  showScreen('endScreen');
}

function showSoundHint() {
  dom.soundHint.classList.remove('hidden');
  dom.soundHint.onclick = () => {
    dom.soundHint.classList.add('hidden');
    if (state.audioEl) state.audioEl.play().catch(() => {});
  };
}

// ============================================================
//  ОБРАБОТКА ПРОБЕЛА И ТАПОВ
// ============================================================
function handleAction() {
  if (state.phase === 'start') {
    startRound();
  } else if (state.phase === 'ready') {
    nextCard();
  } else if (state.phase === 'end') {
    resetToStart();
    startRound();
  }
}

document.addEventListener('keydown', (e) => {
  if (e.code !== 'Space') return;
  e.preventDefault();
  if (document.activeElement === dom.secondsInput) return;
  handleAction();
});

document.addEventListener('pointerdown', (e) => {
  if (e.target.tagName === 'INPUT' || e.target.tagName === 'SELECT' || 
      e.target.closest('.sidebar') || e.target.id === 'soundHint') return;
  handleAction();
});

// ============================================================
//  СТАРТ
// ============================================================
initUI();
resetToStart();
