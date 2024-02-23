import { IsOptional, IsString } from 'class-validator';
import { CoreOutput } from 'src/commons/dtos/core.dto';

export class SilentRefreshAuthOutputDto extends CoreOutput {
  @IsOptional()
  @IsString()
  access_token?: string;
}
