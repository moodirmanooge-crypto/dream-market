# Dream Market Podcast — React + Vite + Firestore

Website casri ah (Black · Gold · White) oo leh animations, sliders, mobile & laptop design, iyo Firestore database.

## 1. Ku shaqeysii kombiyuutarkaaga
```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # dist/ folder-ka ayaa diyaar u ah hosting
```

## 2. Firebase (project: barakaat-a9fe1) — config-ga waa ku jiraa `src/firebase.js`
1. Firebase Console → **Firestore Database** → Create database.
2. **Rules** tab → ku dheji waxa ku jira `firestore.rules` → Publish.
3. **Authentication** → Sign-in method → Email/Password **Enable** → Users → **Add user** (admin-kaaga).

## 3. Admin Panel
- Fur: `http://localhost:5173/#/admin` (ama link-ga "Admin" ee footer-ka).
- Ku gal email/password-ka admin-ka.
- Riix **Seed demo data** si xogta tusaalaha ah loogu shubo Firestore, kadibna ku dar / beddel / tirtir:
  **episodes, shows, guests, partners**. Waxaad sidoo kale arki kartaa **messages** (contact form) iyo **subscribers** (newsletter).
- Episode kasta waxaad siin kartaa **YouTube link** (wuxuu ka furmaa player modal) iyo **image URL**.

## 4. Sawirka hero-ga
Sawirkaaga (tusaale studio-ga sabahvisions) ku rid `public/hero.jpg` — si toos ah ayuu u soo baxayaa slide-ka koowaad.
Haddii aanu jirin, studio illustration animated ah ayaa la tusaa.

## Firestore collections
| Collection | Fields |
|---|---|
| episodes | number, title, guest, role, category, duration, youtube, image, description, featured |
| shows | title, icon, description |
| guests | name, role, image |
| partners | name, logo |
| messages | name, email, type, message, createdAt (website-ka ayaa qora) |
| subscribers | email, createdAt (website-ka ayaa qora) |

## Hosting (Firebase)
```bash
npm i -g firebase-tools
firebase login
firebase init hosting   # public dir: dist, single-page app: yes
npm run build && firebase deploy
```
