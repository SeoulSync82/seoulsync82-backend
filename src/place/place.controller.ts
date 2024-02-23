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
import { ApiPlaceGetCultureDetailResponseDto } from './dto/api-place-get-culture-detail-response.dto';
import { ApiPlaceGetCultureRequestQueryDto } from './dto/api-place-get-culture-request-query.dto';
import { ApiPlaceGetCultureResponseDto } from './dto/api-place-get-culture-response.dto';
import { ApiPlaceGetDetailResponseDto } from './dto/api-place-get-detail-response.dto';
import { ApiPlaceGetExhibitionRequestQueryDto } from './dto/api-place-get-exhibition-request-query.dto';
import { ApiPlaceGetExhibitionResponseDto } from './dto/api-place-get-exhibition-response.dto';
import { ApiPlaceGetPopupRequestQueryDto } from './dto/api-place-get-popup-request-query.dto';
import { ApiPlaceGetPopupResponseDto } from './dto/api-place-get-popup-response.dto';

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
  @ApiArraySuccessResponse(ApiPlaceGetCultureResponseDto, {
    description: '전시/팝업 간편 목록 조회 성공',
    status: HttpStatus.OK,
  })
  async findCultureList(@Query() dto: ApiPlaceGetCultureRequestQueryDto) {
    return await this.placeService.findCultureList(dto);
  }

  @Get('/culture/:uuid')
  @ApiOperation({
    summary: '전시/팝업 상세',
    description: '전시/팝업 상세',
  })
  @ApiSuccessResponse(ApiPlaceGetCultureDetailResponseDto, {
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
  ): Promise<ApiPlaceGetCultureDetailResponseDto> {
    return await this.placeService.findCultureDetail(uuid);
  }

  @Get('/exhibition')
  @ApiOperation({
    summary: '전시소개 목록',
    description: '전시소개 목록',
  })
  @ApiArraySuccessResponse(ApiPlaceGetExhibitionResponseDto, {
    description: '전시소개 목록 조회 성공',
    status: HttpStatus.OK,
  })
  async findExhibitionList(@Query() dto: ApiPlaceGetExhibitionRequestQueryDto) {
    return await this.placeService.findExhibitionList(dto);
  }

  @Get('/popup')
  @ApiOperation({
    summary: '팝업소개 목록',
    description: '팝업소개 목록',
  })
  @ApiArraySuccessResponse(ApiPlaceGetPopupResponseDto, {
    description: '팝업소개 목록 조회 성공',
    status: HttpStatus.OK,
  })
  async findPopupList(@Query() dto: ApiPlaceGetPopupRequestQueryDto) {
    return await this.placeService.findPopupList(dto);
  }

  @Get('/:uuid')
  @ApiOperation({
    summary: '장소 상세',
    description: '장소 상세',
  })
  @ApiSuccessResponse(ApiPlaceGetDetailResponseDto, {
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
  async findPlaceDetail(@Param('uuid') uuid: string): Promise<ApiPlaceGetDetailResponseDto> {
    return await this.placeService.findPlaceDetail(uuid);
  }
}
