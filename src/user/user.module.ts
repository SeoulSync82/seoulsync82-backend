import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from 'src/config/config.module';
import { UserEntity } from 'src/entities/user.entity';
import { UserController } from 'src/user/user.controller';
import { UserQueryRepository } from 'src/user/user.query.repository';
import { UserService } from 'src/user/user.service';

@Module({
  imports: [ConfigModule, TypeOrmModule.forFeature([UserEntity])],
  controllers: [UserController],
  providers: [UserService, UserQueryRepository],
  exports: [UserService, UserQueryRepository],
})
export class UserModule {}
