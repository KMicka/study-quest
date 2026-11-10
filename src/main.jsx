import React, { useState } from 'react';
import { createRoot } from 'react-dom/client';
import './style.css';

const TOTAL = 10;
const pick = (items) => items[Math.floor(Math.random() * items.length)];
const shuffle = (items) => [...items].sort(() => Math.random() - 0.5);

const reading = [
  { passage: 'Maya packed an umbrella because dark clouds covered the sky. On her walk home, rain began to fall.', statement: 'Maya expected it might rain.', answer: 'Yes' },
  { passage: 'Leo planted a seed in a sunny spot and watered it every morning. After two weeks, a small green sprout appeared.', statement: 'Leo forgot to water the seed.', answer: 'No' },
  { passage: 'The library closes at 6 p.m. Nina arrived at 5 p.m. and borrowed a book before leaving.', statement: 'Nina arrived while the library was open.', answer: 'Yes' },
  { passage: 'Omar rode his bike to the park. His sister walked there and arrived ten minutes after him.', statement: 'Omar’s sister reached the park first.', answer: 'No' },
  { passage: 'Ava put her lunch in the fridge in the morning. At noon, she took it out and ate with her friends.', statement: 'Ava ate lunch at noon.', answer: 'Yes' },
  { passage: 'The red team scored three goals. The blue team scored five goals, so the blue team won.', statement: 'The red team scored more goals.', answer: 'No' },
];

const wordSets = [
  { sentence: 'The sun is very ____ today.', answer: 'bright', choices: ['bright', 'quiet', 'slow'] },
  { sentence: 'We use a ____ to measure time.', answer: 'clock', choices: ['clock', 'spoon', 'cloud'] },
  { sentence: 'A plant needs water and ____ to grow.', answer: 'sunlight', choices: ['sunlight', 'sandwiches', 'shoes'] },
  { sentence: 'Please ____ the door when you leave.', answer: 'close', choices: ['close', 'drink', 'draw'] },
  { sentence: 'The opposite of hot is ____.', answer: 'cold', choices: ['cold', 'round', 'loud'] },
  { sentence: 'A triangle has ____ sides.', answer: 'three', choices: ['three', 'five', 'seven'] },
];

function makeQuestion(type) {
  if (type === 'math') {
    const operation = pick(['+', '−', '×']);
    let a = Math.ceil(Math.random() * (operation === '×' ? 9 : 18));
    let b = Math.ceil(Math.random() * (operation === '×' ? 9 : 12));
    if (operation === '−' && b > a) [a, b] = [b, a];
    const answer = operation === '+' ? a + b : operation === '−' ? a - b : a * b;
    const options = new Set([answer]);
    while (options.size < 4) {
      const candidate = answer + pick([-5, -4, -3, -2, -1, 1, 2, 3, 4, 5]);
      if (candidate >= 0) options.add(candidate);
    }
    return { type, eyebrow: 'NUMBER LAB', prompt: `${a} ${operation} ${b} = ?`, choices: shuffle([...options]), answer };
  }
  if (type === 'reading') {
    const item = pick(reading);
    return { type, eyebrow: 'STORY CORNER', prompt: item.statement, passage: item.passage, choices: ['Yes', 'No'], answer: item.answer };
  }
  const item = pick(wordSets);
  return { type, eyebrow: 'WORD WORKSHOP', prompt: item.sentence, choices: shuffle(item.choices), answer: item.answer };
}

const types = ['math', 'reading', 'words'];
const labels = { math: 'Math', reading: 'Reading', words: 'Words' };
const icons = { math: '✦', reading: '◈', words: '✿' };

