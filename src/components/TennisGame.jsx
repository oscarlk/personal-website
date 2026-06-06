import { useEffect, useRef, useState } from 'react';

// ─── Audio ─────────────────────────────────────────────────
let audioCtx = null;

function getAudioCtx() {
  if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  return audioCtx;
}

function playGrunt() {
  try {
    const ctx = getAudioCtx();
    const now = ctx.currentTime;

    // voiced grunt: pitch drops quickly like "hunh"
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const distortion = ctx.createWaveShaper();

    // slight overdrive for a throatier sound
    const curve = new Float32Array(256);
    for (let i = 0; i < 256; i++) {
      const x = (i * 2) / 256 - 1;
      curve[i] = (Math.PI + 200) * x / (Math.PI + 200 * Math.abs(x));
    }
    distortion.curve = curve;

    osc.type = 'sawtooth';
    // pitch sweep: starts mid, drops — classic grunt shape
    const baseFreq = 180 + Math.random() * 60;
    osc.frequency.setValueAtTime(baseFreq, now);
    osc.frequency.exponentialRampToValueAtTime(baseFreq * 0.55, now + 0.18);

    gain.gain.setValueAtTime(0.35, now);
    gain.gain.linearRampToValueAtTime(0.0, now + 0.22);

    osc.connect(distortion);
    distortion.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.22);
  } catch (_) {}
}

const W = 400, H = 200;
const PADDLE_W = 6, PADDLE_H = 28, BALL_SIZE = 5;
const PLAYER_X = 18;
const CPU_X = W - 18 - PADDLE_W;
const WIN_SCORE = 7;

const CLR = {
  ball: '#6ddb3a', ballShadow: '#3a8010',
  you: '#e84040', youDark: '#801010',
  cpu: '#4080e8', cpuDark: '#103080',
};

const DIGITS = {
  '0':['1110','1010','1010','1010','1110'], '1':['0100','1100','0100','0100','1110'],
  '2':['1110','0010','1110','1000','1110'], '3':['1110','0010','0110','0010','1110'],
  '4':['1010','1010','1110','0010','0010'], '5':['1110','1000','1110','0010','1110'],
  '6':['1110','1000','1110','1010','1110'], '7':['1110','0010','0100','0100','0100'],
  '8':['1110','1010','1110','1010','1110'], '9':['1110','1010','1110','0010','1110'],
};

function drawPixelDigit(ctx, digit, x, y, color, scale = 2) {
  const rows = DIGITS[String(digit)] || DIGITS['0'];
  ctx.fillStyle = color;
  rows.forEach((row, ry) => {
    for (let cx = 0; cx < row.length; cx++) {
      if (row[cx] === '1') ctx.fillRect(x + cx * scale, y + ry * scale, scale, scale);
    }
  });
}

function drawCourt(ctx, theme) {
  for (let row = 0; row < H; row += 4) {
    ctx.fillStyle = row % 8 === 0 ? theme.clay : theme.clayDark;
    ctx.fillRect(0, row, W, 4);
  }
  ctx.strokeStyle = theme.lines;
  ctx.lineWidth = 1;
  ctx.strokeRect(10, 10, W - 20, H - 20);

  const SL = 22;
  ctx.beginPath();
  ctx.moveTo(10, SL);     ctx.lineTo(W - 10, SL);
  ctx.moveTo(10, H - SL); ctx.lineTo(W - 10, H - SL);
  ctx.stroke();

  const SVC_DEPTH = 63;
  const leftSvc  = W / 2 - SVC_DEPTH;
  const rightSvc = W / 2 + SVC_DEPTH;
  ctx.beginPath();
  ctx.moveTo(leftSvc,  SL); ctx.lineTo(leftSvc,  H - SL);
  ctx.moveTo(rightSvc, SL); ctx.lineTo(rightSvc, H - SL);
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(leftSvc, H / 2); ctx.lineTo(rightSvc, H / 2);
  ctx.stroke();

  ctx.fillStyle = theme.netPost;
  ctx.fillRect(W / 2 - 1, 2,      2, 10);
  ctx.fillRect(W / 2 - 1, H - 12, 2, 10);

  ctx.fillStyle = theme.net;
  for (let ny = 10; ny < H - 10; ny += 3) ctx.fillRect(W / 2 - 1, ny, 2, 2);
}

