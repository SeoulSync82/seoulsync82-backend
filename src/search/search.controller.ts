import {
  Controller,
  Get,
  Param,
  Patch,
  Query,
  UseFilters,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiQuery,
  ApiParam,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { use } from 'passport';
import { JwtAuthGuard } from 'src/commons/auth/jwt-auth.guard';
import { ApiArraySuccessResponse } from 'src/commons/decorators/api-array-success-response.decorator';
import { ApiSuccessResponse } from 'src/commons/decorators/api-success-response.decorator';
import { CurrentUser } from 'src/commons/decorators/user.decorator';
import { ResponseDto, ResponseDataDto, DetailResponseDto } from 'src/commons/dto/response.dto';
import { SeoulSync82ExceptionFilter } from 'src/commons/filters/seoulsync82.exception.filter';
import { ErrorsInterceptor } from 'src/commons/interceptors/error.interceptor';
import { SuccessInterceptor } from 'src/commons/interceptors/success.interceptor';
import { BadWordsPipe } from 'src/commons/pipe/badwords.pipe';
import { PlaceReadDto } from 'src/place/dto/place.dto';
import { SearchDetailDto, SearchDto, SearchListDto } from './dto/search.dto';
import { SearchService } from './search.service';

@ApiTags('검색')
@Controller('/api/search')
@UseFilters(SeoulSync82ExceptionFilter)
@UseInterceptors(SuccessInterceptor)
export class SearchController {
  constructor(private readonly searchService: SearchService) {}

  @Get('')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({
    summary: '검색',
    description: '검색',
  })
  @ApiArraySuccessResponse(SearchListDto)
  @ApiQuery({
    name: 'search',
    type: 'string',
    required: false,
    description: '장소 이름',
  })
  @ApiQuery({
    name: 'last_id',
    type: 'number',
    required: false,
    description: '가장 마지막으로 본 전시/팝업 아이디',
  })
  @ApiQuery({
    name: 'size',
    type: 'number',
    required: false,
    description: '한 번에 보여질 전시/팝업 수',
  })
  async searchPlace(@Query(BadWordsPipe) dto: SearchDto, @CurrentUser() user) {
    return await this.searchService.searchPlace(dto, user);
  }

  @Get('/place/:uuid')
  @ApiOperation({
    summary: '검색 상세',
    description: '검색 상세',
  })
  @ApiSuccessResponse(SearchDetailDto)
  @ApiParam({
    name: 'uuid',
    type: 'string',
    required: false,
    description: '장소 uuid',
  })
  async searchDetail(@Param('uuid') uuid: string) {
    return await this.searchService.searchDetail(uuid);
  }

  @Get('/popular')
  @ApiOperation({
    summary: '인기 검색어 목록',
    description: '인기 검색어 목록',
  })
  @ApiResponse({
    status: 200,
    description: '인기 검색어 목록',
    type: ResponseDto,
  })
  async searchPopular(): Promise<ResponseDataDto> {
    return await this.searchService.searchPopular();
  }

  @Get('/recent')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({
    summary: '최근 검색어 목록',
    description: '최근 검색어 목록',
  })
  @ApiResponse({
    status: 200,
    description: '최근 검색어 목록',
    type: ResponseDto,
  })
  async searchRecent(@CurrentUser() user): Promise<ResponseDataDto> {
    return await this.searchService.searchRecent(user);
  }

  @Patch('/:uuid')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({
    summary: '최근 검색어 삭제',
    description: '최근 검색어 삭제',
  })
  @ApiResponse({
    status: 200,
    description: '최근 검색어 삭제',
    type: DetailResponseDto,
  })
  async deleteSearchLog(
    @Param('uuid') uuid: string,
    @CurrentUser() user,
  ): Promise<DetailResponseDto> {
    return await this.searchService.deleteSearchLog(uuid, user);
  }
}
