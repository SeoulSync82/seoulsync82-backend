import { TestBed } from '@automock/jest';
import { getRepositoryToken } from '@nestjs/typeorm';
import { CourseQueryRepository } from 'src/course/course.query.repository';
import { ApiCourseGetMyHistoryRequestQueryDto } from 'src/course/dto/api-course-get-my-history-request-query.dto';
import { CourseDetailEntity } from 'src/entities/course.detail.entity';
import { CourseEntity } from 'src/entities/course.entity';
import { UserDto } from 'src/user/dto/user.dto';
import { In, LessThan } from 'typeorm';

describe('CourseQueryRepository', () => {
  let courseQueryRepository: CourseQueryRepository;
  let courseRepository: jest.Mocked<any>;
  let detailRepository: jest.Mocked<any>;

  beforeEach(async () => {
    const { unit, unitRef } = TestBed.create(CourseQueryRepository).compile();
    courseQueryRepository = unit;
    courseRepository = unitRef.get(getRepositoryToken(CourseEntity) as string);
    detailRepository = unitRef.get(getRepositoryToken(CourseDetailEntity) as string);
    jest.clearAllMocks();
  });

  describe('saveCourse', () => {
    it('should save and return course when valid course entity provided', async () => {
      // Given
      const course: CourseEntity = { uuid: 'course-uuid' } as CourseEntity;
      courseRepository.save.mockResolvedValue(course);
      // When
      const result = await courseQueryRepository.saveCourse(course);
      // Then
      expect(courseRepository.save).toHaveBeenCalledWith(course);
      expect(result).toEqual(course);
    });
  });

  describe('saveCourseDetail', () => {
    it('should save and return course detail when valid course detail entity provided', async () => {
      // Given
      const detail: CourseDetailEntity = {
        course_uuid: 'course-uuid',
        place_uuid: 'place-uuid',
      } as CourseDetailEntity;
      detailRepository.save.mockResolvedValue(detail);
      // When
      const result = await courseQueryRepository.saveCourseDetail(detail);
      // Then
      expect(detailRepository.save).toHaveBeenCalledWith(detail);
      expect(result).toEqual(detail);
    });
  });

  describe('findUserHistoryCourse', () => {
    it('should return user history courses from last 7 days when valid user uuid provided', async () => {
      // Given
      const mockQueryBuilder = {
        innerJoin: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue([{ place_uuid: 'place-uuid' }]),
      };
      detailRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);
      const uuid = 'user-uuid';
      // When
      const result = await courseQueryRepository.findUserHistoryCourse(uuid);
      // Then
      expect(detailRepository.createQueryBuilder).toHaveBeenCalledWith('courseDetail');
      expect(mockQueryBuilder.innerJoin).toHaveBeenCalledWith('courseDetail.course', 'course');
      expect(mockQueryBuilder.where).toHaveBeenCalledWith('course.user_uuid = :uuid', { uuid });
      expect(mockQueryBuilder.andWhere).toHaveBeenCalled();
      expect(mockQueryBuilder.select).toHaveBeenCalledWith('courseDetail.place_uuid');
      expect(result).toEqual([{ place_uuid: 'place-uuid' }]);
    });
  });

  describe('findCourse', () => {
    it('should return course when valid uuid provided', async () => {
      // Given
      const course: CourseEntity = { uuid: 'course-uuid' } as CourseEntity;
      courseRepository.findOne.mockResolvedValue(course);
      // When
      const result = await courseQueryRepository.findCourse('course-uuid');
      // Then
      expect(courseRepository.findOne).toHaveBeenCalledWith({ where: { uuid: 'course-uuid' } });
      expect(result).toEqual(course);
    });
  });

  describe('findPlace', () => {
    it('should return course detail places when valid course uuid provided', async () => {
      // Given
      const mockQueryBuilder = {
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue([{ place_uuid: 'place-uuid' }]),
      };
      detailRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);
      const courseUuid = 'course-uuid';
      // When
      const result = await courseQueryRepository.findPlace(courseUuid);
      // Then
      expect(detailRepository.createQueryBuilder).toHaveBeenCalledWith('courseDetail');
      expect(mockQueryBuilder.leftJoinAndSelect).toHaveBeenCalledWith(
        'courseDetail.place',
        'place',
      );
      expect(mockQueryBuilder.where).toHaveBeenCalledWith(
        'courseDetail.course_uuid = :courseUuid',
        { courseUuid },
      );
      expect(mockQueryBuilder.select).toHaveBeenCalledWith(['courseDetail', 'place']);
      expect(result).toEqual([{ place_uuid: 'place-uuid' }]);
    });
  });

  describe('findList', () => {
    it('should return courses list when valid uuids array provided', async () => {
      // Given
      const courses: CourseEntity[] = [{ uuid: 'course-uuid' }] as CourseEntity[];
      courseRepository.find.mockResolvedValue(courses);
      const uuids = ['course-uuid'];
      // When
      const result = await courseQueryRepository.findList(uuids);
      // Then
      expect(courseRepository.find).toHaveBeenCalledWith({ where: { uuid: In(uuids) } });
      expect(result).toEqual(courses);
    });
  });

  describe('findOne', () => {
    it('should return course when valid uuid provided using findOne method', async () => {
      // Given
      const course: CourseEntity = { uuid: 'course-uuid' } as CourseEntity;
      courseRepository.findOne.mockResolvedValue(course);
      // When
      const result = await courseQueryRepository.findOne('course-uuid');
      // Then
      expect(courseRepository.findOne).toHaveBeenCalledWith({ where: { uuid: 'course-uuid' } });
      expect(result).toEqual(course);
    });
  });

  describe('findMyCourse', () => {
    it('should return courses when last_id is greater than 0', async () => {
      // Given
      const dto: ApiCourseGetMyHistoryRequestQueryDto = { last_id: 10, size: 5 };
      const user: UserDto = { uuid: 'user-uuid' } as UserDto;
      const courses: CourseEntity[] = [
        { uuid: 'course-uuid', created_at: new Date() },
      ] as CourseEntity[];
      courseRepository.find.mockResolvedValue(courses);
      // When
      const result = await courseQueryRepository.findMyCourse(dto, user);
      // Then
      expect(courseRepository.find).toHaveBeenCalledWith({
        where: { user_uuid: user.uuid, id: LessThan(dto.last_id) },
        order: { created_at: 'DESC' },
        take: dto.size,
      });
      expect(result).toEqual(courses);
    });

    it('should return courses when last_id is 0', async () => {
      // Given
      const dto: ApiCourseGetMyHistoryRequestQueryDto = { last_id: 0, size: 5 };
      const user: UserDto = { uuid: 'user-uuid' } as UserDto;
      const courses: CourseEntity[] = [
        { uuid: 'course-uuid', created_at: new Date() },
      ] as CourseEntity[];
      courseRepository.find.mockResolvedValue(courses);
      // When
      const result = await courseQueryRepository.findMyCourse(dto, user);
      // Then
      expect(courseRepository.find).toHaveBeenCalledWith({
        where: { user_uuid: user.uuid },
        order: { created_at: 'DESC' },
        take: dto.size,
      });
      expect(result).toEqual(courses);
    });
  });
});
