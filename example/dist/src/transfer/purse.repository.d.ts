import { Repository } from 'typeorm';
import { Purse } from './model/purse.model';
import { Maybe } from '../tools';
export declare class PurseRepository extends Repository<Purse> {
    findPurseById(purseId: number): Promise<Maybe<Purse>>;
}