function drawPlayer(ctx, px, y, shirt, shirtDark, facingRight, opts = {}) {
  const { stripe, headband } = opts;
  const cx = px + PADDLE_W / 2;
  const SKIN = '#f5c8a0', HAIR = '#1a0f00', SHORT = '#f0f0ee';
  const SHOE = '#1a1a1a', GRIP = '#7a5010', RACKET = '#d0d0d0', STRING = '#ffffff';

  ctx.fillStyle = 'rgba(0,0,0,0.18)';
  ctx.fillRect(cx - 4, y + 25, 9, 3);

  ctx.fillStyle = SHOE;
  ctx.fillRect(cx - 4, y + 23, 4, 2);
  ctx.fillRect(cx + 1, y + 23, 4, 2);

  ctx.fillStyle = SKIN;
  ctx.fillRect(cx - 3, y + 17, 2, 6);
  ctx.fillRect(cx + 1, y + 17, 2, 6);

  ctx.fillStyle = SHORT;
  ctx.fillRect(cx - 3, y + 13, 6, 5);
  ctx.fillStyle = '#cccccc';
  ctx.fillRect(cx - 1, y + 13, 1, 5);

  // shirt — striped or solid
  if (stripe) {
    for (let sy = 0; sy < 8; sy += 2) {
      ctx.fillStyle = sy % 4 === 0 ? shirt : stripe;
      ctx.fillRect(cx - 3, y + 6 + sy, 6, 2);
    }
  } else {
    ctx.fillStyle = shirt;
    ctx.fillRect(cx - 3, y + 6, 6, 8);
  }
  ctx.fillStyle = shirtDark;
  ctx.fillRect(cx + 2, y + 7, 1, 6);
  ctx.fillRect(cx - 3, y + 13, 6, 1);

  ctx.fillStyle = SKIN;
  ctx.fillRect(cx - 1, y + 5, 2, 2);
  ctx.fillRect(cx - 2, y + 1, 5, 4);

  ctx.fillStyle = HAIR;
  ctx.fillRect(cx - 2, y,     5, 2);
  ctx.fillRect(cx - 2, y + 1, 1, 1);
  ctx.fillRect(cx + 2, y + 1, 1, 1);

  // headband
  if (headband) {
    ctx.fillStyle = '#f0f0f0';
    ctx.fillRect(cx - 2, y + 2, 5, 2);
    ctx.fillStyle = '#dddddd';
    ctx.fillRect(cx - 2, y + 2, 5, 1);
  }

  if (facingRight) {
    ctx.fillStyle = shirt;
    ctx.fillRect(cx + 3, y + 6, 2, 4);
    ctx.fillStyle = SKIN;
    ctx.fillRect(cx + 4, y + 9, 2, 3);
    ctx.fillStyle = GRIP;
    ctx.fillRect(cx + 5, y + 11, 1, 3);
    ctx.fillStyle = RACKET;
    ctx.fillRect(cx + 5, y + 4, 3, 7);
    ctx.fillRect(cx + 4, y + 5, 1, 5);
    ctx.fillRect(cx + 8, y + 5, 1, 5);
    ctx.fillStyle = STRING;
    ctx.fillRect(cx + 6, y + 5, 1, 5);
    ctx.fillRect(cx + 5, y + 7, 4, 1);
  } else {
    ctx.fillStyle = shirt;
    ctx.fillRect(cx - 5, y + 6, 2, 4);
    ctx.fillStyle = SKIN;
    ctx.fillRect(cx - 6, y + 9, 2, 3);
    ctx.fillStyle = GRIP;
    ctx.fillRect(cx - 6, y + 11, 1, 3);
    ctx.fillStyle = RACKET;
    ctx.fillRect(cx - 8, y + 4, 3, 7);
    ctx.fillRect(cx - 5, y + 5, 1, 5);
    ctx.fillRect(cx - 9, y + 5, 1, 5);
    ctx.fillStyle = STRING;
    ctx.fillRect(cx - 7, y + 5, 1, 5);
    ctx.fillRect(cx - 8, y + 7, 4, 1);
  }
}

