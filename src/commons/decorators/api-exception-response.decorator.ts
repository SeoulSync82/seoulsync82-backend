import { applyDecorators, HttpStatus } from '@nestjs/common';
import { ApiResponse, ApiResponseOptions } from '@nestjs/swagger';
import { ERROR } from 'src/commons/constants/error';
import { isEmpty } from '../util/is/is-empty';

export const ApiExceptionResponse = (error: ERROR[], options?: ApiResponseOptions) => {
  const status = isEmpty(options?.status) ? HttpStatus.OK : options.status;

  return applyDecorators(
    ApiResponse({
      ...options,
      status,
      schema: {
        allOf: [
          {
            properties: {
              status_code: {
                type: 'number',
                default: status,
              },
              status: {
                type: 'enum',
                enum: error,
              },
              timestamp: {
                type: 'string',
                default: new Date(),
              },
              path: {
                type: 'string',
              },
            },
          },
        ],
      },
    }),
  );
};
