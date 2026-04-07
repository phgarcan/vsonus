# Deployment — V-Sonus

## Architecture

```
┌──────────────────┐     ┌──────────────────┐     ┌──────────────────┐
│   Local (dev)    │     │    Staging        │     │   Production     │
│   localhost:3000 │     │  dev.vsonus.ch    │     │   vsonus.ch      │
│                  │     │  Basic Auth       │     │   Public         │
│   Branche: *     │     │  Branche: develop │     │  Branche: main   │
└────────┬─────────┘     └────────┬─────────┘     └────────┬─────────┘
         │                        │                        │
         └────────────────────────┴────────────────────────┘
                                  │
                        ┌─────────▼─────────┐
                        │     Directus      │
                        │   Railway (mutu)  │
                        │  admin.vsonus.ch  │
                        └───────────────────┘
```

Les trois environnements partagent la **meme instance Directus** sur Railway. Le contenu (equipements, packs, realisations) est identique partout.

---

## Environnements

### Local

- **URL** : `http://localhost:3000`
- **Fichier env** : `.env.local`
- **Lancement** : `npm run dev`
- **Usage** : developpement quotidien

### Staging

- **URL** : `https://dev.vsonus.ch`
- **Hebergement** : Infomaniak Node.js (site existant)
- **Fichier env** : `.env.staging` (local) + variables Infomaniak (secrets)
- **Branche Git** : `develop`
- **Protection** : Basic Auth HTTP (variable `STAGING_AUTH`)
- **Indexation** : Bloquee (`robots.txt` → `Disallow: /`)
- **Usage** : validation client avant mise en prod

### Production

- **URL** : `https://vsonus.ch`
- **Hebergement** : Infomaniak Node.js (2e site)
- **Fichier env** : `.env.production` (local) + variables Infomaniak (secrets)
- **Branche Git** : `main`
- **Protection** : Aucune (site public)
- **Indexation** : Active (`robots.txt` → `Allow: /` + sitemap)
- **Usage** : site client final

---

## Variables d'environnement

### Variables publiques (committees dans .env.production / .env.staging)

| Variable | Staging | Production |
|----------|---------|------------|
| `NEXT_PUBLIC_DIRECTUS_URL` | `https://directus-production-daaa.up.railway.app` | idem |
| `DIRECTUS_HOST` | `directus-production-daaa.up.railway.app` | idem |
| `NEXT_PUBLIC_SITE_URL` | `https://dev.vsonus.ch` | `https://vsonus.ch` |
| `NEXT_PUBLIC_GOOGLE_PLACES_API_KEY` | `AIzaSy...` | idem |

### Secrets (panneau Infomaniak uniquement — JAMAIS dans le code)

| Variable | Description |
|----------|-------------|
| `DIRECTUS_SERVER_TOKEN` | Token statique Directus (mutations Server Actions) |
| `RESEND_API_KEY` | Cle API Resend (emails transactionnels) |
| `GEMINI_API_KEY` | Cle API Google Gemini (chatbot) |
| `STAGING_AUTH` | **Staging uniquement** — `user:password` pour Basic Auth |

---

## Workflow Git

```
feature/ma-feature
       │
       ▼
   develop  ──────►  dev.vsonus.ch (staging)
       │
       ▼ (merge quand valide)
    main    ──────►  vsonus.ch (production)
```

### Developpement quotidien

```bash
# Travailler sur develop
git checkout develop
# ... coder ...
git add -A && git commit -m "feat: description"
git push origin develop
# → Infomaniak rebuild automatiquement dev.vsonus.ch
```

### Mise en production

```bash
# 1. Verifier que staging est OK sur dev.vsonus.ch
# 2. Merger dans main
git checkout main
git merge develop
git push origin main
# → Infomaniak rebuild automatiquement vsonus.ch
```

### Hotfix production

