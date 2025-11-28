import { useRouter } from "expo-router";
import { signOut } from 'firebase/auth';
import { useEffect } from "react";
import { auth } from './firebase';

export default function IndexRedirect() {
  const router = useRouter();

  useEffect(() => {
    // Ensure any persisted auth session is cleared on app start so the
    // login screen is always shown first. If sign-out fails we still
    // redirect to `/auth` to show the login UI.
    (async () => {
      try {
        await signOut(auth);
      } catch {
        // ignore errors; proceed to show auth screen
      } finally {
        router.replace('/auth');
      }
    })();
  }, [router]);

  return null;
}
