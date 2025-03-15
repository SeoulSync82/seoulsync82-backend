import { TestBed } from '@automock/jest';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ThemeEntity } from 'src/entities/theme.entity';
import { ThemeQueryRepository } from 'src/theme/theme.query.repository';
import { Repository } from 'typeorm';

describe('ThemeQueryRepository', () => {
  let themeQueryRepository: ThemeQueryRepository;
  let themeRepository: jest.Mocked<Repository<ThemeEntity>>;

  beforeEach(async () => {
    // Given
    const { unit, unitRef } = TestBed.create(ThemeQueryRepository).compile();
    themeQueryRepository = unit;
    themeRepository = unitRef.get(getRepositoryToken(ThemeEntity) as string);
    jest.clearAllMocks();
  });

  describe('findList', () => {
    it('should return list of themes', async () => {
      // Given
      const themes: ThemeEntity[] = [
        { id: 1, uuid: 'theme-1', theme_name: 'Theme One' } as ThemeEntity,
        { id: 2, uuid: 'theme-2', theme_name: 'Theme Two' } as ThemeEntity,
      ];
      jest.spyOn(themeRepository, 'find').mockResolvedValue(themes);
      // When
      const result = await themeQueryRepository.findList();
      // Then
      expect(themeRepository.find).toHaveBeenCalled();
      expect(result).toEqual(themes);
    });
  });

  describe('findThemeUuid', () => {
    it('should return a theme by uuid', async () => {
      // Given
      const themeUuid = 'theme-1';
      const theme: ThemeEntity = { id: 1, uuid: themeUuid, theme_name: 'Theme One' } as ThemeEntity;
      jest.spyOn(themeRepository, 'findOne').mockResolvedValue(theme);
      // When
      const result = await themeQueryRepository.findThemeUuid(themeUuid);
      // Then
      expect(themeRepository.findOne).toHaveBeenCalledWith({
        where: { uuid: themeUuid },
      });
      expect(result).toEqual(theme);
    });
  });

  describe('findThemeName', () => {
    it('should return a theme by theme name', async () => {
      // Given
      const themeName = 'Theme One';
      const theme: ThemeEntity = { id: 1, uuid: 'theme-1', theme_name: themeName } as ThemeEntity;
      jest.spyOn(themeRepository, 'findOne').mockResolvedValue(theme);
      // When
      const result = await themeQueryRepository.findThemeName(themeName);
      // Then
      expect(themeRepository.findOne).toHaveBeenCalledWith({
        where: { theme_name: themeName },
      });
      expect(result).toEqual(theme);
    });
  });
});
