import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PlaceEntity } from 'src/entities/place.entity';
import { SubwayEntity } from 'src/entities/subway.entity';
import { SubwayStationEntity } from 'src/entities/subway_station.entity';
import { SubwayModule } from 'src/subway/subway.module';
import { PlaceController } from './place.controller';
import { PlaceQueryRepository } from './place.query.repository';
import { PlaceService } from './place.service';

@Module({
  imports: [
    forwardRef(() => SubwayModule),
    TypeOrmModule.forFeature([PlaceEntity, SubwayEntity, SubwayStationEntity]),
  ],
  controllers: [PlaceController],
  providers: [PlaceService, PlaceQueryRepository],
  exports: [PlaceQueryRepository],
})
export class PlaceModule {}
