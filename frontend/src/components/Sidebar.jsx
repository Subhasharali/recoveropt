export function Sidebar({ activeTab, setActiveTab }) {
  const navItems = [
    { id: 'overview', label: 'Overview' },
    { id: 'opportunities', label: 'Recovery Opportunities' },
    { id: 'optimizer', label: 'Budget Optimizer' },
    { id: 'simulator', label: 'What-If Simulator' }
  ];

  return (
    <div className="w-64 bg-white border-r border-gray-200 min-h-screen flex flex-col fixed left-0 top-0">
      <div className="p-6 border-b border-gray-200">
        <h1 className="text-xl font-bold text-gray-900">RecoverOpt</h1>
        <p className="text-sm text-gray-500 font-medium">Revenue Recovery</p>
      </div>
      <nav className="flex-1 px-4 py-6 space-y-1">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`w-full text-left px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === item.id
                ? 'bg-blue-50 text-blue-700'
                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
            }`}
          >
            {item.label}
          </button>
        ))}
      </nav>
    </div>
  );
}
