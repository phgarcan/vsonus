Product Requirements Document (PRD) - Refonte V-Sonus
1. Vue d'ensemble du projet
V-Sonus est une entreprise suisse (Suisse Romande) spécialisée dans la location de matériel événementiel (Sonorisation, Éclairage, Scènes, Mapping) et la gestion technique d'événements.
Problème actuel : Le site actuel (WordPress + WooCommerce Bookings) est trop lourd, lent, et inadapté au flux de location spécifique (Panier -> Dates -> Devis avec règles métier).
Objectif : Créer une application web (Headless) ultra-rapide, optimisée pour le SEO (Google Ads), avec un flux de pré-réservation sur-mesure et une interface d'administration simple pour un gérant de 25 ans.
2. Stack Technique (Arquivos da base de código)
Frontend : Next.js (App Router, React Server Components)
Styling : Tailwind CSS
Backend / CMS : Directus (Headless CMS / API REST générée automatiquement)
Hébergement : Netlify ou Vercel (Front) + Directus Cloud ou Railway (Back)
Paiement : Intégration Stripe (Checkout pour acomptes)
Structure des dossiers (Next.js)
/app
  /actions         # Server Actions (ex: reservation.ts pour envoyer vers Directus)
  /[slug]          # Catch-all pour le CMS (Pages dynamiques : Accueil, A propos)
  /catalogue       # Page catalogue rendue côté serveur
  /checkout        # Tunnel de pré-réservation
/components
  /layout          # MegaMenu, Header, Footer
  /cart            # ReservationWidget (Panier)
  /ui              # Composants réutilisables (Boutons, Inputs, etc.)
/lib
  directus.ts      # Client SDK Directus (@directus/sdk)
  store.ts         # État global (Zustand ou React Context pour le panier)
tailwind.config.ts # Configuration du thème Dark/Gaming

3. Padrões de Implementação (UI/UX & Design Patterns)
Identité Visuelle (Thème "Dark / Gaming")
L'esthétique doit rappeler le monde de la nuit, de la scène et du matériel professionnel (Flight cases).
Couleurs principales :
vsonus-black: #000000 (Fond principal)
vsonus-dark: #231F20 (Fonds secondaires, cartes, méga menu)
vsonus-red: #EC1C24 (Couleur d'accentuation)
Typographie : Montserrat (Sans-serif, géométrique et lisible).
Formes : Angles nets et carrés. Aucun arrondi (pas de rounded-lg, utiliser rounded-none).
Effets : Utilisation de lueurs subtiles (glow) rouges au survol, lignes de séparation fines rouges (border-t-2 border-vsonus-red).
Navigation : Implémentation d'un Mega Menu couvrant la largeur de l'écran pour accéder facilement aux catégories (Son, Lumière, Scène, Packs).
Modèles de développement (Patterns)
Data Fetching : Utiliser les React Server Components pour récupérer le catalogue et les pages depuis Directus (readItems) afin d'optimiser le SEO et les Core Web Vitals.
Mutations : Utiliser exclusivement des Server Actions ('use server') pour communiquer avec l'API Directus (ex: création de devis), afin de masquer les tokens d'API.
CMS Headless : Les pages statiques sont construites via un champ de type "Builder" (blocs) dans Directus, rendu via un switch/case dans Next.js.
4. Documentations : Règles Métier (Business Logic)
Le cœur de l'application est le flux de réservation. Il ne s'agit pas d'un e-commerce classique, mais d'une demande de disponibilité et de devis intelligent.
Flux utilisateur
Ajout de matériel ou de packs au panier.
Sélection des dates (Calcul automatique des jours : du 12 au 13 = 2 jours de loc).
L'algorithme vérifie les règles métier et ajoute les frais obligatoires.
Validation par le client (Devis ou Acompte Stripe).
Création de la réservation dans Directus (Statut: en_attente_validation).
Règles Métier Strictes (Extraites des Conditions V-Sonus)
Règle "L-Acoustics" & "Levage" : Si le panier contient une enceinte de marque L-Acoustics OU un palan/pied de levage, la livraison et l'installation par un technicien sont obligatoires. L'option "Retrait sur place" doit être bloquée.
Frais annexes dynamiques :
Transport : Forfait véhicule (ex: 200 CHF pour un fourgon 1100kg).
Montage/Démontage : Calculé selon des grilles spécifiques (ex: Sonorisation 4x4 stacké = 4h00 à 50.-/h * 2 techniciens = 400 CHF). Ces tarifs doivent être gérés dans une table dédiée de la DB.
5. Modèle de Données (Collections Directus)
Claude, tu devras configurer ou interagir avec les collections suivantes via le SDK Directus :
equipements (Catalogue unitaire) : id, nom, prix_journalier, stock_total, technicien_obligatoire (boolean), transport_obligatoire (boolean), image.
packs (Offres tout-en-un) : id, nom, categorie, prix_base, image_principale.
pack_equipements (O2M/M2M) : Lier les packs aux équipements avec une quantite.
tarifs_annexes : Grilles de prix pour le montage, démontage et livraison (pour éviter de hardcoder les prix dans le front).
reservations : id, statut (en_attente, confirme, etc.), informations client (nom, email, tel, adresse), dates, total_ht, flags (besoin_montage, besoin_livraison).
reservation_lignes : Détail du panier lié à la réservation (avec le prix unitaire figé au moment de la commande).
pages (CMS) : slug, title, meta_description, content (Builder de blocs dynamiques).
6. Instructions pour l'IA (Claude Code / Agent)
Initialisation : Assure-toi que Tailwind est configuré selon les spécifications UI (fonds noirs, accents #EC1C24, police Montserrat).
Priorité 1 : Développer le composant de gestion de panier global (Zustand) et le ReservationWidget qui implémente les règles métier (L-Acoustics).
Priorité 2 : Créer l'action serveur (soumettreReservation) pour insérer la commande dans Directus de manière sécurisée.
Priorité 3 : Construire le layout dynamique CMS app/[slug]/page.tsx pour permettre au client de créer ses pages via les blocs Directus.

