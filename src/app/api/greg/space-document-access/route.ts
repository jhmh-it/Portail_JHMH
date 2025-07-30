import { cookies } from 'next/headers';
import { NextResponse, type NextRequest } from 'next/server';
import { z } from 'zod';

import { adminAuth } from '@/lib/firebase-admin';

// Schema validation
const createAccessSchema = z.object({
  space_id: z.string().min(1),
  document_id: z.string().min(1),
});

const deleteAccessSchema = z.object({
  space_id: z.string().min(1),
  document_id: z.string().min(1),
});

// GET /api/greg/space-document-access
export async function GET(_request: NextRequest) {
  try {
    // Vérifier l'authentification via le cookie de session
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get('session');

    if (!sessionCookie) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Vérifier si adminAuth est disponible (not build time)
    if (!adminAuth) {
      return NextResponse.json(
        { error: 'Service temporarily unavailable' },
        { status: 503 }
      );
    }

    try {
      await adminAuth.verifyIdToken(sessionCookie.value);
    } catch {
      return NextResponse.json({ error: 'Invalid session' }, { status: 401 });
    }

    // Configuration API
    const apiBaseUrl = process.env.JHMH_API_BASE_URL;
    const apiKey = process.env.JHMH_API_KEY;

    if (!apiBaseUrl || !apiKey) {
      console.error('[API] Configuration API manquante');
      return NextResponse.json(
        { error: 'Configuration API manquante' },
        { status: 500 }
      );
    }

    // Forward the request to the JHMH API
    const response = await fetch(
      `${apiBaseUrl}/api/greg/space-document-access`,
      {
        headers: {
          'x-api-key': apiKey,
        },
      }
    );

    if (!response.ok) {
      return NextResponse.json(
        { error: 'Failed to fetch access list' },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching space-document access:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/greg/space-document-access
export async function POST(request: NextRequest) {
  try {
    // Vérifier l'authentification via le cookie de session
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get('session');

    if (!sessionCookie) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Vérifier si adminAuth est disponible (not build time)
    if (!adminAuth) {
      return NextResponse.json(
        { error: 'Service temporarily unavailable' },
        { status: 503 }
      );
    }

    try {
      await adminAuth.verifyIdToken(sessionCookie.value);
    } catch {
      return NextResponse.json({ error: 'Invalid session' }, { status: 401 });
    }

    const body = await request.json();
    const validatedData = createAccessSchema.parse(body);

    // Configuration API
    const apiBaseUrl = process.env.JHMH_API_BASE_URL;
    const apiKey = process.env.JHMH_API_KEY;

    if (!apiBaseUrl || !apiKey) {
      console.error('[API] Configuration API manquante');
      return NextResponse.json(
        { error: 'Configuration API manquante' },
        { status: 500 }
      );
    }

    // Forward the request to the JHMH API
    const response = await fetch(
      `${apiBaseUrl}/api/greg/space-document-access`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
        },
        body: JSON.stringify(validatedData),
      }
    );

    if (!response.ok) {
      const errorData = await response.text();
      return NextResponse.json(
        { error: errorData || 'Failed to create access' },
        { status: response.status }
      );
    }

    return NextResponse.json({ success: true }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid data', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Error creating space-document access:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE /api/greg/space-document-access
export async function DELETE(request: NextRequest) {
  try {
    // Vérifier l'authentification via le cookie de session
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get('session');

    if (!sessionCookie) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Vérifier si adminAuth est disponible (not build time)
    if (!adminAuth) {
      return NextResponse.json(
        { error: 'Service temporarily unavailable' },
        { status: 503 }
      );
    }

    try {
      await adminAuth.verifyIdToken(sessionCookie.value);
    } catch {
      return NextResponse.json({ error: 'Invalid session' }, { status: 401 });
    }

    const body = await request.json();
    const validatedData = deleteAccessSchema.parse(body);

    // Configuration API
    const apiBaseUrl = process.env.JHMH_API_BASE_URL;
    const apiKey = process.env.JHMH_API_KEY;

    if (!apiBaseUrl || !apiKey) {
      console.error('[API] Configuration API manquante');
      return NextResponse.json(
        { error: 'Configuration API manquante' },
        { status: 500 }
      );
    }

    // Forward the request to the JHMH API
    const response = await fetch(
      `${apiBaseUrl}/api/greg/space-document-access`,
      {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
        },
        body: JSON.stringify(validatedData),
      }
    );

    if (!response.ok) {
      const errorData = await response.text();
      return NextResponse.json(
        { error: errorData || 'Failed to delete access' },
        { status: response.status }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid data', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Error deleting space-document access:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
