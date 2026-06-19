import { useState } from 'react';
import TennisGame from '../components/TennisGame';
import ScoreBoard from '../components/ScoreBoard';
import ThemeSwitcher, { THEMES } from '../components/ThemeSwitcher';
import AboutSection from '../components/AboutSection';
import SmokeHint from '../components/SmokeHint';

const isMobile = window.matchMedia('(pointer: coarse)').matches;

export default function Home() {
  const [scores, setScores] = useState({ you: 0, cpu: 0 });
  const [themeId, setThemeId] = useState('rolandGarros');

  const scrollToAbout = () => document.getElementById('about').scrollIntoView({ behavior: 'smooth' });
  const scrollToTop   = () => window.scrollTo({ top: 0, behavior: 'smooth' });

  return (
    <>
      <section className="home">
        <h1 className="hero-name" onClick={scrollToAbout} title="Learn more about me">Oscar Khowong</h1>

        <ScoreBoard scoreYou={scores.you} scoreCpu={scores.cpu} />

        <div className="court-wrapper">
          <TennisGame onScoreChange={setScores} theme={THEMES[themeId]} muted />
        </div>

        <p className="controls">
          {isMobile
            ? 'flick to aim · tap to pause · first to 7 wins'
            : '↑ ↓ or W S to move · space to pause · first to 7 wins'}
        </p>

        <ThemeSwitcher current={themeId} onChange={setThemeId} />
        <SmokeHint onClick={scrollToAbout} />
      </section>

      <AboutSection id="about" scrollUp={scrollToTop} />
    </>
  );
}
