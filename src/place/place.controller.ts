import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { ResponseDto, ResponseDataDto } from 'src/commons/dto/response.dto';
import { PlaceReadDto } from './dto/place.dto';
import { PlaceService } from './place.service';

@ApiTags('장소')
@Controller('/api/place')
export class PlaceController {
  constructor(private readonly placeService: PlaceService) {}

  @Get('/simple')
  @ApiOperation({
    summary: '전시소개 간편',
    description: '전시소개 간편',
  })
  @ApiResponse({
    status: 200,
    description: '전시소개 간편',
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
    description: '한 번에 보여질 전시 수',
  })
  async findExhibition(@Query() dto: PlaceReadDto): Promise<ResponseDataDto> {
    return await this.placeService.findExhibition(dto);
  }
}
