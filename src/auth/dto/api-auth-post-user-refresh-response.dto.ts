import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';
import { authCommonResponseDto } from 'src/auth/dto/auth-common-response.dto';

export class ApiAuthPostUserRefreshResponseDto extends authCommonResponseDto {
  @IsOptional()
  @IsString()
  @ApiProperty({
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
    description: '새로 발급된 액세스 토큰',
  })
  access_token?: string;
}
