const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

export async function fetchHealth() {
  const res = await fetch(`${API_BASE_URL}/health`);
  if (!res.ok) throw new Error('Network response was not ok');
  return res.json();
}

export async function fetchMetrics() {
  const res = await fetch(`${API_BASE_URL}/api/metrics`);
  if (!res.ok) throw new Error('Network response was not ok');
  return res.json();
}

export async function fetchRecommendations(limit = 50) {
  const res = await fetch(`${API_BASE_URL}/api/recovery/recommendations?limit=${limit}`);
  if (!res.ok) throw new Error('Network response was not ok');
  return res.json();
}

export async function optimizeBudget(budget) {
  const res = await fetch(`${API_BASE_URL}/api/recovery/optimize?budget=${budget}`);
  if (!res.ok) throw new Error('Network response was not ok');
  return res.json();
}

export async function simulatePolicy(budget, maxAttempts) {
  const res = await fetch(`${API_BASE_URL}/api/recovery/simulate?budget=${budget}&max_attempts=${maxAttempts}`);
  if (!res.ok) throw new Error('Network response was not ok');
  return res.json();
}

export async function executeRecovery(paymentId, action) {
  const res = await fetch(`${API_BASE_URL}/api/recovery/execute`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ payment_id: paymentId, action: action })
  });
  if (!res.ok) throw new Error('Network response was not ok');
  return res.json();
}

export async function fetchAuditTrail(limit = 10) {
  const res = await fetch(`${API_BASE_URL}/api/recovery/audit?limit=${limit}`);
  if (!res.ok) throw new Error('Network response was not ok');
  return res.json();
}
