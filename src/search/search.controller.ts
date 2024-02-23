import {
  Controller,
  Get,
  HttpStatus,
  Param,
  Patch,
  Query,
  UseFilters,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiBearerAuth } from '@nestjs/swagger';
import { ERROR } from 'src/auth/constants/error';
import { JwtAuthGuard } from 'src/commons/auth/jwt-auth.guard';
import { ApiArraySuccessResponse } from 'src/commons/decorators/api-array-success-response.decorator';
import { ApiExceptionResponse } from 'src/commons/decorators/api-exception-response.decorator';
import { ApiSuccessResponse } from 'src/commons/decorators/api-success-response.decorator';
import { CurrentUser } from 'src/commons/decorators/user.decorator';
import { ResponseDto, ResponseDataDto, DetailResponseDto } from 'src/commons/dto/response.dto';
import { SeoulSync82ExceptionFilter } from 'src/commons/filters/seoulsync82.exception.filter';
import { SuccessInterceptor } from 'src/commons/interceptors/success.interceptor';
import { BadWordsPipe } from 'src/commons/pipe/badwords.pipe';
import { ApiSearchGetDetailResponseDto } from './dto/api-search-get-detail-response.dto';
import { ApiSearchGetRequestQueryDto } from './dto/api-search-get-request-query.dto';
import { ApiSearchGetResponseDto } from './dto/api-search-get-response.dto';
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
  @ApiArraySuccessResponse(ApiSearchGetResponseDto, {
    description: '검색 성공',
    status: HttpStatus.OK,
  })
  async searchPlace(@Query(BadWordsPipe) dto: ApiSearchGetRequestQueryDto, @CurrentUser() user) {
    return await this.searchService.searchPlace(dto, user);
  }

  @Get('/place/:uuid')
  @ApiOperation({
    summary: '검색 상세',
    description: '검색 상세',
  })
  @ApiSuccessResponse(ApiSearchGetDetailResponseDto, {
    description: '검색 상세 조회 성공',
    status: HttpStatus.OK,
  })
  @ApiExceptionResponse([ERROR.NOT_EXIST_DATA], {
    description: '장소 uuid가 존재하지 않을 경우',
    status: HttpStatus.NOT_FOUND,
  })
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
  @ApiSuccessResponse(ResponseDto, {
    description: '최근 검색어 목록 조회 성공',
    status: HttpStatus.OK,
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
  @ApiSuccessResponse(DetailResponseDto, {
    description: '최근 검색어 삭제 완료',
    status: HttpStatus.NO_CONTENT,
  })
  @ApiExceptionResponse([ERROR.NOT_EXIST_DATA], {
    description: '검색어 uuid가 존재하지 않을 경우',
    status: HttpStatus.NOT_FOUND,
  })
  async deleteSearchLog(
    @Param('uuid') uuid: string,
    @CurrentUser() user,
  ): Promise<DetailResponseDto> {
    return await this.searchService.deleteSearchLog(uuid, user);
  }

  @Patch('/')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({
    summary: '최근 검색어 전체 삭제',
    description: '최근 검색어 전체 삭제',
  })
  @ApiSuccessResponse(DetailResponseDto, {
    description: '최근 검색어 전체 삭제 완료',
    status: HttpStatus.NO_CONTENT,
  })
  @ApiExceptionResponse([ERROR.NOT_EXIST_DATA], {
    description: '최근 검색어가 하나도 존재하지 않을 경우',
    status: HttpStatus.NOT_FOUND,
  })
  async deleteAllSearchLog(@CurrentUser() user) {
    return await this.searchService.deleteAllSearchLog(user);
  }
}
