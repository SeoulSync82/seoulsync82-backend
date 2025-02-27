import { ApiAuthPostUserLogoutResponseDto } from './auth/dto/api-auth-post-user-logout-response.dto';
import { ApiAuthPostUserRefreshResponseDto } from './auth/dto/api-auth-post-user-refresh-response.dto';
import { authCommonResponseDto } from './auth/dto/auth-common-response.dto';
import { ApiBookmarkGetDetailResponseDto } from './bookmark/dto/api-bookmark-get-detail-response.dto';
import { ApiBookmarkGetResponseDto } from './bookmark/dto/api-bookmark-get-response.dto';
import {
  ApiCommentGetResponseDto,
  CommentListDto,
} from './comment/dto/api-comment-get-response.dto';
import { ApiResponseDto } from './commons/dtos/api-response.dto';
import { CursorPaginatedResponseDto } from './commons/dtos/cursor-paginated-response.dto';
import { LastItemIdResponseDto } from './commons/dtos/last-item-id-response.dto';
import { ListResponseDto } from './commons/dtos/list-response.dto';
import { UuidResponseDto } from './commons/dtos/uuid-response.dto';
import { ApiCommunityGetDetailResponseDto } from './community/dto/api-community-get-detail-response.dto';
import { ApiCommunityGetMyCourseResponseDto } from './community/dto/api-community-get-my-course-response.dto';
import { ApiCommunityGetResponseDto } from './community/dto/api-community-get-response.dto';
import { ApiCourseGetDetailResponseDto } from './course/dto/api-course-get-detail-response.dto';
import { ApiCourseGetMyHistoryResponseDto } from './course/dto/api-course-get-my-history-response.dto';
import { ApiCourseGetPlaceCustomizeResponseDto } from './course/dto/api-course-get-place-customize-response.dto';
import { ApiCourseGetPlaceListResponseDto } from './course/dto/api-course-get-place-list-response.dto';
import {
  ApiCourseGetRecommendResponseDto,
  SubwayLineDetail,
  SubwayStationDetail,
  ThemeDetail,
} from './course/dto/api-course-get-recommend-response.dto';
import { ApiCoursePostRecommendResponseDto } from './course/dto/api-course-post-recommend-response.dto';
import { ApiCoursePostRecommendSaveResponseDto } from './course/dto/api-course-post-recommend-save-response.dto';
import { ApiCoursePostSaveResponseDto } from './course/dto/api-course-post-save-response.dto';
import { ApiNotificationGetListResponseDto } from './notification/dto/api-notification-get-list-response.dto';
import { ApiPlaceGetCultureDetailResponseDto } from './place/dto/api-place-get-culture-detail-response.dto';
import { ApiPlaceGetCultureResponseDto } from './place/dto/api-place-get-culture-response.dto';
import { ApiPlaceGetDetailResponseDto } from './place/dto/api-place-get-detail-response.dto';
import { ApiPlaceGetExhibitionResponseDto } from './place/dto/api-place-get-exhibition-response.dto';
import { ApiPlaceGetPopupResponseDto } from './place/dto/api-place-get-popup-response.dto';
import { ApiSearchGetDetailResponseDto } from './search/dto/api-search-get-detail-response.dto';
import { ApiSearchGetResponseDto } from './search/dto/api-search-get-response.dto';
import { ApiSubwayGetCheckResponseDto } from './subway/dto/api-subway-get-check-response.dto';
import { ApiSubwayGetLineResponseDto } from './subway/dto/api-subway-get-line-response.dto';
import { ApiSubwayGetListResponseDto } from './subway/dto/api-subway-get-list-response.dto';
import { ApiThemeGetListResponseDto } from './theme/dto/api-theme-get-list-response.dto';
import { ApiUserGetProfileResponseDto } from './user/dto/api-user-get-profile-response.dto';
import { ApiUserGetTokenResponseDto } from './user/dto/api-user-get-token-response.dto';

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
  SubwayLineDetail,
  SubwayStationDetail,
  ThemeDetail,
  ApiCommentGetResponseDto,
  CommentListDto,
  ApiAuthPostUserLogoutResponseDto,
  ApiAuthPostUserRefreshResponseDto,
  authCommonResponseDto,
  UuidResponseDto,
  ApiResponseDto,
  CursorPaginatedResponseDto,
  LastItemIdResponseDto,
  ListResponseDto,
  ApiUserGetTokenResponseDto,
];
