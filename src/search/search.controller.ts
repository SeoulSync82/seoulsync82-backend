import { Controller, Get, Param, Query, UseFilters, UseInterceptors } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery, ApiParam } from '@nestjs/swagger';
import { ResponseDto, ResponseDataDto, DetailResponseDto } from 'src/commons/dto/response.dto';
import { SeoulSync82ExceptionFilter } from 'src/commons/filters/seoulsync82.exception.filter';
import { ErrorsInterceptor } from 'src/commons/interceptors/error.interceptor';
import { SuccessInterceptor } from 'src/commons/interceptors/success.interceptor';
import { PlaceReadDto } from 'src/place/dto/place.dto';
import { SearchDto } from './dto/search.dto';
import { SearchService } from './search.service';

@ApiTags('검색')
@Controller('/api/search')
@UseFilters(SeoulSync82ExceptionFilter)
@UseInterceptors(SuccessInterceptor, ErrorsInterceptor)
export class SearchController {
  constructor(private readonly searchService: SearchService) {}

  @Get()
  @ApiOperation({
    summary: '검색',
    description: '검색',
  })
  @ApiResponse({
    status: 200,
    description: '검색',
    type: ResponseDto,
  })
  @ApiQuery({
    name: 'place_name',
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
  async searchPlace(@Query() dto: SearchDto): Promise<ResponseDataDto> {
    return await this.searchService.searchPlace(dto);
  }

  @Get('/place/:uuid')
  @ApiOperation({
    summary: '검색 상세',
    description: '검색 상세',
  })
  @ApiResponse({
    status: 200,
    description: '검색 상세',
    type: DetailResponseDto,
  })
  @ApiParam({
    name: 'uuid',
    type: 'string',
    required: false,
    description: '장소 uuid',
  })
  async searchDetail(@Param('uuid') uuid: string): Promise<DetailResponseDto> {
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
}
