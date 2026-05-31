// admin.utils.test.js — Tests unitaires admin + Auth Firebase (mocké)
import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  statusLabel,
  isPending,
  isAccepted,
  isDeclined,
  computeStats,
  isUnavailable,
  addUnavailableDate,
  removeUnavailableDate,
  updateRequestStatus,
  filterByStatus,
  extractBookedDates,
  isValidUser,
  validateLoginForm,
  getAuthErrorMessage,
  formatDateFr,
} from './Admin.utils.js';

// ══════════════════════════════════════════════
//  DONNÉES DE TEST RÉUTILISABLES
// ══════════════════════════════════════════════
const MEAL_PENDING   = { id: '1', food: 'Sushi',  date: '2025-02-08', slot: 'soir', status: 'pending' };
const MEAL_ACCEPTED  = { id: '2', food: 'Pizza',  date: '2025-02-15', slot: 'midi', status: 'accepted' };
const MEAL_DECLINED  = { id: '3', food: 'Burger', date: '2025-02-22', slot: 'soir', status: 'declined' };

const PLANNING_PENDING  = { id: '4', date: '2025-02-09', comment: 'Mode doux', status: 'pending' };
const PLANNING_ACCEPTED = { id: '5', date: '2025-02-16', comment: 'Surprise',  status: 'accepted' };
const PLANNING_DECLINED = { id: '6', date: '2025-02-23', comment: 'Reporter',  status: 'declined' };

const ACTIVITY_PENDING = { id: '7', activity: 'Bain moussant', date: '2025-02-14', status: 'pending' };

// ══════════════════════════════════════════════
//  statusLabel
// ══════════════════════════════════════════════
describe('statusLabel', () => {
  it('pending → label en attente', () => {
    expect(statusLabel('pending')).toBe('⏳ En attente');
  });

  it('accepted → label accepté', () => {
    expect(statusLabel('accepted')).toBe('✅ Accepté');
  });

  it('declined → label refusé', () => {
    expect(statusLabel('declined')).toBe('❌ Refusé');
  });

  it('statut inconnu → retourne la valeur brute', () => {
    expect(statusLabel('cancelled')).toBe('cancelled');
    expect(statusLabel('')).toBe('');
  });
});

// ══════════════════════════════════════════════
//  isPending / isAccepted / isDeclined
// ══════════════════════════════════════════════
describe('isPending / isAccepted / isDeclined', () => {
  it('isPending → true seulement sur pending', () => {
    expect(isPending(MEAL_PENDING)).toBe(true);
    expect(isPending(MEAL_ACCEPTED)).toBe(false);
    expect(isPending(MEAL_DECLINED)).toBe(false);
  });

  it('isAccepted → true seulement sur accepted', () => {
    expect(isAccepted(MEAL_ACCEPTED)).toBe(true);
    expect(isAccepted(MEAL_PENDING)).toBe(false);
  });

  it('isDeclined → true seulement sur declined', () => {
    expect(isDeclined(MEAL_DECLINED)).toBe(true);
    expect(isDeclined(MEAL_PENDING)).toBe(false);
  });
});

// ══════════════════════════════════════════════
//  computeStats
// ══════════════════════════════════════════════
describe('computeStats', () => {
  it('compte correctement chaque catégorie', () => {
    const stats = computeStats({
      meals:      [MEAL_PENDING, MEAL_ACCEPTED],
      planning:   [PLANNING_PENDING],
      activities: [ACTIVITY_PENDING],
    });
    expect(stats.meals).toBe(2);
    expect(stats.planning).toBe(1);
    expect(stats.activities).toBe(1);
  });

  it('compte uniquement les pending dans le compteur global', () => {
    const stats = computeStats({
      meals:      [MEAL_PENDING, MEAL_ACCEPTED, MEAL_DECLINED],
      planning:   [PLANNING_ACCEPTED],
      activities: [ACTIVITY_PENDING],
    });
    // pending : MEAL_PENDING + ACTIVITY_PENDING = 2
    expect(stats.pending).toBe(2);
  });

  it('retourne 0 partout si les listes sont vides', () => {
    const stats = computeStats({ meals: [], planning: [], activities: [] });
    expect(stats.meals).toBe(0);
    expect(stats.planning).toBe(0);
    expect(stats.activities).toBe(0);
    expect(stats.pending).toBe(0);
  });

  it('fonctionne sans passer toutes les clés', () => {
    const stats = computeStats({ meals: [MEAL_PENDING] });
    expect(stats.meals).toBe(1);
    expect(stats.planning).toBe(0);
    expect(stats.pending).toBe(1);
  });
});

// ══════════════════════════════════════════════
//  isUnavailable / addUnavailableDate / removeUnavailableDate
// ══════════════════════════════════════════════
describe('isUnavailable', () => {
  const unavailable = ['2025-02-08', '2025-02-15'];

  it('date dans la liste → true', () => {
    expect(isUnavailable('2025-02-08', unavailable)).toBe(true);
  });

  it('date absente → false', () => {
    expect(isUnavailable('2025-02-09', unavailable)).toBe(false);
  });

  it('liste vide → false', () => {
    expect(isUnavailable('2025-02-08', [])).toBe(false);
  });
});

