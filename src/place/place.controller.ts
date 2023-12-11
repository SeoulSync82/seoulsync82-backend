import {
  Controller,
  Get,
  Param,
  Query,
  Req,
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
import { JwtAuthGuard } from 'src/commons/auth/jwt-auth.guard';
import { ApiArraySuccessResponse } from 'src/commons/decorators/api-array-success-response.decorator';
import { ApiSuccessResponse } from 'src/commons/decorators/api-success-response.decorator';
import { CurrentUser } from 'src/commons/decorators/user.decorator';
import { ResponseDto, ResponseDataDto, DetailResponseDto } from 'src/commons/dto/response.dto';
import { SeoulSync82ExceptionFilter } from 'src/commons/filters/seoulsync82.exception.filter';
import { ErrorsInterceptor } from 'src/commons/interceptors/error.interceptor';
import { SuccessInterceptor } from 'src/commons/interceptors/success.interceptor';
import { CultureDto, CultureListDto, ExhibitionDto, PlaceReadDto, PopupDto } from './dto/place.dto';
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
  @ApiArraySuccessResponse(CultureListDto)
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
  async findCultureList(@Query() dto: PlaceReadDto) {
    return await this.placeService.findCultureList(dto);
  }

  @Get('/culture/:uuid')
  @ApiOperation({
    summary: '전시/팝업 상세',
    description: '전시/팝업 상세',
  })
  @ApiSuccessResponse(CultureDto)
  @ApiParam({
    name: 'uuid',
    type: 'string',
    required: false,
    description: '장소 uuid',
  })
  async findCultureOne(@Param('uuid') uuid: string): Promise<CultureDto> {
    return await this.placeService.findCultureOne(uuid);
  }

  @Get('/exhibition')
  @ApiOperation({
    summary: '전시소개 목록',
    description: '전시소개 목록',
  })
  @ApiArraySuccessResponse(ExhibitionDto)
  @ApiQuery({
    name: 'last_id',
    type: 'number',
    required: false,
    description: '가장 마지막으로 본 전시 아이디',
  })
  @ApiQuery({
    name: 'size',
    type: 'number',
    required: false,
    description: '한 번에 보여질 전시수',
  })
  async findExhibitionList(@Query() dto: PlaceReadDto) {
    return await this.placeService.findExhibitionList(dto);
  }

  @Get('/popup')
  @ApiOperation({
    summary: '팝업소개 목록',
    description: '팝업소개 목록',
  })
  @ApiArraySuccessResponse(PopupDto)
  @ApiQuery({
    name: 'last_id',
    type: 'number',
    required: false,
    description: '가장 마지막으로 본 팝업 아이디',
  })
  @ApiQuery({
    name: 'size',
    type: 'number',
    required: false,
    description: '한 번에 보여질 팝업 수',
  })
  async findPopupList(@Query() dto: PlaceReadDto) {
    return await this.placeService.findPopupList(dto);
  }
}
