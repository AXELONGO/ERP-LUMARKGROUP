export async function fetchConfig() {
  try {
    const API = (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') ? 'http://localhost:3000' : '';
    const response = await fetch(`${API}/api/config`);
    if (response.ok) {
      return await response.json();
    }
  } catch (error) {
    console.error('Error fetching config:', error);
  }
  return { appName: 'LUMARK', appLogo: 'https://www.tulink.com/wp-content/uploads/2024/09/Logo-Lumark.png' };
}
