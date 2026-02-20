Production checklist — quick fixes applied

- Pin React: Added `overrides` to package.json to force `react`/`react-dom` to 19.2.3 to satisfy @clerk/nextjs peer requirements.
- Resolutions kept: `resolutions` remains for npm-force-resolutions compatibility.
- Engines: Added `engines` to suggest Node >=18 and npm >=9 on the deployment platform.

Next steps (what you should verify on deployment):

- Clear the build cache on your host (Vercel) and redeploy so overrides take effect.
- If deployment still fails, set the install command to `npm install --legacy-peer-deps` or enable `NPM_FLAGS=--legacy-peer-deps` on the host as a temporary workaround.
- Ensure environment variables are set securely in your deployment provider, not in `.env` in the repo.
- Optional: remove `preinstall`/`npm-force-resolutions` after verifying `overrides` fixes the issue.

Local test commands:

```bash
npm ci
npm run build
```

If you want, I can also try updating Clerk to a newer patch that explicitly supports the React version found during the failed deploy.
