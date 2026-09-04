export function Badge({ children, color = 'gray' }) {
  const colors = {
    gray: 'bg-slate-700/40 text-slate-300 border-slate-600/40',
    blue: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    green: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    yellow: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    red: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
  };
  
  const colorClass = colors[color] || colors.gray;
  
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold border ${colorClass} tracking-wide uppercase`}>
      {children}
    </span>
  );
}
