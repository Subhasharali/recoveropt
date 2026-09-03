import { useState } from 'react';
import { simulatePolicy } from '../services/api';
import { Card } from '../components/Card';
import { Badge } from '../components/Badge';

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
    <div className="space-y-6">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900">What-If Simulator</h2>
        <p className="text-gray-500">Compare proposed recovery policies against your current baseline.</p>
      </div>

      <Card>
        <form onSubmit={handleSimulate} className="flex items-end gap-4">
          <div className="flex-1 max-w-xs">
            <label className="block text-sm font-medium text-gray-700 mb-1">Proposed Budget (₹)</label>
            <input
              type="number"
              min="0"
              step="0.01"
              value={budget}
              onChange={(e) => setBudget(Number(e.target.value))}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border"
              required
            />
          </div>
          <div className="flex-1 max-w-xs">
            <label className="block text-sm font-medium text-gray-700 mb-1">Proposed Max Attempts</label>
            <input
              type="number"
              min="1"
              step="1"
              value={maxAttempts}
              onChange={(e) => setMaxAttempts(Number(e.target.value))}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border"
              required
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
          >
            {loading ? 'Simulating...' : 'Run Simulation'}
          </button>
        </form>
        {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
      </Card>

      {result && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card title="Current Policy">
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-500">Expected Recovered Revenue</p>
                  <p className="text-2xl font-semibold text-gray-900">₹{result.current_expected_recovered_revenue}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Recovery Rate</p>
                  <p className="text-2xl font-semibold text-gray-900">{result.current_recovery_rate}%</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Intervention Cost</p>
                  <p className="text-2xl font-semibold text-gray-900">₹{result.current_intervention_cost}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Eligible Opportunities</p>
                  <p className="text-2xl font-semibold text-gray-900">{result.current_eligible_opportunities}</p>
                </div>
              </div>
            </Card>
            <Card title="Proposed Policy">
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-500">Expected Recovered Revenue</p>
                  <p className="text-2xl font-semibold text-indigo-600">₹{result.proposed_expected_recovered_revenue}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Recovery Rate</p>
                  <p className="text-2xl font-semibold text-indigo-600">{result.projected_recovery_rate}%</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Intervention Cost</p>
                  <p className="text-2xl font-semibold text-indigo-600">₹{result.proposed_intervention_cost}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Eligible Opportunities</p>
                  <p className="text-2xl font-semibold text-indigo-600">{result.proposed_eligible_opportunities}</p>
                </div>
              </div>
            </Card>
          </div>

          <div className={`p-6 rounded-lg border ${result.recommendation.startsWith('Beneficial') ? 'bg-green-50 border-green-200' : 'bg-yellow-50 border-yellow-200'}`}>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Simulation Results</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div>
                <p className="text-sm text-gray-600">Incremental Recovery</p>
                <p className={`text-xl font-bold ${result.incremental_expected_recovery > 0 ? 'text-green-600' : result.incremental_expected_recovery < 0 ? 'text-red-600' : 'text-gray-900'}`}>
                  {result.incremental_expected_recovery > 0 ? '+' : ''}₹{result.incremental_expected_recovery}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Incremental Cost</p>
                <p className="text-xl font-bold text-gray-900">
                  {result.incremental_cost > 0 ? '+' : ''}₹{result.incremental_cost}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Projected Net Benefit</p>
                <p className={`text-xl font-bold ${result.projected_net_benefit > 0 ? 'text-green-600' : 'text-gray-900'}`}>
                  ₹{result.projected_net_benefit}
                </p>
              </div>
            </div>
            <div className="pt-4 border-t border-gray-200/50">
              <p className="text-sm font-medium text-gray-900">Recommendation:</p>
              <p className="text-lg font-bold mt-1">
                {result.recommendation}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
