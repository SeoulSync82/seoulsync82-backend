import {
  Body,
  Controller,
  Get,
  Post,
  Query,
  UseFilters,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/commons/auth/jwt-auth.guard';
import { CurrentUser } from 'src/commons/decorators/user.decorator';
import { DetailResponseDto, ResponseDataDto } from 'src/commons/dto/response.dto';
import { SeoulSync82ExceptionFilter } from 'src/commons/filters/seoulsync82.exception.filter';
import { SuccessInterceptor } from 'src/commons/interceptors/success.interceptor';
import { CommunityService } from './community.service';
import { CommunityListReqDto, CommunityPostReqDto } from './dto/community.dto';

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
