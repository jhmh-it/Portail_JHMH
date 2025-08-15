import { NextResponse } from 'next/server';

import {
  createApiRouteHandler,
  createValidatedApiRouteHandler,
} from '@/app/home/greg/lib/api-route-wrapper';
import { createGregSuccessResponse } from '@/app/home/greg/services/greg.service';
import {
  createSpaceDocumentAccessSchema,
  deleteSpaceDocumentAccessSchema,
  type CreateSpaceDocumentAccessRequest,
  type DeleteSpaceDocumentAccessRequest,
} from '@/app/home/greg/types/space-document-access';

// GET /api/greg/space-document-access
export const GET = createApiRouteHandler(
  {
    method: 'GET',
    endpoint: '/api/greg/space-document-access',
  },
  async (request, _, gregService) => {
    if (!gregService) {
      throw new Error('Greg service not available');
    }
    const result = await gregService.getSpaceDocumentAccess();

    if (!result.success) {
      throw new Error('Failed to fetch space document access');
    }

    return NextResponse.json(result.data);
  }
);

// POST /api/greg/space-document-access
export const POST = createValidatedApiRouteHandler<
  CreateSpaceDocumentAccessRequest,
  NextResponse
>(
  {
    method: 'POST',
    endpoint: '/api/greg/space-document-access',
  },
  createSpaceDocumentAccessSchema,
  async (request, validatedData, gregService) => {
    const result = await gregService.createSpaceDocumentAccess(validatedData);

    if (!result.success) {
      throw new Error('Failed to create space document access');
    }

    return NextResponse.json(
      createGregSuccessResponse(result.data, 'Space document access created'),
      { status: 201 }
    );
  }
);

// DELETE /api/greg/space-document-access
export const DELETE = createValidatedApiRouteHandler<
  DeleteSpaceDocumentAccessRequest,
  NextResponse
>(
  {
    method: 'DELETE',
    endpoint: '/api/greg/space-document-access',
  },
  deleteSpaceDocumentAccessSchema,
  async (request, validatedData, gregService) => {
    const result = await gregService.deleteSpaceDocumentAccess(validatedData);

    if (!result.success) {
      throw new Error('Failed to delete space document access');
    }

    return NextResponse.json(
      createGregSuccessResponse(result.data, 'Space document access deleted')
    );
  }
);