describe('addUnavailableDate', () => {
  it('ajoute une date absente', () => {
    const result = addUnavailableDate('2025-02-22', ['2025-02-08']);
    expect(result).toContain('2025-02-22');
    expect(result).toContain('2025-02-08');
    expect(result).toHaveLength(2);
  });

  it('ne duplique pas une date déjà présente', () => {
    const result = addUnavailableDate('2025-02-08', ['2025-02-08']);
    expect(result).toHaveLength(1);
  });

  it('ne mute pas la liste originale', () => {
    const original = ['2025-02-08'];
    addUnavailableDate('2025-02-22', original);
    expect(original).toHaveLength(1); // inchangée
  });
});

describe('removeUnavailableDate', () => {
  it('retire une date présente', () => {
    const result = removeUnavailableDate('2025-02-08', ['2025-02-08', '2025-02-15']);
    expect(result).not.toContain('2025-02-08');
    expect(result).toContain('2025-02-15');
  });

  it('ne plante pas si la date est absente', () => {
    const result = removeUnavailableDate('2025-03-01', ['2025-02-08']);
    expect(result).toEqual(['2025-02-08']);
  });

  it('ne mute pas la liste originale', () => {
    const original = ['2025-02-08', '2025-02-15'];
    removeUnavailableDate('2025-02-08', original);
    expect(original).toHaveLength(2); // inchangée
  });

  it('retourne liste vide si c\'était le seul élément', () => {
    const result = removeUnavailableDate('2025-02-08', ['2025-02-08']);
    expect(result).toEqual([]);
  });
});

// ══════════════════════════════════════════════
//  updateRequestStatus
// ══════════════════════════════════════════════
describe('updateRequestStatus', () => {
  const requests = [MEAL_PENDING, MEAL_ACCEPTED, MEAL_DECLINED];

  it('met à jour le bon élément', () => {
    const result = updateRequestStatus(requests, '1', 'accepted');
    const updated = result.find(r => r.id === '1');
    expect(updated.status).toBe('accepted');
  });

  it('ne touche pas les autres éléments', () => {
    const result = updateRequestStatus(requests, '1', 'accepted');
    const untouched = result.find(r => r.id === '2');
    expect(untouched.status).toBe('accepted'); // inchangé
  });

  it('ne mute pas la liste originale', () => {
    updateRequestStatus(requests, '1', 'accepted');
    expect(requests[0].status).toBe('pending'); // original intact
  });

  it('retourne la liste intacte si l\'id n\'existe pas', () => {
    const result = updateRequestStatus(requests, 'inexistant', 'accepted');
    expect(result).toEqual(requests);
  });
});

// ══════════════════════════════════════════════
//  filterByStatus
// ══════════════════════════════════════════════
describe('filterByStatus', () => {
  const requests = [MEAL_PENDING, MEAL_ACCEPTED, MEAL_DECLINED, PLANNING_PENDING];

  it('filtre correctement les pending', () => {
    const result = filterByStatus(requests, 'pending');
    expect(result).toHaveLength(2);
    result.forEach(r => expect(r.status).toBe('pending'));
  });

  it('filtre correctement les accepted', () => {
    const result = filterByStatus(requests, 'accepted');
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('2');
  });

  it('retourne tableau vide si aucun match', () => {
    expect(filterByStatus([], 'pending')).toEqual([]);
  });
});

// ══════════════════════════════════════════════
//  extractBookedDates
// ══════════════════════════════════════════════
describe('extractBookedDates', () => {
  const planningRequests = [PLANNING_PENDING, PLANNING_ACCEPTED, PLANNING_DECLINED];

  it('inclut les dates pending et accepted', () => {
    const dates = extractBookedDates(planningRequests);
    expect(dates).toContain('2025-02-09'); // pending
    expect(dates).toContain('2025-02-16'); // accepted
  });

  it('exclut les dates déclinées', () => {
    const dates = extractBookedDates(planningRequests);
    expect(dates).not.toContain('2025-02-23'); // declined
  });

  it('retourne tableau vide si liste vide', () => {
    expect(extractBookedDates([])).toEqual([]);
  });

  it('retourne tableau vide si tout est décliné', () => {
    expect(extractBookedDates([PLANNING_DECLINED])).toEqual([]);
  });
});

// ══════════════════════════════════════════════
//  isValidUser — objet Firebase Auth simulé
// ══════════════════════════════════════════════
describe('isValidUser', () => {
  it('utilisateur Firebase valide → true', () => {
    // On simule ce que Firebase Auth renvoie dans onAuthStateChanged
    const fakeUser = { uid: 'abc123', email: 'toi@gmail.com' };
    expect(isValidUser(fakeUser)).toBe(true);
  });

  it('null (déconnecté) → false', () => {
    // Firebase passe null à onAuthStateChanged quand déconnecté
    expect(isValidUser(null)).toBe(false);
  });

  it('undefined → false', () => {
    expect(isValidUser(undefined)).toBe(false);
  });

  it('objet sans email → false', () => {
    expect(isValidUser({ uid: 'abc123' })).toBe(false);
  });

  it('email vide → false', () => {
    expect(isValidUser({ uid: 'abc123', email: '' })).toBe(false);
  });

  it('uid vide → false', () => {
    expect(isValidUser({ uid: '', email: 'toi@gmail.com' })).toBe(false);
  });
});

