import { isEmailAllowed } from './index';

/**
 * Tests de validation pour la fonction isEmailAllowed
 */
function runValidationTests(): void {
  console.warn('🧪 Tests de validation - Fonction isEmailAllowed');
  console.warn('================================================');

  const testCases = [
    // Cas valides
    {
      email: 'john.doe@jhmh.com',
      expected: true,
      description: 'Email valide @jhmh.com',
    },
    {
      email: 'marie.martin@jhmh.com',
      expected: true,
      description: 'Email avec prénom composé',
    },
    {
      email: 'admin@jhmh.com',
      expected: true,
      description: 'Email admin simple',
    },
    {
      email: 'UPPERCASE@JHMH.COM',
      expected: true,
      description: 'Email en majuscules',
    },
    {
      email: '  spaces@jhmh.com  ',
      expected: true,
      description: 'Email avec espaces',
    },

    // Cas invalides
    {
      email: 'user@gmail.com',
      expected: false,
      description: 'Email Gmail (externe)',
    },
    {
      email: 'test@yahoo.fr',
      expected: false,
      description: 'Email Yahoo (externe)',
    },
    {
      email: 'user@company.com',
      expected: false,
      description: 'Autre domaine professionnel',
    },
    { email: '', expected: false, description: 'Email vide' },
    {
      email: 'invalid-email',
      expected: false,
      description: 'Format email invalide',
    },
    {
      email: '@jhmh.com',
      expected: false,
      description: 'Email sans partie locale',
    },
    { email: 'user@', expected: false, description: 'Email sans domaine' },
  ];

  let passed = 0;
  let failed = 0;

  testCases.forEach((testCase, index) => {
    try {
      const result = isEmailAllowed(testCase.email);
      const success = result === testCase.expected;

      if (success) {
        console.warn(`✅ Test ${index + 1}: ${testCase.description}`);
        passed++;
      } else {
        console.error(`❌ Test ${index + 1}: ${testCase.description}`);
        console.error(`   Email: "${testCase.email}"`);
        console.error(`   Attendu: ${testCase.expected}, Reçu: ${result}`);
        failed++;
      }
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      console.error(`💥 Test ${index + 1}: Erreur inattendue`);
      console.error(`   ${testCase.description}`);
      console.error(`   Erreur: ${errorMessage}`);
      failed++;
    }
  });

  console.warn('');
  console.warn('📊 Résultats des tests:');
  console.warn(`   ✅ Réussis: ${passed}`);
  console.warn(`   ❌ Échoués: ${failed}`);
  console.warn(`   📋 Total: ${testCases.length}`);

  if (failed === 0) {
    console.warn('🎉 Tous les tests sont passés !');
  } else {
    console.error(`⚠️  ${failed} test(s) ont échoué.`);
  }
}

/**
 * Tests de performance
 */
function runPerformanceTests(): void {
  console.warn('');
  console.warn('⚡ Tests de performance');
  console.warn('=====================');

  const iterations = 100000;
  const testEmail = 'performance.test@jhmh.com';

  console.warn(`Exécution de ${iterations.toLocaleString()} validations...`);

  const startTime = Date.now();

  for (let i = 0; i < iterations; i++) {
    isEmailAllowed(testEmail);
  }

  const endTime = Date.now();
  const duration = endTime - startTime;
  const perSecond = Math.round((iterations / duration) * 1000);

  console.warn(`⏱️  Durée: ${duration}ms`);
  console.warn(
    `🚀 Performance: ${perSecond.toLocaleString()} validations/seconde`
  );

  if (perSecond > 50000) {
    console.warn('✅ Performance excellente !');
  } else if (perSecond > 10000) {
    console.warn('🟡 Performance correcte');
  } else {
    console.error('🔴 Performance faible');
  }
}

// Exécuter tous les tests
if (require.main === module) {
  runValidationTests();
  runPerformanceTests();
}
