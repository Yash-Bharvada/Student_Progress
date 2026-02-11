# GitHub App Callback URL Configuration

## Important: Update Your GitHub App Settings

Your GitHub App needs to be configured with the correct callback URL.

### Steps to Configure:

1. Go to your GitHub App settings:
   ```
   https://github.com/settings/apps/student-progress
   ```

2. Scroll to **"Callback URL"** or **"Setup URL"**

3. Set the **Setup URL** (redirect after installation) to:
   ```
   http://localhost:3001/api/auth/callback/github
   ```

4. For production, update to your production domain:
   ```
   https://yourdomain.com/api/auth/callback/github
   ```

### Alternative: Use GitHub's Default Redirect

If GitHub doesn't support custom setup URLs, you can:

1. After installation, GitHub redirects to: `https://github.com/settings/installations/{installation_id}`

2. Add a "Return to App" button on your landing page that links to:
   ```
   /api/auth/callback/github?installation_id=105130625
   ```

### Testing the Callback

Test the callback manually:
```bash
curl "http://localhost:3001/api/auth/callback/github?installation_id=105130625&setup_action=install"
```

This should:
1. Set the `student_installation_id` cookie
2. Redirect to `/dashboard`

### Debugging

Check the terminal logs when you install the app. You should see:
```
GitHub Callback Received: {
  installationId: '105130625',
  setupAction: 'install',
  ...
}
✅ GitHub App Installation successful
✅ Cookie set, redirecting to /dashboard
```

If you don't see these logs, GitHub isn't redirecting to the callback URL.
