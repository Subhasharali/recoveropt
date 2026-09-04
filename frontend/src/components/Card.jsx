export function Card({ title, children, className = '' }) {
  return (
    <div className={`bg-slate-800 rounded-lg border border-slate-700/60 transition-colors duration-300 overflow-hidden ${className}`}>
      {title && (
        <div className="px-5 py-3.5 border-b border-slate-700/60 bg-slate-800/80">
          <h3 className="text-sm font-semibold text-slate-200 tracking-tight">{title}</h3>
        </div>
      )}
      <div className="p-5">{children}</div>
    </div>
  );
}
