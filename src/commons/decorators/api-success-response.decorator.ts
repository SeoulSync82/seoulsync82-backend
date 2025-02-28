import { applyDecorators, HttpStatus, Type } from '@nestjs/common';
import { ApiResponse, ApiResponseOptions, getSchemaPath } from '@nestjs/swagger';
import { isEmpty } from 'src/commons/util/is/is-empty';

export const ApiSuccessResponse = <TModel extends Type<unknown>>(
  model: TModel,
  options?: ApiResponseOptions,
) => {
  const status = isEmpty(options?.status) ? HttpStatus.OK : options.status;
  return applyDecorators(
    ApiResponse({
      ...options,
      status,
      schema: {
        allOf: [
          {
            properties: {
              status: { type: 'string', default: 'SUCCESS' },
              statusCode: { type: 'number', default: status },
              timestamp: { type: 'string', example: new Date().toISOString() },
              path: { type: 'string' },
              data: { $ref: getSchemaPath(model) },
            },
          },
        ],
      },
    }),
  );
};
