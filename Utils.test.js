// utils.test.js — Tests unitaires avec Vitest
import { describe, it, expect } from 'vitest';
import {
  formatDate,
  formatDateFr,
  isWeekend,
  isHoliday,
  isBookableDay,
  canBook,
  getQuotaText,
  getMonthKey,
  validateMealRequest,
  validatePlanningRequest,
  getMonthOffset,
  getDaysInMonth,
  MAX_QUOTA,
} from './Utils.js';

// ══════════════════════════════════════════════
//  formatDate
// ══════════════════════════════════════════════
describe('formatDate', () => {
  it('formate correctement une date standard', () => {
    expect(formatDate(new Date(2025, 1, 14))).toBe('2025-02-14');
  });

  it('ajoute un zéro pour les mois et jours < 10', () => {
    expect(formatDate(new Date(2025, 0, 5))).toBe('2025-01-05');
  });

  it('gère décembre correctement', () => {
    expect(formatDate(new Date(2025, 11, 25))).toBe('2025-12-25');
  });
});

// ══════════════════════════════════════════════
//  formatDateFr
// ══════════════════════════════════════════════
describe('formatDateFr', () => {
  it('retourne une chaîne vide si dateStr est vide', () => {
    expect(formatDateFr('')).toBe('');
    expect(formatDateFr(null)).toBe('');
    expect(formatDateFr(undefined)).toBe('');
  });

  it('contient le nom du mois en français', () => {
    const result = formatDateFr('2025-02-14');
    expect(result).toContain('février');
  });

  it('contient le jour de la semaine en français', () => {
    const result = formatDateFr('2025-02-14'); // un vendredi
    expect(result).toContain('vendredi');
  });

  it('contient l\'année', () => {
    expect(formatDateFr('2025-02-14')).toContain('2025');
  });
});

// ══════════════════════════════════════════════
//  isWeekend
// ══════════════════════════════════════════════
describe('isWeekend', () => {
  it('samedi → true', () => {
    expect(isWeekend(new Date('2025-02-08'))).toBe(true); // samedi
  });

  it('dimanche → true', () => {
    expect(isWeekend(new Date('2025-02-09'))).toBe(true); // dimanche
  });

  it('lundi → false', () => {
    expect(isWeekend(new Date('2025-02-10'))).toBe(false);
  });

  it('mercredi → false', () => {
    expect(isWeekend(new Date('2025-02-05'))).toBe(false);
  });

  it('vendredi → false', () => {
    expect(isWeekend(new Date('2025-02-07'))).toBe(false);
  });
});

// ══════════════════════════════════════════════
//  isHoliday
// ══════════════════════════════════════════════
describe('isHoliday', () => {
  it('1er janvier → true', () => {
    expect(isHoliday(new Date('2025-01-01'))).toBe(true);
  });

  it('1er mai → true', () => {
    expect(isHoliday(new Date('2025-05-01'))).toBe(true);
  });

  it('14 juillet → true', () => {
    expect(isHoliday(new Date('2025-07-14'))).toBe(true);
  });

  it('25 décembre → true', () => {
    expect(isHoliday(new Date('2025-12-25'))).toBe(true);
  });

  it('un lundi normal → false', () => {
    expect(isHoliday(new Date('2025-02-10'))).toBe(false);
  });

  it('31 décembre → false (pas férié)', () => {
    expect(isHoliday(new Date('2025-12-31'))).toBe(false);
  });
});

// ══════════════════════════════════════════════
//  isBookableDay
// ══════════════════════════════════════════════
describe('isBookableDay', () => {
  const today = new Date('2025-02-10T12:00:00'); // un lundi fictif = "aujourd'hui"

  it('un weekend futur → réservable', () => {
    const samedi = new Date('2025-02-15'); // samedi dans le futur
    expect(isBookableDay(samedi, today)).toBe(true);
  });

  it('un jour férié futur → réservable', () => {
    const ferie = new Date('2025-05-01');
    expect(isBookableDay(ferie, today)).toBe(true);
  });

  it('un mercredi futur → non réservable', () => {
    const mercredi = new Date('2025-02-12');
    expect(isBookableDay(mercredi, today)).toBe(false);
  });

  it('un weekend passé → non réservable', () => {
    const samediPasse = new Date('2025-02-08'); // avant today
    expect(isBookableDay(samediPasse, today)).toBe(false);
  });

  it('aujourd\'hui si c\'est un weekend → réservable', () => {
    const todaySamedi = new Date('2025-02-08T12:00:00');
    expect(isBookableDay(todaySamedi, todaySamedi)).toBe(true);
  });
});

// ══════════════════════════════════════════════
//  canBook / quota
// ══════════════════════════════════════════════
describe('canBook', () => {
  it('quota 0 → peut réserver', () => {
    expect(canBook(0)).toBe(true);
  });

  it('quota 1 → peut réserver', () => {
    expect(canBook(1)).toBe(true);
  });

  it('quota 2 (MAX) → ne peut plus réserver', () => {
    expect(canBook(2)).toBe(false);
  });

  it('quota > MAX → ne peut plus réserver', () => {
    expect(canBook(5)).toBe(false);
  });
});

