import { useEffect, useRef, useState } from 'react';
import SlimeHint from './SlimeHint';
import AppGrid from './AppGrid';

const NAMES_REST = [
  'James!', 'John!', 'Robert!', 'Michael!', 'William!',
  'David!', 'Richard!', 'Joseph!', 'Thomas!', 'Charles!',
  'Mary!', 'Patricia!', 'Joyanna :)', 'Linda!', 'Barbara!',
  'Elizabeth!', 'Susan!', 'Jessica!', 'Sarah!', 'Karen!',
].sort(() => Math.random() - 0.5);

const NAMES = ['friend!', 'stranger!', 'neighbor!', ...NAMES_REST];

const FULL_TEXT = `I am a full stack engineer at Cisco Systems. Currently [building] AI-powered projects and having a lot of fun doing it.

Drop me a [note] if you want to connect.`;

const NEIGHBORS = {
  a:'sq',b:'vgn',c:'xvd',d:'sfce',e:'rwd',f:'dgr',g:'fht',h:'gjy',
  i:'uo',j:'hkn',k:'jlm',l:'k',m:'nk',n:'bmh',o:'ip',p:'ol',
  q:'wa',r:'et',s:'ade',t:'ry',u:'yi',v:'cb',w:'qe',x:'zc',
  y:'uh',z:'x',
};

function typoChar(ch) {
  const lower = ch.toLowerCase();
  const pool = NEIGHBORS[lower];
  if (!pool) return ch;
  const wrong = pool[Math.floor(Math.random() * pool.length)];
  return ch === ch.toUpperCase() ? wrong.toUpperCase() : wrong;
}

function buildSequence(name) {
  const seq = [];
  // only apply typos to letter characters, not ! or ?
  for (let i = 0; i < name.length; i++) {
    const ch = name[i];
    const isLetter = /[a-zA-Z]/.test(ch);
    const makeTypo = isLetter && Math.random() < 0.18 && i > 0;
    if (makeTypo) {
      seq.push({ op: 'type', ch: typoChar(ch), delay: () => 60 + Math.random() * 80 });
      seq.push({ op: 'pause',                  delay: () => 180 + Math.random() * 120 });
      seq.push({ op: 'back',                   delay: () => 70 + Math.random() * 40 });
    }
    seq.push({ op: 'type', ch, delay: () => 65 + Math.random() * 95 });
  }
  seq.push({ op: 'pause', delay: () => 1600 + Math.random() * 400 });
  for (let i = 0; i < name.length; i++) {
    seq.push({ op: 'back', delay: () => 38 + Math.random() * 28 });
  }
  seq.push({ op: 'pause', delay: () => 160 + Math.random() * 80 });
  return seq;
}

function renderLine(line) {
  // tokenise on [note] and [building]
  const tokens = line.split(/(\[note\]|\[building\])/);
  if (tokens.length === 1) return line;
  return (
    <>
      {tokens.map((tok, i) => {
        if (tok === '[note]')
          return <a key={i} href="mailto:ok.khowong@gmail.com" className="about-note-link">note</a>;
        if (tok === '[building]')
          return <a key={i} href="https://github.com/oscarlk" target="_blank" rel="noreferrer" className="about-building-link">building</a>;
        return tok;
      })}
    </>
  );
}

export default function AboutSection({ id, scrollUp }) {
  const sectionRef    = useRef(null);
  const [typed, setTyped]         = useState('');
  const [started, setStarted]     = useState(false);
  const [typedName, setTypedName] = useState('');

  const nameIdxRef  = useRef(0);
  const seqRef      = useRef(null);
  const seqPosRef   = useRef(0);
  const timerRef    = useRef(null);
  const activeRef   = useRef(false); // guards against strict-mode double-invoke

  // scroll trigger
  useEffect(() => {
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting && !started) setStarted(true); },
      { threshold: 0.3 }
    );
    if (sectionRef.current) obs.observe(sectionRef.current);
    return () => obs.disconnect();
  }, [started]);

  // bio typewriter
  useEffect(() => {
    if (!started || typed.length >= FULL_TEXT.length) return;
    const t = setTimeout(() => setTyped(FULL_TEXT.slice(0, typed.length + 1)), 22);
    return () => clearTimeout(t);
  }, [started, typed]);

  useEffect(() => {
    activeRef.current = true;
    seqRef.current    = buildSequence(NAMES[0]);
    seqPosRef.current = 0;

    function runStep() {
      if (!activeRef.current) return;
      if (!seqRef.current || seqPosRef.current >= seqRef.current.length) {
        nameIdxRef.current = (nameIdxRef.current + 1) % NAMES.length;
        seqRef.current     = buildSequence(NAMES[nameIdxRef.current]);
        seqPosRef.current  = 0;
      }
      const step = seqRef.current[seqPosRef.current++];
      timerRef.current = setTimeout(() => {
        if (!activeRef.current) return;
        if (step.op === 'type') setTypedName(n => n + step.ch);
        if (step.op === 'back') setTypedName(n => n.slice(0, -1));
        runStep();
      }, step.delay());
    }

    runStep();
    return () => {
      activeRef.current = false;
      clearTimeout(timerRef.current);
    };
  }, []);

  const lines = typed.split('\n');

  return (
    <section className="about-section" id={id} ref={sectionRef}>
      <SlimeHint onClick={scrollUp} />
      <AppGrid />
      <div className="about-inner">
        <img src="/oscar.jpg" alt="Oscar Khowong" className="about-photo" />
        <div className="about-text">
          <h2 className="about-greeting">
            Hi <span className="about-name">{typedName}</span><span className="about-name-cursor">|</span>
            <br />I'm Oscar.
          </h2>
          <div className="about-body">
            {lines.map((line, i) => (
              <p key={i} className={line === '' ? 'about-spacer' : ''}>{renderLine(line)}</p>
            ))}
            {started && typed.length < FULL_TEXT.length && (
              <span className="about-cursor">|</span>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
