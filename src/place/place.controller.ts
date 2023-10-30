import {
  Controller,
  Get,
  Param,
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
import { JwtAuthGuard } from 'src/commons/auth/jwt-auth.guard';
import { CurrentUser } from 'src/commons/decorators/user.decorator';
import { ResponseDto, ResponseDataDto, DetailResponseDto } from 'src/commons/dto/response.dto';
import { SeoulSync82ExceptionFilter } from 'src/commons/filters/seoulsync82.exception.filter';
import { ErrorsInterceptor } from 'src/commons/interceptors/error.interceptor';
import { SuccessInterceptor } from 'src/commons/interceptors/success.interceptor';
import { PlaceReadDto } from './dto/place.dto';
import { PlaceService } from './place.service';

@ApiTags('장소')
@Controller('/api/place')
@UseFilters(SeoulSync82ExceptionFilter)
@UseInterceptors(SuccessInterceptor, ErrorsInterceptor)
export class PlaceController {
  constructor(private readonly placeService: PlaceService) {}

  @Get('/culture')
  @ApiOperation({
    summary: '전시/팝업 간편 목록',
    description: '전시/팝업 간편 목록',
  })
  @ApiResponse({
    status: 200,
    description: '전시/팝업 간편 목록',
    type: ResponseDto,
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
  async findCultureList(@Query() dto: PlaceReadDto): Promise<ResponseDataDto> {
    return await this.placeService.findCultureList(dto);
  }

  @Get('/culture/:uuid')
  @ApiOperation({
    summary: '전시/팝업 상세',
    description: '전시/팝업 상세',
  })
  @ApiResponse({
    status: 200,
    description: '전시/팝업 상세',
    type: DetailResponseDto,
  })
  @ApiParam({
    name: 'uuid',
    type: 'string',
    required: false,
    description: '장소 uuid',
  })
  async findCultureOne(@Param('uuid') uuid: string): Promise<DetailResponseDto> {
    return await this.placeService.findCultureOne(uuid);
  }

  @Get('/exhibition')
  @ApiOperation({
    summary: '전시소개 목록',
    description: '전시소개 목록',
  })
  @ApiResponse({
    status: 200,
    description: '전시소개 목록',
    type: ResponseDto,
  })
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
  async findExhibitionList(@Query() dto: PlaceReadDto): Promise<ResponseDataDto> {
    return await this.placeService.findExhibitionList(dto);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @Get('/popup')
  @ApiOperation({
    summary: '팝업소개 목록',
    description: '팝업소개 목록',
  })
  @ApiResponse({
    status: 200,
    description: '팝업소개 목록',
    type: ResponseDto,
  })
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
  async findPopupList(@Query() dto: PlaceReadDto, @CurrentUser() user): Promise<ResponseDataDto> {
    console.log(user);
    return await this.placeService.findPopupList(dto, user);
  }
}
