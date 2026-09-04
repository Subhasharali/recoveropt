export function Table({ headers, children }) {
  return (
    <div className="overflow-x-auto w-full">
      <table className="min-w-full divide-y divide-slate-700/60">
        <thead className="bg-slate-800 sticky top-0 z-10 border-b border-slate-700">
          <tr>
            {headers.map((header, index) => (
              <th
                key={index}
                scope="col"
                className="px-5 py-3 text-left text-[11px] font-bold text-slate-400 uppercase tracking-wider whitespace-nowrap"
              >
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-slate-800 divide-y divide-slate-700/40 [&_tr:hover]:bg-slate-700/30 transition-colors">
          {children}
        </tbody>
      </table>
    </div>
  );
}
