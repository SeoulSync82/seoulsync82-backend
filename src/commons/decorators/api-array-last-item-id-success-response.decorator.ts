import { applyDecorators, Type } from '@nestjs/common';
import { ApiOkResponse, ApiResponseOptions, getSchemaPath } from '@nestjs/swagger';

export const ApiArrayLastItemIdSuccessResponse = <TModel extends Type<unknown>>(
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
                  last_item_id: {
                    type: 'number',
                    description: '마지막 아이템의 ID',
                  },
                },
              },
            },
          },
        ],
      },
    }),
  );
};
