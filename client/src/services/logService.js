import api from './api';

export const fetchLogs       = (params = {}) => api.get('/logs', { params });
export const createLog       = (data)         => api.post('/logs', data);
export const updateLog       = (id, data)     => api.put(`/logs/${id}`, data);
export const deleteLog       = (id)           => api.delete(`/logs/${id}`);
export const fetchAnalytics  = ()             => api.get('/logs/analytics');
export const exportLogsCSV   = ()             => api.get('/logs/export', { responseType: 'blob' });
