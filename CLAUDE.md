# CLAUDE.md — Refonte V-Sonus

## Qu'est-ce que ce projet ?

Application web headless pour **V-Sonus**, entreprise suisse (Vevey, Suisse Romande) de location de matériel événementiel (Sonorisation, Éclairage, Scènes, Mapping). Remplace un site WordPress + WooCommerce Bookings par un flux de pré-réservation sur-mesure ultra-rapide et optimisé SEO.

**Ce n'est PAS un e-commerce classique.** C'est un système de demande de devis intelligent : Panier → Dates → Règles métier → Devis → Réservation.

---

## Commandes

```bash
npm run dev          # Dev local → http://localhost:3000
npm run build        # Build production
npm start            # Serveur prod → port 3000
```

---

## Stack technique

| Composant | Technologie | Version |
|-----------|-------------|---------|
| Langage | TypeScript | ^5.x |
| Framework | Next.js (App Router) | ^15.3.2 |
| UI | React | ^19.0.0 |
| CMS / Backend | Directus (headless) | ^17.0.0 |
| State management | Zustand | ^5.0.0 |
| CSS | Tailwind CSS | ^3.4.1 |
| Icônes | lucide-react | ^0.577.0 |
| Police | Montserrat (Google Fonts via next/font) | — |
| Hébergement front | Infomaniak | — |
| Hébergement back | Railway (Directus) | — |
| Paiement | Stripe (prévu, non implémenté) | — |

---

## Architecture

```
vsonus-2026/
├── app/
│   ├── [slug]/              → Pages CMS dynamiques (Directus)
│   ├── actions/
│   │   └── reservation.ts   → Server Action (soumettreReservation)
│   ├── catalogue/
│   │   ├── page.tsx          → Catalogue SSR + ISR (300s) avec filtres
│   │   ├── error.tsx         → Error Boundary catalogue
│   │   └── [id]/
│   │       ├── page.tsx      → Page produit détail SSR + ISR
│   │       └── not-found.tsx → 404 produit spécifique
│   ├── checkout/             → Formulaire de pré-réservation
│   ├── confirmation/         → Écran succès post-envoi
│   ├── contact/              → Page contact + formulaire
│   ├── galerie/              → Galerie d'événements (masonry)
│   ├── error.tsx             → Error Boundary global
│   ├── not-found.tsx         → Page 404 globale
│   ├── globals.css
│   ├── layout.tsx            → Layout racine (Header + Footer)
│   └── page.tsx              → Homepage
├── components/
│   ├── blocks/               → Blocs CMS (HeroBlock, TextImageBlock, FeaturesGridBlock, CtaBlock, LogoCloudBlock)
│   ├── cart/
│   │   ├── CartDrawer.tsx    → Panneau panier slide-in (calcul temps réel)
│   │   └── ReservationWidget.tsx → ⚠️ LEGACY — non utilisé
│   ├── catalogue/
│   │   └── AddToCartButton.tsx → ⚠️ LEGACY — remplacé par AddToCartSection dans [id]/
│   ├── layout/
│   │   ├── Header.tsx
│   │   ├── Footer.tsx
│   │   └── MegaMenu.tsx      → Menu dropdown 4 catégories
│   └── ui/
│       └── Button.tsx         → Variantes primary/secondary/outline, 3 tailles
├── lib/
│   ├── directus.ts           → Client SDK Directus + interfaces TypeScript + getImageUrl()
│   └── store.ts              → Zustand store (panier, dates, tarifs, getters)
├── scripts/
│   ├── setup-directus.mjs    → Crée les collections/champs Directus
│   └── import-catalog.ts     → Importe le CSV WooCommerce → Directus
├── assets/                   → Logo statique
├── public/                   → Fichiers publics
└── doc/                      → PRD.md, Spec.md
```

---

## Conventions de code

