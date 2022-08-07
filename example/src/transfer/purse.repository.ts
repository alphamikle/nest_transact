import { DataSource, DataSourceOptions, EntityRepository, Repository } from 'typeorm';
import { Purse } from './model/purse.model';
import { Maybe } from '../tools';
import { Config } from '../config';

/**
 * Unfortunatelly, this is a deprecated method of creation of custom repositories, since typeorm ^0.3.0 was released
 * For additional information see: [https://github.com/typeorm/typeorm/pull/8616]
 * and [https://typeorm.io/changelog] under the 0.3.0 version changelog (search by "Old ways of custom repository creation were dropped.")
 */
@EntityRepository(Purse)
export class PurseRepository extends Repository<Purse> {
  async findPurseById(purseId: number): Promise<Maybe<Purse>> {
    return await this.findOne({ where: { id: purseId } });
  }
}

/**
 * This is a new way (from typeorm creators -_-) for creation of custom repositories, which might be helpful
 */
export const NewPurseRepository = new DataSource(Config.typeOrmConfig as DataSourceOptions).getRepository(Purse).extend({
  async findPurseById(purseId: number): Promise<Maybe<Purse>> {
    return await this.findOne({ where: { id: purseId } });
  },
});