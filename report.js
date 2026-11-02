// ============================================================
//  ОТЧЁТ О ФАЙЛАХ
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

const reportDiv = document.getElementById('report');
const statusDiv = document.getElementById('status');
const startBtn = document.getElementById('startBtn');

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
      // Увеличили таймаут до 2000 мс, чтобы аудио точно успело загрузиться
      const t = setTimeout(() => { audio.src = ''; i++; tryNext(); }, 2000);
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

function getRequiredFiles(name, exercise) {
  const req = [];
  if (exercise === 'confusables') {
    req.push({ type: 'img', path: `${CONFUSABLES_DIR}/${name}`, label: `${name}.jpg` });
  } else {
    req.push({ type: 'img', path: `${IMAGES_DIR}/${name}`, fallback: `${ADDITIONAL_DIR}/${name}`, label: `${name}.png` });
  }

  if (exercise === 'words') {
    req.push({ type: 'audio', path: `${AUDIO_DIR}/${name}`, label: `${name}.mp3` });
  } else if (exercise === 'sent_long') {
    req.push({ type: 'audio', path: `${AUDIO_DIR}/${name} - It_is`, label: `${name} - It_is.mp3` });
  } else if (exercise === 'sent_short') {
    req.push({ type: 'audio', path: `${AUDIO_DIR}/${name} - Its`, label: `${name} - Its.mp3` });
  } else if (exercise === 'sent_neg') {
    req.push({ type: 'audio', path: `${AUDIO_DIR}/${name} - It_isnt`, label: `${name} - It_isnt.mp3` });
  } else if (exercise === 'sent_quest') {
    req.push({ type: 'audio', path: `${AUDIO_DIR}/${name} - Is_it`, label: `${name} - Is_it.mp3` });
  } else if (exercise === 'sent_mix') {
    req.push({ type: 'audio', path: `${AUDIO_DIR}/${name} - It_is`, label: `${name} - It_is.mp3` });
    req.push({ type: 'audio', path: `${AUDIO_DIR}/${name} - Its`, label: `${name} - Its.mp3` });
    req.push({ type: 'audio', path: `${AUDIO_DIR}/${name} - It_isnt`, label: `${name} - It_isnt.mp3` });
    req.push({ type: 'audio', path: `${AUDIO_DIR}/${name} - Is_it`, label: `${name} - Is_it.mp3` });
  } else if (exercise === 'confusables') {
    const wrongs = CONFUSABLES_PAIRS[name] || [];
    req.push({ type: 'audio', path: `${AUDIO_DIR}/${name} - Its`, label: `${name} - Its.mp3` });
    wrongs.forEach(w => {
      const base = audioBaseForConfusable(w);
      req.push({ type: 'audio', path: `${AUDIO_DIR}/${base} - It_isnt`, label: `${base} - It_isnt.mp3` });
    });
  } else if (exercise === 'ans_yes') {
    req.push({ type: 'audio', path: `${AUDIO_DIR}/${name} - Is_it`, label: `${name} - Is_it.mp3` });
    req.push({ type: 'audio', path: `${AUDIO_SHORT_DIR}/short_ans_yes`, label: `short_ans/short_ans_yes.mp3` });
    req.push({ type: 'audio', path: `${AUDIO_EMPHATIC_DIR}/${name}_ItIS`, label: `emphatic/${name}_ItIS.mp3` });
  } else if (exercise === 'ans_no') {
    req.push({ type: 'audio', path: `${AUDIO_DIR}/${name} - Is_it`, label: `${name} - Is_it.mp3` });
    req.push({ type: 'audio', path: `${AUDIO_SHORT_DIR}/short_ans_no`, label: `short_ans/short_ans_no.mp3` });
    req.push({ type: 'audio', path: `${AUDIO_DIR}/${name} - Its`, label: `${name} - Its.mp3` });
  } else if (exercise === 'ans_chain') {
    req.push({ type: 'audio', path: `${AUDIO_DIR}/${name} - Negation_chain`, label: `${name} - Negation_chain.mp3` });
  }

  return req;
}

function getCandidates(exercise) {
  if (exercise === 'confusables') {
    return Object.keys(CONFUSABLES_PAIRS);
  }
  let all = [];
  Object.values(LESSONS).forEach(u => all.push(...u.words));
  return [...new Set(all)];
}

async function generateReport() {
  startBtn.style.display = 'none'; // Прячем кнопку
  const exercises = EXERCISES;
  const result = {};

  for (const ex of exercises) {
    const candidates = getCandidates(ex.id);
    const rows = [];
    const limit = ex.id === 'confusables' ? candidates.length : Math.min(candidates.length, 50);

    for (let i = 0; i < limit; i++) {
      const name = candidates[i];
      const req = getRequiredFiles(name, ex.id);
      const missing = [];
      
      for (const r of req) {
        let ok = false;
        if (r.type === 'img') {
          ok = await checkImage(r.path);
          if (!ok && r.fallback) ok = await checkImage(r.fallback);
        } else {
          ok = await checkAudio(r.path);
        }
        if (!ok) missing.push(r.label);
      }
      
      if (missing.length > 0) {
        rows.push({ name, missing });
      }
    }
    
    result[ex.id] = { title: ex.titleRu, rows };
    statusDiv.textContent = `Проверено: ${ex.titleRu}...`;
  }

  renderReport(result);
}

function renderReport(result) {
  statusDiv.textContent = 'Готово! / Done!';
  let html = '';

  for (const exId in result) {
    const ex = result[exId];
    if (ex.rows.length === 0) {
      html += `<h2>${ex.title}</h2><p class="ok">Все файлы на месте / All files present ✅</p>`;
    } else {
      html += `<h2>${ex.title}</h2>`;
      html += `<table><tr><th>Слово / Word</th><th>Не хватает / Missing</th></tr>`;
      ex.rows.forEach(r => {
        html += `<tr><td><code>${r.name}</code></td><td class="miss">${r.missing.join('<br>')}</td></tr>`;
      });
      html += `</table>`;
    }
  }

  reportDiv.innerHTML = html;
}

// Запуск проверки по клику
startBtn.addEventListener('click', () => {
  statusDiv.textContent = 'Пожалуйста, подождите... / Please wait...';
  // Даем браузеру 100мс, чтобы обработать клик и разрешить аудио
  setTimeout(generateReport, 100);
});