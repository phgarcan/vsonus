# Diagnostic Complet — V-Sonus 2026

*Généré le 15 mars 2026*

---

## 1. Stack Technologique

| Couche | Technologie | Version |
|---|---|---|
| Langage | TypeScript | ^5.x |
| Framework frontend | Next.js (App Router) | ^15.3.2 |
| Bibliothèque UI | React | ^19.0.0 |
| CMS / Backend | Directus (headless) | ^17.0.0 |
| Base de données | Gérée par Directus (SQLite/PostgreSQL) | — |
| État global | Zustand | ^5.0.0 |
| Icônes | lucide-react | ^0.577.0 |
| CSS | Tailwind CSS | ^3.4.1 |
| Police | Montserrat (Google Fonts via next/font) | — |
| Scripts utilitaires | csv-parse + tsx | ^6.1 / ^4.21 |

**Authentification :** Aucune authentification utilisateur implémentée. L'accès à Directus utilise un `staticToken` côté serveur (`DIRECTUS_SERVER_TOKEN`) pour les mutations. Pas de login/logout, pas de sessions, pas de JWT côté client.

**Paiement :** Stripe référencé dans les variables d'environnement (commenté), **non implémenté**. Le flux actuel est 100% basé sur la demande de devis (pré-réservation).

---

## 2. Structure du Projet

```
vsonus-2026/
├── app/
│   ├── [slug]/          → Pages CMS dynamiques (Directus)
│   ├── actions/         → Server Actions (soumettreReservation)
│   ├── catalogue/       → Catalogue + page produit [id]
│   ├── checkout/        → Formulaire de pré-réservation
│   ├── confirmation/    → Écran de succès post-envoi
│   ├── contact/         → Page de contact + formulaire
│   ├── galerie/         → Galerie d'événements (masonry)
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx
├── components/
│   ├── blocks/          → Blocs CMS (Hero, TextImage, Features, CTA, Logos)
│   ├── cart/            → CartDrawer, ReservationWidget
│   ├── catalogue/       → AddToCartButton (legacy)
│   ├── layout/          → Header, Footer, MegaMenu
│   └── ui/              → Button
├── lib/
│   ├── directus.ts      → Client SDK + interfaces TypeScript
│   └── store.ts         → Zustand store (panier + dates)
├── scripts/
│   ├── setup-directus.mjs   → Crée les collections/champs Directus
│   └── import-catalog.ts    → Importe le CSV WooCommerce → Directus
├── assets/              → Logo statique
├── public/              → Fichiers publics
└── doc/                 → PRD.md, Spec.md
```

**Patron :** Organisation par **feature/route** (Next.js App Router), avec une couche `components/` séparée par domaine. Cohérent et scalable.

---

## 3. État du Frontend

### Pages existantes

| Route | Type | Statut |
|---|---|---|
| `/` | Server Component | Fonctionnel (placeholder simple) |
| `/catalogue` | SSR + ISR (300s) | Fonctionnel |
| `/catalogue/[id]` | SSR + ISR (300s) | Fonctionnel |
| `/checkout` | SSR + Client Form | Fonctionnel |
| `/confirmation` | Client | Fonctionnel |
| `/contact` | SSR + Client Form | Fonctionnel |
| `/galerie` | SSR + ISR (300s) | Fonctionnel (en attente de données) |
| `/[slug]` | SSR + ISR (60s) | Fonctionnel (en attente de contenu CMS) |

### Système de routes
Next.js App Router avec file-based routing. Pas de middleware de route. Pas de protection de routes authentifiées.

### Composants réutilisables
- `Button` — variantes primary/secondary/outline, 3 tailles, effets glow
- `CartDrawer` — panneau slide-in complet avec calcul temps réel
- `HeroBlock`, `TextImageBlock`, `FeaturesGridBlock`, `CtaBlock`, `LogoCloudBlock` — blocs CMS
- `MegaMenu` — menu dropdown avec 4 catégories

### État global (Zustand)
Persisté dans `localStorage` (`vsonus-cart`). Comprend :
- `cart[]` — articles (équipement ou pack)
- `startDate` / `endDate` — période de location
- `tarifsAnnexes[]` — tarifs depuis Directus (mis en cache)
- Getters : `getNbJours()`, `getSousTotal()`, `requiresTechnicien()`, `requiresTransport()`

