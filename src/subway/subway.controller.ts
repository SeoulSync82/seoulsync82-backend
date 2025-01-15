import {
  Controller,
  Get,
  HttpStatus,
  Param,
  Query,
  UseFilters,
  UseInterceptors,
} from '@nestjs/common';
import { ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
import { ApiSuccessResponse } from 'src/commons/decorators/api-success-response.decorator';
import { SuccessInterceptor } from 'src/commons/interceptors/success.interceptor';
import { ApiSubwayGetCheckResponseDto } from 'src/subway/dto/api-subway-get-check-response.dto';
import { ApiSubwayGetLineResponseDto } from './dto/api-subway-get-line-response.dto';
import { SubwayService } from './subway.service';
import { ERROR } from 'src/auth/constants/error';
import { ApiExceptionResponse } from 'src/commons/decorators/api-exception-response.decorator';
import { ApiSubwayGetListResponseDto } from './dto/api-subway-get-list-response.dto';
import { SeoulSync82ExceptionFilter } from 'src/commons/filters/seoulsync82.exception.filter';
import { ApiSubwayGetCheckRequestQueryDto } from './dto/api-subway-get-check-request-query.dto';

@ApiTags('지하철')
@Controller('/api/subway')
@UseFilters(SeoulSync82ExceptionFilter)
@UseInterceptors(SuccessInterceptor)
export class SubwayController {
  constructor(private readonly subwayService: SubwayService) {}

  @Get('/line')
  @ApiOperation({
    summary: '지하철 호선 리스트',
    description: '지하철 호선 리스트',
  })
  @ApiSuccessResponse(ApiSubwayGetLineResponseDto, {
    description: '지하철 역 호선 조회 성공',
    status: HttpStatus.OK,
  })
  async subwayLineList() {
    return await this.subwayService.subwayLineList();
  }

  @Get('/:line_uuid')
  @ApiOperation({
    summary: '지하철 호선 별 역 리스트 조회',
    description: '지하철 호선 별 역 리스트 조회',
  })
  @ApiSuccessResponse(ApiSubwayGetListResponseDto, {
    description: '지하철 역 리스트 조회 성공',
    status: HttpStatus.OK,
  })
  @ApiExceptionResponse([ERROR.NOT_EXIST_DATA], {
    description: '조회한 지하철역 호선이 없는 경우',
    status: HttpStatus.NOT_FOUND,
  })
  @ApiParam({ name: 'line_uuid', type: 'string', description: '지하철 호선 uuid' })
  async subwayStationList(@Param('line_uuid') line_uuid: string) {
    return await this.subwayService.subwayStationList(line_uuid);
  }

  @Get('/:line_uuid/:station_uuid/customs-check')
  @ApiOperation({
    summary: '지하철 역 커스텀 체크',
    description: '지하철 역 커스텀 체크',
  })
  @ApiSuccessResponse(ApiSubwayGetCheckResponseDto, {
    description: '지하철 역 커스텀 체크 성공',
    status: HttpStatus.OK,
  })
  @ApiExceptionResponse([ERROR.NOT_EXIST_DATA], {
    description: '코스 uuid가 존재하지 않을 경우',
    status: HttpStatus.NOT_FOUND,
  })
  @ApiParam({ name: 'line_uuid', type: 'string', description: '지하철 호선 uuid' })
  @ApiParam({ name: 'station_uuid', type: 'string', description: '지하철 역 uuid' })
  async subwayCustomsCheck(
    @Param('line_uuid') line_uuid: string,
    @Param('station_uuid') station_uuid: string,
    @Query() dto: ApiSubwayGetCheckRequestQueryDto,
  ) {
    return await this.subwayService.subwayCustomsCheck(line_uuid, station_uuid, dto);
  }
}
