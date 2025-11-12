import { z } from 'zod';

export const ListQuerySchema = z
  .object({
    page: z.coerce.number().optional(),
    limit: z.coerce.number().optional(),
    query: z.string().trim().optional(),
  })
  .transform((paramValue) => {
    // Drop explicit undefined keys for exactOptionalPropertyTypes compliance
    const returnValue: Record<string, unknown> = {};
    if (Number.isFinite(paramValue.page!)) returnValue.page = Math.floor(paramValue.page!);
    if (Number.isFinite(paramValue.limit!)) returnValue.limit = Math.floor(paramValue.limit!);
    if (paramValue.query !== undefined) returnValue.query = paramValue.query;
    return returnValue;
  });
