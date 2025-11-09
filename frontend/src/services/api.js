import axios from 'axios';

// 1. Create an 'instance' of axios.
// This is the best practice for setting a base URL.
// Our FastAPI server is running on http://127.0.0.1:8000
const api = axios.create({
  baseURL: 'http://127.0.0.1:8000',
});

/**
 * 2. The function to generate a new quiz.
 * It makes a POST request to our /generate_quiz endpoint.
 * @param {string} url - The Wikipedia URL from the user.
 * @returns {object} The full quiz data from the backend.
 */
export const generateQuiz = async (url) => {
  try {
    // We send a JSON object with a "url" key, just like our Pydantic model expects
    const response = await api.post('/generate_quiz', { url });
    return response.data; // Return the full quiz JSON
  } catch (error) {
    // If the server sends an error (e.g., scraping failed), we'll throw it
    // so our React component can catch it.
    console.error('Error generating quiz:', error.response?.data || error.message);
    throw new Error(error.response?.data?.detail || 'Failed to generate quiz');
  }
};

/**
 * 3. The function to get the quiz history.
 * It makes a GET request to our /history endpoint.
 * @returns {array} A list of history items (id, url, title, date).
 */
export const getHistory = async () => {
  try {
    const response = await api.get('/history');
    return response.data;
  } catch (error) {
    console.error('Error fetching history:', error.response?.data || error.message);
    throw new Error(error.response?.data?.detail || 'Failed to fetch history');
  }
};

/**
 * 4. The function to get a single quiz by its ID.
 * It makes a GET request to our /quiz/{quiz_id} endpoint.
 * @param {number} quizId - The ID of the quiz to fetch.
 * @returns {object} The full quiz data for that specific quiz.
 */
export const getQuizById = async (quizId) => {
  try {
    const response = await api.get(`/quiz/${quizId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching quiz by ID:', error.response?.data || error.message);
    throw new Error(error.response?.data?.detail || 'Failed to fetch quiz');
  }
};