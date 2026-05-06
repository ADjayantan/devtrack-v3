// Get today's date as YYYY-MM-DD
export const today = () => new Date().toISOString().split('T')[0];

// Format a YYYY-MM-DD string to a readable form
export const formatDate = (dateStr) => {
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
};

// Get the last N days as YYYY-MM-DD strings
export const getLastNDays = (n) => {
  const days = [];
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    days.push(d.toISOString().split('T')[0]);
  }
  return days;
};
