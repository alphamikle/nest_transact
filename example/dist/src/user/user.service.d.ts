import { Repository } from 'typeorm';
import { User } from './model/user.model';
export declare class UserService {
    private readonly userRepository;
    constructor(userRepository: Repository<User>);
    findUserById(userId: number): Promise<User>;
}
