/** Maps NextAuth `?error=` codes to user-facing copy (login page). */
export function authErrorMessage(code: string | null): string | null {
  if (!code) return null;

  switch (code) {
    case "Configuration":
      return "Auth is misconfigured. On Render set AUTH_SECRET and AUTH_URL to your public URL (e.g. https://cryolink-bk00.onrender.com) — not localhost or port 10000. Locally run npm run dev and open http://localhost:3000.";
    case "AccessDenied":
      return "Access denied. This account may not use the sign-in method you chose.";
    case "Verification":
      return "The sign-in link expired or was already used. Try again.";
    case "OAuthSignin":
    case "OAuthCallback":
    case "OAuthCreateAccount":
      return "Google sign-in failed. Check OAuth redirect URLs and client credentials.";
    case "CredentialsSignin":
      return "Invalid email or password for this role.";
    case "OAuthRoleRequired":
      return "Choose your role on the home screen, then use Google sign-in from that role’s login page.";
    case "OAuthSignupFailed":
      return "Google sign-up failed. Ensure the database is seeded, then try again.";
    case "RoleMismatch":
      return "This Google account belongs to a different role. Go back and pick the correct role card.";
    default:
      return "Sign-in failed. Try email/password or sign up.";
  }
}