// ══════════════════════════════════════════════
//  validateLoginForm
// ══════════════════════════════════════════════
describe('validateLoginForm', () => {
  const validForm = { email: 'toi@gmail.com', password: 'monAmour2024!' };

  it('formulaire valide → null', () => {
    expect(validateLoginForm(validForm)).toBeNull();
  });

  it('email vide → erreur', () => {
    expect(validateLoginForm({ ...validForm, email: '' })).toContain('Email');
  });

  it('email sans @ → invalide', () => {
    expect(validateLoginForm({ ...validForm, email: 'pasEmail' })).toContain('invalide');
  });

  it('password vide → erreur', () => {
    expect(validateLoginForm({ ...validForm, password: '' })).toContain('Mot de passe');
  });

  it('password trop court (< 6 chars) → erreur', () => {
    expect(validateLoginForm({ ...validForm, password: '123' })).toContain('court');
  });

  it('email avec espaces seulement → erreur', () => {
    expect(validateLoginForm({ ...validForm, email: '   ' })).toContain('Email');
  });
});

// ══════════════════════════════════════════════
//  getAuthErrorMessage — codes Firebase Auth
// ══════════════════════════════════════════════
describe('getAuthErrorMessage', () => {
  it('user-not-found → message lisible', () => {
    const msg = getAuthErrorMessage('auth/user-not-found');
    expect(msg).toContain('email');
  });

  it('wrong-password → message lisible', () => {
    const msg = getAuthErrorMessage('auth/wrong-password');
    expect(msg).toContain('incorrect');
  });

  it('too-many-requests → message lisible', () => {
    const msg = getAuthErrorMessage('auth/too-many-requests');
    expect(msg).toContain('tentatives');
  });

  it('invalid-credential → message lisible (nouveau code Firebase)', () => {
    // Firebase v9+ utilise ce code à la place de user-not-found/wrong-password
    const msg = getAuthErrorMessage('auth/invalid-credential');
    expect(msg).toContain('incorrect');
  });

  it('code inconnu → message générique', () => {
    const msg = getAuthErrorMessage('auth/unknown-error');
    expect(msg).toContain('erreur');
  });
});

// ══════════════════════════════════════════════
//  Mock Firebase Auth — test du flow complet
//  On simule onAuthStateChanged sans appeler Firebase
// ══════════════════════════════════════════════
describe('Flow auth simulé (mock Firebase)', () => {

  it('onAuthStateChanged appelle le callback avec un user valide', () => {
    // Simule Firebase Auth avec vi.fn()
    const fakeUser = { uid: 'abc123', email: 'toi@gmail.com' };
    const mockOnAuthStateChanged = vi.fn((auth, callback) => {
      callback(fakeUser); // simule : utilisateur connecté
    });

    let receivedUser = null;
    mockOnAuthStateChanged({}, (user) => {
      receivedUser = user;
    });

    expect(mockOnAuthStateChanged).toHaveBeenCalledOnce();
    expect(isValidUser(receivedUser)).toBe(true);
    expect(receivedUser.email).toBe('toi@gmail.com');
  });

  it('onAuthStateChanged appelle le callback avec null si déconnecté', () => {
    const mockOnAuthStateChanged = vi.fn((auth, callback) => {
      callback(null); // simule : déconnecté
    });

    let receivedUser = 'non-null'; // valeur initiale pour vérifier le changement
    mockOnAuthStateChanged({}, (user) => {
      receivedUser = user;
    });

    expect(isValidUser(receivedUser)).toBe(false);
  });

  it('signInWithEmailAndPassword est appelé avec les bons paramètres', async () => {
    const mockSignIn = vi.fn().mockResolvedValue({
      user: { uid: 'abc123', email: 'toi@gmail.com' }
    });

    const result = await mockSignIn({}, 'toi@gmail.com', 'monAmour2024!');

    expect(mockSignIn).toHaveBeenCalledWith({}, 'toi@gmail.com', 'monAmour2024!');
    expect(isValidUser(result.user)).toBe(true);
  });

  it('signInWithEmailAndPassword rejette si mauvais mot de passe', async () => {
    const mockSignIn = vi.fn().mockRejectedValue({
      code: 'auth/invalid-credential'
    });

    try {
      await mockSignIn({}, 'toi@gmail.com', 'mauvaisMotDePasse');
      expect(true).toBe(false); // ne doit pas arriver
    } catch (err) {
      const msg = getAuthErrorMessage(err.code);
      expect(msg).toContain('incorrect');
    }
  });

  it('signOut est appelé correctement', async () => {
    const mockSignOut = vi.fn().mockResolvedValue(undefined);
    await mockSignOut({});
    expect(mockSignOut).toHaveBeenCalledOnce();
  });
});