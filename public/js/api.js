// Override global fetch to always attach Authorization header
const originalFetch = window.fetch;

window.fetch = async function(resource, config = {}) {
  const token = localStorage.getItem('erp_jwt_token');
  
  if (token) {
    if (!config.headers) {
      config.headers = {};
    }
    // Si resource es un string y no es de google o apis externas
    if (typeof resource === 'string' && !resource.startsWith('http') || resource.includes(window.location.hostname)) {
        if (!config.headers['Authorization']) {
            config.headers['Authorization'] = `Bearer ${token}`;
        }
    }
  }

  try {
    const response = await originalFetch(resource, config);
    if (response.status === 401) {
      // Unauthorized -> Token expired or invalid
      console.warn('Unauthorized, logging out...');
      localStorage.removeItem('erp_jwt_token');
      localStorage.removeItem('erp_user');
      window.location.reload();
    }
    return response;
  } catch (err) {
    throw err;
  }
};
