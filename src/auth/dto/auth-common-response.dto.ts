import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { ToBoolean } from 'src/commons/decorators/to-boolean.decorator';

export class authCommonResponseDto {
  @IsBoolean()
  @IsNotEmpty()
  @ToBoolean()
  @ApiProperty({
    example: true,
    description: '성공 !',
  })
  ok: boolean;

  @IsString()
  @IsOptional()
  @ApiProperty({
    example: 'auth error message',
    description: 'auth error message',
  })
  error?: string;
}
