import { ApiResponse, ApiResponseOptions, getSchemaPath } from '@nestjs/swagger';
import { applyDecorators, HttpStatus, Type } from '@nestjs/common';
import { isEmpty } from '../util/is/is-empty';

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
              // status_code: {
              //   type: 'number',
              //   default: 1,
              // },
              status: {
                type: 'string',
                default: 'SUCCESS',
              },
              data: {
                type: 'object',
                $ref: getSchemaPath(model),
              },
            },
          },
        ],
      },
    }),
  );
};
