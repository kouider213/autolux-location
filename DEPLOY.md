# 🚀 GUIDE DE DÉPLOIEMENT COMPLET — AUTOLUX LOCATION

---

## ÉTAPE 1 — SUPABASE (10 min)

### 1.1 Créer le projet
1. Aller sur https://supabase.com → "New project"
2. Nom : `autolux-location`
3. Choisir un mot de passe fort (notez-le)
4. Région : Europe (Frankfurt) recommandée
5. Cliquer "Create new project" → attendre ~2 min

### 1.2 Créer les tables (SQL automatique)
1. Aller dans **SQL Editor** (menu gauche)
2. Cliquer "New query"
3. Copier-coller **tout le contenu** de `supabase/schema.sql`
4. Cliquer **Run** → toutes les tables sont créées automatiquement

### 1.3 Récupérer les clés API
1. Aller dans **Settings > API**
2. Copier :
   - `Project URL` → sera votre `NEXT_PUBLIC_SUPABASE_URL`
   - `anon public` → sera votre `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `service_role` → sera votre `SUPABASE_SERVICE_ROLE_KEY` (gardez-la secrète)

### 1.4 Créer les comptes Kouider et Houari
1. Aller dans **Authentication > Users > Add user**
2. Créer Kouider :
   - Email : kouider@autolux.dz
   - Password : (choisissez un mot de passe)
   - Cliquer "Create user"
3. Créer Houari :
   - Email : houari@autolux.dz  
   - Password : (choisissez un mot de passe)
4. **Copier l'UUID** de chaque utilisateur (colonne "User UID")

### 1.5 Lier les profils
1. SQL Editor → New query :
```sql
INSERT INTO profiles (id, name, role) VALUES
  ('REMPLACER_PAR_UUID_KOUIDER', 'Kouider', 'kouider'),
  ('REMPLACER_PAR_UUID_HOUARI', 'Houari', 'houari');
```
2. Remplacer les UUID par ceux copiés à l'étape précédente → Run

---

## ÉTAPE 2 — CONFIGURATION LOCALE (5 min)

### 2.1 Remplir le fichier .env.local
Ouvrir `.env.local` et remplacer les valeurs :

```env
NEXT_PUBLIC_SUPABASE_URL=https://VOTRE_ID.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGci...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGci...
NEXT_PUBLIC_WHATSAPP_NUMBER=213XXXXXXXXX
PHONE_KOUIDER=+213XXXXXXXXX
PHONE_HOUARI=+213XXXXXXXXX
```

### 2.2 Tester en local
```bash
cd rental-system
npm install
npm run dev
```
→ Ouvrir http://localhost:3000

---

## ÉTAPE 3 — NETLIFY (5 min)

### Option A : Via GitHub (recommandé)
1. Créer un repo GitHub → push le projet :
```bash
git init
git add .
git commit -m "Initial commit AutoLux"
git remote add origin https://github.com/VOTRE_USER/autolux.git
git push -u origin main
```

2. Aller sur https://netlify.com → "New site from Git"
3. Choisir votre repo GitHub
4. Settings de build :
   - Build command : `npm run build`
   - Publish directory : `.next`
5. Cliquer "Deploy site"

### Option B : Drag & Drop
```bash
npm run build
```
Glisser-déposer le dossier `.next` sur Netlify

### 3.1 Variables d'environnement sur Netlify
1. Netlify → votre site → **Site settings > Environment variables**
2. Ajouter TOUTES les variables de `.env.local`
3. Redéployer le site

---

## ÉTAPE 4 — TWILIO SMS (optionnel)

1. Créer un compte sur https://twilio.com
2. Acheter un numéro de téléphone
3. Récupérer :
   - Account SID
   - Auth Token
4. Remplir dans les env :
```
TWILIO_ACCOUNT_SID=ACxxxxx
TWILIO_AUTH_TOKEN=xxxxx
TWILIO_PHONE_NUMBER=+1XXXXXXXXXX
```

---

## ÉTAPE 5 — AJOUTER DES PHOTOS DE VOITURES

### Via URL directe
Dans l'admin `/admin/cars` → modifier chaque voiture → coller l'URL de l'image

### Via Supabase Storage
1. Supabase → **Storage > New bucket** → Nom : `cars` → Public
2. Upload vos photos
3. Copier l'URL publique → coller dans l'admin

---

## 📱 PWA — INSTALLATION SUR MOBILE

### iPhone (Safari)
1. Ouvrir le site dans Safari
2. Taper l'icône "Partager" (carré avec flèche)
3. "Sur l'écran d'accueil"
4. L'app est installée !

### Android (Chrome)
1. Ouvrir le site dans Chrome
2. Menu (3 points) → "Ajouter à l'écran d'accueil"
3. Confirmer → installé !

---

## 🔗 URLS IMPORTANTES

| Page | URL |
|------|-----|
| Site public | https://votre-site.netlify.app |
| Connexion admin | https://votre-site.netlify.app/login |
| Dashboard | https://votre-site.netlify.app/admin |
| Réservations | https://votre-site.netlify.app/admin/bookings |
| Véhicules | https://votre-site.netlify.app/admin/cars |
| Catalogue public | https://votre-site.netlify.app/cars |
| Réservation | https://votre-site.netlify.app/reservation |

---

## ❓ PROBLÈMES FRÉQUENTS

**"Variables Supabase manquantes"**
→ Vérifier que `.env.local` est bien rempli et que `npm run dev` a redémarré

**"Profil introuvable" à la connexion admin**
→ Vérifier que l'UUID dans `profiles` correspond exactement à celui dans `auth.users`

**Images qui ne s'affichent pas**
→ Ajouter le domaine dans `next.config.js` > `images.domains`

**SMS non reçus**
→ Vérifier les crédits Twilio et que les numéros sont au format international (+213...)
