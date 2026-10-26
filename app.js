// ============================================================
//  ГЛОБАЛЬНОЕ СОСТОЯНИЕ
// ============================================================
let state = {
  lang: 'ru',
  exercise: 'words',
  lesson: 'all',
  seconds: 5,
  showText: false,
  
  queue: [],
  currentIndex: -1,
  phase: 'start',
  countdownTimer: null,
  audioEl: null
};

// ============================================================
//  ПУТИ И РАСШИРЕНИЯ
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
  timerBar: document.getElementById('timerBar'),
  replayBtn: document.getElementById('replayBtn'), 
  soundHint: document.getElementById('soundHint')
};

// ============================================================
//  ИНИЦИАЛИЗАЦИЯ ИНТЕРФЕЙСА
// ============================================================
function initUI() {
  const savedSeconds = localStorage.getItem('grammar.seconds');
  if (savedSeconds) state.seconds = parseInt(savedSeconds);
  dom.secondsInput.value = state.seconds;

  const savedLang = localStorage.getItem('grammar.lang');
  if (savedLang) {
    state.lang = savedLang;
    dom.langSelect.value = savedLang;
  }

  renderMenus();
  applyLanguage();
  updateCurrentInfo();
}

function renderMenus() {
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

  dom.lessonMenu.innerHTML = '';
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
  const headers = document.querySelectorAll('.menu-section h3');
  if (headers[0]) headers[0].textContent = t.exercises;
  if (headers[1]) headers[1].textContent = t.words;
  if (headers[2]) headers[2].textContent = t.settings;
  
  const settingSpans = document.querySelectorAll('.setting span');
  if (settingSpans[0]) settingSpans[0].textContent = t.seconds;
  if (settingSpans[1]) settingSpans[1].textContent = t.showText;
  
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
  dom.cardImage.classList.remove('crossed-image');
  dom.cardIcon.classList.add('hidden');
  dom.textDisplay.classList.add('hidden');
  dom.replayBtn.classList.add('hidden');
  
  showScreen('startScreen');
  showTimer(false);
}

function startRound() {
  const words = getActiveWords();
  
  if (words.length === 0) {
    alert("Нет слов для тренировки!");
    return;
  }

  state.queue = shuffle([...new Set(words)]);
  state.currentIndex = -1;
  
  state.queue.forEach(name => {
    IMAGE_EXTS.forEach(ext => {
      const img = new Image();
      img.src = `${IMAGES_DIR}/${name}.${ext}`;
    });
  });

  dom.cardIcon.classList.add('hidden');
  
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
  dom.cardImage.classList.remove('crossed-image');
  dom.cardIcon.classList.add('hidden');
  dom.textDisplay.classList.add('hidden');
  dom.replayBtn.classList.add('hidden');
  showTimer(false);

  if (state.exercise === 'words') {
    loadImage(name, 0, () => {
      dom.cardImage.style.visibility = 'visible';
      startCountdown(name, 'words');
    });
    
  } else if (state.exercise.startsWith('sent_')) {
    let sign = '';
    
    if (state.exercise === 'sent_mix') {
      const signs = ['plus_long', 'plus_short', 'minus', 'question'];
      sign = signs[Math.floor(Math.random() * signs.length)];
    } else {
      if (state.exercise === 'sent_long') sign = 'plus_long';
      if (state.exercise === 'sent_short') sign = 'plus_short';
      if (state.exercise === 'sent_neg') sign = 'minus';
      if (state.exercise === 'sent_quest') sign = 'question';
    }
    
    loadImage(name, 0, () => {
      dom.cardImage.style.visibility = 'visible';
      
      // Перечеркивание для минуса!
      if (sign === 'minus') {
        dom.cardImage.classList.add('crossed-image');
      } else {
        dom.cardImage.classList.remove('crossed-image');
      }
      
      dom.cardIcon.className = 'card-icon'; 
      
      if (sign === 'plus_long') {
        dom.cardIcon.textContent = '➕';
        dom.cardIcon.classList.add('icon-plus-long');
      } else if (sign === 'plus_short') {
        dom.cardIcon.textContent = '➕';
        dom.cardIcon.classList.add('icon-plus-short');
      } else if (sign === 'minus') {
        dom.cardIcon.textContent = '➖';
        dom.cardIcon.classList.add('icon-minus');
      } else {
        dom.cardIcon.textContent = '❓';
        dom.cardIcon.classList.add('icon-question');
      }
      
      dom.cardIcon.classList.remove('hidden');
      startCountdown(name, 'sentences', sign);
    });
    
  } else if (state.exercise === 'answers') {
    loadImage(name, 0, () => {
      dom.cardImage.style.visibility = 'visible';
      
      // Убрали перечеркивание для 3-го упражнения
      dom.cardImage.classList.remove('crossed-image'); 
      
      const data = QUESTION[name];
      if (state.showText && data) {
        dom.textDisplay.textContent = data;
        dom.textDisplay.classList.remove('hidden');
      }
      
      playAudio(`${name} - Is_it`, () => {
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
  const total = state.seconds;
  
  state.currentAudioName = '';
  state.currentText = '';
  
  if (exerciseType === 'answers') {
    state.currentAudioName = `${name} - Is_it`;
    state.currentText = QUESTION[name] || '';
  } else if (exerciseType === 'sentences') {
    if (sign === 'plus_long') { state.currentAudioName = `${name} - It_is`; state.currentText = AFFIRMATIVE_LONG[name] || ''; }
    else if (sign === 'plus_short') { state.currentAudioName = `${name} - Its`; state.currentText = AFFIRMATIVE_SHORT[name] || ''; }
    else if (sign === 'minus') { state.currentAudioName = `${name} - It_isnt`; state.currentText = NEGATIVE[name] || ''; }
    else { state.currentAudioName = `${name} - Is_it`; state.currentText = QUESTION[name] || ''; }
  } else {
    state.currentAudioName = name;
    state.currentText = name;
  }

  showTimer(true);
  dom.timerBar.style.height = '100%';
  dom.timerBar.classList.remove('danger');
  dom.replayBtn.classList.add('hidden');
  dom.textDisplay.classList.add('hidden');

  state.countdownTimer = setInterval(() => {
    left--;
    
    if (left > 0) {
      const percent = (left / total) * 100;
      dom.timerBar.style.height = `${percent}%`;
      
      if (left <= 2) {
        dom.timerBar.classList.add('danger');
      }
    } else {
      dom.timerBar.style.height = '0%';
      clearInterval(state.countdownTimer);
      state.countdownTimer = null;
      
      if (state.showText) {
        dom.textDisplay.textContent = state.currentText;
        dom.textDisplay.classList.remove('hidden');
      }

      playAudio(state.currentAudioName, () => { 
        state.phase = 'ready'; 
        dom.replayBtn.classList.remove('hidden');
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
    
    state.currentAudioObj = audio;

    const timeout = setTimeout(() => {
      tryExt(i + 1); 
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

function endRound() {
  state.phase = 'end';
  showTimer(false);
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
      e.target.closest('.sidebar') || e.target.id === 'soundHint' || e.target.closest('.replay-btn')) return;
  handleAction();
});

// ============================================================
//  КНОПКА ПОВТОРА АУДИО
// ============================================================
dom.replayBtn.addEventListener('pointerdown', (e) => {
  e.stopPropagation();
  if (state.currentAudioObj) {
    state.currentAudioObj.currentTime = 0;
    state.currentAudioObj.play().catch(() => {});
  }
});

// ============================================================
//  СТАРТ
// ============================================================
initUI();
resetToStart();
