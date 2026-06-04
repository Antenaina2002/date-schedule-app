# 🌸 Date avec mon amour

[![License: ISC](https://img.shields.io/badge/License-ISC-ff69b4.svg)](https://opensource.org/licenses/ISC)
[![Version: 1.0.0](https://img.shields.io/badge/Version-1.0.0-f2a7b8.svg)](#)
[![Stack: Vanilla JS](https://img.shields.io/badge/Stack-Vanilla_JS-fdf8f5.svg?logo=javascript)](#)
[![Backend: Firebase](https://img.shields.io/badge/Backend-Firebase-ffca28.svg?logo=firebase)](#)

> **Une application web romantique pour planifier des moments à deux — repas, câlins et activités — dans une interface douce et intime.**

---

## ✨ Aperçu

**Date avec mon amour** est une single-page app pensée pour un usage ultra-personnel : permettre à une personne de proposer des moments à partager (repas, câlins, activités) pendant que l'autre — l'admin — gère les disponibilités et répond aux propositions.

L'interface côté client est douce, rose, animée. L'interface admin est claire et fonctionnelle. Les deux communiquent via Firebase Firestore en temps réel.

---

## 🎯 Fonctionnalités détaillées

### 🌹 Côté Elle — `index.html`

L'interface client est organisée en **5 onglets** thématiques :

#### 🍽️ Onglet Repas
Elle peut proposer un repas en 3 étapes :
1.  **Choisir un plat** : Une grille de plats illustrés (Pizza, Sushi, Burger, Ramen...) ou un champ libre pour une envie personnalisée.
2.  **Choisir une date et un créneau** : Sélection via un calendrier natif (dates passées bloquées) et choix entre `🌞 Déjeuner · Midi` et `🌙 Dîner · Soir`.
3.  **Ajouter un petit mot** : Un message romantique pour accompagner la proposition.
À l'envoi, des confettis roses envahissent l'écran ! 🎊

#### 🔥 Onglet Planning Câlins
Soumis à des règles métier strictes :
- **Restriction temporelle** : Accessible uniquement le week-end et les jours fériés.
- **Quota mensuel** : Elle dispose de **2 créneaux maximum par mois**. Un indicateur visuel montre l'état du quota.
- **Calendrier intelligent** : Affiche les jours réservés, les dates passées désactivées et les dates bloquées par l'admin.
- **Réservation** : Possibilité d'ajouter un "commentaire secret" (ex: *"Mode doux 🕯️"*) lors de la sélection d'un jour.

#### ✨ Onglet Activités
Une grille d'activités romantiques (Massage, Ciné, Étoiles, Bain moussant...). Au clic, un formulaire permet de préciser la date souhaitée et d'ajouter un message.

#### 💌 Onglet Réponses
Un fil historique permettant de consulter les décisions de l'admin pour chaque demande, incluant les messages d'acceptation ou les raisons d'un refus.

#### 💬 Onglet Nous
Un chat privé et sécurisé en temps réel pour échanger des messages instantanés avec son amoureux.

---

### 🔐 Côté Lui — `admin.html`

L'interface admin est protégée par **Firebase Authentication** (email + mot de passe).

#### 📊 Tableau de bord
Affiche 4 compteurs clés : Repas, Moments, Activités, et le total des demandes en attente.

#### 📅 Calendrier Global
Un calendrier mensuel permettant de :
- Visualiser les week-ends et jours fériés.
- Voir les dates ayant déjà fait l'objet d'une réservation.
- **Bloquer/Débloquer des dates** : Marquer des jours comme "Indisponible" pour qu'ils ne soient pas réservables côté client.

#### 📋 Gestion des propositions
Listes détaillées pour chaque catégorie (Repas, Câlins, Activités) avec les boutons `✅ Accepter` et `❌ Refuser`. En cas de refus, l'admin peut laisser un message explicatif.

#### 💬 Fil Secret & Feedbacks
- Répondre aux messages du chat en temps réel.
- Consulter les feedbacks et humeurs envoyés.

---

## 🛠️ Architecture Technique

### Stack
| Couche | Technologie | Pourquoi |
| :--- | :--- | :--- |
| **Frontend** | HTML + CSS + JS Vanilla | Zéro build, modules ES natifs |
| **Styles** | CSS Custom Properties | Design system cohérent sans framework |
| **Base de données**| Firebase Firestore | Temps réel, NoSQL, gratuit |
| **Authentification**| Firebase Auth | Sécurité réelle sans serveur |
| **Tests** | Vitest | Rapide, ESM natif |

### Architecture des fichiers
```text
date-app/
├── 📄 index.html          # Interface client
├── 📄 admin.html          # Interface admin
├── 📄 Utils.js            # Logique métier client
├── 📄 admin.utils.js      # Logique métier admin (Auth, Stats)
├── 📄 Utils.test.js       # Tests unitaires client (51 tests)
├── 📄 admin.utils.test.js # Tests unitaires admin (54 tests)
├── ⚙️ package.json        # Configuration et dépendances
└── 📘 README.md           # Documentation
```

---

## 🎨 Design System

Couleurs définies via des **CSS custom properties** sur `:root` :
```css
:root {
  --rose:       #f2a7b8;   /* Rose principal */
  --rose-deep:  #d4688a;   /* Rose profond (CTA, accents) */
  --rose-light: #fce8ef;   /* Rose clair (hover, sélection) */
  --rose-pale:  #fff5f8;   /* Rose très pâle (fonds) */
  --cream:      #fdf8f5;   /* Crème (fond de page) */
  --text:       #3d2535;   /* Texte principal */
}
```
**Animations** : `float` pour les cœurs du header, `fadeIn` pour les sections, `modalIn` avec rebond, et `confettiFall` pour les succès.

---

## 🛡️ Sécurité & Firestore

### Collections
- `mealRequests` : Propositions de repas.
- `planningRequests` : Moments câlins réservés (avec `month` pour le quota).
- `activityRequests` : Idées d'activités.
- `messages` : Fil de discussion en temps réel.
- `feedbacks` : Humeurs et retours.
- `unavailableDates` : Dates bloquées par l'admin.

### Règles Firestore
L'accès est restreint pour garantir la vie privée du couple :
- **Création** : Libre pour les demandes initiales.
- **Lecture/Modif** : Uniquement pour l'administrateur authentifié.

---

## 🧪 Tests

L'application intègre **105 tests unitaires** pour garantir la fiabilité de la logique métier.

### Ce qui est testé
- **Logique Client (`Utils.js`)** : Formatage des dates, détection des week-ends/fériés, validation du quota mensuel, validation des formulaires.
- **Logique Admin (`admin.utils.js`)** : Calcul des stats, gestion des listes immuables, validation du login, traduction des erreurs Auth Firebase.

### Technique de Mock
Utilisation de `vi.fn()` de Vitest pour simuler Firebase sans appels réseau.

### Lancer les tests
```bash
npm install
npm test -- --run
```

---

*Fait avec ❤️ — pour que chaque moment soit parfait.*
