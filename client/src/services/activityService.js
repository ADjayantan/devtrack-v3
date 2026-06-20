import api from './api';

export const fetchActivities     = (params = {}) => api.get('/activities', { params });
export const fetchTodayActivities = (params = {}) => api.get('/activities/today', { params });
export const createActivity      = (data)        => api.post('/activities', data);
export const updateActivity      = (id, data)    => api.put(`/activities/${id}`, data);
export const deleteActivity      = (id)          => api.delete(`/activities/${id}`);
