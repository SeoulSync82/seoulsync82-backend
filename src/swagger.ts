import { ApiAuthPostUserLogoutResponseDto } from 'src/auth/dto/api-auth-post-user-logout-response.dto';
import { ApiAuthPostUserRefreshResponseDto } from 'src/auth/dto/api-auth-post-user-refresh-response.dto';
import { authCommonResponseDto } from 'src/auth/dto/auth-common-response.dto';
import { ApiBookmarkGetDetailResponseDto } from 'src/bookmark/dto/api-bookmark-get-detail-response.dto';
import { ApiBookmarkGetResponseDto } from 'src/bookmark/dto/api-bookmark-get-response.dto';
import { bookmarkCoursePlaceDetailDto } from 'src/bookmark/dto/bookmark-course-place-detail.dto';
import { ApiCommentGetResponseDto } from 'src/comment/dto/api-comment-get-response.dto';
import { CommentListDto } from 'src/comment/dto/comment-list.dto';
import { ApiResponseDto } from 'src/commons/dtos/api-response.dto';
import { CursorPaginatedResponseDto } from 'src/commons/dtos/cursor-paginated-response.dto';
import { LastItemIdResponseDto } from 'src/commons/dtos/last-item-id-response.dto';
import { ListResponseDto } from 'src/commons/dtos/list-response.dto';
import { UuidResponseDto } from 'src/commons/dtos/uuid-response.dto';
import { ApiCommunityGetDetailResponseDto } from 'src/community/dto/api-community-get-detail-response.dto';
import { ApiCommunityGetMyCourseResponseDto } from 'src/community/dto/api-community-get-my-course-response.dto';
import { ApiCommunityGetResponseDto } from 'src/community/dto/api-community-get-response.dto';
import { CommunityCoursePlaceDetailDto } from 'src/community/dto/community-course-place-detail.dto';
import { ApiCourseGetDetailResponseDto } from 'src/course/dto/api-course-get-detail-response.dto';
import { ApiCourseGetMyHistoryResponseDto } from 'src/course/dto/api-course-get-my-history-response.dto';
import { ApiCourseGetPlaceCustomizeResponseDto } from 'src/course/dto/api-course-get-place-customize-response.dto';
import { ApiCourseGetPlaceListResponseDto } from 'src/course/dto/api-course-get-place-list-response.dto';
import {
  ApiCourseGetRecommendResponseDto,
  CourseSubwayStationDetailDto,
} from 'src/course/dto/api-course-get-recommend-response.dto';
import { ApiCoursePostRecommendResponseDto } from 'src/course/dto/api-course-post-recommend-response.dto';
import { ApiCoursePostRecommendSaveResponseDto } from 'src/course/dto/api-course-post-recommend-save-response.dto';
import { ApiCoursePostSaveResponseDto } from 'src/course/dto/api-course-post-save-response.dto';
import { CoursePlaceDetailSaveDto } from 'src/course/dto/course-place-detail-save.dto';
import { CoursePlaceDetailDto } from 'src/course/dto/course-place-detail.dto';
import { CoursePlaceInfoDto } from 'src/course/dto/course-place-info.dto';
import { CoursePlaceDto } from 'src/course/dto/course-place.dto';
import { CourseSubwayLineDetailDto } from 'src/course/dto/course-subway-line-detail.dto';
import { CourseThemeDetailDto } from 'src/course/dto/course-theme-detail.dto';
import { ApiNotificationGetListResponseDto } from 'src/notification/dto/api-notification-get-list-response.dto';
import { ApiPlaceGetCultureDetailResponseDto } from 'src/place/dto/api-place-get-culture-detail-response.dto';
import { ApiPlaceGetCultureResponseDto } from 'src/place/dto/api-place-get-culture-response.dto';
import { ApiPlaceGetDetailResponseDto } from 'src/place/dto/api-place-get-detail-response.dto';
import { ApiPlaceGetExhibitionResponseDto } from 'src/place/dto/api-place-get-exhibition-response.dto';
import { ApiPlaceGetPopupResponseDto } from 'src/place/dto/api-place-get-popup-response.dto';
import { ReactionNotificationDetailDto } from 'src/reaction/dto/reaction-notification-detail.dto';
import { ApiSearchGetDetailResponseDto } from 'src/search/dto/api-search-get-detail-response.dto';
import { ApiSearchGetRecentResponseDto } from 'src/search/dto/api-search-get-recent-response.dto';
import { ApiSearchGetResponseDto } from 'src/search/dto/api-search-get-response.dto';
import { SearchDetailDto } from 'src/search/dto/search-detail.dto';
import { ApiSubwayGetCheckResponseDto } from 'src/subway/dto/api-subway-get-check-response.dto';
import { ApiSubwayGetLineResponseDto } from 'src/subway/dto/api-subway-get-line-response.dto';
import { ApiSubwayGetListResponseDto } from 'src/subway/dto/api-subway-get-list-response.dto';
import { SubwayCustomListDto } from 'src/subway/dto/subway-custom-list.dto';
import { SubwaylineDto } from 'src/subway/dto/subway-line.dto';
import { SubwayStationDto } from 'src/subway/dto/subway-station.dto';
import { ApiThemeGetListResponseDto } from 'src/theme/dto/api-theme-get-list-response.dto';
import { ApiUserGetProfileResponseDto } from 'src/user/dto/api-user-get-profile-response.dto';
import { ApiUserGetTokenResponseDto } from 'src/user/dto/api-user-get-token-response.dto';

