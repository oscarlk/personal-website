export default function SmokeHint({ onClick }) {
  return (
    <div className="smoke-hint" onClick={onClick} title="Scroll down">
      {[...Array(7)].map((_, i) => (
        <span key={i} className="smoke-puff" style={{ '--i': i }} />
      ))}
      <span className="smoke-label">scroll</span>
    </div>
  );
}
