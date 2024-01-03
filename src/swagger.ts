import {
  CommunityMyCourseListResDto,
  CommunityListResDto,
  CommunityDetailResDto,
} from './community/dto/community.dto';
import { CoursePlaceDto, CourseRecommendResDto } from './course/dto/course.dto';
import { MyCourseDetailResDto, MyCourseListResDto } from './bookmark/dto/bookmark.dto';
import { NotificationListResDto } from './notification/dto/notification.dto';
import { CultureDto, CultureListDto, ExhibitionDto, PopupDto } from './place/dto/place.dto';
import { SubwayCustomCheckResDto } from './place/dto/subway.dto';
import { SearchDetailDto, SearchListDto } from './search/dto/search.dto';
import { ThemeListDto } from './theme/dto/theme.dto';

export const SwaggerModels = [
  CultureListDto,
  CultureDto,
  PopupDto,
  ExhibitionDto,
  SearchDetailDto,
  SearchListDto,
  SubwayCustomCheckResDto,
  CourseRecommendResDto,
  CoursePlaceDto,
  NotificationListResDto,
  ThemeListDto,
  MyCourseListResDto,
  MyCourseDetailResDto,
  CommunityMyCourseListResDto,
  CommunityListResDto,
  CommunityDetailResDto,
];
