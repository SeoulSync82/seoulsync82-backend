import { TestBed } from '@automock/jest';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NoticeEntity } from 'src/entities/notice.entity';
import { ApiNoticeGetRequestQueryDto } from 'src/notice/dto/api-notice-get-request-query.dto';
import { NoticeQueryRepository } from 'src/notice/notice.query.repository';
import { IsNull, LessThan, Repository } from 'typeorm';

describe('NoticeQueryRepository', () => {
  let queryRepository: NoticeQueryRepository;
  let repository: jest.Mocked<Repository<NoticeEntity>>;

  beforeEach(() => {
    // Given
    const { unit, unitRef } = TestBed.create(NoticeQueryRepository).compile();
    queryRepository = unit;
    repository = unitRef.get(getRepositoryToken(NoticeEntity) as string);
    jest.clearAllMocks();
  });

  describe('save', () => {
    it('should save entity and return result', async () => {
      // Given
      const entity = { uuid: 'id' } as NoticeEntity;
      repository.save.mockResolvedValue(entity);
      // When
      const result = await queryRepository.save(entity);
      // Then
      expect(repository.save).toHaveBeenCalledWith(entity);
      expect(result).toEqual(entity);
    });
  });

  describe('findOne', () => {
    it('should call repository.findOne with uuid and not archived', async () => {
      // Given
      const entity = { uuid: 'id' } as NoticeEntity;
      repository.findOne.mockResolvedValue(entity);
      // When
      const result = await queryRepository.findOne('id');
      // Then
      expect(repository.findOne).toHaveBeenCalledWith({
        where: { uuid: 'id', archived_at: IsNull() },
      });
      expect(result).toEqual(entity);
    });
  });

  describe('find', () => {
    it('should include LessThan condition when last_id > 0', async () => {
      // Given
      const dto: ApiNoticeGetRequestQueryDto = { size: 2, last_id: 10 } as any;
      const list = [{ id: 1 }] as NoticeEntity[];
      repository.find.mockResolvedValue(list);
      // When
      const result = await queryRepository.find(dto);
      // Then
      expect(repository.find).toHaveBeenCalledWith({
        where: { archived_at: IsNull(), id: LessThan(dto.last_id) },
        order: { published_at: 'DESC' },
        take: dto.size,
      });
      expect(result).toEqual(list);
    });

    it('should omit LessThan condition when last_id is 0', async () => {
      // Given
      const dto: ApiNoticeGetRequestQueryDto = { size: 3, last_id: 0 } as any;
      const list = [{ id: 1 }] as NoticeEntity[];
      repository.find.mockResolvedValue(list);
      // When
      const result = await queryRepository.find(dto);
      // Then
      expect(repository.find).toHaveBeenCalledWith({
        where: { archived_at: IsNull() },
        order: { published_at: 'DESC' },
        take: dto.size,
      });
      expect(result).toEqual(list);
    });
  });
});
