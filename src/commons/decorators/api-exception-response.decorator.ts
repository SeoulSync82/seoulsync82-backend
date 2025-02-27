import { applyDecorators, HttpStatus } from '@nestjs/common';
import { ApiResponse, ApiResponseOptions } from '@nestjs/swagger';
import { isEmpty } from '../util/is/is-empty';

export const ApiExceptionResponse = (errorEnums: any[], options?: ApiResponseOptions) => {
  const status = isEmpty(options?.status) ? HttpStatus.INTERNAL_SERVER_ERROR : options.status;
  return applyDecorators(
    ApiResponse({
      ...options,
      status,
      schema: {
        allOf: [
          {
            properties: {
              statusCode: { type: 'number', default: status },
              status: { type: 'string', enum: errorEnums },
              timestamp: { type: 'string', example: new Date().toISOString() },
              path: { type: 'string' },
            },
          },
        ],
      },
    }),
  );
};
