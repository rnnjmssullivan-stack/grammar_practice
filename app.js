// ============================================================
//  СОСТОЯНИЕ
// ============================================================
let state = {
  lang: 'ru',
  exercise: 'words',
  lesson: 'all',
  seconds: 5,
  showText: false,
  showHints: true,

  queue: [],             // проверенные слова, готовые к показу
  pending: [],           // ещё не проверенные
  currentIndex: -1,
  phase: 'start',
  countdownTimer: null,
  audioEl: null,
  currentAudioQueue: [],
  currentAudioIndex: 0,
  currentText: '',
  filtering: false,
  backgroundCheckActive: false
};

// ============================================================
//  ПУТИ
// ============================================================
const IMAGES_DIR = "images";
const ADDITIONAL_DIR = "images/additional_words_01";
const CONFUSABLES_DIR = "images/confusables";

const AUDIO_DIR = "audio";
const AUDIO_HINTS_DIR = "audio/hints";
const AUDIO_SHORT_DIR = "audio/short_ans";
const AUDIO_EMPHATIC_DIR = "audio/emphatic";

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
  hintsToggle: document.getElementById('hintsToggle'),
  langSelect: document.getElementById('langSelect'),
  startScreen: document.getElementById('startScreen'),
  playScreen: document.getElementById('playScreen'),
  endScreen: document.getElementById('endScreen'),
  imageWrapper: document.querySelector('.image-wrapper'),
  cardImage: document.getElementById('cardImage'),
  cardIcon: document.getElementById('cardIcon'),
  textDisplay: document.getElementById('textDisplay'),
  timerBox: document.getElementById('timerBox'),
  timerBar: document.getElementById('timerBar'),
  replayBtn: document.getElementById('replayBtn'),
  soundHint: document.getElementById('soundHint')
};

// ============================================================
//  ИНИЦИАЛИЗАЦИЯ
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

  const savedHints = localStorage.getItem('grammar.showHints');
  if (savedHints !== null) {
    state.showHints = savedHints === 'true';
    dom.hintsToggle.checked = state.showHints;
  }

  const savedText = localStorage.getItem('grammar.showText');
  if (savedText !== null) {
    state.showText = savedText === 'true';
    dom.showTextToggle.checked = state.showText;
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
  localStorage.setItem('grammar.showText', state.showText);
});

