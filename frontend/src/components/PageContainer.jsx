/**
 * PageContainer — Wraps each page with consistent padding + max-width
 */

export default function PageContainer({ children, className = '' }) {
  return (
    <div className={`animate-fade-in max-w-[1400px] mx-auto space-y-6 ${className}`}>
      {children}
    </div>
  );
}
