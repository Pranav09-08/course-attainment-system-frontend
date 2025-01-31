const API_URL = 'https://api.example.com/dashboard';

export const fetchDashboardData = async (userId) => {
  try {
    const response = await fetch(`${API_URL}/${userId}`);
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Failed to fetch dashboard data', error);
    throw new Error('Dashboard data fetch failed');
  }
};
