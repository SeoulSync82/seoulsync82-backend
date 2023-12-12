import { Controller, Get, Query, UseFilters, UseInterceptors } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ApiArraySuccessResponse } from 'src/commons/decorators/api-array-success-response.decorator';
import { ResponseDto, ResponseDataDto } from 'src/commons/dto/response.dto';
import { SeoulSync82ExceptionFilter } from 'src/commons/filters/seoulsync82.exception.filter';
import { SuccessInterceptor } from 'src/commons/interceptors/success.interceptor';
import { PlaceReadDto } from 'src/place/dto/place.dto';
import { ThemeListDto } from './dto/theme.dto';
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
  @ApiArraySuccessResponse(ThemeListDto)
  async themeList() {
    return await this.themeService.themeList();
  }
}