export const SwaggerModels = [
  ApiPlaceGetCultureResponseDto,
  ApiPlaceGetCultureDetailResponseDto,
  ApiPlaceGetPopupResponseDto,
  ApiPlaceGetExhibitionResponseDto,
  ApiSearchGetDetailResponseDto,
  ApiSearchGetResponseDto,
  ApiSubwayGetCheckResponseDto,
  ApiCoursePostRecommendResponseDto,
  ApiNotificationGetListResponseDto,
  ApiThemeGetListResponseDto,
  ApiBookmarkGetResponseDto,
  ApiBookmarkGetDetailResponseDto,
  ApiCommunityGetMyCourseResponseDto,
  ApiCommunityGetResponseDto,
  ApiCommunityGetDetailResponseDto,
  ApiCourseGetMyHistoryResponseDto,
  ApiCourseGetDetailResponseDto,
  ApiPlaceGetDetailResponseDto,
  ApiCourseGetPlaceListResponseDto,
  ApiUserGetProfileResponseDto,
  ApiSubwayGetListResponseDto,
  ApiSubwayGetLineResponseDto,
  ApiCourseGetRecommendResponseDto,
  ApiCourseGetPlaceCustomizeResponseDto,
  ApiCoursePostRecommendSaveResponseDto,
  ApiCoursePostSaveResponseDto,
  CourseSubwayLineDetailDto,
  CourseSubwayStationDetailDto,
  CourseThemeDetailDto,
  ApiCommentGetResponseDto,
  ApiAuthPostUserLogoutResponseDto,
  ApiAuthPostUserRefreshResponseDto,
  authCommonResponseDto,
  UuidResponseDto,
  ApiResponseDto,
  CursorPaginatedResponseDto,
  LastItemIdResponseDto,
  ListResponseDto,
  ApiUserGetTokenResponseDto,
  bookmarkCoursePlaceDetailDto,
  CommentListDto,
  ReactionNotificationDetailDto,
  CommunityCoursePlaceDetailDto,
  CoursePlaceDto,
  CoursePlaceDetailDto,
  CoursePlaceInfoDto,
  CoursePlaceDetailSaveDto,
  SubwayCustomListDto,
  SearchDetailDto,
  SubwaylineDto,
  SubwayStationDto,
  ReactionNotificationDetailDto,
  ApiSearchGetRecentResponseDto,
];
