# Google Authentication Setup

The following packages have been installed via terminal to enable Google OAuth:

1. **@react-oauth/google**: The official React wrapper for Google Identity Services.
2. **jwt-decode**: A small library to decode the JSON Web Tokens (JWT) returned by Google.

## Installation Commands Used:
```powershell
npm install @react-oauth/google jwt-decode
```

## Configuration Steps:
1. Go to [Google Cloud Console](https://console.cloud.google.com/).
2. Create or select a project.
3. Go to **APIs & Services > Credentials**.
4. Create an **OAuth 2.0 Client ID**.
5. Add your authorized Javascript Origins (e.g., `http://localhost:5173`).
6. Copy the **Client ID** and paste it into `src/main.jsx`.

## Implementation Summary:
- **Provider**: The app is wrapped in `GoogleOAuthProvider` in `src/main.jsx`.
- **Login Component**: `GoogleLogin` from `@react-oauth/google` is used in the `LandingView`.
- **Decoding**: `jwtDecode` is used to extract user name and details from the Google response.
- **Session**: The user state is saved to `localStorage` as `pi78_auth_user`.
