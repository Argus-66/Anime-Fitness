export const setAuthToken = (token: string) => {
  localStorage.setItem('authToken', token);
};

export const getAuthToken = () => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('authToken');
  }
  return null;
};

export const setUser = (user: any) => {
  localStorage.setItem('user', JSON.stringify(user));
};

export const getUser = () => {
  if (typeof window !== 'undefined') {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  }
  return null;
};

export const clearAuth = () => {
  localStorage.removeItem('authToken');
  localStorage.removeItem('user');
};

export const clearUser = () => {
  localStorage.removeItem('user');
}; 