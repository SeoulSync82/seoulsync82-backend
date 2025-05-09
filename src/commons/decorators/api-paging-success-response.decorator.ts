import { applyDecorators, Type } from '@nestjs/common';
import { ApiOkResponse, ApiResponseOptions, getSchemaPath } from '@nestjs/swagger';

export const ApiPagingSuccessResponse = <TModel extends Type<unknown>>(
  model: TModel,
  options?: ApiResponseOptions,
) => {
  return applyDecorators(
    ApiOkResponse({
      ...options,
      schema: {
        allOf: [
          {
            properties: {
              status: { type: 'string', default: 'SUCCESS' },
              statusCode: { type: 'number', default: 200 },
              timestamp: { type: 'string', example: new Date().toISOString() },
              path: { type: 'string' },
              data: {
                type: 'object',
                properties: {
                  items: {
                    type: 'array',
                    items: { $ref: getSchemaPath(model) },
                  },
                  total_count: { type: 'number', description: '전체 건수' },
                  next_page: { type: 'string', description: '다음 페이지 Encrypted 커서' },
                },
              },
            },
          },
        ],
      },
    }),
  );
};
