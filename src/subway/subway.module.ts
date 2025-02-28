import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SubwayEntity } from 'src/entities/subway.entity';
import { SubwayLineEntity } from 'src/entities/subway_line.entity';
import { SubwayStationEntity } from 'src/entities/subway_station.entity';
import { PlaceModule } from 'src/place/place.module';
import { SubwayController } from 'src/subway/subway.controller';
import { SubwayQueryRepository } from 'src/subway/subway.query.repository';
import { SubwayService } from 'src/subway/subway.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([SubwayEntity, SubwayStationEntity, SubwayLineEntity]),
    forwardRef(() => PlaceModule),
  ],
  controllers: [SubwayController],
  providers: [SubwayService, SubwayQueryRepository],
  exports: [SubwayQueryRepository],
})
export class SubwayModule {}
