import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PlaceEntity } from 'src/entities/place.entity';
import { SubwayEntity } from 'src/entities/subway.entity';
import { SubwayStationEntity } from 'src/entities/subway_station.entity';
import { PlaceController } from './place.controller';
import { PlaceQueryRepository } from './place.query.repository';
import { PlaceService } from './place.service';
import { SubwayQueryRepository } from '../subway/subway.query.repository';
import { SubwayModule } from 'src/subway/subway.module';

@Module({
  imports: [
    SubwayModule,
    TypeOrmModule.forFeature([PlaceEntity, SubwayEntity, SubwayStationEntity]),
  ],
  controllers: [PlaceController],
  providers: [PlaceService, PlaceQueryRepository],
  exports: [PlaceQueryRepository],
})
export class PlaceModule {}
