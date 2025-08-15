import { cookies } from 'next/headers';
import { NextResponse, type NextRequest } from 'next/server';
import { z } from 'zod';

import { adminAuth } from '@/lib/firebase-admin';

// Schema validation
const updateUserSchema = z.object({
  name: z.string().optional(),
  mail: z.string().email('Email invalide').optional(),
  custom_instruction: z.string().optional(),
  frequence_utilisation: z.number().int().optional(),
  rn: z.number().int().optional(),
  source_prefere: z.string().optional(),
  sources: z.boolean().optional(),
  verbose: z.boolean().optional(),
});

// GET /api/greg/users/{user_id}
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    // Await params before using
    const { userId } = await params;
    // The upstream Greg API expects IDs in the form "users/{id}".
    // Our route param cannot contain slashes, so we normalize here.
    const upstreamId = userId.startsWith('users/') ? userId : `users/${userId}`;

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
    const response = await fetch(`${apiBaseUrl}/api/greg/users/${upstreamId}`, {
      headers: {
        'x-api-key': apiKey,
      },
    });

    if (!response.ok) {
      if (response.status === 404) {
        return NextResponse.json({ error: 'User not found' }, { status: 404 });
      }
      return NextResponse.json(
        { error: 'Failed to fetch user' },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching user:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT /api/greg/users/{user_id}
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    // Await params before using
    const { userId } = await params;
    // Normalize for upstream API
    const upstreamId = userId.startsWith('users/') ? userId : `users/${userId}`;

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
    const validatedData = updateUserSchema.parse(body);

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
    const response = await fetch(`${apiBaseUrl}/api/greg/users/${upstreamId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
      },
      body: JSON.stringify(validatedData),
    });

    if (!response.ok) {
      if (response.status === 404) {
        return NextResponse.json({ error: 'User not found' }, { status: 404 });
      }
      const errorData = await response.text();
      return NextResponse.json(
        { error: errorData || 'Failed to update user' },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid data', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Error updating user:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE /api/greg/users/{user_id}
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    // Await params before using
    const { userId } = await params;
    // Normalize for upstream API
    const upstreamId = userId.startsWith('users/') ? userId : `users/${userId}`;

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
    const response = await fetch(`${apiBaseUrl}/api/greg/users/${upstreamId}`, {
      method: 'DELETE',
      headers: {
        'x-api-key': apiKey,
      },
    });

    if (!response.ok) {
      if (response.status === 404) {
        return NextResponse.json({ error: 'User not found' }, { status: 404 });
      }
      return NextResponse.json(
        { error: 'Failed to delete user' },
        { status: response.status }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting user:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
