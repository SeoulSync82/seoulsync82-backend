import { Controller, Get, HttpStatus, Param, Patch, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { ERROR } from 'src/commons/constants/error';
import { ApiArraySuccessResponse } from 'src/commons/decorators/api-array-success-response.decorator';
import { ApiExceptionResponse } from 'src/commons/decorators/api-exception-response.decorator';
import { ApiSuccessResponse } from 'src/commons/decorators/api-success-response.decorator';
import { CurrentUser } from 'src/commons/decorators/user.decorator';
import { LastItemIdResponseDto } from 'src/commons/dtos/last-item-id-response.dto';
import { ListResponseDto } from 'src/commons/dtos/list-response.dto';
import { UuidResponseDto } from 'src/commons/dtos/uuid-response.dto';
import { BadWordsPipe } from 'src/commons/pipe/badwords.pipe';
import { ApiSearchGetDetailResponseDto } from 'src/search/dto/api-search-get-detail-response.dto';
import { ApiSearchGetRecentResponseDto } from 'src/search/dto/api-search-get-recent-response.dto';
import { ApiSearchGetRequestQueryDto } from 'src/search/dto/api-search-get-request-query.dto';
import { ApiSearchGetResponseDto } from 'src/search/dto/api-search-get-response.dto';
import { SearchService } from 'src/search/search.service';
import { UserDto } from 'src/user/dto/user.dto';

@ApiTags('검색')
@Controller('/api/search')
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
  async getSearchPlace(
    @Query(BadWordsPipe) dto: ApiSearchGetRequestQueryDto,
    @CurrentUser() user: UserDto,
  ): Promise<LastItemIdResponseDto<ApiSearchGetResponseDto>> {
    return this.searchService.getSearchPlace(dto, user);
  }

  @Get('/popular')
  @ApiOperation({
    summary: '인기 검색어 목록',
    description: '인기 검색어 목록',
  })
  async getPopularSearches(): Promise<ListResponseDto<string>> {
    return this.searchService.getPopularSearches();
  }

  @Get('/recent')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({
    summary: '최근 검색어 목록',
    description: '최근 검색어 목록',
  })
  async getRecentSearches(
    @CurrentUser() user: UserDto,
  ): Promise<ListResponseDto<ApiSearchGetRecentResponseDto>> {
    return this.searchService.getRecentSearches(user);
  }

  @Patch('/:uuid')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({
    summary: '최근 검색어 삭제',
    description: '최근 검색어 삭제',
  })
  @ApiSuccessResponse(UuidResponseDto, {
    description: '최근 검색어 삭제 완료',
    status: HttpStatus.NO_CONTENT,
  })
  @ApiExceptionResponse([ERROR.NOT_EXIST_DATA], {
    description: '검색어 uuid가 존재하지 않을 경우',
    status: HttpStatus.NOT_FOUND,
  })
  async deleteSearchLog(
    @Param('uuid') uuid: string,
    @CurrentUser() user: UserDto,
  ): Promise<UuidResponseDto> {
    return this.searchService.deleteSearchLog(uuid, user);
  }

  @Patch('/')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({
    summary: '최근 검색어 전체 삭제',
    description: '최근 검색어 전체 삭제',
  })
  @ApiSuccessResponse(UuidResponseDto, {
    description: '최근 검색어 전체 삭제 완료',
    status: HttpStatus.NO_CONTENT,
  })
  @ApiExceptionResponse([ERROR.NOT_EXIST_DATA], {
    description: '최근 검색어가 하나도 존재하지 않을 경우',
    status: HttpStatus.NOT_FOUND,
  })
  async deleteAllSearchLog(@CurrentUser() user: UserDto): Promise<UuidResponseDto> {
    return this.searchService.deleteAllSearchLog(user);
  }

  @Get('/place/:uuid')
  @ApiOperation({
    summary: '검색 상세',
    description: '검색 상세',
    deprecated: true,
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
  async getSearchDetail(@Param('uuid') uuid: string): Promise<ApiSearchGetDetailResponseDto> {
    return this.searchService.getSearchDetail(uuid);
  }
}
