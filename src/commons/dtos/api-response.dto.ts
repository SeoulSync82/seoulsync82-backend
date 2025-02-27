import { ApiProperty } from '@nestjs/swagger';

export class ApiResponseDto<T> {
  @ApiProperty({ example: 'SUCCESS', description: '응답 상태' })
  status: string;

  @ApiProperty({ example: 200, description: 'HTTP 상태 코드' })
  statusCode: number;

  @ApiProperty({ example: '2025-02-22T14:20:00.000Z', description: '응답 생성 시간' })
  timestamp: string;

  @ApiProperty({ example: '/api/bookmark', description: '요청 경로' })
  path: string;

  @ApiProperty({ description: '응답 데이터' })
  data: T;
}
