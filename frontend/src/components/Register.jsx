import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { API, authFetch } from '../config.js';
import { useLang } from '../LanguageContext.jsx';

const PASSWORD_RULES = [
  { label: '8 caractères minimum', test: (p) => p.length >= 8 },
  { label: 'Au moins une majuscule', test: (p) => /[A-Z]/.test(p) },
  { label: 'Au moins une minuscule', test: (p) => /[a-z]/.test(p) },
  { label: 'Au moins un chiffre',    test: (p) => /[0-9]/.test(p) },
];

export default function Register() {
  const [formData, setFormData] = useState({ username: '', email: '', password: '' });
  const [message, setMessage] = useState({ text: '', isError: false });
  const [fieldErrors, setFieldErrors] = useState({});
  const navigate = useNavigate();
  const { t } = useLang();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage({ text: '', isError: false });
    setFieldErrors({});
    try {
      const response = await authFetch(`${API}/api/auth/register`, {
        method: 'POST',
        body: JSON.stringify(formData),
      });
      const data = await response.json();
      if (!response.ok) {
        if (data.errors && Array.isArray(data.errors)) {
          const byField = {};
          data.errors.forEach(({ field, message }) => { byField[field] = message; });
          setFieldErrors(byField);
          setMessage({ text: "Corrigez les erreurs ci-dessous.", isError: true });
        } else {
          throw new Error(data.error || "Erreur lors de l'inscription.");
        }
        return;
      }
      setMessage({ text: 'Compte créé ! Vous pouvez vous connecter.', isError: false });
      setFormData({ username: '', email: '', password: '' });
      setTimeout(() => navigate('/login'), 1500);
    } catch (err) {
      setMessage({ text: err.message, isError: true });
    }
  };

  return (
    <div className="max-w-md mx-auto mt-12">
      <div className="card p-8">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-black" style={{ color: 'var(--text)' }}>{t('register.title')}</h2>
          <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
            {t('register.has_account')}{' '}
            <Link to="/login" style={{ color: 'var(--accent)' }} className="font-semibold hover:underline">
              {t('register.link_login')}
            </Link>
          </p>
        </div>

        {message.text && (
          <div className={`px-4 py-3 rounded-lg text-sm mb-6 font-medium ${
            message.isError
              ? 'bg-red-500/15 border border-red-500/40 text-red-400'
              : 'bg-green-500/15 border border-green-500/40 text-green-400'
          }`}>
            {message.text}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-semibold mb-1.5" style={{ color: 'var(--text-muted)' }}>
              {t('register.username')}
            </label>
            <input
              type="text"
              required
              className="form-input"
              value={formData.username}
              onChange={(e) => setFormData({ ...formData, username: e.target.value })}
            />
            {fieldErrors.username && (
              <p className="text-xs mt-1.5 text-red-400">{fieldErrors.username}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-semibold mb-1.5" style={{ color: 'var(--text-muted)' }}>
              {t('register.email')}
            </label>
            <input
              type="email"
              required
              className="form-input"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />
            {fieldErrors.email && (
              <p className="text-xs mt-1.5 text-red-400">{fieldErrors.email}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-semibold mb-1.5" style={{ color: 'var(--text-muted)' }}>
              {t('register.password')}
            </label>
            <input
              type="password"
              required
              className="form-input"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            />
            {fieldErrors.password && (
              <p className="text-xs mt-1.5 text-red-400">{fieldErrors.password}</p>
            )}
            <ul className="mt-2 space-y-1">
              {PASSWORD_RULES.map(({ label, test }) => {
                const ok = formData.password.length > 0 && test(formData.password);
                return (
                  <li key={label} className="flex items-center gap-1.5 text-xs"
                    style={{ color: ok ? 'var(--accent)' : 'var(--text-muted)' }}>
                    <span>{ok ? '✓' : '·'}</span>
                    {label}
                  </li>
                );
              })}
            </ul>
          </div>
          <button type="submit" className="btn btn-primary w-full py-2.5 mt-2">
            {t('register.submit')}
          </button>
        </form>
      </div>
    </div>
  );
}
