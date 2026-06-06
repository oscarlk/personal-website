import { useState } from 'react';
import TennisGame from '../components/TennisGame';
import ScoreBoard from '../components/ScoreBoard';
import ThemeSwitcher, { THEMES } from '../components/ThemeSwitcher';

const isMobile = window.matchMedia('(pointer: coarse)').matches;

export default function Home() {
  const [scores, setScores] = useState({ you: 0, cpu: 0 });
  const [themeId, setThemeId] = useState('rolandGarros');

  return (
    <main className="home">
      <h1 className="hero-name">Oscar Khowong</h1>
      <p className="hero-sub">welcome to my corner of the internet</p>

      <ScoreBoard scoreYou={scores.you} scoreCpu={scores.cpu} />

      <div className="court-wrapper">
        <TennisGame onScoreChange={setScores} theme={THEMES[themeId]} />
      </div>

      <p className="controls">
        {isMobile
          ? 'flick to aim · tap to pause · first to 7 wins'
          : '↑ ↓ or W S to move · space to pause · first to 7 wins'}
      </p>

      <ThemeSwitcher current={themeId} onChange={setThemeId} />
    </main>
  );
}
