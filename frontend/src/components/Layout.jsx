import { Sidebar } from './Sidebar';

export function Layout({ activeTab, setActiveTab, children }) {
  return (
    <div className="min-h-screen bg-slate-900 flex text-slate-50 selection:bg-blue-900 selection:text-blue-50 font-sans">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      <main className="flex-1 ml-64 p-8 lg:p-10 overflow-x-hidden relative">
        <div className="absolute inset-0 bg-slate-900 pointer-events-none -z-10"></div>
        <div className="max-w-6xl mx-auto animate-fade-in-up">
          {children}
        </div>
      </main>
    </div>
  );
}
