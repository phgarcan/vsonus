Spécifications Techniques (SPEC.md) - Refonte V-Sonus
Ce document détaille les fichiers exacts à créer ou à modifier dans le projet Next.js, ainsi que les instructions d'implémentation pour répondre aux exigences du PRD.md.
1. Fichiers de Configuration Globale
tailwind.config.ts (À modifier)
O que precisa ser modificado:
Ajouter la palette de couleurs personnalisée : vsonus-black (#000000), vsonus-dark (#231F20), vsonus-red (#EC1C24).
Définir Montserrat comme police par défaut (fontFamily.sans).
Ajouter des ombres personnalisées pour l'effet "Gaming" : glow-red et glow-red-hover.
Désactiver ou forcer les classes d'arrondis pour imposer des angles nets (style flight case).
app/layout.tsx (À modifier)
O que precisa ser modificado:
Importer la police Google Font Montserrat via next/font/google.
Appliquer la couleur de fond globale bg-vsonus-black et la couleur de texte text-white au <body>.
Intégrer les composants globaux <Header /> et <Footer />.
2. Librairies et Gestion d'État (State Management)
lib/directus.ts (À criar)
O que precisa ser criado:
Initialisation du client Directus via @directus/sdk avec l'URL de l'API.
Définition des types TypeScript (Interfaces) stricts pour les collections : Equipement, Pack, TarifAnnexe, Page.
Exportation d'une fonction utilitaire getImageUrl(id) pour formater les URLs des images du CMS.
lib/store.ts (À criar)
O que precisa ser criado:
Création d'un store global avec Zustand (ou React Context).
État : cart (articles ajoutés), startDate, endDate.
Actions : addToCart, removeFromCart, setDates, clearCart.
Logique Dérivée (Getters) : Calcul du nombre de jours, calcul du sous-total, et surtout la détection des règles métier strictes (retourne true si un article a technicien_obligatoire ou transport_obligatoire à true).
3. Composants UI & Layout (Frontend)
components/layout/Header.tsx & components/layout/MegaMenu.tsx (À criar)
O que precisa ser criado:
Un Header sticky avec le logo V-Sonus, le bouton d'accès au panier, et un bouton "Catalogue".
Mega Menu : Un panneau pleine largeur qui s'ouvre au clic/survol, avec fond bg-vsonus-dark et lignes de séparation fines vsonus-red. Il doit lister les catégories (Sonorisation, Éclairage, Scènes, Mapping).
components/cart/ReservationWidget.tsx (À criar)
O que precisa ser criado:
Composant client interactif ('use client') qui lit l'état depuis lib/store.ts.
Affiche un DatePicker pour choisir les dates de location.
Affiche la liste des articles du panier.
Injecte dynamiquement les frais (Transport / Montage) si l'algorithme du store détecte du matériel L-Acoustics ou de Levage.
Bouton "Demander un devis" (avec effet shadow-glow-red au survol) qui redirige vers le Checkout.
components/ui/Button.tsx (À criar)
O que precisa ser criado:
Composant réutilisable avec les styles forcés du projet : rounded-none, angles nets, fond vsonus-red ou vsonus-dark, et effets de survol typés "gaming".
4. Pages (App Router)
app/catalogue/page.tsx (À criar)
O que precisa ser criado:
Composant React Server (SSR) pour des performances SEO optimales.
Appel à Directus readItems('equipements') pour récupérer le matériel.
Affichage d'une grille de cartes produits (fonds bg-vsonus-dark).
Chaque carte contient un bouton "Ajouter au projet" qui interagit avec le store Zustand côté client.
app/checkout/page.tsx (À criar)
O que precisa ser criado:
Page contenant le formulaire de contact du client (Nom, Email, Téléphone, Adresse de l'événement).
Récapitulatif final du panier et des frais.
Bouton de validation finale appelant la Server Action de soumission.
(Optionnel selon le choix final) : Intégration du module Stripe Checkout pour le paiement de l'acompte.
app/[slug]/page.tsx (À criar)
O que precisa ser criado:
Fichier "Catch-all" pour le CMS Headless.
Appel à Directus pour récupérer la page correspondant au slug.
Génération des métadonnées SEO (generateMetadata) à partir des champs title et meta_description.
Fonction renderBlock qui utilise un switch/case sur block.collection pour rendre les sections dynamiques de la page (ex: Hero Banner, Textes, Galerie) en se basant sur les données du constructeur visuel de Directus.
5. Logique Backend (Server Actions)
app/actions/reservation.ts (À criar)
O que precisa ser criado:
Fichier avec la directive 'use server'.
Fonction soumettreReservation(clientData, cartData, dates).
Initialisation d'un client Directus avec un Token Serveur sécurisé (variable d'environnement DIRECTUS_SERVER_TOKEN).
Mutations : 1. Création d'une entrée dans la collection reservations (statut en_attente_validation). 2. Boucle pour créer des entrées dans reservation_lignes pour lier le matériel, les packs et les éventuels frais annexes de logistique à l'ID de la réservation parente.
Retourne un objet { success: true, id: '...' } au front-end.