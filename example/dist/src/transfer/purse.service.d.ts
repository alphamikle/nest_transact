import { PurseRepository } from './purse.repository';
import { Purse } from './model/purse.model';
export declare class PurseService {
    private readonly purseRepository;
    constructor(purseRepository: PurseRepository);
    findPurseById(purseId: number): Promise<Purse>;
    savePurse(purse: Purse): Promise<Purse>;
}
