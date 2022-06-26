import { HttpException, Injectable } from '@nestjs/common';
import { isNotDefined } from '../tools';
import { PurseRepository } from './purse.repository';
import { Purse } from './model/purse.model';

@Injectable()
export class PurseService {
  constructor(
    private readonly purseRepository: PurseRepository,
  ) {
  }

  async findPurseById(purseId: number): Promise<Purse> {
    const purse = await this.purseRepository.findPurseById(purseId);
    if (isNotDefined(purse)) {
      throw new HttpException(`NOT FOUND PURSE WITH ID "${purseId}"`, 404);
    }
    return purse;
  }

  async savePurse(purse: Purse): Promise<Purse> {
    return this.purseRepository.save(purse);
  }
}