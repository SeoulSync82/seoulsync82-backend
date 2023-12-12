import { CoursePlaceDto, CourseRecommendResDto } from './course/dto/course.dto';
import { MyCourseDetailResDto, MyCourseListResDto } from './my_course/dto/my_course.dto';
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
];
