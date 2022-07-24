import { Purse } from './purse.model';
export declare class User {
    id: number;
    name: string;
    defaultPurseId?: number;
    defaultPurse?: Purse;
    purses?: Purse[];
}
