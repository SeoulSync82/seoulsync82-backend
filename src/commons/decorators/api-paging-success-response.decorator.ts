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
              status_code: {
                type: 'number',
                default: 1,
              },
              status: {
                type: 'string',
                default: 'SUCCESS',
              },
              data: {
                type: 'object',
                properties: {
                  items: {
                    type: 'array',
                    items: {
                      $ref: getSchemaPath(model),
                    },
                  },
                  total_count: {
                    type: 'number',
                    description: 'total_count',
                  },
                  next_page: {
                    type: 'string',
                    description: 'cursor',
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
