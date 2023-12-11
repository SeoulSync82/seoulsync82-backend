import { ApiOkResponse, ApiResponseOptions, getSchemaPath } from '@nestjs/swagger';
import { applyDecorators, Type } from '@nestjs/common';

export const ApiArraySuccessResponse = <TModel extends Type<unknown>>(
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
                  last_item_id: {
                    type: 'string',
                    description: 'last_item_id',
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
