/**
 * Utilitaires de logging pour les appels d'API
 */

export interface ApiCallLog {
  endpoint: string;
  method: string;
  success: boolean;
  statusCode?: number;
  duration?: number;
  error?: string;
  requestParams?: Record<string, unknown>;
  responseSize?: number;
}

/**
 * Logs standardisés pour les appels d'API JHMH
 */
export function logApiCall(log: ApiCallLog): void {
  const timestamp = new Date().toISOString();
  const prefix = `[API Call ${log.method} ${log.endpoint}]`;

  if (log.success) {
    console.warn(`${prefix} ✅ Success in ${log.duration}ms`, {
      timestamp,
      statusCode: log.statusCode,
      responseSize: log.responseSize,
      requestParams: log.requestParams,
    });
  } else {
    console.error(`${prefix} ❌ Error in ${log.duration}ms`, {
      timestamp,
      statusCode: log.statusCode,
      error: log.error,
      requestParams: log.requestParams,
    });
  }
}

/**
 * Logs spécifiques pour les APIs JHMH externes
 */
export function logJhmhApiCall(
  endpoint: string,
  method: string,
  success: boolean,
  options: {
    statusCode?: number;
    duration?: number;
    error?: string;
    requestParams?: Record<string, unknown>;
    responseSize?: number;
    responseData?: unknown;
  } = {}
): void {
  const log: ApiCallLog = {
    endpoint: `JHMH:${endpoint}`,
    method,
    success,
    ...options,
  };

  logApiCall(log);

  // Log additionnel en mode développement
  if (process.env.NODE_ENV === 'development' && options.responseData) {
    console.warn(`[JHMH API Response] ${endpoint}:`, {
      data: options.responseData,
      size: options.responseSize,
    });
  }
}

/**
 * Logs pour les erreurs Greg API
 */
export function logGregApiError(
  operation: string,
  endpoint: string,
  error: unknown,
  context?: Record<string, unknown>
): void {
  const errorMessage = error instanceof Error ? error.message : String(error);

  console.error(`[Greg API Error] ${operation} failed:`, {
    timestamp: new Date().toISOString(),
    endpoint,
    error: errorMessage,
    context,
    stack: error instanceof Error ? error.stack : undefined,
  });
}

/**
 * Wrapper pour mesurer le temps d'exécution d'un appel API
 */
export async function measureApiCall<T>(
  operation: () => Promise<T>,
  logInfo: Omit<ApiCallLog, 'success' | 'duration'>
): Promise<T> {
  const startTime = Date.now();

  try {
    const result = await operation();
    const duration = Date.now() - startTime;

    logApiCall({
      ...logInfo,
      success: true,
      duration,
    });

    return result;
  } catch (error) {
    const duration = Date.now() - startTime;
    const errorMessage = error instanceof Error ? error.message : String(error);

    logApiCall({
      ...logInfo,
      success: false,
      duration,
      error: errorMessage,
    });

    throw error;
  }
}
