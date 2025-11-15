// React default import not required with the automatic JSX runtime
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import { BrowserRouter } from 'react-router-dom'
import { I18nProvider } from './i18n/index.jsx'

// Accept admin token/user from query params when redirected from the public frontend login
(() => {
  try {
    const params = new URLSearchParams(window.location.search);
    const adminToken = params.get('adminToken');
    const adminUser = params.get('adminUser');
    if (adminToken) {
      localStorage.setItem('token', adminToken);
    }
    if (adminUser) {
      try { localStorage.setItem('user', adminUser); } catch (e) { /* ignore */ }
    }
    // Clean the query params so routes don't include them
    if (adminToken || adminUser) {
      const url = new URL(window.location.href);
      url.search = '';
      window.history.replaceState({}, '', url.toString());
    }
  } catch (e) {
    // ignore parsing errors
  }
})();

ReactDOM.createRoot(document.getElementById('root')).render(
  <BrowserRouter>
    <I18nProvider>
      <App />
    </I18nProvider>
  </BrowserRouter>
)
