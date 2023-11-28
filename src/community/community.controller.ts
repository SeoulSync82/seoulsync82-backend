import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  UseFilters,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/commons/auth/jwt-auth.guard';
import { CurrentUser } from 'src/commons/decorators/user.decorator';
import { DetailResponseDto, ResponseDataDto } from 'src/commons/dto/response.dto';
import { SeoulSync82ExceptionFilter } from 'src/commons/filters/seoulsync82.exception.filter';
import { SuccessInterceptor } from 'src/commons/interceptors/success.interceptor';
import { CommunityService } from './community.service';
import { CommunityListReqDto, CommunityPostReqDto, CommunityPutReqDto } from './dto/community.dto';

@ApiTags('커뮤니티')
@Controller('/api/community')
@UseFilters(SeoulSync82ExceptionFilter)
@UseInterceptors(SuccessInterceptor)
export class CommunityController {
  constructor(private readonly communityService: CommunityService) {}

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @Post('/')
  @ApiOperation({
    summary: '커뮤니티 글쓰기',
    description: '커뮤니티 글쓰기',
  })
  @ApiResponse({
    status: 200,
    description: '커뮤니티 글쓰기',
    type: DetailResponseDto,
  })
  async communityPost(
    @CurrentUser() user,
    @Body() dto: CommunityPostReqDto,
  ): Promise<DetailResponseDto> {
    return await this.communityService.communityPost(user, dto);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @Get('/')
  @ApiOperation({
    summary: '커뮤니티 목록',
    description: '커뮤니티 목록',
  })
  @ApiResponse({
    status: 200,
    description: '커뮤니티 목록',
    type: ResponseDataDto,
  })
  async communityList(
    @Query() dto: CommunityListReqDto,
    @CurrentUser() user,
  ): Promise<ResponseDataDto> {
    return await this.communityService.communityList(dto, user);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @Get('/:uuid')
  @ApiOperation({
    summary: '커뮤니티 상세',
    description: '커뮤니티 상세',
  })
  @ApiResponse({
    status: 200,
    description: '커뮤니티 상세',
    type: DetailResponseDto,
  })
  @ApiParam({
    name: 'uuid',
    type: 'string',
    required: false,
    description: '커뮤니티 uuid',
  })
  async communityDetail(@Param('uuid') uuid: string): Promise<DetailResponseDto> {
    return await this.communityService.communityDetail(uuid);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @Put('/:uuid')
  @ApiOperation({
    summary: '커뮤니티 수정',
    description: '커뮤니티 수정',
  })
  @ApiResponse({
    status: 200,
    description: '커뮤니티 수정',
    type: DetailResponseDto,
  })
  @ApiParam({
    name: 'uuid',
    type: 'string',
    required: false,
    description: '커뮤니티 uuid',
  })
  async communityPut(
    @CurrentUser() user,
    @Body() dto: CommunityPutReqDto,
    @Param('uuid') uuid: string,
  ): Promise<DetailResponseDto> {
    return await this.communityService.communityPut(user, dto, uuid);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @Delete('/:uuid')
  @ApiOperation({
    summary: '커뮤니티 삭제',
    description: '커뮤니티 삭제',
  })
  @ApiResponse({
    status: 200,
    description: '커뮤니티 삭제',
    type: DetailResponseDto,
  })
  @ApiParam({
    name: 'uuid',
    type: 'string',
    required: false,
    description: '커뮤니티 uuid',
  })
  async communityDelete(
    @CurrentUser() user,
    @Param('uuid') uuid: string,
  ): Promise<DetailResponseDto> {
    return await this.communityService.communityDelete(user, uuid);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @Delete('/:uuid')
  @ApiOperation({
    summary: '커뮤니티 코스 좋아요',
    description: '커뮤니티 코스 좋아요',
  })
  @ApiResponse({
    status: 200,
    description: '커뮤니티 코스 좋아요',
    type: DetailResponseDto,
  })
  @ApiParam({
    name: 'uuid',
    type: 'string',
    required: false,
    description: '커뮤니티 uuid',
  })
  async communityReaction(
    @CurrentUser() user,
    @Param('uuid') uuid: string,
  ): Promise<DetailResponseDto> {
    return await this.communityService.communityReaction(user, uuid);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @Delete('/:uuid')
  @ApiOperation({
    summary: '커뮤니티 코스 좋아요 취소',
    description: '커뮤니티 코스 좋아요 취소',
  })
  @ApiResponse({
    status: 200,
    description: '커뮤니티 코스 좋아요 취소',
    type: DetailResponseDto,
  })
  @ApiParam({
    name: 'uuid',
    type: 'string',
    required: false,
    description: '커뮤니티 uuid',
  })
  async communityReactionDelete(
    @CurrentUser() user,
    @Param('uuid') uuid: string,
  ): Promise<DetailResponseDto> {
    return await this.communityService.communityDelete(user, uuid);
  }
}
