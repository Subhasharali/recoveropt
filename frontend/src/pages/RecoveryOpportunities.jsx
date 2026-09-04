import { useState, useEffect } from 'react';
import { fetchRecommendations, executeRecovery, fetchAuditTrail } from '../services/api';
import { Table } from '../components/Table';
import { Badge } from '../components/Badge';
import { Card } from '../components/Card';
import { formatCurrency, formatPercentage } from '../utils/formatting';

export function RecoveryOpportunities() {
  const [opportunities, setOpportunities] = useState([]);
  const [auditLog, setAuditLog] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [executing, setExecuting] = useState({});
  const [executionResults, setExecutionResults] = useState({});

  const loadData = () => {
    Promise.all([fetchRecommendations(20), fetchAuditTrail(10)])
      .then(([opps, audit]) => {
        setOpportunities(opps);
        setAuditLog(audit);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleExecute = async (paymentId, action) => {
    setExecuting(prev => ({ ...prev, [paymentId]: true }));
    try {
      const result = await executeRecovery(paymentId, action);
      setExecutionResults(prev => ({ ...prev, [paymentId]: result }));
      fetchAuditTrail(10).then(setAuditLog).catch(console.error);
    } catch (err) {
      setExecutionResults(prev => ({ ...prev, [paymentId]: { status: 'ERROR', message: err.message } }));
    } finally {
      setExecuting(prev => ({ ...prev, [paymentId]: false }));
    }
  };

  if (loading) return <div className="text-slate-500 animate-pulse font-mono text-sm">LOADING QUEUE...</div>;
  if (error) return <div className="text-rose-400 bg-rose-500/10 p-4 rounded-md border border-rose-500/20 font-mono text-sm">SYSTEM ERROR: {error}</div>;

  const eligibleCount = opportunities.length;
  const highestRecovery = opportunities.length > 0 
    ? Math.max(...opportunities.map(o => o.estimated_recovery_amount)) 
    : 0;
  const uniqueActions = new Set(opportunities.map(o => o.recommended_action)).size;

  return (
    <div className="space-y-8">
      <div className="border-b border-slate-700/60 pb-5">
        <h2 className="text-2xl font-bold text-slate-50 tracking-tight">Recovery Opportunities</h2>
        <p className="text-slate-400 mt-1 text-sm">Prioritized recovery actions for at-risk payments.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-2">
        <div className="bg-slate-800 border border-slate-700/60 rounded-lg p-5 flex flex-col">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Eligible opportunities</span>
          <span className="text-2xl font-bold text-slate-200">{eligibleCount}</span>
        </div>
        <div className="bg-slate-800 border border-slate-700/60 rounded-lg p-5 flex flex-col border-t-2 border-t-emerald-500">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Highest expected recovery</span>
          <span className="text-2xl font-bold text-emerald-400">{formatCurrency(highestRecovery)}</span>
        </div>
        <div className="bg-slate-800 border border-slate-700/60 rounded-lg p-5 flex flex-col">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Actions available</span>
          <span className="text-2xl font-bold text-slate-200">{uniqueActions}</span>
        </div>
      </div>

      <Card className="!p-0 border-slate-700/60">
        <Table headers={['Payment ID', 'Recommended Action', 'Probability', 'Expected Recovery', 'Policy', 'Execution']}>
          {opportunities.map((opp) => (
            <tr key={opp.payment_id}>
              <td className="px-5 py-3 whitespace-nowrap text-[13px] font-mono font-medium text-slate-300">{opp.payment_id}</td>
              <td className="px-5 py-3 whitespace-nowrap text-[13px]">
                <Badge color={opp.recommended_action === 'retry_payment' ? 'blue' : opp.recommended_action === 'stop_recovery' ? 'gray' : 'yellow'}>
                  {opp.recommended_action.replace(/_/g, ' ')}
                </Badge>
              </td>
              <td className="px-5 py-3 whitespace-nowrap text-[13px] font-medium text-slate-200">{formatPercentage(opp.estimated_recovery_probability, true)}</td>
              <td className="px-5 py-3 whitespace-nowrap text-[13px] font-semibold text-slate-100">{formatCurrency(opp.estimated_recovery_amount)}</td>
              <td className="px-5 py-3 whitespace-nowrap text-[13px]">
                <Badge color={opp.policy_allowed ? 'green' : 'red'}>{opp.policy_allowed ? 'Allowed' : 'Blocked'}</Badge>
              </td>
              <td className="px-5 py-3 whitespace-nowrap text-[13px]">
                {executionResults[opp.payment_id] ? (
                  <div className="flex flex-col items-start gap-1 animate-fade-in-up">
                    <Badge color={
                      executionResults[opp.payment_id].status === 'SUCCESS' ? 'green' :
                      executionResults[opp.payment_id].status === 'FAILED' ? 'red' :
                      executionResults[opp.payment_id].status === 'STOPPED' ? 'gray' :
                      executionResults[opp.payment_id].status === 'LINK_CREATED' ? 'blue' : 'yellow'
                    }>
                      {executionResults[opp.payment_id].status}
                    </Badge>
                    {executionResults[opp.payment_id].payment_link_url && (
                      <button
                        onClick={() => window.open(executionResults[opp.payment_id].payment_link_url, '_blank')}
                        className="text-[11px] text-blue-400 hover:text-blue-300 font-bold uppercase tracking-wide underline underline-offset-4 mt-1"
                      >
                        Open Link
                      </button>
                    )}
                  </div>
                ) : (
                  <button
                    onClick={() => handleExecute(opp.payment_id, opp.recommended_action)}
                    disabled={executing[opp.payment_id]}
                    className="inline-flex items-center justify-center px-4 py-1.5 border border-transparent text-[11px] font-bold uppercase tracking-wider rounded bg-blue-600 text-white hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 focus:ring-offset-slate-900 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {executing[opp.payment_id] ? (
                      <span className="flex items-center gap-2">
                        <svg className="animate-spin h-3.5 w-3.5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Executing...
                      </span>
                    ) : 'Execute'}
                  </button>
                )}
              </td>
            </tr>
          ))}
          {opportunities.length === 0 && (
            <tr>
              <td colSpan="6" className="px-5 py-8 text-center text-[13px] text-slate-500">No opportunities available.</td>
            </tr>
          )}
        </Table>
      </Card>
      
      <div className="pt-8">
        <h3 className="text-[13px] font-bold text-slate-300 uppercase tracking-widest px-1 mb-4">Execution Log</h3>
        <Card className="!p-0 border-slate-700/60">
          <Table headers={['Payment ID', 'Action', 'Status', 'Cost', 'Recovered', 'Time']}>
            {auditLog.map((audit) => (
              <tr key={audit.id}>
                <td className="px-5 py-3 whitespace-nowrap text-[12px] font-mono font-medium text-slate-400">{audit.payment_id}</td>
                <td className="px-5 py-3 whitespace-nowrap text-[12px] text-slate-300">{audit.executed_action.replace(/_/g, ' ')}</td>
                <td className="px-5 py-3 whitespace-nowrap">
                  <Badge color={
                    audit.execution_status === 'SUCCESS' ? 'green' :
                    audit.execution_status === 'FAILED' ? 'red' :
                    audit.execution_status === 'STOPPED' ? 'gray' :
                    audit.execution_status === 'LINK_CREATED' ? 'blue' : 'yellow'
                  }>{audit.execution_status}</Badge>
                </td>
                <td className="px-5 py-3 whitespace-nowrap text-[12px] text-slate-400 font-mono">{formatCurrency(audit.intervention_cost)}</td>
                <td className="px-5 py-3 whitespace-nowrap text-[12px] font-semibold text-emerald-400 font-mono">
                  {audit.recovered_amount > 0 ? formatCurrency(audit.recovered_amount) : <span className="text-slate-600">-</span>}
                </td>
                <td className="px-5 py-3 whitespace-nowrap text-[11px] text-slate-500 font-mono">
                  {new Date(audit.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit', second:'2-digit'})}
                </td>
              </tr>
            ))}
            {auditLog.length === 0 && (
              <tr>
                <td colSpan="6" className="px-5 py-8 text-center text-[13px] text-slate-500">No recent executions found.</td>
              </tr>
            )}
          </Table>
        </Card>
      </div>
    </div>
  );
}
