import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PlaceEntity } from 'src/entities/place.entity';
import { PlaceModule } from 'src/place/place.module';
import { SearchController } from './search.controller';
import { SearchQueryRepository } from './search.query.repository';
import { SearchService } from './search.service';

@Module({
  imports: [TypeOrmModule.forFeature([PlaceEntity]), PlaceModule],
  controllers: [SearchController],
  providers: [SearchService, SearchQueryRepository],
})
export class SearchModule {}