describe('getQuotaText', () => {
  it('0 utilisé → "Il te reste 2 créneaux"', () => {
    expect(getQuotaText(0)).toContain('2 créneaux');
  });

  it('1 utilisé → "Il te reste 1 créneau" (sans s)', () => {
    const text = getQuotaText(1);
    expect(text).toContain('1 créneau');
    expect(text).not.toContain('créneaux');
  });

  it('2 utilisés → message complet atteint', () => {
    expect(getQuotaText(2)).toContain('déjà réservés');
  });
});

// ══════════════════════════════════════════════
//  getMonthKey
// ══════════════════════════════════════════════
describe('getMonthKey', () => {
  it('extrait le bon mois', () => {
    expect(getMonthKey('2025-02-14')).toBe('2025-02');
  });

  it('fonctionne pour janvier', () => {
    expect(getMonthKey('2025-01-01')).toBe('2025-01');
  });

  it('fonctionne pour décembre', () => {
    expect(getMonthKey('2025-12-25')).toBe('2025-12');
  });
});

// ══════════════════════════════════════════════
//  validateMealRequest
// ══════════════════════════════════════════════
describe('validateMealRequest', () => {
  const validRequest = { food: 'Sushi', date: '2025-02-15', slot: 'soir' };

  it('requête valide → retourne null', () => {
    expect(validateMealRequest(validRequest)).toBeNull();
  });

  it('sans plat → erreur plat', () => {
    expect(validateMealRequest({ ...validRequest, food: '' })).toContain('manger');
  });

  it('plat vide avec espaces → erreur plat', () => {
    expect(validateMealRequest({ ...validRequest, food: '   ' })).toContain('manger');
  });

  it('sans date → erreur date', () => {
    expect(validateMealRequest({ ...validRequest, date: '' })).toContain('date');
  });

  it('sans créneau → erreur créneau', () => {
    expect(validateMealRequest({ ...validRequest, slot: null })).toContain('soir');
  });

  it('priorité : plat > date > créneau', () => {
    // Si plat manque, on parle du plat en premier
    const err = validateMealRequest({ food: '', date: '', slot: null });
    expect(err).toContain('manger');
  });
});

// ══════════════════════════════════════════════
//  validatePlanningRequest
// ══════════════════════════════════════════════
describe('validatePlanningRequest', () => {
  it('requête valide → retourne null', () => {
    expect(validatePlanningRequest({ comment: 'Mode doux 🕯️', quotaUsed: 0 })).toBeNull();
  });

  it('sans commentaire → erreur', () => {
    expect(validatePlanningRequest({ comment: '', quotaUsed: 0 })).toContain('envie');
  });

  it('commentaire avec espaces seulement → erreur', () => {
    expect(validatePlanningRequest({ comment: '   ', quotaUsed: 0 })).toContain('envie');
  });

  it('quota atteint → erreur quota (priorité sur commentaire)', () => {
    const err = validatePlanningRequest({ comment: 'quelque chose', quotaUsed: 2 });
    expect(err).toContain('2 moments');
  });

  it('quota atteint sans commentaire → erreur quota quand même', () => {
    const err = validatePlanningRequest({ comment: '', quotaUsed: 2 });
    expect(err).toContain('2 moments');
  });
});

// ══════════════════════════════════════════════
//  getMonthOffset
// ══════════════════════════════════════════════
describe('getMonthOffset', () => {
  it('février 2025 commence un samedi → offset 5', () => {
    // 1er fév 2025 = samedi (getDay() = 6) → (6+6)%7 = 5
    expect(getMonthOffset(2025, 1)).toBe(5);
  });

  it('janvier 2025 commence un mercredi → offset 2', () => {
    // 1er jan 2025 = mercredi (getDay() = 3) → (3+6)%7 = 2
    expect(getMonthOffset(2025, 0)).toBe(2);
  });
});

// ══════════════════════════════════════════════
//  getDaysInMonth
// ══════════════════════════════════════════════
describe('getDaysInMonth', () => {
  it('février 2025 → 28 jours (pas bissextile)', () => {
    expect(getDaysInMonth(2025, 1)).toBe(28);
  });

  it('février 2024 → 29 jours (bissextile)', () => {
    expect(getDaysInMonth(2024, 1)).toBe(29);
  });

  it('janvier → 31 jours', () => {
    expect(getDaysInMonth(2025, 0)).toBe(31);
  });

  it('avril → 30 jours', () => {
    expect(getDaysInMonth(2025, 3)).toBe(30);
  });

  it('décembre → 31 jours', () => {
    expect(getDaysInMonth(2025, 11)).toBe(31);
  });
});