function drawBall(ctx, x, y) {
  const bx = Math.round(x - BALL_SIZE / 2);
  const by = Math.round(y - BALL_SIZE / 2);
  ctx.fillStyle = 'rgba(0,0,0,0.25)';
  ctx.fillRect(bx + 2, by + 2, BALL_SIZE, BALL_SIZE);
  ctx.fillStyle = CLR.ball;
  ctx.fillRect(bx, by, BALL_SIZE, BALL_SIZE);
  ctx.fillStyle = '#a0ff60';
  ctx.fillRect(bx, by, 2, 2);
  ctx.fillStyle = CLR.ballShadow;
  ctx.fillRect(bx + BALL_SIZE - 2, by + BALL_SIZE - 2, 2, 2);
}

function drawWinScreen(ctx, winner, scoreYou, scoreCpu, isMobile) {
  ctx.fillStyle = 'rgba(0,0,0,0.6)';
  ctx.fillRect(0, 0, W, H);
  ctx.fillStyle = winner === 'YOU' ? CLR.you : CLR.cpu;
  ctx.font = 'bold 22px "Courier New"';
  ctx.textAlign = 'center';
  ctx.fillText(winner === 'YOU' ? 'YOU WIN!' : 'CPU WINS', W / 2, H / 2 - 18);
  ctx.fillStyle = '#e8d5b0';
  ctx.font = '11px "Courier New"';
  ctx.fillText(`TIEBREAK: ${scoreYou}-${scoreCpu}`, W / 2, H / 2 + 2);
  ctx.fillStyle = '#f5c842';
  ctx.font = '9px "Courier New"';
  ctx.fillText(isMobile ? 'TAP TO PLAY AGAIN' : 'PRESS SPACE TO PLAY AGAIN', W / 2, H / 2 + 20);
  ctx.textAlign = 'left';
}

