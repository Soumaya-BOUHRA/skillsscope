import axios from 'axios';

const baseURL = import.meta.env.VITE_API_URL || '/api';

export const api = axios.create({
  baseURL,
  headers: { 'Content-Type': 'application/json' },
});

const TOKEN_KEY = 'skillscope_token';

export const getToken = () => localStorage.getItem(TOKEN_KEY);
export const setToken = (token) => {
  if (token) localStorage.setItem(TOKEN_KEY, token);
  else localStorage.removeItem(TOKEN_KEY);
};

api.interceptors.request.use((config) => {
  const token = getToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const payload = error.response?.data;
    const message =
      payload?.message ||
      (error.code === 'ERR_NETWORK'
        ? 'Cannot reach the server. Please check your connection.'
        : 'Something went wrong. Please try again.');
    const friendly = new Error(message);
    friendly.status = error.response?.status;
    friendly.errors = payload?.errors;
    friendly.raw = error;
    return Promise.reject(friendly);
  }
);

const unwrap = (promise) => promise.then((res) => res.data);

export const authApi = {
  register: (data) => unwrap(api.post('/auth/register', data)),
  login: (data) => unwrap(api.post('/auth/login', data)),
  me: () => unwrap(api.get('/auth/me')),
};

export const resumeApi = {
  upload: (file, onUploadProgress) => {
    const form = new FormData();
    form.append('resume', file);
    return unwrap(
      api.post('/resumes/upload', form, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (e) => {
          if (e.total) onUploadProgress?.(Math.round((e.loaded / e.total) * 100));
        },
      })
    );
  },
  list: () => unwrap(api.get('/resumes')),
  get: (id) => unwrap(api.get(`/resumes/${id}`)),
  remove: (id) => unwrap(api.delete(`/resumes/${id}`)),
};

export const analysisApi = {
  analyze: (resumeId) => unwrap(api.post(`/analysis/${resumeId}`)),
  get: (resumeId) => unwrap(api.get(`/analysis/${resumeId}`)),
  careers: (analysisId, force = false) =>
    unwrap(api.get(`/analysis/${analysisId}/careers`, { params: { force } })),
};

export const jobApi = {
  create: (data) => unwrap(api.post('/jobs', data)),
  list: () => unwrap(api.get('/jobs')),
  get: (id) => unwrap(api.get(`/jobs/${id}`)),
  remove: (id) => unwrap(api.delete(`/jobs/${id}`)),
  match: (jobId, resumeId) => unwrap(api.post(`/jobs/${jobId}/match/${resumeId}`)),
  matches: (jobId) => unwrap(api.get(`/jobs/${jobId}/matches`)),
};

export const statsApi = {
  dashboard: () => unwrap(api.get('/stats/dashboard')),
};

export const historyApi = {
  list: (params) => unwrap(api.get('/history', { params })),
};

export default api;
