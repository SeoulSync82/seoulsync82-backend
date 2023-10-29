import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PlaceEntity } from 'src/entities/place.entity';
import { PlaceController } from './place.controller';
import { PlaceQueryRepository } from './place.query.repository';
import { PlaceService } from './place.service';

@Module({
  imports: [TypeOrmModule.forFeature([PlaceEntity])],
  controllers: [PlaceController],
  providers: [PlaceService, PlaceQueryRepository],
  exports: [PlaceQueryRepository],
})
export class PlaceModule {}
