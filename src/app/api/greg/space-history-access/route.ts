import { NextResponse } from 'next/server';

import {
  createApiRouteHandler,
  createValidatedApiRouteHandler,
} from '@/app/home/greg/lib/api-route-wrapper';
import { createGregSuccessResponse } from '@/app/home/greg/services/greg.service';
import {
  createSpaceHistoryAccessSchema,
  updateSpaceHistoryAccessSchema,
  deleteSpaceHistoryAccessSchema,
  type CreateSpaceHistoryAccessRequest,
  type UpdateSpaceHistoryAccessRequest,
  type DeleteSpaceHistoryAccessRequest,
} from '@/app/home/greg/types/space-history-access';

// GET /api/greg/space-history-access
export const GET = createApiRouteHandler(
  {
    method: 'GET',
    endpoint: '/api/greg/space-history-access',
  },
  async (request, _, gregService) => {
    if (!gregService) {
      throw new Error('Greg service not available');
    }
    const result = await gregService.getSpaceHistoryAccess();

    if (!result.success) {
      throw new Error('Failed to fetch space history access');
    }

    return NextResponse.json(result.data);
  }
);

// POST /api/greg/space-history-access
export const POST = createValidatedApiRouteHandler<
  CreateSpaceHistoryAccessRequest,
  NextResponse
>(
  {
    method: 'POST',
    endpoint: '/api/greg/space-history-access',
  },
  createSpaceHistoryAccessSchema,
  async (request, validatedData, gregService) => {
    const result = await gregService.createSpaceHistoryAccess(validatedData);

    if (!result.success) {
      throw new Error('Failed to create space history access');
    }

    return NextResponse.json(
      createGregSuccessResponse(result.data, 'Space history access created'),
      { status: 201 }
    );
  }
);

// PUT /api/greg/space-history-access
export const PUT = createValidatedApiRouteHandler<
  UpdateSpaceHistoryAccessRequest,
  NextResponse
>(
  {
    method: 'PUT',
    endpoint: '/api/greg/space-history-access',
  },
  updateSpaceHistoryAccessSchema,
  async (request, validatedData, gregService) => {
    const result = await gregService.updateSpaceHistoryAccess(validatedData);

    if (!result.success) {
      throw new Error('Failed to update space history access');
    }

    return NextResponse.json(
      createGregSuccessResponse(result.data, 'Space history access updated')
    );
  }
);

// DELETE /api/greg/space-history-access
export const DELETE = createValidatedApiRouteHandler<
  DeleteSpaceHistoryAccessRequest,
  NextResponse
>(
  {
    method: 'DELETE',
    endpoint: '/api/greg/space-history-access',
  },
  deleteSpaceHistoryAccessSchema,
  async (request, validatedData, gregService) => {
    const result = await gregService.deleteSpaceHistoryAccess(validatedData);

    if (!result.success) {
      throw new Error('Failed to delete space history access');
    }

    return NextResponse.json(
      createGregSuccessResponse(result.data, 'Space history access deleted')
    );
  }
);
