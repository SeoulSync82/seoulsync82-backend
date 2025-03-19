import { ConfigService } from 'src/config/config.service';

export function getFrontendUrl(referer: string, configService: ConfigService): string {
  const localFrontend = configService.get('SEOULSYNC82_FRONTEND_LOCAL');
  const stagingFrontend = configService.get('SEOULSYNC82_FRONTEND_STAGING');

  if (referer.startsWith(localFrontend)) {
    return localFrontend;
  }

  return stagingFrontend;
}
