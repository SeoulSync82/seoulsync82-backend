import { Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsEnum,
  IsInstance,
  IsNotEmpty,
  IsNumber,
  IsString,
  ValidateNested,
} from 'class-validator';
import { EnRunMode } from 'src/commons/enum/system/run-mode.enum';

/** 서버정보 */
class Server {
  /** 실행 모드
   * @example develop / qa / stage / production
   */
  @IsEnum(EnRunMode)
  runMode: EnRunMode;

  /** 포트 */
  @IsNotEmpty()
  @IsNumber()
  port: number;

  /** 스웨거 활성화 여부 */
  @IsNotEmpty()
  @IsBoolean()
  isSwagger: boolean;

  /** 바인딩 IP  */
  @IsNotEmpty()
  @IsString()
  binding: string;

  /** host 네임 */
  @IsNotEmpty()
  @IsString()
  host: string;
}

/** redis 주소정보, 포트정보 */
class RedisHostPrimaryReadonly {
  /** primary */
  @IsNotEmpty()
  @IsString()
  primary: string;

  /** readonly */
  @IsNotEmpty()
  @IsArray()
  readonlys: string[];

  @IsNumber()
  port: number;
}

/** redis db정보 */
class RedisTypeHostDB extends RedisHostPrimaryReadonly {
  /** db */
  @IsNotEmpty()
  @IsNumber()
  db: number;
}

/** redis 정보 */
class Redis {
  /** default db 정보 */
  @IsInstance(RedisTypeHostDB)
  @ValidateNested()
  @Type(() => RedisTypeHostDB)
  default: RedisTypeHostDB;
}

/** CommonConfigDto */
export class CommonConfigDto {
  /** 서버정보 */
  @IsInstance(Server)
  @ValidateNested()
  @Type(() => Server)
  server: Server;

  /** redis정보 */
  @IsInstance(Redis)
  @ValidateNested()
  @Type(() => Redis)
  redis: Redis;
}
