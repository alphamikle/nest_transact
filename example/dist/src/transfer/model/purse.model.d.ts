import { User } from '../../user/model/user.model';
export interface NewPurse {
    id: number;
    balance: number;
    userId: number;
}
export declare class Purse implements NewPurse {
    id: number;
    balance: number;
    userId: number;
    user?: User;
    constructor(params?: NewPurse);
}
