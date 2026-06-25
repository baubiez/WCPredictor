import { useState } from 'react';
import { API } from '../config.js';

export default function Register() {
  const [formData, setFormData] = useState({ username: '', email: '', password: '' });
  const [message, setMessage] = useState({ text: '', isError: false });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage({ text: '', isError: false });

    try {
      // Connexion à l'API backend exposée sur le port 3000
      const response = await fetch(`${API}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Une erreur est survenue lors de l'inscription.");
      }

      setMessage({ text: 'Compte créé avec succès ! Vous pouvez vous connecter.', isError: false });
      setFormData({ username: '', email: '', password: '' }); // Réinitialise le formulaire
    } catch (err) {
      setMessage({ text: err.message, isError: true });
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-slate-800 rounded-lg shadow-xl text-white">
      <h2 className="text-2xl font-bold mb-6 text-center">Créer un compte</h2>
      
      {message.text && (
        <div className={`p-3 rounded mb-4 text-sm ${message.isError ? 'bg-red-600' : 'bg-green-600'}`}>
          {message.text}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Nom d'utilisateur</label>
          <input
            type="text"
            required
            className="w-full p-2 rounded bg-slate-700 border border-slate-600 focus:outline-none focus:border-blue-500 text-white"
            value={formData.username}
            onChange={(e) => setFormData({ ...formData, username: e.target.value })}
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Adresse Email</label>
          <input
            type="email"
            required
            className="w-full p-2 rounded bg-slate-700 border border-slate-600 focus:outline-none focus:border-blue-500 text-white"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Mot de passe</label>
          <input
            type="password"
            required
            className="w-full p-2 rounded bg-slate-700 border border-slate-600 focus:outline-none focus:border-blue-500 text-white"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
          />
        </div>
        <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 p-2 rounded font-bold transition">
          S'inscrire
        </button>
      </form>
    </div>
  );
}