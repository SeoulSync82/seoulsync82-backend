import { ConfigService } from 'src/config/config.service';

export function getFrontendUrl(referer: string, configService: ConfigService): string {
  const localFrontend = configService.get('SEOULSYNC82_FRONTEND_LOCAL');
  const stagingFrontend = configService.get('SEOULSYNC82_FRONTEND_STAGING');
  const prodFrontend = configService.get('SEOULSYNC82_FRONTEND_PROD');

  if (referer.startsWith(localFrontend)) {
    return localFrontend;
  }
  if (referer.startsWith(stagingFrontend)) {
    return stagingFrontend;
  }
  return prodFrontend;
}
