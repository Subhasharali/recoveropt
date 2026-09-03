export function Card({ title, children, className = "" }) {
  return (
    <div className={`bg-white rounded-lg border border-gray-200 shadow-sm p-5 ${className}`}>
      {title && <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">{title}</h3>}
      {children}
    </div>
  );
}
