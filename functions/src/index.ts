/**
 * Cloud Functions for Firebase - Node.js/TypeScript
 * Authentication domain restriction for JHMH platform
 * Deploy with `firebase deploy --only functions`
 */

import * as admin from 'firebase-admin';
import { onRequest } from 'firebase-functions/v2/https';
import { beforeUserSignedIn } from 'firebase-functions/v2/identity';

// Initialize Firebase Admin SDK
admin.initializeApp();

/**
 * Vérifie si l'email appartient à un domaine autorisé
 */
export function isEmailAllowed(email: string): boolean {
  if (!email) return false;

  const normalizedEmail = email.toLowerCase().trim();
  const domain = normalizedEmail.split('@')[1] ?? '';

  return domain === 'jhmh.com';
}

/**
 * Cloud Function beforeUserSignedIn
 * Vérifie que l'email appartient au domaine @jhmh.com
 */
export const beforeUserSignedInRestrictToJhmhDomain = beforeUserSignedIn(
  {
    region: 'europe-west1',
  },
  async event => {
    const email = event.data?.email;

    if (!email) {
      throw new Error('Email is required for authentication');
    }

    if (!isEmailAllowed(email)) {
      throw new Error(
        `Access denied. Only @jhmh.com email addresses are allowed. Attempted: ${email}`
      );
    }

    console.warn('[Auth] Access granted for:', email);
    return;
  }
);

/**
 * Cloud Function de santé pour vérifier le bon fonctionnement
 */
export const healthCheck = onRequest(
  {
    region: 'europe-west1',
  },
  async (req, res) => {
    try {
      const allowedEmail = 'test@jhmh.com';
      const blockedEmail = 'test@gmail.com';

      const testResults = [
        {
          test: 'Allow @jhmh.com emails',
          email: allowedEmail,
          result: isEmailAllowed(allowedEmail),
          expected: true,
        },
        {
          test: 'Block external emails',
          email: blockedEmail,
          result: isEmailAllowed(blockedEmail),
          expected: false,
        },
      ];

      const allPassed = testResults.every(
        test => test.result === test.expected
      );

      const response = {
        status: allPassed ? 'healthy' : 'unhealthy',
        timestamp: new Date().toISOString(),
        version: '2.0.0',
        region: 'europe-west1',
        tests: testResults,
        config: {
          allowedDomain: '@jhmh.com',
          totalTests: testResults.length,
          passedTests: testResults.filter(t => t.result === t.expected).length,
        },
      };

      res.set('Access-Control-Allow-Origin', '*');
      res.set('Access-Control-Allow-Methods', 'GET');
      res.set('Cache-Control', 'no-cache');

      if (allPassed) {
        console.warn('[Health] All tests passed');
        res.status(200).json(response);
      } else {
        console.error('[Health] Some tests failed', testResults);
        res.status(500).json(response);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      console.error('[Health] Health check failed:', errorMessage);

      res.status(500).json({
        status: 'error',
        timestamp: new Date().toISOString(),
        error: errorMessage,
      });
    }
  }
);
