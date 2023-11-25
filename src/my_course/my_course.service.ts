import { Injectable } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { ResponseDataDto } from 'src/commons/dto/response.dto';
import { MyCourseListResDto } from './dto/my_course.dto';
import { MyCourseQueryRepository } from './my_course.query.repository';

@Injectable()
export class MyCourseService {
  constructor(private readonly myCourseQueryRepository: MyCourseQueryRepository) {}

  async myCourseList(dto, user) {
    const courseList = await this.myCourseQueryRepository.find(dto, user);
    if (courseList.length === 0) {
      return ResponseDataDto.from([], null, 0);
    }

    const myCourseListResDto = plainToInstance(MyCourseListResDto, courseList, {
      excludeExtraneousValues: true,
    });

    const last_item_id = courseList.length > 0 ? courseList[courseList.length - 1].id : 0;

    return ResponseDataDto.from(myCourseListResDto, null, last_item_id);
  }
}
