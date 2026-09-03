import { useState } from 'react';
import { optimizeBudget } from '../services/api';
import { Card } from '../components/Card';
import { Table } from '../components/Table';
import { Badge } from '../components/Badge';

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
    <div className="space-y-6">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900">Budget Optimizer</h2>
        <p className="text-gray-500">Allocate your recovery budget to maximize expected net benefit.</p>
      </div>

      <Card>
        <form onSubmit={handleOptimize} className="flex items-end gap-4">
          <div className="flex-1 max-w-xs">
            <label className="block text-sm font-medium text-gray-700 mb-1">Recovery Budget (₹)</label>
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
          <button
            type="submit"
            disabled={loading}
            className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
          >
            {loading ? 'Optimizing...' : 'Optimize Allocation'}
          </button>
        </form>
        {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
      </Card>

      {result && (
        <div className="space-y-6">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
            <h3 className="text-lg font-medium text-blue-900 mb-4">Allocation Result</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <p className="text-sm text-blue-700">Available Budget</p>
                <p className="text-2xl font-bold text-blue-900">₹{result.available_budget}</p>
              </div>
              <div>
                <p className="text-sm text-blue-700">Allocated Cost</p>
                <p className="text-2xl font-bold text-blue-900">₹{result.estimated_intervention_cost}</p>
              </div>
              <div>
                <p className="text-sm text-blue-700">Expected Recovery</p>
                <p className="text-2xl font-bold text-green-700">₹{result.estimated_recovery}</p>
              </div>
              <div>
                <p className="text-sm text-blue-700">Expected Net Benefit</p>
                <p className="text-2xl font-bold text-green-700">₹{result.expected_net_benefit}</p>
              </div>
            </div>
            <p className="mt-4 text-sm text-blue-800">{result.explanation}</p>
          </div>

          <Card title={`Selected Opportunities (${result.selected_opportunity_count})`}>
            {result.selected_opportunities.length > 0 ? (
              <Table headers={['Payment ID', 'Action', 'Cost', 'Expected', 'Net Benefit']}>
                {result.selected_opportunities.map((opp) => (
                  <tr key={opp.payment_id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{opp.payment_id}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <Badge color="blue">{opp.recommended_action.replace(/_/g, ' ')}</Badge>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">₹{opp.intervention_cost}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">₹{opp.estimated_recovery}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-green-600">₹{opp.expected_net_benefit}</td>
                  </tr>
                ))}
              </Table>
            ) : (
              <p className="text-sm text-gray-500">No opportunities selected. Try increasing the budget.</p>
            )}
          </Card>
        </div>
      )}
    </div>
  );
}
