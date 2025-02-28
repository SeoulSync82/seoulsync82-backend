import { Controller, Get, HttpStatus } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { ApiArraySuccessResponse } from 'src/commons/decorators/api-array-success-response.decorator';
import { ApiThemeGetListResponseDto } from 'src/theme/dto/api-theme-get-list-response.dto';
import { ThemeService } from 'src/theme/theme.service';

@ApiTags('테마')
@Controller('/api/theme')
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
  async themeList(): Promise<{ items: ApiThemeGetListResponseDto[] }> {
    return this.themeService.themeList();
  }
}
