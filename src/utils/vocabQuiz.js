import vocabData from '../data/vocabulary.json';

const STORAGE_KEY = 'vocab-term-mastery';

const CHAPTER_ORDER = [
  { key: 'chapter_9', book: 2, label: 'Ch. 9' },
  { key: 'chapter_10', book: 2, label: 'Ch. 10' },
  { key: 'chapter_11', book: 2, label: 'Ch. 11' },
  { key: 'chapter_12', book: 2, label: 'Ch. 12' },
  { key: 'chapter_13', book: 2, label: 'Ch. 13' },
  { key: 'chapter_14', book: 2, label: 'Ch. 14' },
  { key: 'chapter_15', book: 2, label: 'Ch. 15' },
  { key: 'chapter_1', book: 3, label: 'Ch. 1' },
  { key: 'chapter_2', book: 3, label: 'Ch. 2' },
  { key: 'chapter_3', book: 3, label: 'Ch. 3' },
  { key: 'chapter_4', book: 3, label: 'Ch. 4' },
];

function getAllChapters() {
  const chapters = [];
  for (const bookKey of ['book_2_vocabulary', 'book_3_vocabulary']) {
    const book = vocabData[bookKey];
    for (const [key, data] of Object.entries(book)) {
      const order = CHAPTER_ORDER.find(c => c.key === key);
      chapters.push({
        key,
        book: order?.book || (bookKey === 'book_2_vocabulary' ? 2 : 3),
        label: order?.label || key.replace('chapter_', 'Ch. '),
        title: data.title,
        vocabulary: data.vocabulary,
      });
    }
  }
  return chapters.sort((a, b) => {
    if (a.book !== b.book) return a.book - b.book;
    return CHAPTER_ORDER.findIndex(c => c.key === a.key) - CHAPTER_ORDER.findIndex(c => c.key === b.key);
  });
}

function getAllTerms() {
  const chapters = getAllChapters();
  return chapters.flatMap(ch => ch.vocabulary.map(v => ({ ...v, chapterKey: ch.key, chapterTitle: ch.title })));
}

function shuffle(array) {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function getMastery() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function saveMastery(mastery) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(mastery));
  } catch {
    console.warn('Failed to save mastery to localStorage');
  }
}

function getTermMastery(term) {
  const mastery = getMastery();
  return mastery[term] || { mastery: 0, attempts: 0, lastCorrect: null, lastWrong: null };
}

function updateTermMastery(term, correct) {
  const mastery = getMastery();
  const existing = mastery[term] || { mastery: 0, attempts: 0, lastCorrect: null, lastWrong: null };
  if (correct) {
    existing.mastery = Math.min(100, existing.mastery + 20);
    existing.lastCorrect = new Date().toISOString();
  } else {
    existing.mastery = Math.max(0, existing.mastery - 15);
    existing.lastWrong = new Date().toISOString();
  }
  existing.attempts++;
  mastery[term] = existing;
  saveMastery(mastery);
  return mastery[term];
}

function resetMastery() {
  localStorage.removeItem(STORAGE_KEY);
}

function weightedSelect(pool, count) {
  const mastery = getMastery();
  const weighted = pool.map(term => {
    const m = mastery[term.term]?.mastery || 0;
    return { term, weight: 100 - m + 1 };
  });
  const totalWeight = weighted.reduce((sum, w) => sum + w.weight, 0);
  const selected = [];
  const available = [...weighted];
  for (let i = 0; i < Math.min(count, available.length); i++) {
    const currentTotal = available.reduce((sum, w) => sum + w.weight, 0);
    let rand = Math.random() * currentTotal;
    for (let j = 0; j < available.length; j++) {
      rand -= available[j].weight;
      if (rand <= 0) {
        selected.push(available[j].term);
        available.splice(j, 1);
        break;
      }
    }
  }
  return selected;
}

function generateMCQ(term, chapterPool) {
  const distractors = shuffle(chapterPool.filter(d => d.term !== term.term)).slice(0, 3);
  const options = shuffle([
    { text: term.term, correct: true },
    ...distractors.map(d => ({ text: d.term, correct: false })),
  ]);
  return { definition: term.definition, options, chapterKey: term.chapterKey, chapterTitle: term.chapterTitle };
}

function generateQuiz(chapterKeys, mode, sessionIndex = 0) {
  const chapters = getAllChapters();
  let pool;
  if (mode === 'all') {
    pool = getAllTerms();
  } else {
    pool = chapters
      .filter(ch => chapterKeys.includes(ch.key))
      .flatMap(ch => ch.vocabulary.map(v => ({ ...v, chapterKey: ch.key, chapterTitle: ch.title })));
  }

  if (mode === 'all') {
    const start = sessionIndex * 20;
    const allShuffled = shuffle(pool);
    const session = allShuffled.slice(start, start + 20);
    const questions = session.map(term => {
      const chapter = chapters.find(c => c.key === term.chapterKey);
      const chapterPool = chapter.vocabulary.map(v => ({ ...v, chapterKey: chapter.key, chapterTitle: chapter.title }));
      return generateMCQ(term, chapterPool);
    });
    return { questions, totalTerms: pool.length, sessionIndex, isLastSession: start + 20 >= pool.length };
  }

  const selected = weightedSelect(pool, pool.length);
  const questions = selected.map(term => {
    const chapter = chapters.find(c => c.key === term.chapterKey);
    const chapterPool = chapter.vocabulary.map(v => ({ ...v, chapterKey: chapter.key, chapterTitle: chapter.title }));
    return generateMCQ(term, chapterPool);
  });
  return { questions, totalTerms: selected.length, sessionIndex: 0, isLastSession: true };
}

function getChapterMasteryStats(chapterKey) {
  const chapters = getAllChapters();
  const chapter = chapters.find(c => c.key === chapterKey);
  if (!chapter) return { mastered: 0, learning: 0, new: 0, total: 0, avgMastery: 0 };
  const mastery = getMastery();
  let mastered = 0, learning = 0, newCount = 0;
  let totalMastery = 0;
  for (const v of chapter.vocabulary) {
    const m = mastery[v.term]?.mastery || 0;
    totalMastery += m;
    if (m >= 80) mastered++;
    else if (m > 0) learning++;
    else newCount++;
  }
  return {
    mastered,
    learning,
    new: newCount,
    total: chapter.vocabulary.length,
    avgMastery: Math.round(totalMastery / chapter.vocabulary.length),
  };
}

function getOverallStats() {
  const allTerms = getAllTerms();
  const mastery = getMastery();
  let mastered = 0, learning = 0, newCount = 0, totalMastery = 0;
  for (const term of allTerms) {
    const m = mastery[term.term]?.mastery || 0;
    totalMastery += m;
    if (m >= 80) mastered++;
    else if (m > 0) learning++;
    else newCount++;
  }
  return {
    mastered,
    learning,
    new: newCount,
    total: allTerms.length,
    avgMastery: Math.round(totalMastery / allTerms.length),
  };
}

export {
  getAllChapters,
  getAllTerms,
  generateQuiz,
  getMastery,
  getTermMastery,
  updateTermMastery,
  resetMastery,
  getChapterMasteryStats,
  getOverallStats,
  CHAPTER_ORDER,
};
