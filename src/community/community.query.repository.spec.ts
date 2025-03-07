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

  describe('countCommunity', () => {
    it('should return count of communities with archived_at null', async () => {
      // Given
      repository.count.mockResolvedValue(5);
      // When
      const result = await communityQueryRepository.countCommunity();
      // Then
      expect(repository.count).toHaveBeenCalledWith({
        where: { archived_at: IsNull() },
      });
      expect(result).toBe(5);
    });
  });

  describe('findCommunityList', () => {
    let qb: any;
    const user: UserDto = { uuid: 'user-uuid' } as UserDto;
    // 기본 dto 세팅
    const baseDto: ApiCommunityGetRequestQueryDto = { size: 2, order: 'latest' };

    beforeEach(() => {
      qb = {
        leftJoin: jest.fn().mockReturnThis(),
        addSelect: jest.fn().mockReturnThis(),
        setParameter: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        groupBy: jest.fn().mockReturnThis(),
        addGroupBy: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        addOrderBy: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        getRawAndEntities: jest.fn(),
      };
      repository.createQueryBuilder = jest.fn().mockReturnValue(qb);
    });

    it('should apply pagination and return community list with nextCursor when entities exceed size', async () => {
      // Given
      const community1: CommunityEntity = {
        uuid: 'c1',
        id: 1,
        created_at: new Date(),
      } as CommunityEntity;
      const community2: CommunityEntity = {
        uuid: 'c2',
        id: 2,
        created_at: new Date(),
      } as CommunityEntity;
      const extraCommunity: CommunityEntity = {
        uuid: 'c3',
        id: 3,
        created_at: new Date(),
      } as CommunityEntity;
      qb.getRawAndEntities.mockResolvedValue({
        entities: [community1, community2, extraCommunity],
        raw: [
          { like_count: '10', isLiked: '1' },
          { like_count: '5', isLiked: '0' },
          { like_count: '3', isLiked: '1' },
        ],
      });
      jest.spyOn(CommunityCursorPaginationHelper, 'decodeCursor').mockReturnValue(undefined);
      jest.spyOn(CommunityCursorPaginationHelper, 'applyCursor').mockImplementation(() => {});
      jest.spyOn(CommunityCursorPaginationHelper, 'generateCursor').mockReturnValue('next-cursor');
      // When
      const result = await communityQueryRepository.findCommunityList(baseDto, user);
      // Then
      expect(qb.take).toHaveBeenCalledWith(baseDto.size + 1);
      expect(result.communityList).toEqual([
        { ...community1, like_count: 10, isLiked: true },
        { ...community2, like_count: 5, isLiked: false },
      ]);
      expect(result.nextCursor).toBe('next-cursor');
    });

    it('should return community list without nextCursor when entities count is less than or equal to dto.size', async () => {
      // Given
      const community1: CommunityEntity = {
        uuid: 'c1',
        id: 1,
        created_at: new Date(),
      } as CommunityEntity;
      const community2: CommunityEntity = {
        uuid: 'c2',
        id: 2,
        created_at: new Date(),
      } as CommunityEntity;
      qb.getRawAndEntities.mockResolvedValue({
        entities: [community1, community2],
        raw: [
          { like_count: '10', isLiked: '1' },
          { like_count: '5', isLiked: '0' },
        ],
      });
      jest.spyOn(CommunityCursorPaginationHelper, 'decodeCursor').mockReturnValue(undefined);
      jest.spyOn(CommunityCursorPaginationHelper, 'applyCursor').mockImplementation(() => {});
      jest.spyOn(CommunityCursorPaginationHelper, 'generateCursor').mockReturnValue(null);
      // When
      const result = await communityQueryRepository.findCommunityList(baseDto, user);
      // Then
      expect(result.communityList).toEqual([
        { ...community1, like_count: 10, isLiked: true },
        { ...community2, like_count: 5, isLiked: false },
      ]);
      expect(result.nextCursor).toBeNull();
    });

    it('should apply me filter and like_count ordering when dto.me is true and order is not latest', async () => {
      // Given
      const dto: ApiCommunityGetRequestQueryDto = {
        size: 2,
        order: 'popular',
        me: true,
        next_page: 'cursorString',
      } as ApiCommunityGetRequestQueryDto;
      const community1: CommunityEntity = {
        uuid: 'c1',
        id: 1,
        created_at: new Date(),
      } as CommunityEntity;
      const community2: CommunityEntity = {
        uuid: 'c2',
        id: 2,
        created_at: new Date(),
      } as CommunityEntity;
      qb.getRawAndEntities.mockResolvedValue({
        entities: [community1, community2],
        raw: [
          { like_count: '20', isLiked: '1' },
          { like_count: '15', isLiked: '0' },
        ],
      });
      // When
      const result = await communityQueryRepository.findCommunityList(dto, user);
      // Then
      expect(qb.andWhere).toHaveBeenCalledWith('community.user_uuid = :userUuid', {
        userUuid: user.uuid,
      });
      expect(qb.orderBy).toHaveBeenCalledWith('like_count', 'DESC');
      expect(qb.addOrderBy).toHaveBeenCalledWith('community.created_at', 'DESC');
      expect(qb.addOrderBy).toHaveBeenCalledWith('community.id', 'DESC');
      expect(result.communityList).toEqual([
        { ...community1, like_count: 20, isLiked: true },
        { ...community2, like_count: 15, isLiked: false },
      ]);
      expect(result.nextCursor).toBeNull();
    });
  });
});
