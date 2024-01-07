import {
  CommunityMyCourseListResDto,
  CommunityListResDto,
  CommunityDetailResDto,
} from './community/dto/community.dto';
import {
  CourseDetailResDto,
  CoursePlaceDto,
  CourseRecommendResDto,
  MyCourseHistoryResDto,
} from './course/dto/course.dto';
import { BookmarkListResDto, MyCourseDetailResDto } from './bookmark/dto/bookmark.dto';
import { NotificationListResDto } from './notification/dto/notification.dto';
import {
  CultureDto,
  CultureListDto,
  ExhibitionDto,
  PlaceDetailResDto,
  PopupDto,
} from './place/dto/place.dto';
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
  BookmarkListResDto,
  MyCourseDetailResDto,
  CommunityMyCourseListResDto,
  CommunityListResDto,
  CommunityDetailResDto,
  MyCourseHistoryResDto,
  CourseDetailResDto,
  PlaceDetailResDto,
];
