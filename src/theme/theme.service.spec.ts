import { TestBed } from '@automock/jest';
import { ThemeEntity } from 'src/entities/theme.entity';
import { ThemeQueryRepository } from 'src/theme/theme.query.repository';
import { ThemeService } from 'src/theme/theme.service';

describe('ThemeService', () => {
  let service: ThemeService;
  let themeQueryRepository: jest.Mocked<ThemeQueryRepository>;

  beforeEach(async () => {
    // Given
    const { unit, unitRef } = TestBed.create(ThemeService).compile();
    service = unit;
    themeQueryRepository = unitRef.get(ThemeQueryRepository);
    jest.clearAllMocks();
  });

  describe('themeList', () => {
    it('should return list of themes as ApiThemeGetListResponseDto array when themes exist', async () => {
      // Given
      const themes: ThemeEntity[] = [
        { id: 1, uuid: 'theme-1', theme_name: 'Theme One' } as ThemeEntity,
        { id: 2, uuid: 'theme-2', theme_name: 'Theme Two' } as ThemeEntity,
      ];
      jest.spyOn(themeQueryRepository, 'findList').mockResolvedValue(themes);
      // When
      const result = await service.themeList();
      // Then
      const expected = {
        items: themes.map((theme) => ({
          id: theme.id,
          uuid: theme.uuid,
          theme_name: theme.theme_name,
        })),
      };
      expect(result).toMatchObject(expected);
    });

    it('should return an empty list when no themes exist', async () => {
      // Given
      jest.spyOn(themeQueryRepository, 'findList').mockResolvedValue([]);
      // When
      const result = await service.themeList();
      // Then
      expect(result).toEqual({ items: [] });
    });
  });
});
