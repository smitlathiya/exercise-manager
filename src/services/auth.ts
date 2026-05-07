import * as AuthSession from 'expo-auth-session';
import * as WebBrowser from 'expo-web-browser';
import Constants from 'expo-constants';
import { Platform } from 'react-native';
import { GOOGLE_OAUTH_SCOPES } from '@/constants';
import { useAuthStore } from '@/store/auth';
import type { GoogleProfile } from '@/types';

WebBrowser.maybeCompleteAuthSession();

const googleDiscovery = {
  authorizationEndpoint: 'https://accounts.google.com/o/oauth2/v2/auth',
  tokenEndpoint: 'https://oauth2.googleapis.com/token',
  revocationEndpoint: 'https://oauth2.googleapis.com/revoke',
};

const cfg = (Constants.expoConfig?.extra?.googleAuth ?? {}) as Record<string, string>;

export const getClientId = (): string => {
  console.log(Platform.OS, cfg.androidClientId);

  if (Platform.OS === 'ios') return cfg.iosClientId ?? cfg.expoClientId ?? '';
  if (Platform.OS === 'android') return cfg.androidClientId ?? cfg.expoClientId ?? '';
  return cfg.webClientId ?? cfg.expoClientId ?? '';
};

export const useGoogleAuthRequest = () => {
  const clientId = getClientId();
  const redirectUri = AuthSession.makeRedirectUri({ scheme: 'gymtracker' });
  return AuthSession.useAuthRequest(
    {
      clientId,
      scopes: GOOGLE_OAUTH_SCOPES,
      redirectUri,
      responseType: AuthSession.ResponseType.Code,
      usePKCE: true,
      extraParams: { access_type: 'offline', prompt: 'consent' },
    },
    googleDiscovery
  );
};

interface ExchangeArgs {
  code: string;
  codeVerifier: string;
  redirectUri: string;
}

export const exchangeCodeForTokens = async ({
  code,
  codeVerifier,
  redirectUri,
}: ExchangeArgs): Promise<void> => {
  const body = new URLSearchParams({
    client_id: getClientId(),
    code,
    code_verifier: codeVerifier,
    grant_type: 'authorization_code',
    redirect_uri: redirectUri,
  });
  const r = await fetch(googleDiscovery.tokenEndpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: body.toString(),
  });
  if (!r.ok) {
    throw new Error(`Token exchange failed: ${r.status} ${await r.text()}`);
  }
  const json = (await r.json()) as {
    access_token: string;
    refresh_token?: string;
    expires_in: number;
    id_token?: string;
  };
  const expiresAt = Date.now() + json.expires_in * 1000;
  let profile: GoogleProfile | null = null;
  try {
    const u = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
      headers: { Authorization: `Bearer ${json.access_token}` },
    });
    if (u.ok) profile = (await u.json()) as GoogleProfile;
  } catch {
    /* offline OK */
  }
  await useAuthStore.getState().setSession({
    accessToken: json.access_token,
    refreshToken: json.refresh_token ?? null,
    expiresAt,
    profile,
  });
};

export const refreshAccessToken = async (): Promise<string | null> => {
  const { refreshToken, setSession } = useAuthStore.getState();
  if (!refreshToken) return null;
  const body = new URLSearchParams({
    client_id: getClientId(),
    refresh_token: refreshToken,
    grant_type: 'refresh_token',
  });
  const r = await fetch(googleDiscovery.tokenEndpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: body.toString(),
  });
  if (!r.ok) return null;
  const json = (await r.json()) as { access_token: string; expires_in: number };
  const expiresAt = Date.now() + json.expires_in * 1000;
  await setSession({ accessToken: json.access_token, expiresAt });
  return json.access_token;
};

export const getValidAccessToken = async (): Promise<string | null> => {
  const { accessToken, expiresAt } = useAuthStore.getState();
  if (accessToken && expiresAt && Date.now() < expiresAt - 60_000) {
    return accessToken;
  }
  return refreshAccessToken();
};

export const signOut = async (): Promise<void> => {
  const { accessToken, clear } = useAuthStore.getState();
  if (accessToken) {
    try {
      await fetch(`${googleDiscovery.revocationEndpoint}?token=${accessToken}`, {
        method: 'POST',
      });
    } catch {
      /* ignore */
    }
  }
  await clear();
};
