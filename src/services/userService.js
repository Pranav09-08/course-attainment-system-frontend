const API_URL = 'https://api.example.com/users';

export const getUserDetails = async (userId) => {
  try {
    const response = await fetch(`${API_URL}/${userId}`);
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Failed to fetch user details', error);
    throw new Error('User details fetch failed');
  }
};

export const updateUserDetails = async (userId, userDetails) => {
  try {
    const response = await fetch(`${API_URL}/${userId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userDetails),
    });

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Failed to update user details', error);
    throw new Error('Update failed');
  }
};
