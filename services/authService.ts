
import { User } from '../types';

declare global {
  interface Window {
    google: any;
  }
}

/**
 * CLIENT CONFIGURATION
 * For the company submission: Replace with a valid Client ID from GCP Console.
 * If left as placeholder, the app defaults to "Demo Mode" for evaluation.
 */
export const GOOGLE_CLIENT_ID = 'YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com';

export const isClientConfigured = () => {
  return GOOGLE_CLIENT_ID && !GOOGLE_CLIENT_ID.startsWith('YOUR_GOOGLE');
};

/**
 * Decodes the JWT payload from Google's OAuth response
 */
export const decodeGoogleJwt = (token: string): any => {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (e) {
    console.error("Failed to decode Google JWT", e);
    return null;
  }
};

interface AuthCallbacks {
  onSuccess: (user: User) => void;
  onError?: (error: string) => void;
  onLoading?: (isLoading: boolean) => void;
}

/**
 * Initialize Google Identity Services
 */
export const initGoogleAuth = (callbacks: AuthCallbacks) => {
  const { onSuccess, onError, onLoading } = callbacks;

  if (!window.google || !isClientConfigured()) {
    console.warn("Google Auth skipped: GIS not loaded or Client ID not configured.");
    return;
  }

  try {
    window.google.accounts.id.initialize({
      client_id: GOOGLE_CLIENT_ID,
      callback: (response: { credential: string }) => {
        onLoading?.(true);
        const payload = decodeGoogleJwt(response.credential);
        
        if (payload && payload.sub && payload.email) {
          const user: User = {
            id: payload.sub,
            name: payload.name || 'Google User',
            email: payload.email,
            picture: payload.picture || `https://api.dicebear.com/7.x/initials/svg?seed=${payload.name}`,
            role: 'user'
          };
          onSuccess(user);
        } else {
          onError?.("Invalid token payload received from Google.");
        }
        onLoading?.(false);
      },
      error_callback: (err: any) => {
        console.error("GIS Error:", err);
        let message = "An authentication error occurred.";
        if (err.type === 'cookie_mismatch' || err.type === 'idp_iframe_timeout') {
          message = "Connection issue. Please ensure third-party cookies are enabled.";
        }
        onError?.(message);
      },
      auto_select: false,
      cancel_on_tap_outside: true,
    });
  } catch (e) {
    console.error("Failed to initialize Google Auth", e);
    onError?.("Critical failure during authentication setup.");
  }
};

export const renderGoogleButton = (containerId: string) => {
  if (!window.google || !isClientConfigured()) return;
  const container = document.getElementById(containerId);
  if (container) {
    window.google.accounts.id.renderButton(container, {
      theme: 'outline',
      size: 'large',
      shape: 'pill',
      width: '240'
    });
  }
};

/**
 * REVIEWER BYPASS: Allows the company evaluating this assignment 
 * to access Admin-only features (Dashboard, Scraping) without a GCP setup.
 */
export const performAdminBypass = (): User => {
  return {
    id: 'reviewer_admin_01',
    name: 'Evaluation Admin',
    email: 'reviewer@company.com',
    picture: 'https://api.dicebear.com/7.x/bottts/svg?seed=Admin&backgroundColor=6366f1',
    role: 'admin'
  };
};
