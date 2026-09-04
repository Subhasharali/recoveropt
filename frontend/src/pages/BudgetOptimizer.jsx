import { useState } from 'react';
import { optimizeBudget } from '../services/api';
import { Card } from '../components/Card';
import { Table } from '../components/Table';
import { Badge } from '../components/Badge';
import { formatCurrency } from '../utils/formatting';

export function BudgetOptimizer() {
  const [budget, setBudget] = useState(100);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleOptimize = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const data = await optimizeBudget(budget);
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
        <h2 className="text-2xl font-bold text-slate-50 tracking-tight">Budget Optimizer</h2>
        <p className="text-slate-400 mt-1 text-sm">Allocate limited recovery budget to maximize expected net benefit.</p>
      </div>

      <Card className="bg-slate-800 border-slate-700/60 shadow-none">
        <form onSubmit={handleOptimize} className="flex flex-col sm:flex-row items-start sm:items-end gap-4">
          <div className="w-full sm:flex-1 max-w-xs">
            <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-2">Recovery Budget (₹)</label>
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
                OPTIMIZING...
              </span>
            ) : 'OPTIMIZE ALLOCATION'}
          </button>
        </form>
        {error && <p className="mt-4 text-sm text-rose-400 bg-rose-500/10 p-3 rounded border border-rose-500/20">{error}</p>}
      </Card>

      {result && (
        <div className="space-y-6 animate-fade-in-up">
          <div className="bg-slate-800 border border-slate-700/60 rounded-lg overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-700/60 bg-slate-800/80 flex items-center justify-between">
              <h3 className="text-[13px] font-bold text-slate-200 tracking-widest uppercase">Allocation Strategy</h3>
              <p className="text-[11px] text-slate-500 uppercase tracking-widest hidden sm:block">Opportunities ranked by expected ROI</p>
            </div>
            
            <div className="p-6 grid grid-cols-2 md:grid-cols-4 gap-6 items-end">
              <div>
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Available Budget</p>
                <p className="text-2xl font-bold text-slate-200 tracking-tight">{formatCurrency(result.available_budget)}</p>
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Allocated Cost</p>
                <p className="text-2xl font-bold text-slate-200 tracking-tight">{formatCurrency(result.estimated_intervention_cost)}</p>
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Expected Recovery</p>
                <p className="text-2xl font-bold text-slate-400 tracking-tight">{formatCurrency(result.estimated_recovery)}</p>
              </div>
              <div className="border-l-4 pl-4 md:border-l-4 md:pl-5 border-emerald-500 py-1">
                <p className="text-[11px] font-bold text-emerald-500 uppercase tracking-widest mb-2">Expected Net Benefit</p>
                <p className="text-4xl font-bold text-emerald-400 tracking-tighter">{formatCurrency(result.expected_net_benefit)}</p>
              </div>
            </div>
          </div>

          <Card title={`Selected Opportunities (${result.selected_opportunity_count})`} className="border-slate-700/60 !p-0">
            {result.selected_opportunities.length > 0 ? (
              <Table headers={['Payment ID', 'Action', 'Cost', 'Expected', 'Net Benefit']}>
                {result.selected_opportunities.map((opp) => (
                  <tr key={opp.payment_id}>
                    <td className="px-5 py-3 whitespace-nowrap text-[12px] font-mono font-medium text-slate-400">{opp.payment_id}</td>
                    <td className="px-5 py-3 whitespace-nowrap">
                      <Badge color="blue">{opp.recommended_action.replace(/_/g, ' ')}</Badge>
                    </td>
                    <td className="px-5 py-3 whitespace-nowrap text-[12px] font-mono text-slate-300">{formatCurrency(opp.intervention_cost)}</td>
                    <td className="px-5 py-3 whitespace-nowrap text-[12px] font-mono text-slate-200">{formatCurrency(opp.estimated_recovery)}</td>
                    <td className="px-5 py-3 whitespace-nowrap text-[13px] font-mono font-bold text-emerald-400">{formatCurrency(opp.expected_net_benefit)}</td>
                  </tr>
                ))}
              </Table>
            ) : (
              <div className="p-8 text-center">
                <p className="text-[12px] font-mono text-slate-500 uppercase tracking-widest">No opportunities selected. Try increasing the budget.</p>
              </div>
            )}
          </Card>
        </div>
      )}
    </div>
  );
}