export default function TennisGame({ onScoreChange, theme }) {
  const canvasRef = useRef(null);
  const themeRef  = useRef(theme);
  useEffect(() => { themeRef.current = theme; }, [theme]);
  const stateRef  = useRef({
    ball: { x: W / 2, y: H / 2, vx: 1.4, vy: 0.9 },
    you:  { y: H / 2 - PADDLE_H / 2 },
    cpu:  { y: H / 2 - PADDLE_H / 2 },
    scoreYou: 0, scoreCpu: 0,
    gameOver: false, winner: '',
    paused: false,
    keys: {},
    isMobile: false,
    flick: null, // { vx, vy } aimed shot queued by swipe
  });

  const [scores, setScores] = useState({ you: 0, cpu: 0, gameOver: false, winner: '' });

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const s = stateRef.current;
    let rafId;

    s.isMobile = window.matchMedia('(pointer: coarse)').matches;

    function resetBall(dir) {
      s.ball.x = W / 2;
      s.ball.y = H / 2 + (Math.random() - 0.5) * 40;
      const angle = (Math.random() - 0.5) * 0.8;
      s.ball.vx = dir * 1.4;
      s.ball.vy = Math.sin(angle) * 1.5;
      s.you.y = H / 2 - PADDLE_H / 2;
      s.cpu.y = H / 2 - PADDLE_H / 2;
    }

    function updateScores() {
      setScores({ you: s.scoreYou, cpu: s.scoreCpu, gameOver: s.gameOver, winner: s.winner });
      onScoreChange?.({ you: s.scoreYou, cpu: s.scoreCpu });
    }

    function restart() {
      s.scoreYou = 0; s.scoreCpu = 0;
      s.gameOver = false; s.winner = '';
      resetBall(1);
      updateScores();
    }

    function loop() {
      ctx.clearRect(0, 0, W, H);
      drawCourt(ctx, themeRef.current);

      if (!s.gameOver && !s.paused) {
        // move you
        if (s.isMobile) {
          // auto-track: smoothly chase the ball
          const youCenter = s.you.y + PADDLE_H / 2;
          const autoSpd = 2.5;
          if (youCenter < s.ball.y - 2) s.you.y += autoSpd;
          else if (youCenter > s.ball.y + 2) s.you.y -= autoSpd;
        } else {
          const spd = 2.2;
          if (s.keys['ArrowUp']   || s.keys['w'] || s.keys['W']) s.you.y -= spd;
          if (s.keys['ArrowDown'] || s.keys['s'] || s.keys['S']) s.you.y += spd;
        }
        s.you.y = Math.max(10, Math.min(H - 10 - PADDLE_H, s.you.y));

        // move cpu
        const center = s.cpu.y + PADDLE_H / 2;
        const cpuSpd = 0.95;
        if (center < s.ball.y - 3) s.cpu.y += cpuSpd;
        else if (center > s.ball.y + 3) s.cpu.y -= cpuSpd;
        s.cpu.y = Math.max(10, Math.min(H - 10 - PADDLE_H, s.cpu.y));

        // move ball
        s.ball.x += s.ball.vx;
        s.ball.y += s.ball.vy;

        if (s.ball.y - BALL_SIZE / 2 <= 10) { s.ball.y = 10 + BALL_SIZE / 2; s.ball.vy *= -1; }
        if (s.ball.y + BALL_SIZE / 2 >= H - 10) { s.ball.y = H - 10 - BALL_SIZE / 2; s.ball.vy *= -1; }

        const youTop = s.you.y, youBot = s.you.y + PADDLE_H;
        if (s.ball.x - BALL_SIZE / 2 <= PLAYER_X + PADDLE_W &&
            s.ball.x - BALL_SIZE / 2 >= PLAYER_X &&
            s.ball.y >= youTop && s.ball.y <= youBot) {
          s.ball.x = PLAYER_X + PADDLE_W + BALL_SIZE / 2;
          playGrunt();
          if (s.isMobile && s.flick) {
            s.ball.vx = Math.abs(s.flick.vx); // always fires toward CPU
            s.ball.vy = s.flick.vy;
            s.flick = null;
          } else {
            const rel = (s.ball.y - (youTop + PADDLE_H / 2)) / (PADDLE_H / 2);
            s.ball.vx = Math.min(Math.abs(s.ball.vx) * 1.05, 4);
            s.ball.vy = rel * 2.2;
          }
        }

        const cpuTop = s.cpu.y, cpuBot = s.cpu.y + PADDLE_H;
        if (s.ball.x + BALL_SIZE / 2 >= CPU_X &&
            s.ball.x + BALL_SIZE / 2 <= CPU_X + PADDLE_W &&
            s.ball.y >= cpuTop && s.ball.y <= cpuBot) {
          playGrunt();
          s.ball.x = CPU_X - BALL_SIZE / 2;
          const rel = (s.ball.y - (cpuTop + PADDLE_H / 2)) / (PADDLE_H / 2);
          s.ball.vx = Math.max(-Math.abs(s.ball.vx) * 1.05, -4);
          s.ball.vy = rel * 2.2;
        }

        if (s.ball.x < 0) {
          s.scoreCpu++;
          if (s.scoreCpu >= WIN_SCORE) { s.gameOver = true; s.winner = 'CPU'; }
          else resetBall(-1);
          updateScores();
        }
        if (s.ball.x > W) {
          s.scoreYou++;
          if (s.scoreYou >= WIN_SCORE) { s.gameOver = true; s.winner = 'YOU'; }
          else resetBall(1);
          updateScores();
        }
      }

      const t = themeRef.current;
      drawPlayer(ctx, PLAYER_X, s.you.y, t.you.shirt, t.you.shirtDark, true,  t.you);
      drawPlayer(ctx, CPU_X,    s.cpu.y, t.cpu.shirt, t.cpu.shirtDark, false, t.cpu);
      if (!s.gameOver) drawBall(ctx, s.ball.x, s.ball.y);
      drawPixelDigit(ctx, s.scoreYou, 40,      18, CLR.you);
      drawPixelDigit(ctx, s.scoreCpu, W - 50,  18, CLR.cpu);
      if (s.gameOver) drawWinScreen(ctx, s.winner, s.scoreYou, s.scoreCpu, s.isMobile);
      // draw queued flick arrow on mobile
      if (s.isMobile && s.flick && !s.gameOver && !s.paused) {
        const ax = PLAYER_X + PADDLE_W + 10;
        const ay = s.you.y + PADDLE_H / 2;
        const len = 18;
        const norm = Math.sqrt(s.flick.vx ** 2 + s.flick.vy ** 2);
        const ex = ax + (s.flick.vx / norm) * len;
        const ey = ay + (s.flick.vy / norm) * len;
        ctx.strokeStyle = '#f5c842';
        ctx.lineWidth = 2;
        ctx.beginPath(); ctx.moveTo(ax, ay); ctx.lineTo(ex, ey); ctx.stroke();
        // arrowhead
        const angle = Math.atan2(ey - ay, ex - ax);
        ctx.fillStyle = '#f5c842';
        ctx.beginPath();
        ctx.moveTo(ex, ey);
        ctx.lineTo(ex - 5 * Math.cos(angle - 0.5), ey - 5 * Math.sin(angle - 0.5));
        ctx.lineTo(ex - 5 * Math.cos(angle + 0.5), ey - 5 * Math.sin(angle + 0.5));
        ctx.closePath(); ctx.fill();
        ctx.lineWidth = 1;
      }

      if (s.paused && !s.gameOver) {
        ctx.fillStyle = 'rgba(0,0,0,0.5)';
        ctx.fillRect(0, 0, W, H);
        ctx.fillStyle = '#f5c842';
        ctx.font = 'bold 18px "Courier New"';
        ctx.textAlign = 'center';
        ctx.fillText('PAUSED', W / 2, H / 2 - 8);
        ctx.font = '9px "Courier New"';
        ctx.fillStyle = '#a89080';
        ctx.fillText(s.isMobile ? 'TAP COURT TO RESUME' : 'PRESS SPACE TO RESUME', W / 2, H / 2 + 10);
        ctx.textAlign = 'left';
      }

      rafId = requestAnimationFrame(loop);
    }

    function onKeyDown(e) {
      s.keys[e.key] = true;
      if (['ArrowUp', 'ArrowDown'].includes(e.key)) e.preventDefault();
      if (e.key === ' ') {
        e.preventDefault();
        if (s.gameOver) restart();
        else s.paused = !s.paused;
      }
    }
    function onKeyUp(e) { s.keys[e.key] = false; }

    // ── Touch controls (mobile) ──────────────────────────────
    let touchStart = null;

    function onTouchStart(e) {
      e.preventDefault();
      // unlock AudioContext on iOS — must happen inside a user gesture
      const ac = getAudioCtx();
      if (ac.state === 'suspended') ac.resume();
      const t = e.touches[0];
      touchStart = { x: t.clientX, y: t.clientY, time: Date.now() };
    }

    function onTouchEnd(e) {
      e.preventDefault();
      if (!touchStart) return;
      const t = e.changedTouches[0];
      const dx = t.clientX - touchStart.x;
      const dy = t.clientY - touchStart.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      touchStart = null;

      if (dist < 12) {
        // tap → toggle pause / restart
        if (s.gameOver) restart();
        else s.paused = !s.paused;
      } else {
        // flick → queue aimed shot; vx is scaled by how horizontal the swipe is
        const norm = Math.sqrt(dx * dx + dy * dy);
        const BASE = 2.5;
        s.flick = {
          vx: Math.max(1.4, (Math.abs(dx) / norm) * BASE * 1.6),
          vy: (dy / norm) * BASE,
        };
      }
    }

    canvas.addEventListener('touchstart', onTouchStart, { passive: false });
    canvas.addEventListener('touchend',   onTouchEnd,   { passive: false });

    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup',   onKeyUp);
    rafId = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup',   onKeyUp);
      canvas.removeEventListener('touchstart', onTouchStart);
      canvas.removeEventListener('touchend',   onTouchEnd);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      width={W}
      height={H}
      style={{ width: '100%', height: '100%', imageRendering: 'pixelated', display: 'block' }}
    />
  );
}
