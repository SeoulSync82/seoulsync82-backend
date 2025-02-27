import { ApiProperty } from '@nestjs/swagger';

export class UuidResponseDto {
  @ApiProperty({
    example: '2871948cc25b589ea0a672a6f060fae3',
    description: 'Resource UUID',
  })
  uuid: string;
}
