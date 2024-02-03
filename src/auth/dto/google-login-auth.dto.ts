import { IsOptional, IsString } from 'class-validator';
import { CoreOutput } from 'src/commons/dtos/core.dto';

export class GoogleLoginAuthOutputDto extends CoreOutput {
  @IsOptional()
  @IsString()
  accessToken?: string;
}
