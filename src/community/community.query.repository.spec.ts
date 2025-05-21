import { TestBed } from '@automock/jest';
import { getRepositoryToken } from '@nestjs/typeorm';
import { CommunityCursorPaginationHelper } from 'src/commons/helpers/community.cursor.helper';
import { ApiCommunityGetRequestQueryDto } from 'src/community/dto/api-community-get-request-query.dto';
import { CommunityEntity } from 'src/entities/community.entity';
import { UserDto } from 'src/user/dto/user.dto';
import { IsNull, Repository } from 'typeorm';
import { CommunityQueryRepository } from './community.query.repository';

describe('CommunityQueryRepository', () => {
  let communityQueryRepository: CommunityQueryRepository;
  let repository: jest.Mocked<Repository<CommunityEntity>>;

  beforeEach(async () => {
    const { unit, unitRef } = TestBed.create(CommunityQueryRepository).compile();
    communityQueryRepository = unit;
    repository = unitRef.get(getRepositoryToken(CommunityEntity) as string);
    jest.clearAllMocks();
  });

  describe('save', () => {
    it('should save the community entity', async () => {
      // Given
      const entity: CommunityEntity = { uuid: 'test-uuid' } as CommunityEntity;
      repository.save.mockResolvedValue(entity);
      // When
      const result = await communityQueryRepository.save(entity);
      // Then
      expect(repository.save).toHaveBeenCalledWith(entity);
      expect(result).toEqual(entity);
    });
  });

  describe('findOne', () => {
    it('should find one community entity by uuid and archived_at null', async () => {
      // Given
      const uuid = 'test-uuid';
      const entity: CommunityEntity = { uuid, archived_at: null } as CommunityEntity;
      repository.findOne.mockResolvedValue(entity);
      // When
      const result = await communityQueryRepository.findOne(uuid);
      // Then
      expect(repository.findOne).toHaveBeenCalledWith({
        where: { uuid, archived_at: IsNull() },
      });
      expect(result).toEqual(entity);
    });
  });

  describe('myCommunity', () => {
    it('should return communities for the given user', async () => {
      // Given
      const user: UserDto = { uuid: 'user-uuid' } as UserDto;
      const entities: CommunityEntity[] = [
        {
          uuid: 'c1',
          user_uuid: 'user-uuid',
          archived_at: null,
          created_at: new Date(),
        } as CommunityEntity,
        {
          uuid: 'c2',
          user_uuid: 'user-uuid',
          archived_at: null,
          created_at: new Date(),
        } as CommunityEntity,
      ];
      repository.find.mockResolvedValue(entities);
      // When
      const result = await communityQueryRepository.myCommunity(user);
      // Then
      expect(repository.find).toHaveBeenCalledWith({
        where: { user_uuid: user.uuid, archived_at: IsNull() },
        order: { created_at: 'DESC' },
      });
      expect(result).toEqual(entities);
    });
  });

  describe('findCommunityByCourse', () => {
    it('should find community by course uuid and user', async () => {
      // Given
      const courseUuid = 'course-uuid';
      const user: UserDto = { uuid: 'user-uuid' } as UserDto;
      const entity: CommunityEntity = {
        uuid: 'c1',
        course_uuid: courseUuid,
        user_uuid: user.uuid,
        archived_at: null,
      } as CommunityEntity;
      repository.findOne.mockResolvedValue(entity);
      // When
      const result = await communityQueryRepository.findCommunityByCourse(courseUuid, user);
      // Then
      expect(repository.findOne).toHaveBeenCalledWith({
        where: { course_uuid: courseUuid, user_uuid: user.uuid, archived_at: IsNull() },
      });
      expect(result).toEqual(entity);
    });
  });

  describe('countTotalCommunity', () => {
    let qb: any;
    const user: UserDto = { uuid: 'user-uuid' } as any;
    const baseDto: ApiCommunityGetRequestQueryDto = { size: 2, order: 'latest' };

    beforeEach(() => {
      qb = {
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        getCount: jest.fn().mockResolvedValue(5),
      };
      repository.createQueryBuilder = jest.fn().mockReturnValue(qb);
    });

    it('should return count of communities with archived_at null', async () => {
      // When
      const result = await communityQueryRepository.countTotalCommunity(baseDto, user);
      // Then
      expect(repository.createQueryBuilder).toHaveBeenCalledWith('community');
      expect(qb.where).toHaveBeenCalledWith('community.archived_at IS NULL');
      expect(qb.getCount).toHaveBeenCalled();
      expect(result).toBe(5);
    });

    it('should apply me filter when dto.me is true', async () => {
      // Given
      const dto = { ...baseDto, me: true } as ApiCommunityGetRequestQueryDto;
      // When
      await communityQueryRepository.countTotalCommunity(dto, user);
      // Then
      expect(qb.andWhere).toHaveBeenCalledWith('community.user_uuid = :userUuid', {
        userUuid: user.uuid,
      });
    });
  });

  describe('findCommunityList', () => {
    let qb: any;
    const user: UserDto = { uuid: 'user-uuid' } as any;
    const baseDto: ApiCommunityGetRequestQueryDto = { size: 2, order: 'latest' };

    beforeEach(() => {
      qb = {
        addSelect: jest.fn().mockReturnThis(),
        setParameter: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        addOrderBy: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        getRawAndEntities: jest.fn(),
      };
      repository.createQueryBuilder = jest.fn().mockReturnValue(qb);

      jest
        .spyOn(CommunityCursorPaginationHelper, 'buildLikeCountSub')
        .mockReturnValue('LIKE_COUNT_SUBQ');
      jest
        .spyOn(CommunityCursorPaginationHelper, 'buildIsLikedSub')
        .mockReturnValue('IS_LIKED_SUBQ');
    });

    it('should apply pagination and return community list with nextCursor when entities exceed size', async () => {
      // Given
      const c1 = { uuid: 'c1', id: 1, created_at: new Date() } as CommunityEntity;
      const c2 = { uuid: 'c2', id: 2, created_at: new Date() } as CommunityEntity;
      const c3 = { uuid: 'c3', id: 3, created_at: new Date() } as CommunityEntity;
      qb.getRawAndEntities.mockResolvedValue({
        entities: [c1, c2, c3],
        raw: [
          { like_count: '10', is_liked: '1' },
          { like_count: '5', is_liked: '0' },
          { like_count: '3', is_liked: '1' },
        ],
      });
      jest.spyOn(CommunityCursorPaginationHelper, 'applyCursor').mockImplementation(() => {});
      jest.spyOn(CommunityCursorPaginationHelper, 'generateCursor').mockReturnValue('next-cursor');

      // When
      const { communityList, nextCursor } = await communityQueryRepository.findCommunityList(
        baseDto,
        user,
      );

      // Then
      expect(qb.addSelect).toHaveBeenCalledWith('LIKE_COUNT_SUBQ', 'like_count');
      expect(qb.addSelect).toHaveBeenCalledWith('IS_LIKED_SUBQ', 'is_liked');
      expect(qb.take).toHaveBeenCalledWith(baseDto.size + 1);
      expect(communityList).toEqual([
        { ...c1, like_count: 10, is_liked: true },
        { ...c2, like_count: 5, is_liked: false },
      ]);
      expect(nextCursor).toBe('next-cursor');
    });

    it('should return community list without nextCursor when entities count is <= dto.size', async () => {
      // Given
      const c1 = { uuid: 'c1', id: 1, created_at: new Date() } as CommunityEntity;
      const c2 = { uuid: 'c2', id: 2, created_at: new Date() } as CommunityEntity;
      qb.getRawAndEntities.mockResolvedValue({
        entities: [c1, c2],
        raw: [
          { like_count: '10', is_liked: '1' },
          { like_count: '5', is_liked: '0' },
        ],
      });
      jest.spyOn(CommunityCursorPaginationHelper, 'applyCursor').mockImplementation(() => {});
      jest.spyOn(CommunityCursorPaginationHelper, 'generateCursor').mockReturnValue(null);

      // When
      const { communityList, nextCursor } = await communityQueryRepository.findCommunityList(
        baseDto,
        user,
      );

      // Then
      expect(communityList).toEqual([
        { ...c1, like_count: 10, is_liked: true },
        { ...c2, like_count: 5, is_liked: false },
      ]);
      expect(nextCursor).toBeNull();
    });

    it('should apply me filter and popular ordering when dto.me is true and order is "popular"', async () => {
      // Given
      const dto = {
        size: 2,
        order: 'popular',
        me: true,
        next_page: 'ignored',
      } as ApiCommunityGetRequestQueryDto;
      qb.getRawAndEntities.mockResolvedValue({
        entities: [],
        raw: [],
      });

      // When
      await communityQueryRepository.findCommunityList(dto, user);

      // Then
      expect(qb.andWhere).toHaveBeenCalledWith('community.user_uuid = :userUuid', {
        userUuid: user.uuid,
      });
      expect(qb.orderBy).toHaveBeenCalledWith('like_count', 'DESC');
      expect(qb.addOrderBy).toHaveBeenCalledWith('community.created_at', 'DESC');
      expect(qb.addOrderBy).toHaveBeenCalledWith('community.id', 'DESC');
    });
  });

  describe('findExistingCourse', () => {
    let qb: any;
    const courseUuids = ['c1', 'c2'];

    beforeEach(() => {
      qb = {
        leftJoin: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        addSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        groupBy: jest.fn().mockReturnThis(),
        addGroupBy: jest.fn().mockReturnThis(),
        getRawMany: jest.fn(),
      };
      repository.createQueryBuilder = jest.fn().mockReturnValue(qb);
    });

    it('should return mapped existing courses with correct types', async () => {
      // Given
      const rawRows = [
        { course_uuid: 'c1', score: '4.5', like_count: '10' },
        { course_uuid: 'c2', score: '3.0', like_count: '0' },
      ];
      qb.getRawMany.mockResolvedValue(rawRows);

      // When
      const result = await communityQueryRepository.findExistingCourse(courseUuids);

      // Then
      expect(repository.createQueryBuilder).toHaveBeenCalledWith('community');
      expect(qb.leftJoin).toHaveBeenCalledWith(
        'community.reactions',
        'reaction',
        'reaction.like = 1',
      );
      expect(qb.select).toHaveBeenCalledWith('community.course_uuid', 'course_uuid');
      expect(qb.addSelect).toHaveBeenCalledWith('community.score', 'score');
      expect(qb.addSelect).toHaveBeenCalledWith('COUNT(reaction.id)', 'like_count');
      expect(qb.where).toHaveBeenCalledWith('community.course_uuid IN (:...courseUuids)', {
        courseUuids,
      });
      expect(qb.andWhere).toHaveBeenCalledWith('community.archived_at IS NULL');
      expect(qb.groupBy).toHaveBeenCalledWith('community.course_uuid');
      expect(qb.addGroupBy).toHaveBeenCalledWith('community.score');
      expect(qb.getRawMany).toHaveBeenCalled();

      expect(result).toEqual([
        { course_uuid: 'c1', score: '4.5', like_count: 10 },
        { course_uuid: 'c2', score: '3.0', like_count: 0 },
      ]);
    });
  });

  describe('findCourse', () => {
    it('should find one community entity by course_uuid and archived_at null', async () => {
      // Given
      const courseUuid = 'course-123';
      const entity: CommunityEntity = {
        uuid: 'c1',
        course_uuid: courseUuid,
        archived_at: null,
      } as CommunityEntity;
      repository.findOne.mockResolvedValue(entity);

      // When
      const result = await communityQueryRepository.findCourse(courseUuid);

      // Then
      expect(repository.findOne).toHaveBeenCalledWith({
        where: { course_uuid: courseUuid, archived_at: IsNull() },
      });
      expect(result).toEqual(entity);
    });
  });
});