```bash
git checkout main
git checkout -b hotfix/description
# ... fix ...
git checkout main && git merge hotfix/description
git push origin main
# Backporter dans develop :
git checkout develop && git merge main
git push origin develop
```

---

## Configuration Infomaniak

### Site staging (dev.vsonus.ch) — deja existant

1. **Panneau Infomaniak** → Hebergement Web → dev.vsonus.ch → Node.js
2. **Repository** : `phgarcan/vsonus` branche `develop`
3. **Build command** : `npm install && npm run build`
4. **Start command** : `npm start`
5. **Port** : 3000
6. **Node.js** : 20.x LTS
7. **Variables d'environnement** (dans le panneau) :
   ```
   DIRECTUS_SERVER_TOKEN=...
   RESEND_API_KEY=...
   GEMINI_API_KEY=...
   STAGING_AUTH=vsonus:VsonusStaging2026!
   NEXT_PUBLIC_SITE_URL=https://dev.vsonus.ch
   NEXT_PUBLIC_DIRECTUS_URL=https://directus-production-daaa.up.railway.app
   DIRECTUS_HOST=directus-production-daaa.up.railway.app
   NEXT_PUBLIC_GOOGLE_PLACES_API_KEY=AIzaSyCJiVBONTpjvIGm1QwDdm3AOTuY2DeD5yk
   ```

### Site production (vsonus.ch) — a creer

1. **Creer un nouveau site Node.js** dans Infomaniak (meme hebergement ou separe)
2. **Repository** : `phgarcan/vsonus` branche `main`
3. **Build/Start** : idem staging
4. **Variables d'environnement** (dans le panneau) :
   ```
   DIRECTUS_SERVER_TOKEN=...
   RESEND_API_KEY=...
   GEMINI_API_KEY=...
   NEXT_PUBLIC_SITE_URL=https://vsonus.ch
   NEXT_PUBLIC_DIRECTUS_URL=https://directus-production-daaa.up.railway.app
   DIRECTUS_HOST=directus-production-daaa.up.railway.app
   NEXT_PUBLIC_GOOGLE_PLACES_API_KEY=AIzaSyCJiVBONTpjvIGm1QwDdm3AOTuY2DeD5yk
   ```
   **PAS de `STAGING_AUTH`** → le site est public
5. **DNS** : pointer `vsonus.ch` et `www.vsonus.ch` vers l'IP Infomaniak
6. **SSL** : activer Let's Encrypt dans le panneau

---

## Checklist premiere mise en production

- [ ] Branche `develop` creee et pushee
- [ ] Site Node.js production cree sur Infomaniak
- [ ] Variables d'environnement configurees (staging + prod)
- [ ] DNS `vsonus.ch` pointe vers le site prod
- [ ] SSL actif sur vsonus.ch
- [ ] `STAGING_AUTH` configure sur dev.vsonus.ch → Basic Auth fonctionne
- [ ] `STAGING_AUTH` **absent** sur vsonus.ch → site public
- [ ] `https://vsonus.ch/robots.txt` → `Allow: /` + sitemap
- [ ] `https://dev.vsonus.ch/robots.txt` → `Disallow: /`
- [ ] Google Search Console : soumettre sitemap `https://vsonus.ch/sitemap.xml`
- [ ] Tester toutes les pages critiques : `/`, `/catalogue`, `/packs`, `/checkout`, `/contact`
- [ ] Tester le panier + soumission de reservation
- [ ] Tester la connexion `/mon-compte`

---

## Protection staging (Basic Auth)

Le staging est protege par HTTP Basic Auth via le middleware Next.js.

- **Active** si la variable `STAGING_AUTH` est definie (format `user:password`)
- **Desactive** si la variable est absente (= production)
- Le navigateur affiche une popup native login/password
- Les routes `/api/*` ne sont pas protegees (webhooks, healthchecks)

Pour tester en local :
```bash
STAGING_AUTH=test:test npm run dev
```