function App() {
  const [screen, setScreen] = useState('home');
  const [mode, setMode] = useState('mix');
  const [question, setQuestion] = useState(null);
  const [round, setRound] = useState(1);
  const [hearts, setHearts] = useState(3);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [selected, setSelected] = useState(null);
  const [history, setHistory] = useState([]);

  function start(nextMode) {
    setMode(nextMode);
    setRound(1);
    setHearts(3);
    setScore(0);
    setStreak(0);
    setSelected(null);
    setHistory([]);
    setQuestion(makeQuestion(nextMode === 'mix' ? pick(types) : nextMode));
    setScreen('game');
  }

  function answer(choice) {
    if (selected !== null) return;
    const correct = choice === question.answer;
    setSelected(choice);
    setHistory((old) => [...old, { type: question.type, correct }]);
    if (correct) {
      setScore((old) => old + 10 + Math.min(streak, 4) * 2);
      setStreak((old) => old + 1);
    } else {
      setHearts((old) => old - 1);
      setStreak(0);
    }
  }

  function next() {
    if (round === TOTAL || hearts === 0) {
      setScreen('result');
      return;
    }
    setRound((old) => old + 1);
    setQuestion(makeQuestion(mode === 'mix' ? pick(types) : mode));
    setSelected(null);
  }

  const correctCount = history.filter((item) => item.correct).length;
  return (
    <div className="app-shell">
      <header className="topbar">
        <button className="brand" onClick={() => setScreen('home')} aria-label="Study Quest home"><span className="brand-icon">✦</span> STUDY<span>QUEST</span></button>
        <span className="top-note">A little learning adventure</span>
      </header>

      {screen === 'home' && <main className="home">
        <div className="hero-copy">
          <span className="tag">LEARN • PLAY • LEVEL UP</span>
          <h1>Every answer<br />is an <em>adventure.</em></h1>
          <p>Explore bite-sized challenges in math, reading, and words. Collect points, build a streak, and see how far you can go!</p>
          <button className="primary" onClick={() => start('mix')}>Start a quest <span>↗</span></button>
          <div className="hero-meta"><span>✦ 10 quick questions</span><span>♡ 3 hearts</span><span>◉ Instant feedback</span></div>
        </div>
        <div className="hero-art" aria-hidden="true"><div className="orbit orbit-one"/><div className="orbit orbit-two"/><div className="planet"><span>✦</span></div><div className="float-card card-a">8 + 5 = ?</div><div className="float-card card-b">A B C</div><div className="star star-a">✧</div><div className="star star-b">✦</div><div className="star star-c">✧</div></div>
        <section className="choose-section">
          <div><span className="section-kicker">PICK YOUR PATH</span><h2>Choose a challenge</h2></div>
          <div className="mode-grid">
            <button className="mode-card math" onClick={() => start('math')}><span className="mode-icon">✦</span><strong>Math Lab</strong><small>Quick numbers, clever thinking</small><span className="card-arrow">↗</span></button>
            <button className="mode-card reading" onClick={() => start('reading')}><span className="mode-icon">◈</span><strong>Story Corner</strong><small>Read closely, choose yes or no</small><span className="card-arrow">↗</span></button>
            <button className="mode-card words" onClick={() => start('words')}><span className="mode-icon">✿</span><strong>Word Workshop</strong><small>Find the word that fits</small><span className="card-arrow">↗</span></button>
          </div>
        </section>
      </main>}

      {screen === 'game' && question && <main className="game-wrap">
        <div className="game-top"><button className="text-button" onClick={() => setScreen('home')}>← Exit quest</button><span>{mode === 'mix' ? 'Mixed Quest' : labels[mode] + ' Quest'}</span></div>
        <div className="stats"><div><small>QUESTION</small><strong>{round}<span> / {TOTAL}</span></strong></div><div><small>POINTS</small><strong>{score}</strong></div><div><small>STREAK</small><strong>⚡ {streak}</strong></div><div><small>HEARTS</small><strong className="hearts">{'♥'.repeat(hearts)}<span>{'♡'.repeat(3 - hearts)}</span></strong></div></div>
        <div className="progress" aria-label={`Question ${round} of ${TOTAL}`}><div style={{ width: `${(round / TOTAL) * 100}%` }} /></div>
        <section className="question-card"><div className={`question-icon ${question.type}`}>{icons[question.type]}</div><span className="section-kicker">{question.eyebrow}</span><h1>{question.type === 'words' ? <>Choose the missing word</> : question.type === 'reading' ? 'Read & decide' : 'Solve the problem'}</h1>{question.passage && <p className="passage">{question.passage}</p>}<div className="prompt">{question.prompt}</div><div className={`choices ${question.choices.length === 2 ? 'two' : ''}`}>{question.choices.map((choice) => <button key={choice} disabled={selected !== null} className={`choice ${selected !== null && choice === question.answer ? 'correct' : ''} ${selected === choice && choice !== question.answer ? 'incorrect' : ''}`} onClick={() => answer(choice)}>{choice}{selected !== null && choice === question.answer && <span>✓</span>}{selected === choice && choice !== question.answer && <span>×</span>}</button>)}</div>{selected !== null && <div className={`feedback ${selected === question.answer ? 'good' : 'bad'}`}><div><strong>{selected === question.answer ? 'Brilliant work!' : 'Keep going!'}</strong><p>{selected === question.answer ? 'You earned points for that answer.' : `The right answer is ${question.answer}.`}</p></div><button onClick={next}>{round === TOTAL || hearts === 0 ? 'See results' : 'Next question'} →</button></div>}</section>
      </main>}

      {screen === 'result' && <main className="result-wrap"><div className="result-glow">✦</div><span className="tag">QUEST COMPLETE</span><h1>{correctCount >= 8 ? 'Amazing work!' : correctCount >= 5 ? 'Nice progress!' : 'Every step counts!'}</h1><p>You answered {correctCount} out of {history.length} questions correctly. Ready to go again?</p><div className="result-stats"><div><small>FINAL SCORE</small><strong>{score}</strong></div><div><small>CORRECT</small><strong>{correctCount}/{history.length}</strong></div><div><small>RANK</small><strong>{correctCount >= 8 ? 'Star Scholar' : correctCount >= 5 ? 'Explorer' : 'Rising Learner'}</strong></div></div><div className="result-actions"><button className="primary" onClick={() => start(mode)}>Play again ↗</button><button className="secondary" onClick={() => setScreen('home')}>Choose another path</button></div></main>}
      <footer>Made for curious minds ✦</footer>
    </div>
  );
}

createRoot(document.getElementById('root')).render(<App />);
