// admin.utils.js — Logique pure extraite de admin.html
// Aucune dépendance au DOM, Firebase, ni Auth
// → Testable directement avec Vitest

// ══════════════════════════════════════════════
//  STATUTS
// ══════════════════════════════════════════════

/**
 * Traduit un statut technique en label français affiché
 */
export function statusLabel(status) {
    const labels = {
      pending:  '⏳ En attente',
      accepted: '✅ Accepté',
      declined: '❌ Refusé',
    };
    return labels[status] ?? status;
  }
  
  /**
   * Retourne true si la requête est en attente de décision
   */
  export function isPending(request) {
    return request.status === 'pending';
  }
  
  /**
   * Retourne true si la requête a été acceptée
   */
  export function isAccepted(request) {
    return request.status === 'accepted';
  }
  
  /**
   * Retourne true si la requête a été refusée
   */
  export function isDeclined(request) {
    return request.status === 'declined';
  }
  
  // ══════════════════════════════════════════════
  //  STATS
  // ══════════════════════════════════════════════
  
  /**
   * Calcule les statistiques globales à partir des listes de requêtes
   * @param {{ meals, planning, activities }} requests
   * @returns {{ meals, planning, activities, pending }}
   */
  export function computeStats({ meals = [], planning = [], activities = [] }) {
    const all = [...meals, ...planning, ...activities];
    return {
      meals:      meals.length,
      planning:   planning.length,
      activities: activities.length,
      pending:    all.filter(r => r.status === 'pending').length,
    };
  }
  
  // ══════════════════════════════════════════════
  //  DATES BLOQUÉES
  // ══════════════════════════════════════════════
  
  /**
   * Retourne true si une date est dans la liste des dates indisponibles
   */
  export function isUnavailable(dateStr, unavailableDates = []) {
    return unavailableDates.includes(dateStr);
  }
  
  /**
   * Ajoute une date à la liste si elle n'y est pas déjà
   * (sans muter l'original — retourne une nouvelle liste)
   */
  export function addUnavailableDate(dateStr, unavailableDates = []) {
    if (unavailableDates.includes(dateStr)) return unavailableDates;
    return [...unavailableDates, dateStr];
  }
  
  /**
   * Retire une date de la liste des indisponibilités
   * (sans muter l'original — retourne une nouvelle liste)
   */
  export function removeUnavailableDate(dateStr, unavailableDates = []) {
    return unavailableDates.filter(d => d !== dateStr);
  }
  
  // ══════════════════════════════════════════════
  //  REQUÊTES — MUTATIONS LOCALES
  // ══════════════════════════════════════════════
  
  /**
   * Met à jour le statut d'une requête dans une liste
   * Retourne une nouvelle liste (immutable)
   */
  export function updateRequestStatus(requests, id, newStatus) {
    return requests.map(r => r.id === id ? { ...r, status: newStatus } : r);
  }
  
  /**
   * Filtre les requêtes par statut
   */
  export function filterByStatus(requests, status) {
    return requests.filter(r => r.status === status);
  }
  
  /**
   * Extrait les dates réservées depuis les requêtes planning
   * (exclut les refusées)
   */
  export function extractBookedDates(planningRequests = []) {
    return planningRequests
      .filter(r => r.status !== 'declined')
      .map(r => r.date);
  }
  
  // ══════════════════════════════════════════════
  //  AUTH — ÉTAT DE CONNEXION
  // ══════════════════════════════════════════════
  
  /**
   * Retourne true si l'utilisateur Firebase est valide (connecté)
   * On teste la forme de l'objet, pas Firebase lui-même
   */
  export function isValidUser(user) {
    return (
      user !== null &&
      user !== undefined &&
      typeof user.email === 'string' &&
      user.email.length > 0 &&
      typeof user.uid === 'string' &&
      user.uid.length > 0
    );
  }
  
  /**
   * Valide le format d'un email avant d'appeler Firebase Auth
   */
  export function validateLoginForm({ email, password }) {
    if (!email || email.trim() === '') return 'Email requis';
    if (!email.includes('@')) return 'Email invalide';
    if (!password || password.trim() === '') return 'Mot de passe requis';
    if (password.length < 6) return 'Mot de passe trop court (min. 6 caractères)';
    return null;
  }
  
  /**
   * Traduit les codes d'erreur Firebase Auth en messages lisibles
   */
  export function getAuthErrorMessage(errorCode) {
    const messages = {
      'auth/user-not-found':      'Aucun compte avec cet email 😕',
      'auth/wrong-password':      'Mot de passe incorrect 😕',
      'auth/invalid-email':       'Email invalide',
      'auth/too-many-requests':   'Trop de tentatives, réessaie plus tard',
      'auth/network-request-failed': 'Problème de connexion réseau',
      'auth/invalid-credential':  'Email ou mot de passe incorrect 😕',
    };
    return messages[errorCode] ?? 'Une erreur est survenue, réessaie';
  }
  
  // ══════════════════════════════════════════════
  //  FORMATAGE (partagées avec utils.js)
  // ══════════════════════════════════════════════
  
  export function formatDateFr(dateStr) {
    if (!dateStr) return '';
    const d = new Date(dateStr + 'T00:00:00');
    return d.toLocaleDateString('fr-FR', {
      weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
    });
  }
  
  export function formatDate(d) {
    return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
  }