- **TypeScript strict** — pas de `any`, interfaces pour toutes les collections Directus
- **Commentaires en français**
- **Design : `rounded-none` partout** — zéro border-radius (style flight case / industriel)
- **Couleurs exclusives** : `vsonus-black` (#000), `vsonus-dark` (#231F20), `vsonus-red` (#EC1C24)
- **Police** : Montserrat uniquement
- **Data fetching** : React Server Components + Directus SDK (`readItems`, `readItem`)
- **Mutations** : Server Actions uniquement (`'use server'`) — jamais d'appels Directus côté client
- **Authentification Directus** : `getServerDirectus()` avec `DIRECTUS_SERVER_TOKEN` pour les mutations. Ne JAMAIS utiliser l'export `directus` public (code mort).
- **Images** : toujours via `getImageUrl(id)` avec paramètres de transformation
- **Tailwind CSS pur** — aucune bibliothèque de composants externe
- **Surgical changes only** — ne modifier que ce qui est demandé, pas de refactoring non sollicité
- **Heuristiques Nielsen Norman** — toute proposition UX doit respecter les principes NNG

---

## Optimisation tokens — Cibler avant de lire

**Ne JAMAIS lire un fichier entier** avant d'avoir utilisé `grep` ou `ls` pour localiser précisément l'information.

- Si une modification de fonction est demandée → chercher d'abord sa définition avec `grep -n "nomFonction" fichier.ts`, puis lire uniquement le bloc concerné avec `view` + `view_range`.
- Ne jamais afficher le code complet d'un fichier dans les réponses → utiliser des extraits (diff) uniquement.
- Pour explorer un répertoire → `ls` d'abord, puis cibler le fichier pertinent.
- Pour trouver une variable ou un import → `grep -rn "terme" app/ lib/ components/` avant de lire.
- **Toujours cibler avant de lire. Toujours.**

---

## Vérifications obligatoires après chaque modification

**Après CHAQUE modification, tu DOIS vérifier que les pages principales ne sont pas cassées :**

1. Lance `npm run dev` et vérifie dans le navigateur :
   - `/catalogue` — les équipements et packs s'affichent
   - `/catalogue/[un-id-existant]` — la page produit charge
   - Le CartDrawer s'ouvre et affiche correctement
   - `/checkout` — le formulaire charge
2. Vérifie la console navigateur — aucune erreur
3. `npm run build` passe sans erreur

**Règle Directus critique** : ne JAMAIS ajouter un champ aux `fields` d'une requête `readItems()` si ce champ n'existe pas encore en base. Directus retourne `FORBIDDEN` et le `.catch(() => [])` masque l'erreur → données vides silencieuses. Si un champ est prévu mais pas encore créé, le rendre optionnel dans l'interface TypeScript et ne pas le demander dans la requête.

---

## Collections Directus

| Collection | Champs principaux |
|---|---|
| `equipements` | id, nom, prix_journalier, stock_total, technicien_obligatoire, transport_obligatoire, prix_livraison (nullable), image, categorie, marque, description, sort, images (M2M → equipements_images) |
| `equipements_images` | id, equipements_id (FK), directus_files_id (FK → directus_files), sort |
| `packs` | id, nom, categorie, prix_base, prix_livraison (nullable), prix_fourgon (nullable), mode_livraison (enum: obligatoire/optionnel/retrait_uniquement), image_principale, description, capacite (nullable), sort, prix_promo (nullable), promo_label (nullable), promo_date_fin (nullable) |
| `pack_equipements` | id, pack_id, equipement_id (FK), quantite, sort |
| `tarifs_annexes` | id, label, type, prix, unite, description |
| `logos_partenaires` | id, nom, logo (file), url (nullable), sort, status |
| `reservations` | id, statut, nom_client, email_client, tel_client, adresse_evenement, date_debut, date_fin, total_ht, besoin_montage, besoin_livraison, notes |
| `reservation_lignes` | id, reservation_id (FK), type, reference_id, label, quantite, prix_unitaire, prix_total |
| `pages` | id, slug, title, meta_description, content (blocs M2A), status |
| `site_settings` | id, hero_video (nullable), hero_video_poster (nullable), promo_active (boolean), promo_texte (nullable), promo_lien (nullable), promo_cta (nullable) |

**⚠️ `galerie_photos`** — collection NON créée. La page `/galerie` gère l'erreur via `.catch()`.

---

## Règles métier critiques

### Coefficients de location (grille tarifaire V-Sonus)

Le prix de location n'est PAS multiplié par le nombre de jours. Il suit cette grille de coefficients :

| Durée | Coefficient |
|-------|------------|
| 1 jour | × 1 |
| 2 jours | × 1.5 |
| 3 jours | × 2 |
| 4 jours | × 2.5 |
| 5 jours | × 3 |
| 6+ jours | **Sur demande** — bloquer la réservation en ligne, inviter à contacter V-Sonus |

**Le coefficient s'applique UNIQUEMENT sur le prix de location (`prix_base` pour les packs, `prix_journalier` pour les équipements). Les frais de livraison et de fourgon sont facturés 1 seule fois, quel que soit le nombre de jours.**

### Séparation prix location / frais de livraison (packs)

Chaque pack a 3 prix distincts :
- `prix_base` — prix de la location seule (soumis au coefficient)
- `prix_livraison` — frais de livraison et installation (facturé 1×)
- `prix_fourgon` — frais de location fourgon + essence (facturé 1×)

Et un `mode_livraison` qui détermine le comportement :
- `obligatoire` → livraison + fourgon ajoutés automatiquement, pas de choix utilisateur (packs sono L-Acoustics, scène, structure)
- `optionnel` → l'utilisateur choisit "Retrait sur place" (0.-) ou "Livraison + Installation" (packs lumières sauf S, mapping, RCF)
- `retrait_uniquement` → pas de livraison proposée (pack lumières S)

### Règle "L-Acoustics" & "Levage"
Si le panier contient une enceinte de marque **L-Acoustics** OU un **palan/pied de levage** :
- La livraison par technicien est **obligatoire**
- Le montage/démontage est **obligatoire**
- L'option "Retrait sur place" doit être **bloquée**

Ces flags sont gérés par `technicien_obligatoire` et `transport_obligatoire` sur les équipements.

### Équipements éclairage — option retrait/livraison
Les équipements unitaires de catégorie **éclairage** proposent un choix :
- Retrait sur place (gratuit)
- Livraison (prix défini dans `prix_livraison`, facturé 1×)

Ce choix est visible sur la page produit et modifiable dans le CartDrawer.

---

## Zustand Store (lib/store.ts)

État persisté dans `localStorage` (clé `vsonus-cart`) :
- `cart[]` — articles (équipement ou pack)
- `startDate` / `endDate` — période de location
- `tarifsAnnexes[]` — tarifs depuis Directus (cache)
- `livraisonChoix: Record<string, 'retrait' | 'livraison'>` — choix de livraison par article
- Getters : `getCoefficient()`, `getNbJours()`, `getSousTotal()`, `requiresTechnicien()`, `requiresTransport()`

---

## Variables d'environnement

```
NEXT_PUBLIC_DIRECTUS_URL=     # URL de l'instance Directus
DIRECTUS_SERVER_TOKEN=        # Token statique pour les mutations (Server Actions)
# STRIPE_SECRET_KEY=          # Prévu, pas encore actif
# NEXT_PUBLIC_STRIPE_KEY=     # Prévu, pas encore actif
```

**⚠️ Vérifier que `.env.local` est bien dans `.gitignore`.**

---

## Points d'attention critiques

1. **Fichiers morts à ne PAS utiliser** : `components/catalogue/AddToCartButton.tsx` (remplacé par `AddToCartSection`), `components/cart/ReservationWidget.tsx` (non référencé).
2. **Export `directus` public dans `lib/directus.ts`** — code mort, utiliser `getServerDirectus()` pour toute mutation.
3. **Incohérences de nommage** : `scenes` (store) vs `scene` (type Pack), `prix_base` vs `prix_journalier` traités différemment dans `getSousTotal`.
4. **Collection `galerie_photos` inexistante** — la page `/galerie` affiche un état vide.
5. **Homepage** — en cours de construction via les blocs CMS.

---

## Design system

- Thème **Dark / Gaming** (monde de la nuit, flight cases)
- Fond principal : `bg-vsonus-black` (#000)
- Fonds secondaires : `bg-vsonus-dark` (#231F20)
- Accent : `vsonus-red` (#EC1C24)
- **Zéro arrondi** : `rounded-none` partout
- Effets : lueurs `glow-red` au survol, bordures fines rouges (`border-t-2 border-vsonus-red`)
- Ombres custom : `shadow-glow-red`, `shadow-glow-red-hover`

---

## Linear

- **Projet** : "Refonte V-Sonus"
- **Équipe** : Garcan Digital
- **Préfixe** : GAR-
- Quand tu termines un ticket, **mets à jour le ticket dans Linear** : statut → QA Review, et ajoute un commentaire résumant ce qui a été fait (fichiers créés, fichiers modifiés, résultat du build, points d'attention).

### Mode plan obligatoire (tickets ≥ 3 points)

Pour les tickets estimés à **3 points ou plus** (2h+), tu DOIS commencer en mode plan :

1. Analyse les fichiers concernés
2. Propose un plan d'action détaillé (quels fichiers modifier, dans quel ordre, quels risques)
3. **Attends la validation** avant de modifier quoi que ce soit

Les tickets de 1-2 points (quick fix) peuvent être exécutés directement.