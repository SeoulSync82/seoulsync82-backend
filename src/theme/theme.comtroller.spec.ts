import { TestBed } from '@automock/jest';
import { ApiThemeGetListResponseDto } from 'src/theme/dto/api-theme-get-list-response.dto';
import { ThemeController } from 'src/theme/theme.controller';
import { ThemeService } from 'src/theme/theme.service';

describe('ThemeController', () => {
  let themeController: ThemeController;
  let themeService: jest.Mocked<ThemeService>;

  beforeEach(async () => {
    // Given
    const { unit, unitRef } = TestBed.create(ThemeController).compile();
    themeController = unit;
    themeService = unitRef.get(ThemeService);
    jest.clearAllMocks();
  });

  describe('themeList', () => {
    it('should return theme list', async () => {
      // Given
      const expectedThemes: ApiThemeGetListResponseDto[] = [
        { id: 1, uuid: 'theme-1', theme_name: 'Theme One' },
        { id: 2, uuid: 'theme-2', theme_name: 'Theme Two' },
      ];
      const expectedResponse = { items: expectedThemes };
      jest.spyOn(themeService, 'themeList').mockResolvedValue(expectedResponse);
      // When
      const result = await themeController.themeList();
      // Then
      expect(themeService.themeList).toHaveBeenCalled();
      expect(result).toEqual(expectedResponse);
    });
  });
});
