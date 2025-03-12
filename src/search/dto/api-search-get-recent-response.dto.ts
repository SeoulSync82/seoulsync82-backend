import { ApiProperty } from '@nestjs/swagger';

export class ApiSearchGetRecentResponseDto {
  @ApiProperty({
    example: ['마라탕', '더현대', '스시', '아쿠아리움', '감자탕'],
    description: '최근 검색어 목록',
  })
  search: string;
}
