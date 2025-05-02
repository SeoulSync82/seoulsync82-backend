import { PartialType } from '@nestjs/swagger';
import { ApiNoticePostRequestBodyDto } from './api-notice-post-request-body.dto';

export class ApiNoticePutRequestBodyDto extends PartialType(ApiNoticePostRequestBodyDto) {}
