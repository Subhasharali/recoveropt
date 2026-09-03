import { useState, useEffect } from 'react';
import { fetchRecommendations, executeRecovery, fetchAuditTrail } from '../services/api';
import { Table } from '../components/Table';
import { Badge } from '../components/Badge';
import { Card } from '../components/Card';

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
      // Reload audit trail to show new entry
      fetchAuditTrail(10).then(setAuditLog).catch(console.error);
    } catch (err) {
      setExecutionResults(prev => ({ ...prev, [paymentId]: { status: 'ERROR', message: err.message } }));
    } finally {
      setExecuting(prev => ({ ...prev, [paymentId]: false }));
    }
  };

  if (loading) return <div className="p-8 text-gray-500">Loading opportunities...</div>;
  if (error) return <div className="p-8 text-red-500">Error: {error}</div>;

  return (
    <div className="space-y-6">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900">Recovery Opportunities</h2>
        <p className="text-gray-500">Review recommended actions for at-risk payments and execute bounded recovery workflows.</p>
      </div>

      <Table headers={['Payment ID', 'Action', 'Probability', 'Expected', 'Policy', 'Execution']}>
        {opportunities.map((opp) => (
          <tr key={opp.payment_id}>
            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{opp.payment_id}</td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
              <Badge color={opp.recommended_action === 'retry_payment' ? 'blue' : opp.recommended_action === 'stop_recovery' ? 'gray' : 'yellow'}>
                {opp.recommended_action.replace(/_/g, ' ')}
              </Badge>
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{(opp.estimated_recovery_probability * 100).toFixed(0)}%</td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">₹{opp.estimated_recovery_amount.toLocaleString()}</td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
              <Badge color={opp.policy_allowed ? 'green' : 'red'}>{opp.policy_allowed ? 'Allowed' : 'Blocked'}</Badge>
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-sm">
              {executionResults[opp.payment_id] ? (
                <div className="flex flex-col space-y-1">
                  <Badge color={
                    executionResults[opp.payment_id].status === 'SUCCESS' ? 'green' :
                    executionResults[opp.payment_id].status === 'FAILED' ? 'red' :
                    executionResults[opp.payment_id].status === 'STOPPED' ? 'gray' :
                    executionResults[opp.payment_id].status === 'LINK_CREATED' ? 'blue' : 'yellow'
                  }>
                    {executionResults[opp.payment_id].status}
                  </Badge>
                  <span className="text-xs text-gray-500">{executionResults[opp.payment_id].message}</span>
                  {executionResults[opp.payment_id].payment_link_url && (
                    <button
                      onClick={() => window.open(executionResults[opp.payment_id].payment_link_url, '_blank')}
                      className="text-xs text-indigo-600 hover:text-indigo-900 mt-1 text-left inline-block w-max font-medium"
                    >
                      [ Open Test Payment ]
                    </button>
                  )}
                </div>
              ) : (
                <button
                  onClick={() => handleExecute(opp.payment_id, opp.recommended_action)}
                  disabled={executing[opp.payment_id]}
                  className="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none disabled:opacity-50"
                >
                  {executing[opp.payment_id] ? 'Executing...' : 'Execute'}
                </button>
              )}
            </td>
          </tr>
        ))}
      </Table>
      
      <div className="pt-8">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Recent Executions (Audit Trail)</h3>
        <Card className="!p-0 overflow-hidden">
          <Table headers={['Time', 'Payment', 'Action', 'Status', 'Cost', 'Recovered', 'Reason']}>
            {auditLog.map((audit) => (
              <tr key={audit.id}>
                <td className="px-6 py-4 whitespace-nowrap text-xs text-gray-500">
                  {new Date(audit.created_at).toLocaleTimeString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{audit.payment_id}</td>
                <td className="px-6 py-4 whitespace-nowrap text-xs text-gray-500">{audit.executed_action.replace(/_/g, ' ')}</td>
                <td className="px-6 py-4 whitespace-nowrap text-xs">
                  <Badge color={
                    audit.execution_status === 'SUCCESS' ? 'green' :
                    audit.execution_status === 'FAILED' ? 'red' :
                    audit.execution_status === 'STOPPED' ? 'gray' :
                    audit.execution_status === 'LINK_CREATED' ? 'blue' : 'yellow'
                  }>{audit.execution_status}</Badge>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-xs text-gray-500">₹{audit.intervention_cost}</td>
                <td className="px-6 py-4 whitespace-nowrap text-xs font-medium text-green-600">
                  {audit.recovered_amount > 0 ? `₹${audit.recovered_amount}` : '-'}
                </td>
                <td className="px-6 py-4 text-xs text-gray-500 max-w-xs truncate" title={audit.reason}>
                  {audit.reason}
                  {audit.razorpay_link_id && (
                    <span className="ml-2 px-1.5 py-0.5 rounded bg-gray-100 border border-gray-200 text-gray-600 font-mono text-[10px]">
                      {audit.razorpay_link_id}
                    </span>
                  )}
                </td>
              </tr>
            ))}
            {auditLog.length === 0 && (
              <tr>
                <td colSpan="7" className="px-6 py-4 text-center text-sm text-gray-500">No recent executions found.</td>
              </tr>
            )}
          </Table>
        </Card>
      </div>
    </div>
  );
}
