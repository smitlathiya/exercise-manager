import React, { useEffect, useState } from 'react';
import { View, Alert } from 'react-native';
import * as AuthSession from 'expo-auth-session';
import { Screen, Text, Button, Card } from '@/components/ui';
import { useTheme } from '@/hooks/useTheme';
import { useGoogleAuthRequest, exchangeCodeForTokens } from '@/services/auth';

export const AuthScreen: React.FC = () => {
  const t = useTheme();
  const [request, response, promptAsync] = useGoogleAuthRequest();
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const handle = async () => {
      if (response?.type !== 'success') return;
      try {
        setBusy(true);
        const code = response.params.code;
        const verifier = request?.codeVerifier;
        const redirectUri = AuthSession.makeRedirectUri({ scheme: 'gymtracker' });
        if (!code || !verifier) throw new Error('Missing code or verifier.');
        await exchangeCodeForTokens({ code, codeVerifier: verifier, redirectUri });
      } catch (e) {
        const msg = e instanceof Error ? e.message : 'Sign-in failed.';
        Alert.alert('Sign-in failed', msg);
      } finally {
        setBusy(false);
      }
    };
    void handle();
  }, [response, request]);

  return (
    <Screen>
      <View style={{ flex: 1, justifyContent: 'space-between' }}>
        <View style={{ paddingTop: t.spacing.xxl }}>
          <Text variant="display" style={{ marginBottom: t.spacing.sm }}>
            Gym Tracker
          </Text>
          <Text variant="body" color="muted">
            Local-first workout tracking with private Google Drive backups.
          </Text>
        </View>

        <Card style={{ marginVertical: t.spacing.xl }}>
          <Text variant="h3">Why Google?</Text>
          <Text variant="body" color="muted" style={{ marginTop: t.spacing.sm }}>
            Sign in with Google to keep an encrypted backup in a private app folder
            in your Drive. We can only see files this app creates — never the rest
            of your Drive.
          </Text>
        </Card>

        <View>
          <Button
            title="Continue with Google"
            onPress={() => promptAsync()}
            fullWidth
            loading={busy}
            disabled={!request}
          />
          <Text
            variant="caption"
            color="dim"
            align="center"
            style={{ marginTop: t.spacing.md }}
          >
            Scope: drive.appdata only
          </Text>
        </View>
      </View>
    </Screen>
  );
};
