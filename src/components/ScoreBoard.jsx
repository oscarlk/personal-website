export default function ScoreBoard({ scoreYou, scoreCpu }) {
  return (
    <div className="score-row">
      <span className="score-you">YOU&nbsp;&nbsp;{scoreYou}</span>
      <span className="tiebreak-label">TIEBREAK · FIRST TO 7</span>
      <span className="score-cpu">{scoreCpu}&nbsp;&nbsp;CPU</span>
    </div>
  );
}
