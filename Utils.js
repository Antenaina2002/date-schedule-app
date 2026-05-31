// utils.js — Fonctions pures extraites de index.html
// Ces fonctions n'ont aucune dépendance au DOM ni à Firebase
// → Testables directement avec Vitest

export const MAX_QUOTA = 2;

export const HOLIDAYS = [
  '01-01','04-01','05-01','05-08','05-09','05-20','07-14',
  '08-15','11-01','11-11','12-25','04-21','05-29','06-09',
];

/**
 * Formate une date JS en string YYYY-MM-DD
 */
export function formatDate(d) {
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
}

/**
 * Formate une date string YYYY-MM-DD en français lisible
 */
export function formatDateFr(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('fr-FR', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
  });
}

/**
 * Retourne true si le jour est un weekend (sam ou dim)
 */
export function isWeekend(date) {
  const day = date.getDay();
  return day === 0 || day === 6;
}

/**
 * Retourne true si la date est un jour férié français
 */
export function isHoliday(date) {
  const key = `${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')}`;
  return HOLIDAYS.includes(key);
}

/**
 * Retourne true si la date est réservable (weekend ou férié, non passée)
 */
export function isBookableDay(date, today = new Date()) {
  const isPast = date < today && date.toDateString() !== today.toDateString();
  if (isPast) return false;
  return isWeekend(date) || isHoliday(date);
}

/**
 * Retourne true si le quota n'est pas atteint
 */
export function canBook(quotaUsed) {
  return quotaUsed < MAX_QUOTA;
}

/**
 * Retourne le texte du quota selon le nombre utilisé
 */
export function getQuotaText(quotaUsed) {
  if (quotaUsed >= MAX_QUOTA) {
    return 'Tes 2 moments sont déjà réservés ce mois-ci ❤️';
  }
  const remaining = MAX_QUOTA - quotaUsed;
  return `Il te reste ${remaining} créneau${remaining > 1 ? 'x' : ''} ce mois-ci`;
}

/**
 * Retourne le mois au format YYYY-MM depuis une date string YYYY-MM-DD
 */
export function getMonthKey(dateStr) {
  return dateStr.slice(0, 7);
}

/**
 * Valide une proposition de repas — retourne null si ok, string d'erreur sinon
 */
export function validateMealRequest({ food, date, slot }) {
  if (!food || food.trim() === '') return 'Choisis quelque chose à manger 😋';
  if (!date) return 'Choisis une date mon amour 📅';
  if (!slot) return 'Midi ou soir ? 🌞🌙';
  return null;
}

/**
 * Valide une proposition de planning — retourne null si ok, string sinon
 */
export function validatePlanningRequest({ comment, quotaUsed }) {
  if (quotaUsed >= MAX_QUOTA) return 'Tu as déjà utilisé tes 2 moments ce mois-ci ❤️';
  if (!comment || comment.trim() === '') return 'Dis-moi ce dont tu as envie… 🌸';
  return null;
}

/**
 * Calcule le décalage du premier jour du mois (lundi = 0)
 */
export function getMonthOffset(year, month) {
  const firstDay = new Date(year, month, 1).getDay();
  return (firstDay + 6) % 7;
}

/**
 * Retourne le nombre de jours dans un mois
 */
export function getDaysInMonth(year, month) {
  return new Date(year, month + 1, 0).getDate();
}