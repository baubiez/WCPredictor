import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { API, authFetch } from '../config.js';

export default function Register() {
  const [formData, setFormData] = useState({ username: '', email: '', password: '' });
  const [message, setMessage] = useState({ text: '', isError: false });
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage({ text: '', isError: false });
    try {
      const response = await authFetch(`${API}/api/auth/register`, {
        method: 'POST',
        body: JSON.stringify(formData),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Erreur lors de l'inscription.");
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
          <h2 className="text-2xl font-black" style={{ color: 'var(--text)' }}>Créer un compte</h2>
          <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
            Déjà inscrit ?{' '}
            <Link to="/login" style={{ color: 'var(--accent)' }} className="font-semibold hover:underline">
              Se connecter
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
              Nom d'utilisateur
            </label>
            <input
              type="text"
              required
              className="form-input"
              value={formData.username}
              onChange={(e) => setFormData({ ...formData, username: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-1.5" style={{ color: 'var(--text-muted)' }}>
              Adresse Email
            </label>
            <input
              type="email"
              required
              className="form-input"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-1.5" style={{ color: 'var(--text-muted)' }}>
              Mot de passe
            </label>
            <input
              type="password"
              required
              className="form-input"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            />
          </div>
          <button type="submit" className="btn btn-primary w-full py-2.5 mt-2">
            S'inscrire
          </button>
        </form>
      </div>
    </div>
  );
}
