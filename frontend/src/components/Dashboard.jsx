import { useNavigate } from 'react-router-dom';

export default function Dashboard() {
  const navigate = useNavigate();
  
  // On récupère les infos de l'utilisateur sauvegardées lors du login
  const userString = localStorage.getItem('user');
  const user = userString ? JSON.parse(userString) : { username: 'Joueur' };

  const handleLogout = () => {
    // Pour se déconnecter, on vide simplement la mémoire du navigateur...
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    // ... et on renvoie vers l'accueil
    navigate('/');
    window.location.reload(); // Force la mise à jour de la barre de navigation
  };

  return (
    <div className="max-w-4xl mx-auto mt-10 p-6 bg-slate-800 rounded-lg shadow-xl text-white">
      <div className="flex justify-between items-center mb-8 border-b border-slate-700 pb-4">
        <h2 className="text-3xl font-bold">Tableau de Bord</h2>
        <button 
          onClick={handleLogout}
          className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded text-sm font-bold transition"
        >
          Se déconnecter
        </button>
      </div>
      
      <div className="bg-slate-700 p-6 rounded text-center">
        <h3 className="text-xl mb-2">Bienvenue, <span className="text-blue-400 font-bold">{user.username}</span> !</h3>
        <p className="text-slate-300">
          Votre espace est prêt. Dès que les administrateurs auront ajouté les matchs, vous pourrez commencer à faire vos pronostics ici.
        </p>
      </div>
    </div>
  );
}