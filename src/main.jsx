import React, { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import './style.css';

const TOTAL = 10; // Each quest has at most ten challenges.
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

// Build a fresh challenge whenever the player moves to the next step.
function makeQuestion(type) {
  if (type === 'math') {
    const operation = pick(['+', '−', '×']);
    let a = Math.ceil(Math.random() * (operation === '×' ? 9 : 18));
    let b = Math.ceil(Math.random() * (operation === '×' ? 9 : 12));
    if (operation === '−' && b > a) [a, b] = [b, a];
    const answer = operation === '+' ? a + b : operation === '−' ? a - b : a * b; // Keep the correct result for checking typed input.
    const options = new Set([answer]);
    while (options.size < 4) {
      const candidate = answer + pick([-5, -4, -3, -2, -1, 1, 2, 3, 4, 5]);
      if (candidate >= 0) options.add(candidate);
    }
    return { type, eyebrow: 'NUMBER LAB', prompt: `${a} ${operation} ${b} = ?`, choices: shuffle([...options]), answer, hint: operation === '×' ? `Think of ${a} groups of ${b}.` : operation === '−' ? `Start at ${a} and count back ${b}.` : `Start at ${a} and count forward ${b}.` };
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
const starterHero = { name: 'Nova', color: 'violet', xp: 0, attempts: 0, wins: 0, skills: { math: 0, reading: 0, words: 0 } };
const PROFILE_KEY = 'studyQuestProfiles';
function loadProfiles() {
  try {
    const saved = JSON.parse(localStorage.getItem(PROFILE_KEY));
    if (saved?.profiles?.length) return saved;
  } catch { /* Start with a fresh profile if saved data is invalid. */ }
  let hero = starterHero;
  try {
    const previous = JSON.parse(localStorage.getItem('studyQuestCompanion'));
    if (previous) hero = { ...starterHero, ...previous, skills: { ...starterHero.skills, ...previous.skills } };
  } catch { /* No previous player to import. */ }
  return { activeId: 'first-player', profiles: [{ id: 'first-player', playerName: 'Player 1', hero }] };
}

// The hero's level and appearance grow from XP earned across quests.
function Hero({ hero, compact = false }) {
  const level = Math.floor(hero.xp / 50) + 1;
  return <div className={`hero-profile ${compact ? 'compact' : ''}`}>
    <div className={`hero-creature ${hero.color} ${level >= 3 ? 'evolved' : ''}`} aria-label={`${hero.name}, level ${level}`}>
      {level >= 3 && <span className="hero-crown">✦</span>}
      <span className="hero-ear left"/><span className="hero-ear right"/>
      <span className="hero-eye left"/><span className="hero-eye right"/>
      <span className="hero-mouth">ᴗ</span>
    </div>
    <div className="hero-info"><small>YOUR QUEST COMPANION</small><strong>{hero.name} <span>Lv. {level}</span></strong><div className="xp-track"><span style={{ width: `${(hero.xp % 50) * 2}%` }}/></div><p>{hero.xp % 50}/50 XP to next level</p></div>
  </div>;
}

function App() {
  // React state stores everything the player can change during a quest.
  const [screen, setScreen] = useState('home');
  const [mode, setMode] = useState('mix');
  const [question, setQuestion] = useState(null);
  const [round, setRound] = useState(1);
  const [hearts, setHearts] = useState(3);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [selected, setSelected] = useState(null);
  const [history, setHistory] = useState([]);
  const [mathInput, setMathInput] = useState('');
  const [wordChoice, setWordChoice] = useState(null);
  const [hintUsed, setHintUsed] = useState(false);
  const [hintsLeft, setHintsLeft] = useState(2);
  const [readingChoice, setReadingChoice] = useState(null);
  const [profileData, setProfileData] = useState(loadProfiles);
  const [newPlayerName, setNewPlayerName] = useState('');
  const activeProfile = profileData.profiles.find((profile) => profile.id === profileData.activeId) || profileData.profiles[0];
  const hero = activeProfile.hero;
  function setHero(update) {
    setProfileData((data) => ({ ...data, profiles: data.profiles.map((profile) => profile.id === data.activeId
      ? { ...profile, hero: typeof update === 'function' ? update(profile.hero) : update }
      : profile) }));
  }
  function addPlayer(event) {
    event.preventDefault();
    const name = newPlayerName.trim();
    if (!name) return;
    const id = crypto.randomUUID();
    setProfileData((data) => ({ activeId: id, profiles: [...data.profiles, { id, playerName: name, hero: { ...starterHero, skills: { ...starterHero.skills } } }] }));
    setNewPlayerName('');
  }
  useEffect(() => { localStorage.setItem(PROFILE_KEY, JSON.stringify(profileData)); }, [profileData]);

  // Reset progress so a new quest starts with full hearts and fresh hints.
  function start(nextMode) {
    setMode(nextMode);
    setRound(1);
    setHearts(3);
    setScore(0);
    setStreak(0);
    setSelected(null);
    setHistory([]);
    setMathInput('');
    setWordChoice(null);
    setHintUsed(false);
    setHintsLeft(2);
    setReadingChoice(null);
    setQuestion(makeQuestion(nextMode === 'mix' ? pick(types) : nextMode));
    setScreen('game');
  }

  // Check an answer once, then update points, streak, hearts, and the map.
  function answer(choice) {
    if (selected !== null) return;
    const correct = String(choice).trim().toLowerCase() === String(question.answer).toLowerCase();
    setSelected(choice);
    setHistory((old) => [...old, { type: question.type, correct }]);
    // Every attempt gives XP; correct answers also strengthen the matching skill.
    setHero((old) => ({ ...old, xp: old.xp + (correct ? 10 : 2), attempts: old.attempts + 1, wins: old.wins + Number(correct), skills: { ...old.skills, [question.type]: old.skills[question.type] + Number(correct) } }));
    if (correct) {
      setScore((old) => old + 10 + Math.min(streak, 4) * 2);
      setStreak((old) => old + 1);
    } else {
      setHearts((old) => old - 1);
      setStreak(0);
    }
  }

  // Continue to another challenge or show the final result.
  function next() {
    if (round === TOTAL || hearts === 0) {
      setScreen('result');
      return;
    }
    setRound((old) => old + 1);
    setQuestion(makeQuestion(mode === 'mix' ? pick(types) : mode));
    setSelected(null);
    setMathInput('');
    setWordChoice(null);
    setHintUsed(false);
    setReadingChoice(null);
  }

  // A player may reveal only two hints per quest.
  function useHint() {
    if (hintUsed || hintsLeft === 0 || selected !== null) return;
    setHintUsed(true);
    setHintsLeft((old) => old - 1);
  }

  const correctCount = history.filter((item) => item.correct).length;
  // Odd challenges use the original multiple-choice style; even ones use hands-on input.
  const handsOn = round % 2 === 0;
  return (
    <div className="app-shell">
      <header className="topbar">
        <button className="brand" onClick={() => setScreen('home')} aria-label="Study Quest home"><span className="brand-icon">✦</span> STUDY<span>QUEST</span></button>
        <span className="top-note">A little learning adventure</span>
      </header>

      {screen === 'home' && <main className="home">
        <section className="player-banner" aria-label="Player and companion">
          <div className="player-banner-main"><span className="section-kicker">WELCOME BACK, {activeProfile.playerName.toUpperCase()}</span><Hero hero={hero}/></div>
          <div className="player-controls"><label htmlFor="player-select">Saved player</label><select id="player-select" value={profileData.activeId} onChange={(event) => setProfileData((data) => ({ ...data, activeId: event.target.value }))}>{profileData.profiles.map((profile) => <option key={profile.id} value={profile.id}>{profile.playerName}</option>)}</select><form onSubmit={addPlayer}><label htmlFor="new-player">New player</label><div><input id="new-player" value={newPlayerName} maxLength="24" onChange={(event) => setNewPlayerName(event.target.value)} placeholder="Enter a name"/><button type="submit">Add player</button></div></form><small>Progress is saved for each player on this browser.</small></div>
        </section>
        <div className="hero-copy">
          <span className="tag">LEARN • PLAY • LEVEL UP</span>
          <h1>Every answer<br />is an <em>adventure.</em></h1>
          <p>Explore bite-sized challenges in math, reading, and words. Collect points, build a streak, and see how far you can go!</p>
          <button className="primary" onClick={() => start('mix')}>Start a quest <span>↗</span></button>
          <div className="hero-meta"><span>✦ 10 challenges</span><span>♡ 3 hearts</span><span>◉ 2 hints</span></div>
        </div>
        <div className="hero-art" aria-hidden="true"><div className="orbit orbit-one"/><div className="orbit orbit-two"/><div className="planet"><span>✦</span></div><div className="float-card card-a">8 + 5 = ?</div><div className="float-card card-b">A B C</div><div className="star star-a">✧</div><div className="star star-b">✦</div><div className="star star-c">✧</div></div>
        <section className="companion-section"><div><span className="section-kicker">YOUR CHARACTER</span><h2>Make your companion yours</h2><p>Play challenges to earn XP and train your companion. Reach level 3 to unlock its star crown.</p></div><div className="hero-customize"><label htmlFor="hero-name">Companion name</label><input id="hero-name" maxLength="16" value={hero.name} onChange={(event) => setHero((old) => ({ ...old, name: event.target.value }))} onBlur={() => { if (!hero.name.trim()) setHero((old) => ({ ...old, name: 'Nova' })); }}/><span>Color</span><div className="color-picks">{['violet', 'mint', 'peach'].map((color) => <button key={color} className={`${color} ${hero.color === color ? 'active' : ''}`} onClick={() => setHero((old) => ({ ...old, color }))} aria-label={`Choose ${color} color`} aria-pressed={hero.color === color}/>)}</div></div><div className="skill-grid">{types.map((type) => <div key={type}><span>{icons[type]} {labels[type]}</span><strong>{hero.skills[type]}</strong></div>)}<div><span>✦ Challenges</span><strong>{hero.attempts}</strong></div></div></section>
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
        <Hero hero={hero} compact/>
        <div className="stats"><div><small>QUESTION</small><strong>{round}<span> / {TOTAL}</span></strong></div><div><small>POINTS</small><strong>{score}</strong></div><div><small>STREAK</small><strong>⚡ {streak}</strong></div><div><small>HEARTS</small><strong className="hearts">{'♥'.repeat(hearts)}<span>{'♡'.repeat(3 - hearts)}</span></strong></div></div>
        <div className="quest-map" aria-label="Quest progress">{Array.from({ length: TOTAL }, (_, i) => <div key={i} className={`map-node ${i < history.length ? history[i].correct ? 'won' : 'lost' : i === round - 1 ? 'current' : ''}`}><span>{i < history.length ? history[i].correct ? '★' : '×' : i + 1}</span></div>)}</div>
        <section className="question-card"><div className="question-head"><div className={`question-icon ${question.type}`}>{icons[question.type]}</div><button className="hint-button" onClick={useHint} disabled={hintUsed || hintsLeft === 0 || selected !== null}>✧ Hint ({hintsLeft})</button></div><span className="section-kicker">{question.eyebrow} · CHALLENGE {round} · {handsOn ? 'HANDS-ON' : 'QUICK PICK'}</span><h1>{question.type === 'words' ? handsOn ? 'Place the missing word' : 'Choose the missing word' : question.type === 'reading' ? 'Read & decide' : 'Solve the problem'}</h1>{question.passage && <p className="passage">{question.passage}</p>}{question.type === 'reading' && <p className="instruction">Is this statement true? Choose Yes or No.</p>}<div className="prompt">{question.type === 'words' && handsOn ? question.prompt.replace('____', wordChoice || '____') : question.prompt}</div>
        {hintUsed && <p className="hint-text">✧ {question.type === 'math' ? question.hint : question.type === 'reading' ? 'Look for details in the story that support or contradict the statement.' : 'One word does not belong: ' + question.choices.find((item) => item !== question.answer) + '.'}</p>}
        {question.type === 'math' && handsOn && <form className="math-answer" onSubmit={(event) => { event.preventDefault(); if (mathInput !== '') answer(mathInput); }}><label htmlFor="math-input">Type your answer</label><div><input id="math-input" type="number" min="0" value={mathInput} onChange={(event) => setMathInput(event.target.value)} disabled={selected !== null} autoFocus placeholder="?" /><button disabled={mathInput === '' || selected !== null}>Check answer →</button></div></form>}
        {/* Reading hands-on lets the player choose first, then check; quick pick checks immediately. */}
        {(!handsOn || question.type === 'reading') && <div className={`choices ${question.choices.length === 2 ? 'two' : ''}`}>{question.choices.map((choice) => <button key={choice} disabled={selected !== null} className={`choice ${selected !== null && choice === question.answer ? 'correct' : ''} ${selected === choice && choice !== question.answer ? 'incorrect' : ''} ${handsOn && question.type === 'reading' && readingChoice === choice ? 'picked' : ''}`} onClick={() => handsOn && question.type === 'reading' ? setReadingChoice(choice) : answer(choice)}>{choice}{selected !== null && choice === question.answer && <span>✓</span>}{selected === choice && choice !== question.answer && <span>×</span>}</button>)}</div>}
        {question.type === 'reading' && handsOn && <button className="check-word reading-check" disabled={!readingChoice || selected !== null} onClick={() => answer(readingChoice)}>Check answer →</button>}
        {question.type === 'words' && handsOn && <><p className="instruction">Tap a word to place it in the sentence.</p><div className="word-bank">{question.choices.map((choice) => <button key={choice} disabled={selected !== null} className={`word-tile ${wordChoice === choice ? 'placed' : ''}`} onClick={() => setWordChoice(choice)}>{choice}</button>)}</div><button className="check-word" disabled={!wordChoice || selected !== null} onClick={() => answer(wordChoice)}>Check word →</button></>}
        {selected !== null && <div className={`feedback ${String(selected).toLowerCase() === String(question.answer).toLowerCase() ? 'good' : 'bad'}`}><div><strong>{String(selected).toLowerCase() === String(question.answer).toLowerCase() ? 'Brilliant work!' : 'Keep going!'}</strong><p>{String(selected).toLowerCase() === String(question.answer).toLowerCase() ? `+${10 + Math.min(streak - 1, 4) * 2} points! Your quest grows stronger.` : `The right answer is ${question.answer}.`}</p></div><button onClick={next}>{round === TOTAL || hearts === 0 ? 'See results' : 'Next challenge'} →</button></div>}</section>
      </main>}

      {screen === 'result' && <main className="result-wrap"><div className="result-glow">✦</div><span className="tag">QUEST COMPLETE</span><h1>{correctCount >= 8 ? 'Amazing work!' : correctCount >= 5 ? 'Nice progress!' : 'Every step counts!'}</h1><p>You answered {correctCount} out of {history.length} questions correctly. {hero.name} earned {correctCount * 10 + (history.length - correctCount) * 2} XP this quest!</p><Hero hero={hero}/><div className="result-stats"><div><small>FINAL SCORE</small><strong>{score}</strong></div><div><small>CORRECT</small><strong>{correctCount}/{history.length}</strong></div><div><small>RANK</small><strong>{correctCount >= 8 ? 'Star Scholar' : correctCount >= 5 ? 'Explorer' : 'Rising Learner'}</strong></div></div><div className="result-actions"><button className="primary" onClick={() => start(mode)}>Play again ↗</button><button className="secondary" onClick={() => setScreen('home')}>Choose another path</button></div></main>}
      <footer>Made for curious minds ✦</footer>
    </div>
  );
}

createRoot(document.getElementById('root')).render(<App />);
