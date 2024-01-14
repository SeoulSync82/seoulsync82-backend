import {
  Controller,
  Get,
  HttpStatus,
  Param,
  Query,
  UseFilters,
  UseInterceptors,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiParam } from '@nestjs/swagger';
import { ERROR } from 'src/auth/constants/error';
import { ApiArraySuccessResponse } from 'src/commons/decorators/api-array-success-response.decorator';
import { ApiExceptionResponse } from 'src/commons/decorators/api-exception-response.decorator';
import { ApiSuccessResponse } from 'src/commons/decorators/api-success-response.decorator';
import { SeoulSync82ExceptionFilter } from 'src/commons/filters/seoulsync82.exception.filter';
import { SuccessInterceptor } from 'src/commons/interceptors/success.interceptor';
import { ApiPlaceCultureDetailGetResponseDto } from './dto/api-place-culture-detail-get-response.dto';
import { ApiPlaceCultureGetRequestQueryDto } from './dto/api-place-culture-get-request-query.dto';
import { ApiPlaceCultureGetResponseDto } from './dto/api-place-culture-get-response.dto';
import { ApiPlaceDetailGetResponseDto } from './dto/api-place-detail-get-response.dto';
import { ApiPlaceExhibitionGetRequestQueryDto } from './dto/api-place-exhibition-get-request-query.dto';
import { ApiPlaceExhibitionGetResponseDto } from './dto/api-place-exhibition-get-response.dto';
import { ApiPlacePopupGetRequestQueryDto } from './dto/api-place-popup-get-request-query.dto';
import { ApiPlacePopupGetResponseDto } from './dto/api-place-popup-get-response.dto';

import { PlaceService } from './place.service';

@ApiTags('장소')
@Controller('/api/place')
@UseFilters(SeoulSync82ExceptionFilter)
@UseInterceptors(SuccessInterceptor)
export class PlaceController {
  constructor(private readonly placeService: PlaceService) {}

  @Get('/culture')
  @ApiOperation({
    summary: '전시/팝업 간편 목록',
    description: '전시/팝업 간편 목록',
  })
  @ApiArraySuccessResponse(ApiPlaceCultureGetResponseDto, {
    description: '전시/팝업 간편 목록 조회 성공',
    status: HttpStatus.OK,
  })
  async findCultureList(@Query() dto: ApiPlaceCultureGetRequestQueryDto) {
    return await this.placeService.findCultureList(dto);
  }

  @Get('/culture/:uuid')
  @ApiOperation({
    summary: '전시/팝업 상세',
    description: '전시/팝업 상세',
  })
  @ApiSuccessResponse(ApiPlaceCultureDetailGetResponseDto, {
    description: '전시/팝업 상세 조회 성공',
    status: HttpStatus.OK,
  })
  @ApiExceptionResponse([ERROR.NOT_EXIST_DATA], {
    description: '장소 uuid가 존재하지 않는 경우',
    status: HttpStatus.NOT_FOUND,
  })
  @ApiParam({
    name: 'uuid',
    type: 'string',
    required: false,
    description: '장소 uuid',
  })
  async findCultureDetail(
    @Param('uuid') uuid: string,
  ): Promise<ApiPlaceCultureDetailGetResponseDto> {
    return await this.placeService.findCultureDetail(uuid);
  }

  @Get('/exhibition')
  @ApiOperation({
    summary: '전시소개 목록',
    description: '전시소개 목록',
  })
  @ApiArraySuccessResponse(ApiPlaceExhibitionGetResponseDto, {
    description: '전시소개 목록 조회 성공',
    status: HttpStatus.OK,
  })
  async findExhibitionList(@Query() dto: ApiPlaceExhibitionGetRequestQueryDto) {
    return await this.placeService.findExhibitionList(dto);
  }

  @Get('/popup')
  @ApiOperation({
    summary: '팝업소개 목록',
    description: '팝업소개 목록',
  })
  @ApiArraySuccessResponse(ApiPlacePopupGetResponseDto, {
    description: '팝업소개 목록 조회 성공',
    status: HttpStatus.OK,
  })
  async findPopupList(@Query() dto: ApiPlacePopupGetRequestQueryDto) {
    return await this.placeService.findPopupList(dto);
  }

  @Get('/:uuid')
  @ApiOperation({
    summary: '장소 상세',
    description: '장소 상세',
  })
  @ApiSuccessResponse(ApiPlaceDetailGetResponseDto, {
    description: '장소 상세 조회 성공',
    status: HttpStatus.OK,
  })
  @ApiExceptionResponse([ERROR.NOT_EXIST_DATA], {
    description: '장소 uuid가 존재하지 않는 경우',
    status: HttpStatus.NOT_FOUND,
  })
  @ApiParam({
    name: 'uuid',
    type: 'string',
    required: false,
    description: '장소 uuid',
  })
  async findPlaceDetail(@Param('uuid') uuid: string): Promise<ApiPlaceDetailGetResponseDto> {
    return await this.placeService.findPlaceDetail(uuid);
  }
}
