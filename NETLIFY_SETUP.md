Netlify deployment — quick steps

1) Push this repository to a Git provider (GitHub/GitLab/Bitbucket) and ensure `main` is up to date.

2) In Netlify: Site → New site → "Import from Git" → pick your repo.
   - Branch to deploy: `main`
   - Build command: `npm run build`
   - Publish directory: `dist`
   - Base directory: `shri-ganesh-frontend`

3) Environment variables (Netlify UI → Site settings → Build & deploy → Environment):
   - `VITE_API_URL` = https://<your-backend-domain>/api  (set to your production backend)
   - `VITE_GOOGLE_CLIENT_ID` = <your-google-client-id>
   - `VITE_GOOGLE_API_KEY` = <your-google-api-key>  (set the key you provided)
   > Do NOT commit real secrets to the repo — use Netlify environment variables.

4) Save and trigger a deploy (Netlify will build on every push to `main`).

Local commit steps (example):

```bash
git add netlify.toml shri-ganesh-frontend/.env.example NETLIFY_SETUP.md
git commit -m "Add Netlify config + env placeholders"
git push origin main
```

If you want, I can also:
- Walk you through connecting the repo on Netlify UI
- Create a `netlify.toml` tweak or add branch previews
- Add a GitHub Action that triggers a Netlify deploy token (if you prefer GitHub Actions)
