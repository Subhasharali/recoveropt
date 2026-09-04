import { useState, useEffect } from 'react';
import { fetchMetrics, fetchRecommendations } from '../services/api';
import { Card } from '../components/Card';
import { Table } from '../components/Table';
import { Badge } from '../components/Badge';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { formatCurrency, formatPercentage } from '../utils/formatting';

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

  if (loading) return <div className="text-slate-500 animate-pulse font-mono text-sm">LOADING TERMINAL...</div>;
  if (error) return <div className="text-rose-400 bg-rose-500/10 p-4 rounded-md border border-rose-500/20 font-mono text-sm">SYSTEM ERROR: {error}</div>;

  const chartData = [
    { name: 'At Risk', value: metrics.revenue_at_risk, color: '#f59e0b' },
    { name: 'Recovered', value: metrics.recovered_revenue, color: '#10b981' }
  ];

  return (
    <div className="space-y-8">
      <div className="border-b border-slate-700/60 pb-5">
        <h2 className="text-2xl font-bold text-slate-50 tracking-tight">Revenue Recovery Overview</h2>
        <p className="text-slate-400 mt-1 text-sm">Monitor at-risk revenue, recovery performance, and intervention efficiency.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="col-span-1 md:col-span-2 lg:col-span-1 flex flex-col justify-end border-l-4 border-amber-500 pl-4 py-1">
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-2">Revenue at Risk</p>
          <p className="text-5xl font-bold text-slate-50 tracking-tighter">{formatCurrency(metrics.revenue_at_risk)}</p>
          <p className="text-xs text-amber-500 mt-3 font-medium uppercase tracking-wider">Currently exposed</p>
        </div>
        
        <div className="flex flex-col justify-end border-l-4 border-emerald-500 pl-4 py-1">
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-2">Recovered Revenue</p>
          <p className="text-4xl font-bold text-emerald-400 tracking-tighter">{formatCurrency(metrics.recovered_revenue)}</p>
          <p className="text-xs text-emerald-500 mt-3 font-medium uppercase tracking-wider">Successfully recovered</p>
        </div>
        
        <div className="flex flex-col justify-end border-l-4 border-blue-500 pl-4 py-1">
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-2">Recovery Rate</p>
          <p className="text-4xl font-bold text-blue-400 tracking-tighter">{formatPercentage(metrics.recovery_rate)}</p>
          <p className="text-xs text-blue-500 mt-3 font-medium uppercase tracking-wider">Overall efficiency</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 pt-4">
        <Card className="lg:col-span-1 border-slate-700/60 bg-slate-800">
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Failed Payments</p>
          <p className="text-2xl font-bold text-slate-200">{metrics.failed_payments.toLocaleString()}</p>
        </Card>
        
        <Card className="lg:col-span-1 border-slate-700/60 bg-slate-800">
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Eligible Opportunities</p>
          <p className="text-2xl font-bold text-slate-200">{metrics.eligible_opportunities.toLocaleString()}</p>
        </Card>
        
        <Card className="lg:col-span-1 border-slate-700/60 bg-slate-800">
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Total Processed</p>
          <p className="text-2xl font-bold text-slate-200">{metrics.total_payments.toLocaleString()}</p>
        </Card>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-5 gap-6 pt-4">
        <Card title="Recovery Performance" className="xl:col-span-2 flex flex-col border-slate-700/60">
          <div className="h-80 w-full pt-6">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 10, right: 20, left: 0, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} dy={15} />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tickFormatter={(value) => `₹${value/1000}k`}
                  dx={-10}
                />
                <Tooltip 
                  cursor={{fill: '#1e293b'}}
                  contentStyle={{backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '4px', color: '#f8fafc', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.3)'}}
                  itemStyle={{color: '#f8fafc', fontWeight: 'bold'}}
                  formatter={(value) => [formatCurrency(value), 'Amount']}
                />
                <Bar dataKey="value" radius={[4, 4, 0, 0]} maxBarSize={80}>
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
        
        <div className="xl:col-span-3 flex flex-col gap-4">
          <h3 className="text-[13px] font-bold text-slate-300 uppercase tracking-widest px-1">Highest-value opportunities</h3>
          <Card className="!p-0 border-slate-700/60 shadow-none">
            <Table headers={['Payment ID', 'Action', 'Expected', 'Risk']}>
              {opportunities.map((opp) => (
                <tr key={opp.payment_id}>
                  <td className="px-5 py-3 whitespace-nowrap text-[13px] font-mono text-slate-400">{opp.payment_id}</td>
                  <td className="px-5 py-3 whitespace-nowrap">
                    <Badge color={opp.recommended_action === 'retry_payment' ? 'blue' : opp.recommended_action === 'stop_recovery' ? 'gray' : 'yellow'}>
                      {opp.recommended_action.replace(/_/g, ' ')}
                    </Badge>
                  </td>
                  <td className="px-5 py-3 whitespace-nowrap text-[13px] font-semibold text-slate-100">
                    {formatCurrency(opp.estimated_recovery_amount)}
                  </td>
                  <td className="px-5 py-3 whitespace-nowrap text-[13px]">
                    <Badge color={opp.risk_level === 'low' ? 'green' : 'red'}>{opp.risk_level}</Badge>
                  </td>
                </tr>
              ))}
              {opportunities.length === 0 && (
                <tr>
                  <td colSpan="4" className="px-5 py-8 text-center text-[13px] text-slate-500">No opportunities available.</td>
                </tr>
              )}
            </Table>
          </Card>
        </div>
      </div>
    </div>
  );
}
