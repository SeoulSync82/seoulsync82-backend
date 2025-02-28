import { ApiResponseDto } from 'src/commons/dtos/api-response.dto';

export function createApiResponse<T>(
  data: T,
  statusCode = 200,
  status = 'SUCCESS',
  path = '',
): ApiResponseDto<T> {
  return {
    status,
    statusCode,
    timestamp: new Date().toISOString(),
    path,
    data,
  };
}
