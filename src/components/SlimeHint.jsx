export default function SlimeHint({ onClick }) {
  return (
    <div className="slime-hint" onClick={onClick} title="Scroll up">
      {[...Array(8)].map((_, i) => (
        <span key={i} className="slime-drip" style={{ '--i': i }} />
      ))}
      <span className="slime-label">↑ back up</span>
    </div>
  );
}
