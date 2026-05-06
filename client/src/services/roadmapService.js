import api from './api';

export const fetchRoadmaps = () => api.get('/roadmap');
export const createRoadmap = (data) => api.post('/roadmap', data);
export const updateRoadmap = (id, data) => api.put(`/roadmap/${id}`, data);
export const deleteRoadmap = (id) => api.delete(`/roadmap/${id}`);
