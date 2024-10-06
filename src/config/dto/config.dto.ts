import {
  IsBoolean,
  IsInstance,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsString,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { CommonConfigDto } from './common-config.dto';

class WebTokenConfig {
  @IsNotEmpty()
  @IsString()
  secretKey: string;

  @IsNotEmpty()
  @IsNumber()
  expirationTime: number;
}

class JsonWebTokenConfig {
  @IsNotEmpty()
  @IsString()
  tokenSecretKey: string;
}

class DataSourceConnectionConfig {
  @IsNotEmpty()
  @IsString()
  host: string;

  @IsNotEmpty()
  @IsNumber()
  port: number;

  @IsNotEmpty()
  @IsString()
  username: string;

  @IsNotEmpty()
  @IsString()
  password: string;

  @IsNotEmpty()
  @IsString()
  database: string;
}

class DataSourceConfig {
  @IsNotEmpty()
  @IsString()
  type: 'mysql' | 'postgres' | 'mariadb';

  @IsBoolean()
  logging: boolean;

  @IsInt()
  poolSize: number;

  @IsInstance(DataSourceConnectionConfig)
  @ValidateNested()
  @Type(() => DataSourceConnectionConfig)
  master: DataSourceConnectionConfig;

  @ValidateNested()
  slaves: DataSourceConnectionConfig[];
}

class MongoDBConfig {
  @IsNotEmpty()
  @IsString()
  url: string;
}

class DeepLinkConfig {
  @IsNotEmpty()
  @IsString()
  apiKey: string;

  @IsNotEmpty()
  @IsString()
  androidPackageName: string;

  @IsNotEmpty()
  @IsString()
  iosBundleId: string;

  @IsNotEmpty()
  @IsString()
  urlPrefix: string;

  @IsNotEmpty()
  @IsString()
  shareUrl: string;
}

export class ContentConfigDto {
  @IsNotEmpty()
  @IsInt()
  getNewsUnreadFollowedStartDay: number;

  @IsNotEmpty()
  @IsInt()
  getGeneralElectionPopularityCount: number;

  @IsNotEmpty()
  @IsInt()
  getGeneralElectionPopularityViewScore: number;

  @IsNotEmpty()
  @IsInt()
  getExtraKeywords: number;
}

class SentryConfig {
  @IsNotEmpty()
  @IsString()
  dsn: string;
}

export class ConfigDto extends CommonConfigDto {
  @IsInstance(WebTokenConfig)
  @ValidateNested()
  @Type(() => WebTokenConfig)
  webtoken: WebTokenConfig;

  @IsInstance(JsonWebTokenConfig)
  @ValidateNested()
  @Type(() => JsonWebTokenConfig)
  jwt: JsonWebTokenConfig;

  @IsInstance(DataSourceConfig)
  @ValidateNested()
  @Type(() => DataSourceConfig)
  newmingDatabase: DataSourceConfig;

  @IsInstance(DataSourceConfig)
  @ValidateNested()
  @Type(() => DataSourceConfig)
  newmingStatisticsDatabase: DataSourceConfig;

  @IsInstance(MongoDBConfig)
  @ValidateNested()
  @Type(() => MongoDBConfig)
  newsMongoDb: MongoDBConfig;

  /** NEXT API SERVICE */
  @IsString()
  nextNewsApi: string;

  /** COREDOT SERVICE API */
  @IsString()
  rewardApi: string;

  /** Mustadd URL */
  @IsString()
  mustaddUrl: string;

  /** mosti gttos api */
  @IsString()
  mostiGttosApi: string;

  /** push api */
  @IsString()
  pushApi: string;

  @IsInstance(DeepLinkConfig)
  @ValidateNested()
  @Type(() => DeepLinkConfig)
  deepLink: DeepLinkConfig;

  @IsInstance(ContentConfigDto)
  @ValidateNested()
  @Type(() => ContentConfigDto)
  content: ContentConfigDto;

  @IsInstance(SentryConfig)
  @ValidateNested()
  @Type(() => SentryConfig)
  sentry: SentryConfig;
}
