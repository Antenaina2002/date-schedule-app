// Admin.utils.js — Logic pure pour l'interface admin

/**
 * Retourne un label lisible en français pour chaque statut
 */
export function statusLabel(status) {
  switch (status) {
    case 'pending': return '⏳ En attente';
    case 'accepted': return '✅ Accepté';
    case 'declined': return '❌ Refusé';
    default: return status;
  }
}

export const isPending = (item) => item.status === 'pending';
export const isAccepted = (item) => item.status === 'accepted';
export const isDeclined = (item) => item.status === 'declined';

/**
 * Calcule les statistiques globales pour le tableau de bord
 */
export function computeStats({ meals = [], planning = [], activities = [] } = {}) {
  const pending = [
    ...meals.filter(isPending),
    ...planning.filter(isPending),
    ...activities.filter(isPending)
  ].length;

  return {
    meals: meals.length,
    planning: planning.length,
    activities: activities.length,
    pending
  };
}

/**
 * Gestion des dates indisponibles
 */
export const isUnavailable = (date, list) => list.includes(date);

export function addUnavailableDate(date, list) {
  if (list.includes(date)) return [...list];
  return [...list, date];
}

export function removeUnavailableDate(date, list) {
  return list.filter(d => d !== date);
}

/**
 * Met à jour le statut d'une demande dans une liste locale (immutable)
 */
export function updateRequestStatus(list, id, status) {
  return list.map(item => item.id === id ? { ...item, status } : item);
}

export function filterByStatus(list, status) {
  return list.filter(item => item.status === status);
}

/**
 * Extrait les dates réservées (pending ou accepted) pour affichage calendrier
 */
export function extractBookedDates(list) {
  return list
    .filter(item => item.status !== 'declined')
    .map(item => item.date);
}

/**
 * Valide si l'objet user de Firebase est "complet" pour notre usage
 */
export function isValidUser(user) {
  if (!user) return false;
  if (!user.uid || !user.email) return false;
  return user.email.trim() !== '' && user.uid.trim() !== '';
}

/**
 * Validation locale du formulaire de login
 */
export function validateLoginForm({ email, password }) {
  if (!email || email.trim() === '') return 'L’Email est requis.';
  if (!email.includes('@')) return 'Email invalide.';
  if (!password || password.trim() === '') return 'Le Mot de passe est requis.';
  if (password.length < 6) return 'Le mot de passe est trop court (min 6 caractères).';
  return null;
}

/**
 * Traduction des codes d'erreur Firebase Auth en français
 */
export function getAuthErrorMessage(code) {
  switch (code) {
    case 'auth/user-not-found':
      return 'Aucun compte ne correspond à cet email.';
    case 'auth/wrong-password':
      return 'Mot de passe incorrect.';
    case 'auth/too-many-requests':
      return 'Trop de tentatives. Réessaie plus tard.';
    case 'auth/invalid-credential':
      return 'Identifiants incorrects.';
    case 'auth/network-request-failed':
      return 'Erreur réseau. Vérifie ta connexion.';
    default:
      return 'Une erreur est survenue lors de la connexion.';
  }
}

/**
 * Formate une date string YYYY-MM-DD en français lisible
 */
export function formatDateFr(dateStr) {
  if (!dateStr) return '';
  try {
    const d = new Date(dateStr + 'T00:00:00');
    if (isNaN(d.getTime())) return dateStr;
    return d.toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  } catch (e) {
    return dateStr;
  }
}
