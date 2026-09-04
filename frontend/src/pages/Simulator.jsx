import { useState } from 'react';
import { simulatePolicy } from '../services/api';
import { Card } from '../components/Card';
import { formatCurrency, formatPercentage } from '../utils/formatting';

export function Simulator() {
  const [budget, setBudget] = useState(5000);
  const [maxAttempts, setMaxAttempts] = useState(3);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSimulate = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const data = await simulatePolicy(budget, maxAttempts);
      setResult(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="border-b border-slate-700/60 pb-5">
        <h2 className="text-2xl font-bold text-slate-50 tracking-tight">What-If Simulator</h2>
        <p className="text-slate-400 mt-1 text-sm">Compare proposed recovery policies against the current baseline.</p>
      </div>

      <Card className="bg-slate-800 border-slate-700/60 shadow-none">
        <form onSubmit={handleSimulate} className="flex flex-col sm:flex-row items-start sm:items-end gap-4">
          <div className="w-full sm:flex-1 max-w-xs">
            <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-2">Proposed Budget (₹)</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <span className="text-slate-500 sm:text-sm">₹</span>
              </div>
              <input
                type="number"
                min="0"
                step="0.01"
                value={budget}
                onChange={(e) => setBudget(Number(e.target.value))}
                className="block w-full pl-7 pr-3 py-2 bg-slate-900 border border-slate-700 rounded shadow-sm focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm text-slate-100 transition-colors"
                required
              />
            </div>
          </div>
          <div className="w-full sm:flex-1 max-w-xs">
            <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-2">Proposed Max Attempts</label>
            <input
              type="number"
              min="1"
              step="1"
              value={maxAttempts}
              onChange={(e) => setMaxAttempts(Number(e.target.value))}
              className="block w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded shadow-sm focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm text-slate-100 transition-colors"
              required
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full sm:w-auto inline-flex items-center justify-center px-6 py-2 border border-transparent text-[11px] font-bold uppercase tracking-wider rounded bg-blue-600 text-white hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 focus:ring-offset-slate-900 disabled:opacity-50 transition-colors h-[38px]"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin h-3.5 w-3.5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                SIMULATING...
              </span>
            ) : 'RUN SIMULATION'}
          </button>
        </form>
        {error && <p className="mt-4 text-sm text-rose-400 bg-rose-500/10 p-3 rounded border border-rose-500/20">{error}</p>}
      </Card>

      {result && (
        <div className="space-y-6 animate-fade-in-up">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card title="Current Policy" className="border-slate-700/60 bg-slate-800/50 shadow-none">
              <div className="grid grid-cols-2 gap-y-8 gap-x-4">
                <div>
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">Expected Recovered</p>
                  <p className="text-xl font-bold text-slate-300 tracking-tight">{formatCurrency(result.current_expected_recovered_revenue)}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">Recovery Rate</p>
                  <p className="text-xl font-bold text-slate-300 tracking-tight">{formatPercentage(result.current_recovery_rate)}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">Intervention Cost</p>
                  <p className="text-xl font-bold text-slate-300 tracking-tight font-mono">{formatCurrency(result.current_intervention_cost)}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">Eligible Opportunities</p>
                  <p className="text-xl font-bold text-slate-300">{result.current_eligible_opportunities}</p>
                </div>
              </div>
            </Card>
            <Card title="Proposed Policy" className="border-blue-900/50 bg-blue-900/10 shadow-none">
              <div className="grid grid-cols-2 gap-y-8 gap-x-4">
                <div>
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">Expected Recovered</p>
                  <p className="text-xl font-bold text-blue-400 tracking-tight">{formatCurrency(result.proposed_expected_recovered_revenue)}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">Recovery Rate</p>
                  <p className="text-xl font-bold text-blue-400 tracking-tight">{formatPercentage(result.projected_recovery_rate)}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">Intervention Cost</p>
                  <p className="text-xl font-bold text-blue-400 tracking-tight font-mono">{formatCurrency(result.proposed_intervention_cost)}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">Eligible Opportunities</p>
                  <p className="text-xl font-bold text-blue-400">{result.proposed_eligible_opportunities}</p>
                </div>
              </div>
            </Card>
          </div>

          <div className="bg-slate-800 border border-slate-700/60 rounded-lg overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-700/60 bg-slate-800/80">
              <h3 className="text-[13px] font-bold text-slate-200 tracking-widest uppercase">Simulation Results</h3>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div>
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Incremental Recovery</p>
                  <p className={`text-2xl font-bold tracking-tight font-mono ${result.incremental_expected_recovery > 0 ? 'text-emerald-400' : result.incremental_expected_recovery < 0 ? 'text-rose-400' : 'text-slate-300'}`}>
                    {result.incremental_expected_recovery > 0 ? '+' : ''}{formatCurrency(result.incremental_expected_recovery)}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Incremental Cost</p>
                  <p className="text-2xl font-bold tracking-tight text-slate-300 font-mono">
                    {result.incremental_cost > 0 ? '+' : ''}{formatCurrency(result.incremental_cost)}
                  </p>
                </div>
                <div className="pl-4 border-l-2 border-slate-700/60">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Projected Net Benefit</p>
                  <p className={`text-4xl font-bold tracking-tighter font-mono ${result.projected_net_benefit > 0 ? 'text-emerald-400' : result.projected_net_benefit < 0 ? 'text-rose-400' : 'text-slate-100'}`}>
                    {result.projected_net_benefit > 0 ? '+' : ''}{formatCurrency(result.projected_net_benefit)}
                  </p>
                </div>
              </div>
              
              <div className={`p-4 rounded border ${result.recommendation.startsWith('Beneficial') ? 'bg-emerald-500/10 border-emerald-500/30' : 'bg-amber-500/10 border-amber-500/30'}`}>
                <div className="flex items-start gap-3">
                  <div className={`mt-0.5 w-2 h-2 rounded-full ${result.recommendation.startsWith('Beneficial') ? 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.5)]' : 'bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.5)]'}`}></div>
                  <div>
                    <p className={`text-[12px] font-bold uppercase tracking-widest mb-1 ${result.recommendation.startsWith('Beneficial') ? 'text-emerald-400' : 'text-amber-400'}`}>
                      {result.recommendation.startsWith('Beneficial') ? 'RECOMMENDED' : 'NOT RECOMMENDED'}
                    </p>
                    <p className={`text-sm font-medium ${result.recommendation.startsWith('Beneficial') ? 'text-emerald-200/70' : 'text-amber-200/70'}`}>
                      {result.recommendation}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
