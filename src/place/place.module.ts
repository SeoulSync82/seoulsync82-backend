import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PlaceEntity } from 'src/entities/place.entity';
import { SubwayEntity } from 'src/entities/subway.entity';
import { SubwayStationEntity } from 'src/entities/subway_station.entity';
import { PlaceController } from 'src/place/place.controller';
import { PlaceQueryRepository } from 'src/place/place.query.repository';
import { PlaceService } from 'src/place/place.service';
import { SubwayModule } from 'src/subway/subway.module';

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
