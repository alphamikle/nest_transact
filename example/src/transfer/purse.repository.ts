import { EntityRepository, Repository } from 'typeorm';
import { Purse } from './model/purse.model';
import { Maybe } from '../tools';

@EntityRepository(Purse)
export class PurseRepository extends Repository<Purse> {
  async findPurseById(purseId: number): Promise<Maybe<Purse>> {
    return await this.findOne({ where: { id: purseId } });
  }
}