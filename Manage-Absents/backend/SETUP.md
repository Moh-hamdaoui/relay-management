# Relay — Instructions de mise en place

## Prérequis

- [Node.js](https://nodejs.org/) (v18+)
- Git

> Pas de serveur de base de données à installer — Relay utilise **SQLite**, la base est un simple fichier local généré automatiquement au démarrage.

---

## 1. Cloner le projet

```bash
git clone <url-du-repo>
cd relay
```

---

## 2. Installer les dépendances

```bash
npm install
```

---

## 3. Configurer les variables d'environnement

```bash
cp .env.example .env
```

Ouvre `.env` et remplis les valeurs manquantes.

---

## 4. Lancer le serveur

```bash
npm run dev
```

Au premier démarrage, deux choses se passent automatiquement :

- `db/initDb.js` lit `schema.sql` et crée la base `relay.db` avec toutes les tables
- `db/seedData.js` (`seedMinimalIfEmpty`) insère un petit jeu de test si la base est vide

Tu dois voir dans la console :

```
✅ Base de données initialisée
✅ Données de test insérées (...)
Listening on http://localhost:3000
```

Pour un **jeu démo plus riche** (4 utilisateurs, plus de données) : `npm run db:seed` ou `npm run db:seed:reset`.

---

## Structure du projet

```
relay/

├── db/
│   ├── db.js          # Connexion SQLite
│   ├── initDb.js      # Création des tables au démarrage
│   └── seedData.js    # Seeds : minimal au boot, démo complet via npm run db:seed
├──routes/
│   ├── users.js
│   ├── responsibilities.js
│   ├── unavailabilities.js
│   └── coverages.js
├── schema.sql             # Schéma de la base de données
├── relay.db               # Base SQLite (générée automatiquement, non committée)
├── .env                   # Variables d'environnement (non committée)
├── .env.example           # Template à compléter
├── app.js
├── server.js
└── package.json
```

---

## Données de test disponibles

| Utilisateur  | Email          | Rôle                                              |
| ------------ | -------------- | ------------------------------------------------- |
| Alice Dupont | alice@mail.com | 3 responsabilités, 2 absences (remplacements Bob) |
| Bob Martin   | bob@mail.com   | 3 responsabilités, 1 absence (remplacements Alice) |

---

## Problèmes fréquents

**Les tables ne se créent pas**
→ Vérifie que `schema.sql` est bien à la racine du projet.

**Les données de test se réinsèrent à chaque démarrage**
→ La base `relay.db` a été supprimée ou corrompue. Supprime-la et relance — elle sera recréée proprement.

**Erreur `Cannot use import statement`**
→ Vérifie que `"type": "module"` est présent dans `package.json`.

**Réinitialiser complètement la base**

```bash
rm relay.db
npm run dev
```
