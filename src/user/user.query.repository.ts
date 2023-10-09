import { InjectRepository } from "@nestjs/typeorm";
import { Provider, UserEntity } from "src/entites/user.entity";
import { Repository } from "typeorm";

export class UserQueryRepository{
  constructor(
    @InjectRepository(UserEntity)
    private repository: Repository<UserEntity>
  ){}


  async findOneOrCreate(email){
    const data = {id: 1, email:'11111', firstName:"11111", lastName:"11111", photo:"11111", provider: Provider.Google}
    return data
  }
}

