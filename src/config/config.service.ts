import { parse } from 'dotenv';
import * as fs from 'fs';
import * as joi from 'joi';

export interface EnvConfig {
  [key: string]: string;
}

export class ConfigService {
  private readonly envConfig: EnvConfig;

  constructor(filePath: string) {
    const configFile = fs.readFileSync(filePath);
    const config = parse(configFile);
    this.envConfig = ConfigService.validateInput(config);
  }

  private static validateInput(envConfig: EnvConfig): EnvConfig {
    const envVarsSchema = joi.object({
      APP_ENV: joi.string().valid('debug', 'dev', 'staging', 'production').required(),
      APP_PORT: joi.number().default(3456),
      APP_URL: joi.string().uri({
        scheme: [/https?/],
      }),
      DB_TYPE: joi.string().default('mysql'),
      DB_USERNAME: joi.string().default('root'),
      DB_PASSWORD: joi.string().allow('').default(''),
      DB_HOST: joi.string().default('localhost'),
      DB_PORT: joi.number().default(3306),
      DB_DATABASE: joi.string().default('SeoulSync82'),

      GOOGLE_ID: joi.string().required(),
      GOOGLE_SECRET: joi.string().required(),
      GOOGLE_CALLBACK: joi.string().required(),

      NAVER_ID: joi.string().required(),
      NAVER_SECRET: joi.string().required(),
      NAVER_CALLBACK: joi.string().required(),

      KAKAO_ID: joi.string().required(),
      KAKAO_SECRET: joi.string().required(),
      KAKAO_CALLBACK: joi.string().required(),

      JWT_SECRET: joi.string().required(),
      JWT_ACCESS_TOKEN_EXPIRATION_TIME: joi.string().required(),
      JWT_REFRESH_KEY: joi.string().required(),
      JWT_REFRESH_TOKEN_EXPIRATION_TIME: joi.string().required(),
      JWT_REFRESH_TOKEN_EXPIRATION_DATE: joi.string().required(),

      OLD_SEOULSYNC82_FRONTEND_LOCAL: joi.string().required(),
      OLD_SEOULSYNC82_FRONTEND_STAGING: joi.string().required(),

      SEOULSYNC82_FRONTEND_LOCAL: joi.string().required(),
      SEOULSYNC82_FRONTEND_LOCAL_SUB: joi.string().required(),
      SEOULSYNC82_FRONTEND_STAGING: joi.string().required(),
    });

    const { error, value } = envVarsSchema.validate(envConfig);
    if (error) {
      throw new Error(`Config validation error: ${error.message}`);
    }
    return value;
  }

  get(key: string): string {
    return this.envConfig[key];
  }

  isEnv(env: string): boolean {
    return this.envConfig.APP_ENV === env;
  }
}
