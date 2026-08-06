import api from './axios';

export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  getMe: () => api.get('/auth/me'),
};

export const investmentAPI = {
  create: (data) => api.post('/investments', data),
  list: (params) => api.get('/investments', { params }),
};

export const dashboardAPI = {
  getSummary: () => api.get('/dashboard/summary'),
  getEarningsChart: (days = 30) => api.get('/dashboard/earnings-chart', { params: { days } }),
};

export const referralAPI = {
  getDirect: (params) => api.get('/referrals/direct', { params }),
  getTree: (depth = 10) => api.get('/referrals/tree', { params: { depth } }),
  getTreeStats: () => api.get('/referrals/tree/stats'),
  getIncome: (params) => api.get('/referrals/income', { params }),
};

export const planAPI = {
  list: () => api.get('/plans'),
  create: (data) => api.post('/plans', data),
};

export const walletAPI = {
  deposit: (amount) => api.post('/wallet/deposit', { amount }),
};

export const roiAPI = {
  trigger: (date) => api.post('/roi/trigger', { date }),
  getHistory: (params) => api.get('/roi/history', { params }),
};
