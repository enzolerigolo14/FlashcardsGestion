# API RESTful de Gestion de Flashcards

Projet de groupe R5.05. API permettant de gérer des flashcards, des collections et de réviser avec un algorithme de répétition espacée.

## 🚀 Installation & Lancement

1.  **Installation des dépendances**
    ```bash
    npm install
    ```

2.  **Configuration de l'environnement**
    Créer un fichier `.env` à la racine :
    ```env
    DB_FILE=file:local.db
    JWT_SECRET=votre_secret_jwt_securise
    ```

3.  **Base de données**
    ```bash
    # Création des tables
    npm run db:push
    
    # (Optionnel) Ajout de données de test
    npm run db:seed
    ```

4.  **Démarrage**
    ```bash
    npm run dev
    ```
    L'API sera accessible sur `http://localhost:3000`.

---

## 📚 Documentation de l'API

### 🔐 Authentification

#### Inscription
*   **URL** : `/auth/register`
*   **Méthode** : `POST`
*   **Body** :
    ```json
    {
      "email": "utilisateur@example.com",
      "password": "password123",
      "firstName": "Jean",
      "lastName": "Dupont"
    }
    ```

#### Connexion
*   **URL** : `/auth/login`
*   **Méthode** : `POST`
*   **Body** :
    ```json
    {
      "email": "utilisateur@example.com",
      "password": "password123"
    }
    ```
    Pour être admin : 
    ```json
    {
      "email": "admin@example.com",
      "password": "password123"
    }
    ```
    *Réponse (Succès)* : Renvoie un token JWT à utiliser dans le header `Authorization` pour les requêtes suivantes.
    ```json
    {
      "token": "eyJhbGciOiJIUzI1NiIsInR...",
      "user": { ... }
    }
    ```

> ⚠️ **Note** : Pour toutes les requêtes nécessitant une authentification, ajoutez le header : `Authorization: Bearer <votre_token>`

---

### 📂 Collections

#### Créer une collection
*   **URL** : `/collections`
*   **Méthode** : `POST`
*   **Body** :
    ```json
    {
      "title": "Capitales de l'Europe",
      "description": "Pour reviser la géo",
      "isPublic": true
    }
    ```

#### Lister mes collections
*   **URL** : `/collections/my`
*   **Méthode** : `GET`

#### Rechercher des collections publiques
*   **URL** : `/collections/public?search=anglais`
*   **Méthode** : `GET`

#### Modifier une collection
*   **URL** : `/collections/:id`
*   **Méthode** : `PUT`
*   **Body** (tous les champs sont optionnels) :
    ```json
    {
      "title": "Nouveau titre",
      "isPublic": false
    }
    ```

---

### 🃏 Flashcards

#### Créer une flashcard
*   **URL** : `/flashcards`
*   **Méthode** : `POST`
*   **Body** :
    ```json
    {
      "collectionId": 1,
      "frontText": "Chien",
      "backText": "Dog",
      "frontUrl": "https://example.com/chien.jpg",
      "backUrl": ""
    }
    ```

#### Lister les cartes d'une collection
*   **URL** : `/flashcards/collection/:collectionId`
*   **Méthode** : `GET`

#### Réviser (Obtenir les cartes à faire aujourd'hui)
*   **URL** : `/flashcards/collection/:collectionId/review`
*   **Méthode** : `GET`

#### Enregistrer le résultat d'une révision
*   **URL** : `/flashcards/:id/review`
*   **Méthode** : `POST`
*   **Body** :
    ```json
    {
      "success": true
    }
    ```
    *   `true` : Vous avez réussi, la carte passera au niveau supérieur (révision plus tard).
    *   `false` : Vous avez échoué, la carte retourne au niveau 1 (révision demain).

---

### 🛡️ Admin

*   `GET /admin/users` : Voir tous les utilisateurs.
*   `DELETE /admin/users/:id` : Supprimer un utilisateur et toutes ses données.

---

## 🗃️ Modèle de Données (Schéma)

*   **Users** : `id`, `email`, `password`, `firstName`, `lastName`, `admin`
*   **Collections** : `id`, `userId`, `title`, `description`, `isPublic`
*   **Flashcards** : `id`, `collectionId`, `frontText`, `backText`, `frontUrl`, `backUrl`
*   **FlashcardsProgress** : `id`, `userId`, `flashCardId`, `level`, `lastReviewDate`, `nextReviewDate`