dom.hintsToggle.addEventListener('change', () => {
  state.showHints = dom.hintsToggle.checked;
  localStorage.setItem('grammar.showHints', state.showHints);
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
//  ПРОВЕРКА И ПРЕДЗАГРУЗКА
// ============================================================
function checkImage(basePath) {
  return new Promise(resolve => {
    let i = 0;
    const tryNext = () => {
      if (i >= IMAGE_EXTS.length) { resolve(false); return; }
      const img = new Image();
      img.onload = () => resolve(true);
      img.onerror = () => { i++; tryNext(); };
      img.src = `${basePath}.${IMAGE_EXTS[i]}`;
    };
    tryNext();
  });
}

function checkAudio(basePath) {
  return new Promise(resolve => {
    let i = 0;
    const tryNext = () => {
      if (i >= AUDIO_EXTS.length) { resolve(false); return; }
      const audio = new Audio();
      let done = false;
      const finish = (ok) => {
        if (done) return;
        done = true;
        clearTimeout(t);
        resolve(ok);
      };
      const t = setTimeout(() => { audio.src = ''; i++; tryNext(); }, 800);
      audio.oncanplay = () => finish(true);
      audio.onerror = () => { clearTimeout(t); i++; tryNext(); };
      audio.src = `${basePath}.${AUDIO_EXTS[i]}`;
      audio.load();
    };
    tryNext();
  });
}

function audioBaseForConfusable(w) {
  return w.replace(/_\d+$/, '');
}

async function isWordAvailable(name, exercise) {
  let imgOk = false;
  if (exercise === 'confusables') {
    imgOk = await checkImage(`${CONFUSABLES_DIR}/${name}`);
  } else {
    imgOk = await checkImage(`${IMAGES_DIR}/${name}`);
    if (!imgOk) imgOk = await checkImage(`${ADDITIONAL_DIR}/${name}`);
  }
  if (!imgOk) return false;

  if (exercise === 'words') return await checkAudio(`${AUDIO_DIR}/${name}`);
  if (exercise === 'sent_long')  return await checkAudio(`${AUDIO_DIR}/${name} - It_is`);
  if (exercise === 'sent_short') return await checkAudio(`${AUDIO_DIR}/${name} - Its`);
  if (exercise === 'sent_neg')   return await checkAudio(`${AUDIO_DIR}/${name} - It_isnt`);
  if (exercise === 'sent_quest') return await checkAudio(`${AUDIO_DIR}/${name} - Is_it`);
  if (exercise === 'sent_mix') {
    const checks = await Promise.all([
      checkAudio(`${AUDIO_DIR}/${name} - It_is`),
      checkAudio(`${AUDIO_DIR}/${name} - Its`),
      checkAudio(`${AUDIO_DIR}/${name} - It_isnt`),
      checkAudio(`${AUDIO_DIR}/${name} - Is_it`)
    ]);
    return checks.every(Boolean);
  }
  if (exercise === 'confusables') {
    const wrongs = CONFUSABLES_PAIRS[name] || [];
    if (wrongs.length === 0) return false;
    const rightOk = await checkAudio(`${AUDIO_DIR}/${name} - Its`);
    if (!rightOk) return false;
    for (const w of wrongs) {
      const ok = await checkAudio(`${AUDIO_DIR}/${audioBaseForConfusable(w)} - It_isnt`);
      if (ok) return true;
    }
    return false;
  }
  if (exercise === 'ans_yes') {
    const checks = await Promise.all([
      checkAudio(`${AUDIO_DIR}/${name} - Is_it`),
      checkAudio(`${AUDIO_SHORT_DIR}/short_ans_yes`),
      checkAudio(`${AUDIO_EMPHATIC_DIR}/${name}_ItIS`)
    ]);
    return checks.every(Boolean);
  }
  if (exercise === 'ans_no') {
    const checks = await Promise.all([
      checkAudio(`${AUDIO_DIR}/${name} - Is_it`),
      checkAudio(`${AUDIO_SHORT_DIR}/short_ans_no`),
      checkAudio(`${AUDIO_DIR}/${name} - Its`)
    ]);
    return checks.every(Boolean);
  }
  if (exercise === 'ans_chain') {
    return await checkAudio(`${AUDIO_DIR}/${name} - Negation_chain`);
  }
  return false;
}

// ============================================================
//  РАУНД
// ============================================================
function getActiveWords() {
  if (state.lesson === 'all') {
    let all = [];
    Object.values(LESSONS).forEach(u => all.push(...u.words));
    return all;
  }
  return LESSONS[state.lesson].words;
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
  state.filtering = false;
  state.backgroundCheckActive = false;
  if (state.countdownTimer) clearInterval(state.countdownTimer);
  if (state.audioEl) { state.audioEl.pause(); state.audioEl = null; }
  state.currentAudioQueue = [];
  state.currentAudioIndex = 0;
  state.queue = [];
  state.pending = [];

  dom.cardImage.src = '';
  dom.imageWrapper.classList.remove('crossed-image');
  dom.cardIcon.classList.add('hidden');
  dom.textDisplay.classList.add('hidden');
  dom.replayBtn.classList.add('hidden');

  showScreen('startScreen');
  showTimer(false);
}

// Фоновая проверка: берём из pending и добавляем в queue
async function backgroundCheck() {
  if (state.backgroundCheckActive) return;
  state.backgroundCheckActive = true;

  while (state.pending.length > 0) {
    const name = state.pending.shift();
    const ok = await isWordAvailable(name, state.exercise);
    if (ok) {
      state.queue.push(name);
    }
  }

  state.backgroundCheckActive = false;
}

async function startRound() {
  if (state.filtering) return;
  state.filtering = true;

  dom.startScreen.querySelector('.hint').innerHTML =
    'Загрузка... / Loading...<br><span class="en">Проверяем файлы / Checking files</span>';

  let candidates;
  if (state.exercise === 'confusables') {
    candidates = Object.keys(CONFUSABLES_PAIRS);
  } else {
    candidates = [...new Set(getActiveWords())];
  }
  candidates = shuffle(candidates);

  // Ищем первое доступное слово (проверяем по одному, пропуская недоступные)
  let firstAvailable = null;
  let firstIndex = -1;
  for (let i = 0; i < candidates.length; i++) {
    const ok = await isWordAvailable(candidates[i], state.exercise);
    if (ok) {
      firstAvailable = candidates[i];
      firstIndex = i;
      break;
    }
  }

  state.filtering = false;

  // Если не нашли ни одного — ошибка
  if (!firstAvailable) {
    alert("Нет слов с полным набором файлов для этого упражнения!");
    resetToStart();
    return;
  }

  // Первое слово — в очередь. Остальные — в pending.
  state.queue = [firstAvailable];
  state.pending = candidates.slice(firstIndex + 1);

  state.currentIndex = -1;
  nextCard(); // показываем первое

  // Запускаем фоновую проверку остальных (не ждём)
  backgroundCheck();
}

function nextCard() {
  state.currentIndex++;
  if (state.currentIndex >= state.queue.length) {
    // Очередь опустела — но фоновая проверка может ещё идти
    if (state.pending.length > 0 || state.backgroundCheckActive) {
      // Подождать, пока фоновая проверка добавит что-то
      const waitFor = setInterval(() => {
        if (state.currentIndex < state.queue.length) {
          clearInterval(waitFor);
          nextCard();
        } else if (!state.backgroundCheckActive && state.pending.length === 0) {
          clearInterval(waitFor);
          endRound();
        }
      }, 100);
      return;
    }
    endRound();
    return;
  }

  const name = state.queue[state.currentIndex];
  showScreen('playScreen');

  dom.cardImage.style.visibility = 'hidden';
  dom.cardImage.src = '';
  dom.imageWrapper.classList.remove('crossed-image');
  dom.cardIcon.classList.add('hidden');
  dom.textDisplay.classList.add('hidden');
  dom.replayBtn.classList.add('hidden');
  showTimer(false);

  // ---------- 0. WORDS ----------
  if (state.exercise === 'words') {
    state.currentText = AFFIRMATIVE_SHORT[name] || name;
    state.currentAudioQueue = [{ dir: AUDIO_DIR, name: name }];
    state.currentAudioIndex = 0;

    loadImage(name, `${IMAGES_DIR}/${name}`, () => {
      dom.cardImage.style.visibility = 'visible';
      startCountdown(name, 'words');
    });
  }

  // ---------- 1. SENTENCES ----------
  else if (state.exercise.startsWith('sent_')) {
    let sign = 'plus_long';
    if (state.exercise === 'sent_mix') {
      const signs = ['plus_long', 'plus_short', 'minus', 'question'];
      sign = signs[Math.floor(Math.random() * signs.length)];
    } else if (state.exercise === 'sent_long') sign = 'plus_long';
    else if (state.exercise === 'sent_short') sign = 'plus_short';
    else if (state.exercise === 'sent_neg') sign = 'minus';
    else if (state.exercise === 'sent_quest') sign = 'question';

    let audioSuffix = '', text = '';
    if (sign === 'plus_long') { audioSuffix = 'It_is'; text = AFFIRMATIVE_LONG[name] || ''; }
    else if (sign === 'plus_short') { audioSuffix = 'Its'; text = AFFIRMATIVE_SHORT[name] || ''; }
    else if (sign === 'minus') { audioSuffix = 'It_isnt'; text = NEGATIVE[name] || ''; }
    else { audioSuffix = 'Is_it'; text = QUESTION[name] || ''; }

    state.currentText = text;
    state.currentAudioQueue = [{ dir: AUDIO_DIR, name: `${name} - ${audioSuffix}` }];
    state.currentAudioIndex = 0;

    loadImage(name, `${IMAGES_DIR}/${name}`, () => {
      dom.cardImage.style.visibility = 'visible';
      if (sign === 'minus') dom.imageWrapper.classList.add('crossed-image');

      dom.cardIcon.className = 'card-icon';
      if (sign === 'plus_long') { dom.cardIcon.textContent = '➕'; dom.cardIcon.classList.add('icon-plus-long'); }
      else if (sign === 'plus_short') { dom.cardIcon.textContent = '➕'; dom.cardIcon.classList.add('icon-plus-short'); }
      else if (sign === 'minus') { dom.cardIcon.textContent = '➖'; dom.cardIcon.classList.add('icon-minus'); }
      else { dom.cardIcon.textContent = '❓'; dom.cardIcon.classList.add('icon-question'); }
      dom.cardIcon.classList.remove('hidden');

      startCountdown(name, 'sentences', sign);
    });
  }

  // ---------- 2. CONFUSABLES ----------
  else if (state.exercise === 'confusables') {
    const wrongs = CONFUSABLES_PAIRS[name] || [];
    const wrong = wrongs[Math.floor(Math.random() * wrongs.length)];
    const base = audioBaseForConfusable(wrong);

    const wrongWordText = wrong.replace(/_\d+$/, '').replace(/_/g, ' ');
    const rightText = AFFIRMATIVE_SHORT[name] || `It's ${name}.`;
    const fullText = `It isn't ${wrongWordText}. ${rightText}`;

    dom.textDisplay.innerHTML = `<s>${wrongWordText}</s>`;
    dom.textDisplay.classList.remove('hidden');

    state.currentText = fullText;
    state.currentAudioQueue = [
      { dir: AUDIO_DIR, name: `${base} - It_isnt` },
      { dir: AUDIO_DIR, name: `${name} - Its` }
    ];
    state.currentAudioIndex = 0;

    loadImage(name, `${CONFUSABLES_DIR}/${name}`, () => {
      dom.cardImage.style.visibility = 'visible';
      startCountdown(name, 'confusables');
    });
  }

  // ---------- 3.1 ANS YES ----------
  else if (state.exercise === 'ans_yes') {
    state.currentText = `Yes, it IS. ${AFFIRMATIVE_LONG[name] || ''}`;
    state.currentAudioQueue = [
      { dir: AUDIO_SHORT_DIR, name: 'short_ans_yes' },
      { dir: AUDIO_EMPHATIC_DIR, name: `${name}_ItIS` }
    ];
    state.currentAudioIndex = 0;

    loadImage(name, `${IMAGES_DIR}/${name}`, () => {
      dom.cardImage.style.visibility = 'visible';
      playAudioSingle(`${AUDIO_DIR}/${name} - Is_it`, () => {
        startCountdown(name, 'ans_yes');
      });
    });
  }

  // ---------- 3.2 ANS NO ----------
  else if (state.exercise === 'ans_no') {
    state.currentText = `No, it isn't. ${AFFIRMATIVE_SHORT[name] || ''}`;
    state.currentAudioQueue = [
      { dir: AUDIO_SHORT_DIR, name: 'short_ans_no' },
      { dir: AUDIO_DIR, name: `${name} - Its` }
    ];
    state.currentAudioIndex = 0;

    loadImage(name, `${IMAGES_DIR}/${name}`, () => {
      dom.cardImage.style.visibility = 'visible';
      playAudioSingle(`${AUDIO_DIR}/${name} - Is_it`, () => {
        startCountdown(name, 'ans_no');
      });
    });
  }

  // ---------- 3.3 ANS CHAIN ----------
  else if (state.exercise === 'ans_chain') {
    state.currentText = `It isn't ... It's not ... It is NOT ...`;
    state.currentAudioQueue = [{ dir: AUDIO_DIR, name: `${name} - Negation_chain` }];
    state.currentAudioIndex = 0;

    loadImage(name, `${IMAGES_DIR}/${name}`, () => {
      dom.cardImage.style.visibility = 'visible';
      showTimer(false);
      if (state.showText) {
        dom.textDisplay.textContent = state.currentText;
        dom.textDisplay.classList.remove('hidden');
      }
      playAudioQueue(() => {
        state.phase = 'ready';
        dom.replayBtn.classList.remove('hidden');
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

  let hintFile = null;
  if (exerciseType === 'sentences' && state.showHints) {
    if (sign === 'plus_long' || sign === 'plus_short') hintFile = 'hint_yes';
    else if (sign === 'minus') hintFile = 'hint_no';
    else hintFile = 'hint_questionYN';
  }

  showTimer(true);
  dom.timerBar.style.height = '100%';
  dom.timerBar.classList.remove('danger');
  dom.replayBtn.classList.add('hidden');
  if (exerciseType !== 'confusables') {
    dom.textDisplay.classList.add('hidden');
  }

  if (hintFile) {
    playAudioSingle(`${AUDIO_HINTS_DIR}/${hintFile}`, null);
  }

  state.countdownTimer = setInterval(() => {
    left--;
    if (left > 0) {
      const percent = (left / total) * 100;
      dom.timerBar.style.height = `${percent}%`;
      if (left <= 2) dom.timerBar.classList.add('danger');
    } else {
      dom.timerBar.style.height = '0%';
      clearInterval(state.countdownTimer);
      state.countdownTimer = null;

      if (state.showText) {
        dom.textDisplay.textContent = state.currentText;
        dom.textDisplay.classList.remove('hidden');
      }

      playAudioQueue(() => {
        state.phase = 'ready';
        dom.replayBtn.classList.remove('hidden');
      });
    }
  }, 1000);
}

// ============================================================
//  ЗАГРУЗКА КАРТИНОК
// ============================================================
function loadImage(name, basePath, onSuccess) {
  const tryExt = (extIndex) => {
    if (extIndex >= IMAGE_EXTS.length) {
      if (!basePath.includes('additional')) {
        loadImage(name, `${ADDITIONAL_DIR}/${name}`, onSuccess);
      } else {
        dom.cardImage.removeAttribute('src');
        dom.cardImage.alt = name;
        if (onSuccess) onSuccess();
      }
      return;
    }
    const ext = IMAGE_EXTS[extIndex];
    const src = `${basePath}.${ext}`;
    const img = new Image();
    img.onload = () => {
      dom.cardImage.src = src;
      dom.cardImage.alt = name;
      requestAnimationFrame(() => requestAnimationFrame(() => {
        if (onSuccess) onSuccess();
      }));
    };
    img.onerror = () => tryExt(extIndex + 1);
    img.src = src;
  };
  tryExt(0);
}

// ============================================================
//  АУДИО
// ============================================================
function playAudioSingle(path, onFinish) {
  const tryExt = (i) => {
    if (i >= AUDIO_EXTS.length) {
      if (onFinish) onFinish();
      return;
    }
    const src = `${path}.${AUDIO_EXTS[i]}`;
    const audio = new Audio();
    let done = false;
    const finish = (ok) => {
      if (done) return;
      done = true;
      if (ok) {
        state.audioEl = audio;
        audio.play().then(() => {
          audio.onended = () => { if (onFinish) onFinish(); };
        }).catch(() => {
          showSoundHint();
          if (onFinish) onFinish();
        });
      } else {
        if (onFinish) onFinish();
      }
    };
    audio.oncanplay = () => finish(true);
    audio.onerror = () => { done = true; tryExt(i + 1); };
    audio.src = src;
  };
  tryExt(0);
}

function playAudioQueue(onFinish) {
  state.phase = 'audio';
  const playNext = () => {
    if (state.currentAudioIndex >= state.currentAudioQueue.length) {
      state.phase = 'ready';
      if (onFinish) onFinish();
      return;
    }
    const item = state.currentAudioQueue[state.currentAudioIndex];
    const tryExt = (i) => {
      if (i >= AUDIO_EXTS.length) {
        state.currentAudioIndex++;
        playNext();
        return;
      }
      const src = `${item.dir}/${item.name}.${AUDIO_EXTS[i]}`;
      const audio = new Audio();
      let done = false;
      const finish = (ok) => {
        if (done) return;
        done = true;
        if (ok) {
          state.audioEl = audio;
          audio.play().then(() => {
            audio.onended = () => {
              state.currentAudioIndex++;
              playNext();
            };
          }).catch(() => {
            showSoundHint();
            state.currentAudioIndex++;
            playNext();
          });
        } else {
          state.currentAudioIndex++;
          playNext();
        }
      };
      audio.oncanplay = () => finish(true);
      audio.onerror = () => { done = true; tryExt(i + 1); };
      audio.src = src;
    };
    tryExt(0);
  };
  playNext();
}

function replayCurrentAudio() {
  if (state.currentAudioQueue.length === 0) return;
  if (state.audioEl) { state.audioEl.pause(); state.audioEl = null; }
  state.currentAudioIndex = 0;
  playAudioQueue(() => {
    state.phase = 'ready';
    dom.replayBtn.classList.remove('hidden');
  });
}

// ============================================================
//  УТИЛИТЫ
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
//  ПРОБЕЛ И ТАПЫ
// ============================================================
function handleAction() {
  if (state.filtering) return;
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
      e.target.closest('.sidebar') || e.target.closest('.topbar') ||
      e.target.id === 'soundHint' || e.target.closest('.replay-btn')) return;
  if (e.target.id === 'sidebarOverlay') return;
  handleAction();
});

// ============================================================
//  КНОПКА ПОВТОРА
// ============================================================
dom.replayBtn.addEventListener('pointerdown', (e) => {
  e.stopPropagation();
  replayCurrentAudio();
});

// ============================================================
//  СТАРТ
// ============================================================
initUI();
resetToStart();