export function Sidebar({ activeTab, setActiveTab }) {
  const navItems = [
    { id: 'overview', label: 'Overview' },
    { id: 'opportunities', label: 'Recovery Opportunities' },
    { id: 'optimizer', label: 'Budget Optimizer' },
    { id: 'simulator', label: 'What-If Simulator' }
  ];

  return (
    <div className="w-64 bg-slate-900 border-r border-slate-800/80 min-h-screen flex flex-col fixed left-0 top-0 z-10">
      <div className="p-6">
        <h1 className="text-xl font-bold tracking-tight text-slate-50">RecoverOpt</h1>
        <p className="text-[10px] text-slate-400 font-bold tracking-widest uppercase mt-1">Revenue Recovery</p>
      </div>
      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`w-full text-left px-3 py-2 rounded-md text-[13px] font-medium transition-all duration-200 border-l-2 ${
              activeTab === item.id
                ? 'bg-blue-500/10 text-blue-400 border-blue-500 shadow-sm'
                : 'text-slate-400 border-transparent hover:bg-slate-800/50 hover:text-slate-200'
            }`}
          >
            {item.label}
          </button>
        ))}
      </nav>
      <div className="p-4 m-4 rounded-lg bg-slate-800/50 border border-slate-700/50 flex flex-col gap-1.5 shadow-sm">
        <div className="flex items-center gap-2">
          <div className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </div>
          <span className="text-[10px] font-bold tracking-wider text-slate-300 uppercase">Test Mode</span>
        </div>
        <span className="text-[11px] text-slate-500 leading-tight font-medium">Razorpay connected</span>
      </div>
    </div>
  );
}
