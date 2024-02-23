import { Controller, Get, HttpStatus, UseFilters, UseInterceptors } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { ApiArraySuccessResponse } from 'src/commons/decorators/api-array-success-response.decorator';
import { SeoulSync82ExceptionFilter } from 'src/commons/filters/seoulsync82.exception.filter';
import { SuccessInterceptor } from 'src/commons/interceptors/success.interceptor';
import { ApiThemeGetListResponseDto } from './dto/api-theme-get-list-response.dto';
import { ThemeService } from './theme.service';

@ApiTags('테마')
@Controller('/api/theme')
@UseFilters(SeoulSync82ExceptionFilter)
@UseInterceptors(SuccessInterceptor)
export class ThemeController {
  constructor(private readonly themeService: ThemeService) {}

  @Get('')
  @ApiOperation({
    summary: '테마 리스트',
    description: '테마 리스트',
  })
  @ApiArraySuccessResponse(ApiThemeGetListResponseDto, {
    description: '테마 리스트 조회 성공',
    status: HttpStatus.OK,
  })
  async themeList() {
    return await this.themeService.themeList();
  }
}
