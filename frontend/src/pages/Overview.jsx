import { useState, useEffect } from 'react';
import { fetchMetrics, fetchRecommendations } from '../services/api';
import { Card } from '../components/Card';
import { Table } from '../components/Table';
import { Badge } from '../components/Badge';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export function Overview() {
  const [metrics, setMetrics] = useState(null);
  const [opportunities, setOpportunities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    Promise.all([fetchMetrics(), fetchRecommendations(5)])
      .then(([metricsData, oppsData]) => {
        setMetrics(metricsData);
        setOpportunities(oppsData);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  if (loading) return <div className="p-8 text-gray-500">Loading overview...</div>;
  if (error) return <div className="p-8 text-red-500">Error: {error}</div>;

  const chartData = [
    { name: 'Revenue at Risk', value: metrics.revenue_at_risk },
    { name: 'Recovered', value: metrics.recovered_revenue }
  ];

  return (
    <div className="space-y-6">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900">Overview</h2>
        <p className="text-gray-500">Key metrics for your recovery operations.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card title="Revenue at Risk">
          <p className="text-3xl font-semibold text-gray-900">₹{metrics.revenue_at_risk.toLocaleString()}</p>
        </Card>
        <Card title="Recovered Revenue">
          <p className="text-3xl font-semibold text-green-600">₹{metrics.recovered_revenue.toLocaleString()}</p>
        </Card>
        <Card title="Recovery Rate">
          <p className="text-3xl font-semibold text-blue-600">{metrics.recovery_rate}%</p>
        </Card>
        <Card title="Failed Payments">
          <p className="text-3xl font-semibold text-gray-900">{metrics.failed_payments.toLocaleString()}</p>
        </Card>
        <Card title="Eligible Opportunities">
          <p className="text-3xl font-semibold text-gray-900">{metrics.eligible_opportunities.toLocaleString()}</p>
        </Card>
        <Card title="Total Processed">
          <p className="text-3xl font-semibold text-gray-900">{metrics.total_payments.toLocaleString()}</p>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card title="Recovery Status">
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} />
                <YAxis axisLine={false} tickLine={false} tickFormatter={(value) => `₹${value/1000}k`} />
                <Tooltip formatter={(value) => `₹${value.toLocaleString()}`} />
                <Bar dataKey="value" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
        
        <Card title="Top Recovery Opportunities">
          <Table headers={['Payment ID', 'Action', 'Expected', 'Risk']}>
            {opportunities.map((opp) => (
              <tr key={opp.payment_id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{opp.payment_id}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <Badge color={opp.recommended_action === 'retry_payment' ? 'blue' : opp.recommended_action === 'stop_recovery' ? 'gray' : 'yellow'}>
                    {opp.recommended_action.replace('_', ' ')}
                  </Badge>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">₹{opp.estimated_recovery_amount.toLocaleString()}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <Badge color={opp.risk_level === 'low' ? 'green' : 'red'}>{opp.risk_level}</Badge>
                </td>
              </tr>
            ))}
          </Table>
        </Card>
      </div>
    </div>
  );
}
