import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from 'src/config/config.module';
import { UserEntity } from 'src/entites/user.entity';
import { UserController } from './user.controller';
import { UserQueryRepository } from './user.query.repository';
import { UserService } from './user.service';

@Module({
  imports:[ConfigModule,TypeOrmModule.forFeature([
    UserEntity, //
  ])],
  controllers: [UserController],
  providers: [UserService, UserQueryRepository],
  exports: [UserService, UserQueryRepository]
})
export class UserModule {}
