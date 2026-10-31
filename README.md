# Dream Market Podcast — React + Vite + Firestore (v2)

## Waxa cusub
- **`/admin`** si toos ah ayuu u furmaa (tusaale `dream.galladtech.com/admin`).
- **Login** wuxuu ka akhriyaa collection-ka **`admin-dream`** (username + password). Admin cusub ku dar: doc cusub oo ID-giisu = username-ka.
- Admin-ku wuxuu maamulaa **wax kasta**: logo, hero, qoraalada, badhamada, ticker, stats, cinwaanada qaybaha, About, contact, social links, footer,
  episodes, shows, guests, partners, fariimaha iyo subscribers.
- **Upload sawir & video** (Firebase Storage) ama ku dheji link.
- **Kala horreyn (position):** ↑ ↓ — website-ku sida admin-ku u dhigo ayuu u muujiyaa. 🙈 = qari.

## ⚙️ Firebase — samee hal mar
1. **Authentication → Sign-in method → Anonymous → Enable** (login-ka admin-ka ayaa u baahan).
2. **Firestore → Rules:** fur `firestore.rules`, koobi qaybta `BEGIN DREAM … END DREAM` kuna dar rules-kaaga hadda jira
   gudaha `match /databases/{database}/documents { … }` → **Publish**. ⚠️ Ha tirtirin rules-ka apps-kaaga kale.
3. **Storage → Rules:** sidoo kale ku dar qaybta `BEGIN DREAM … END DREAM` ee `storage.rules` → **Publish**
   (haddii la weydiiyo "grant permission to access Firestore" → Allow).
4. Gal `/admin` → Dashboard → **Seed demo data** (hal mar) → kadib wax walba wax ka beddel.

> Haddii rules-kaagu leeyihiin `allow read, write: if true` oo guud (test mode), qof kasta wuu akhrin karaa `admin-dream`. Ka saar si password-ku u ammaan noqdo.

## Hosting — si `/admin` u shaqeeyo
| Host | File (waa la sameeyay) |
|---|---|
| cPanel / Hostinger / Apache | `public/.htaccess` (wuxuu galayaa `dist/`) |
| Netlify | `public/_redirects` |
| Vercel | `vercel.json` |
| Firebase Hosting | `firebase.json` |

```bash
npm install
npm run build     # kadib dist/ oo dhan upload garee (ay ku jirto .htaccess)
```

## Collections (Firestore)
`dreamSettings/site` · `dreamEpisodes` · `dreamShows` · `dreamGuests` · `dreamPartners` · `dreamMessages` · `dreamSubscribers` · `dreamAdminSessions` · `admin-dream` (adiga ayaa maamula)