### Framework CSS
**Tailwind CSS pur** — aucune bibliothèque de composants externe. Design system propriétaire :
- Couleurs : `vsonus-black` (#000), `vsonus-dark` (#231F20), `vsonus-red` (#EC1C24)
- Zéro border-radius (design industriel/gaming)
- Ombres glow personnalisées

---

## 4. État du Backend / Base de Données

### Collections Directus (créées via `setup-directus.mjs`)

| Collection | Champs principaux |
|---|---|
| `equipements` | id, nom, prix_journalier, stock_total, technicien_obligatoire, transport_obligatoire, image, categorie, marque, description |
| `packs` | id, nom, categorie, prix_base, image_principale, description |
| `pack_equipements` | id, pack_id, equipement_id (FK), quantite |
| `tarifs_annexes` | id, label, type, prix, unite, description |
| `reservations` | id, statut, nom_client, email_client, tel_client, adresse_evenement, date_debut, date_fin, total_ht, besoin_montage, besoin_livraison, notes |
| `reservation_lignes` | id, reservation_id (FK), type, reference_id, label, quantite, prix_unitaire, prix_total |
| `pages` | id, slug, title, meta_description, content (blocs M2A), status |

**`galerie_photos`** — **NON créée par le script.** La page `/galerie` gère l'erreur via `.catch()` et affiche un état vide. Doit être créée manuellement ou ajoutée au script.

### Politiques de sécurité
Directus n'utilise pas de RLS au sens PostgreSQL. Les permissions sont gérées par **politiques d'accès** :
- **Rôle public :** lecture sur `equipements`, `packs`, `pack_equipements`, `pages`, `directus_files` — configuré via l'API REST pendant le développement.
- **Token serveur :** accès complet pour les mutations (reservations, reservation_lignes).

Il n'y a pas de RLS réel. Le token côté serveur est le seul mécanisme de protection en écriture.

### APIs / Endpoints
Aucune API Route personnalisée (`app/api/`). Tout le I/O passe par :
1. Directus SDK (`readItems`, `readItem`, `createItem`) dans les Server Components
2. Server Actions (`app/actions/reservation.ts`) pour les formulaires

### Storage / Upload
Configuré et fonctionnel — le script `import-catalog.ts` upload les images vers `/files` de Directus via `FormData`. Les images sont servies via `getImageUrl()` avec paramètres de transformation (width, height, fit, quality).

---

## 5. Fonctionnalités Implémentées

### Ce qui fonctionne réellement (testable)
- Affichage du catalogue avec filtre par catégorie et recherche textuelle
- Page de détail produit avec image, badges, suggestions
- Ajouter/supprimer/modifier la quantité dans le panier
- CartDrawer avec calcul en temps réel, sélection de dates
- Règles métier : `technicien_obligatoire` et `transport_obligatoire` déclenchent des frais obligatoires
- Formulaire de checkout créant des enregistrements dans Directus
- Page de confirmation avec l'ID de la réservation
- Métadonnées SEO dynamiques sur toutes les routes

### Existe en code mais ne fonctionne pas encore complètement
- **`/galerie`** — la page s'affiche, mais sans données (collection `galerie_photos` inexistante dans Directus)
- **`/contact` — formulaire** utilise `formsubmit.co` avec l'email placeholder `info@vsonus.ch` — non testé/configuré
- **Blocs CMS** (`HeroBlock`, etc.) — code prêt mais aucune page créée dans Directus pour les tester
- **`ReservationWidget`** (`components/cart/ReservationWidget.tsx`) — composant legacy, non utilisé dans aucune route active

### Uniquement ébauché / placeholder
- **Homepage (`/`)** — pratiquement vide, juste le logo + un bouton
- **`/[slug]`** — renderer CMS prêt mais sans pages publiées dans Directus
- **Intégration Stripe** — uniquement des commentaires dans les env vars
- **`AddToCartButton`** (`components/catalogue/AddToCartButton.tsx`) — ancienne version, remplacée par `AddToCartSection` dans `[id]/`

---

## 6. Problèmes Identifiés

### Erreurs / Risques dans le code

**1. Frais codés en dur dans le CartDrawer (risque de divergence)**
```typescript
// components/cart/CartDrawer.tsx
const FRAIS_TRANSPORT = { label: 'Transport – Fourgon', prix: 200 }
const FRAIS_MONTAGE   = { label: 'Montage / Démontage', prix: 400 }
```
Les valeurs réelles proviennent de Directus au checkout. Si un admin modifie les prix dans le CMS, le CartDrawer continuera d'afficher les anciens montants.

**2. Calcul de jours sans validation des dates mal formées**
```typescript
// lib/store.ts — getNbJours()
const diff = new Date(end).getTime() - new Date(start).getTime()
```
Si `startDate` ou `endDate` est invalide, retourne `NaN`. Aucun guard.

**3. Token Directus exposé dans le dépôt**
`.env.local` contient le token réel et pourrait être dans le contrôle de version (`.gitignore` à vérifier).

**4. Absence d'Error Boundaries**
Aucun fichier `error.tsx` dans aucune route. Une erreur dans un Server Component (ex: Directus hors ligne) retournera un 500 sans fallback élégant.

**5. Client Directus public exporté mais jamais utilisé**
```typescript
// lib/directus.ts
export const directus = createDirectus<Schema>(directusUrl).with(rest())
```
Tous les Server Components utilisent `getServerDirectus()`. L'export `directus` est du code mort.

### Incohérences de nommage

| Incohérence | Où |
|---|---|
| `scenes` (store) vs `scene` (type Pack) | `lib/store.ts` vs `lib/directus.ts` |
| `prix_base` (Pack) vs `prix_journalier` (Equipement) — traités différemment dans getSousTotal | `store.ts` |
| Bloc `block_texte` (legacy) vs `block_texte_image` (nouveau) | Coexistent dans le renderer `[slug]/page.tsx` |

### Fichiers morts / dupliqués

| Fichier | Situation |
|---|---|
| `components/catalogue/AddToCartButton.tsx` | Remplacé par `app/catalogue/[id]/AddToCartSection.tsx` — non supprimé |
| `components/cart/ReservationWidget.tsx` | Non référencé dans aucune route active |

### Dépendances non utilisées
- `csv-parse` et `tsx` sont en `devDependencies` mais utilisées uniquement dans les scripts — correct, mais augmentent le poids du dev.
- Le client `directus` public dans `lib/directus.ts` est exporté mais **jamais utilisé** dans aucun Server Component (tous utilisent `getServerDirectus()`).

---

## 7. Évaluation Générale

### Note : **7.5 / 10**

| Critère | Note | Commentaire |
|---|---|---|
| Architecture | 8/10 | App Router bien structuré, SSR/ISR adapté par route |
| Typage TypeScript | 8/10 | Interfaces complètes et cohérentes |
| Design system | 9/10 | Identité forte, cohérent, facile à maintenir |
| Logique métier | 8/10 | Règles L-Acoustics/Levage bien modélisées |
| Gestion d'erreurs | 4/10 | Pas d'Error Boundaries, validations minimales |
| Sécurité | 5/10 | Token potentiellement exposé, pas de rate limiting |
| Couverture fonctionnelle | 7/10 | Core opérationnel, CMS et galerie en attente de données |
| Code mort | 6/10 | 2-3 composants orphelins à nettoyer |

---

### Ce qui vaut la peine d'être gardé

- **Architecture App Router** — bien structurée, SSR/ISR adapté par route
- **Système de types TypeScript** — interfaces Directus complètes et cohérentes
- **Zustand store** — logique métier centralisée, persistance fonctionnelle
- **Design system Tailwind** — cohérent, identité forte, facile à maintenir
- **Scripts de setup/import** — économisent des heures de configuration manuelle
- **Server Actions** — patron correct pour les formulaires en Next.js 15
- **Règles métier** (`technicien_obligatoire`, `transport_obligatoire`) — bien modélisées

### Ce qui doit être amélioré

1. **Homepage** — placeholder vide, nécessite du contenu réel (HeroBlock via CMS)
2. **Frais codés en dur** — récupérer depuis Directus ou synchroniser avec le store
3. **Formulaire de contact** — remplacer `formsubmit.co` par une Server Action propre
4. **Collection `galerie_photos`** — créer dans Directus + ajouter au script de setup
5. **Gestion d'erreurs** — ajouter `error.tsx` et `not-found.tsx` par route
6. **`.gitignore`** — vérifier que `.env.local` est bien ignoré
7. **Nettoyer les fichiers morts** — `AddToCartButton.tsx`, `ReservationWidget.tsx`
8. **Supprimer l'export `directus` public** inutilisé dans `lib/directus.ts`

### Ce qui doit être refait

- **Rien** ne nécessite une réécriture complète. Le seul point qui pourrait mériter une révision est le flux d'authentification si le client souhaite ajouter un espace client ou un tableau de bord des réservations.

---

### Recommandation : **Continuer sur cette base — elle est solide**

La fondation technique est correcte. Next.js 15 + Directus est un choix mature pour ce cas d'usage. Le code est propre, typé et suit les bonnes pratiques de l'App Router. Les pendants sont incrémentaux, pas structurels.

**Prochaines priorités suggérées :**
1. Récupérer les tarifs annexes depuis Directus dans le CartDrawer (éliminer le hardcode)
2. Créer la collection `galerie_photos` et la peupler avec des photos réelles
3. Construire la homepage avec `HeroBlock` + `FeaturesGridBlock` via le CMS
4. Configurer `error.tsx` global et par route
5. Vérifier le `.gitignore` pour protéger `.env.local`
