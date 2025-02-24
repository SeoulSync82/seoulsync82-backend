import { parse } from 'dotenv';
import * as fs from 'fs';
import * as joi from 'joi';

/**
 * Key-value mapping
 */
export interface EnvConfig {
  [key: string]: string;
}

/**
 * Config ㅎService
 */
export class ConfigService {
  /**
   * Object that will contain the injected environment variables
   */
  private readonly envConfig: EnvConfig;

  /**
   * Constructor
   * @param {string} filePath
   */
  constructor(filePath: string) {
    const config = parse(fs.readFileSync(filePath));
    this.envConfig = ConfigService.validateInput(config);
  }

  /**
   * Ensures all needed variables are set, and returns the validated JavaScript object
   * including the applied default values.
   * @param {EnvConfig} envConfig the configuration object with variables from the configuration file
   * @returns {EnvConfig} a validated environment configuration object
   */

  private static validateInput(envConfig: EnvConfig): EnvConfig {
    /**
     * A schemas to validate envConfig against
     */

    const envVarsSchema: joi.ObjectSchema = joi.object({
      APP_ENV: joi.string().valid('debug', 'dev', 'staging', 'production').required(),
      APP_PORT: joi.number().required().default(3456),
      APP_URL: joi.string().uri({
        scheme: [/https?/],
      }),
      DB_TYPE: joi.string().default('mysql'),
      DB_USERNAME: joi.string().default('root'),
      DB_PASSWORD: joi.string().allow('').default(''),
      DB_HOST: joi.string().default('localhost'),
      DB_PORT: joi.number().default('3306'),
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

    const { error, value: validatedEnvConfig } = envVarsSchema.validate(envConfig);
    if (error) {
      throw new Error(`Config validation error: ${error.message}`);
    }
    return validatedEnvConfig;
  }

  /**
   * Fetches the key from the configuration file
   * @param {string} key
   * @returns {string} the associated value for a given key
   */
  get(key: string): string {
    return this.envConfig[key];
  }

  /**
   * Checks whether the application environment set in the configuration file matches the environment parameter
   * @param {string} env
   * @returns {boolean} Whether or not the environment variable matches the application environment
   */
  isEnv(env: string): boolean {
    return this.envConfig.APP_ENV === env;
  }
}
