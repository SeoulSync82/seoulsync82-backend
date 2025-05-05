import { TestBed } from '@automock/jest';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ApiCommentGetRequestQueryDto } from 'src/comment/dto/api-comment-get-request-query.dto';
import { CommentEntity } from 'src/entities/comment.entity';
import { UserDto } from 'src/user/dto/user.dto';
import { IsNull, LessThan, Repository } from 'typeorm';
import { CommentQueryRepository } from './comment.query.repository';

describe('CommentQueryRepository', () => {
  let commentQueryRepository: CommentQueryRepository;
  let repository: jest.Mocked<Repository<CommentEntity>>;

  beforeEach(async () => {
    const { unit, unitRef } = TestBed.create(CommentQueryRepository).compile();
    commentQueryRepository = unit;
    repository = unitRef.get(getRepositoryToken(CommentEntity) as string);
    jest.clearAllMocks();
  });

  describe('save', () => {
    it('should save comment entity when save is called', async () => {
      // Given
      const dummyComment = { uuid: 'test-uuid' } as CommentEntity;
      repository.save.mockResolvedValue(dummyComment);

      // When
      const result = await commentQueryRepository.save(dummyComment);

      // Then
      expect(repository.save).toHaveBeenCalledWith(dummyComment);
      expect(result).toEqual(dummyComment);
    });
  });

  describe('findOne', () => {
    it('should find one comment entity when findOne is called with uuid', async () => {
      // Given
      const uuid = 'test-uuid';
      const dummyComment = { uuid, comment: 'test comment' } as CommentEntity;
      repository.findOne.mockResolvedValue(dummyComment);

      // When
      const result = await commentQueryRepository.findOne(uuid);

      // Then
      expect(repository.findOne).toHaveBeenCalledWith({
        where: { uuid, archived_at: IsNull() },
      });
      expect(result).toEqual(dummyComment);
    });
  });

  describe('find', () => {
    it('should find comments with id less than last_id when last_id > 0', async () => {
      // Given
      const uuid = 'community-uuid';
      const dto: ApiCommentGetRequestQueryDto = { size: 5, last_id: 10 };
      const dummyComments = [{ uuid: '1' } as CommentEntity, { uuid: '2' } as CommentEntity];
      repository.find.mockResolvedValue(dummyComments);

      // When
      const result = await commentQueryRepository.find(uuid, dto);

      // Then
      expect(repository.find).toHaveBeenCalledWith({
        where: { target_uuid: uuid, archived_at: IsNull(), id: LessThan(dto.last_id) },
        order: { created_at: 'DESC' },
        take: dto.size,
      });
      expect(result).toEqual(dummyComments);
    });

    it('should find comments without id condition when last_id equals 0', async () => {
      // Given
      const uuid = 'community-uuid';
      const dto: ApiCommentGetRequestQueryDto = { size: 5, last_id: 0 };
      const dummyComments = [{ uuid: '1' } as CommentEntity];
      repository.find.mockResolvedValue(dummyComments);

      // When
      const result = await commentQueryRepository.find(uuid, dto);

      // Then
      expect(repository.find).toHaveBeenCalledWith({
        where: { target_uuid: uuid, archived_at: IsNull() },
        order: { created_at: 'DESC' },
        take: dto.size,
      });
      expect(result).toEqual(dummyComments);
    });
  });

  describe('findMyComment', () => {
    it("should return the user's comment when it exists", async () => {
      // Given
      const targetUuid = 'community-uuid';
      const user = { uuid: 'user-uuid' } as UserDto;
      const dummyComment = { uuid: 'comment-uuid', user_uuid: user.uuid } as CommentEntity;
      repository.findOne.mockResolvedValue(dummyComment);
      // When
      const result = await commentQueryRepository.findMyComment(targetUuid, user);
      // Then
      expect(repository.findOne).toHaveBeenCalledWith({
        where: { target_uuid: targetUuid, user_uuid: user.uuid, archived_at: IsNull() },
      });
      expect(result).toEqual(dummyComment);
    });
  });
});
