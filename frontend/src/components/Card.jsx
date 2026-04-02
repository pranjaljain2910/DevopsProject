/**
 * Card — generic wrapper component (kept for backward compat)
 * Most stat cards now use StatCard.jsx instead.
 */

export default function Card({ children, className = '' }) {
  return (
    <div className={`card ${className}`}>
      {children}
    </div>
  );
}
