import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SubwayEntity } from 'src/entities/subway.entity';
import { SubwayLineEntity } from 'src/entities/subway_line.entity';
import { SubwayStationEntity } from 'src/entities/subway_station.entity';
import { SubwayQueryRepository } from 'src/subway/subway.query.repository';
import { SubwayController } from './subway.controller';
import { SubwayService } from './subway.service';

@Module({
  imports: [TypeOrmModule.forFeature([SubwayEntity, SubwayStationEntity, SubwayLineEntity])],
  controllers: [SubwayController],
  providers: [SubwayService, SubwayQueryRepository],
  exports: [SubwayQueryRepository],
})
export class SubwayModule {}
