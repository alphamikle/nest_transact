import { HttpException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './model/user.model';
import { isNotDefined } from '../tools';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {
  }

  async findUserById(userId: number): Promise<User> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (isNotDefined(user)) {
      throw new HttpException(`NOT FOUND USER WITH ID "${userId}"`, 404);
    }
    return user;
  }
}
