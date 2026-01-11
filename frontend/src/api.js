import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000/api';

export const generateQuiz = async (url, forceRefresh = false) => {
    const response = await axios.post(`${API_BASE_URL}/generate`, { url, force_refresh: forceRefresh });
    return response.data;
};

export const getHistory = async () => {
    const response = await axios.get(`${API_BASE_URL}/history`);
    return response.data;
};

export const getQuiz = async (id) => {
    const response = await axios.get(`${API_BASE_URL}/quiz/${id}`);
    return response.data;
};
