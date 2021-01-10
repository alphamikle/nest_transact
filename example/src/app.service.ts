import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { TransactionFor } from 'nest-transact';
import { User } from './model/user.model';
import { Purse } from './model/purse.model';
import { InjectRepository } from '@nestjs/typeorm';
import { UserDto } from './dto/user.dto';
import { PurseDto } from './dto/purse.dto';
import { classToPlain, plainToClass } from 'class-transformer';
import { RemittanceResultDto } from './dto/remittance-result.dto';
import { ModuleRef } from '@nestjs/core';

export const NOT_FOUND_USER_WITH_ID = (userId: number) => `Not found user with id = ${userId}`;
export const NOT_FOUND_PURSE_WITH_USER_ID = (userId: number) => `Not found purse with userId = ${userId}`;
export const NOT_FOUND_PURSE_WITH_PURSE_ID = (purseId: number) => `Not found purse with purse = ${purseId}`;
export const USER_DOES_NOT_HAVE_PURSE = (userId: number) => `User with id = ${userId} doesnt have a default purse`;
export const NOT_ENOUGH_MONEY = (userId: number) => `User with id = ${userId} does not have enough money`;

@Injectable()
export class AppService extends TransactionFor<AppService> {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Purse)
    private readonly purseRepository: Repository<Purse>,
    moduleRef: ModuleRef,
  ) {
    super(moduleRef);
  }

  async getUsers() {
    return this.userRepository.find({ relations: ['purses', 'defaultPurse'] });
  }

  async getPurse(userId: number): Promise<Purse | undefined> {
    return this.purseRepository.findOne({ where: { userId } });
  }

  async createUser(userDto: UserDto): Promise<User> {
    return this.userRepository.save(userDto);
  }

  async createPurse(purseDto: PurseDto, userId: number): Promise<Purse> {
    const user = await this.userRepository.findOne(userId);
    if (user === undefined) {
      throw new Error(NOT_FOUND_USER_WITH_ID(userId));
    }
    let purse: Purse = plainToClass(Purse, classToPlain(purseDto));
    purse.userId = userId;
    purse = await this.purseRepository.save(purse);
    if (user.defaultPurseId === null) {
      user.defaultPurseId = purse.id;
      await this.userRepository.save(user);
    }
    return purse;
  }

  async makeRemittance(fromId: number, toId: number, sum: number, withError = false, transaction = true) {
    const fromUser = await this.userRepository.findOne(fromId, { transaction });
    const toUser = await this.userRepository.findOne(toId, { transaction });
    if (fromUser === undefined) {
      throw new Error(NOT_FOUND_USER_WITH_ID(fromId));
    }
    if (toUser === undefined) {
      throw new Error(NOT_FOUND_USER_WITH_ID(toId));
    }
    if (fromUser.defaultPurseId === null) {
      throw new Error(USER_DOES_NOT_HAVE_PURSE(fromId));
    }
    if (toUser.defaultPurseId === null) {
      throw new Error(USER_DOES_NOT_HAVE_PURSE(toId));
    }
    const fromPurse = await this.purseRepository.findOne(fromUser.defaultPurseId, { transaction });
    const toPurse = await this.purseRepository.findOne(toUser.defaultPurseId, { transaction });
    const modalSum = Math.abs(sum);
    if (fromPurse.balance < modalSum) {
      throw new Error(NOT_ENOUGH_MONEY(fromId));
    }
    fromPurse.balance -= sum;
    toPurse.balance += sum;
    await this.purseRepository.save(fromPurse, { transaction });
    if (withError) {
      throw new Error('Unexpectable error was thrown while remittance');
    }
    await this.purseRepository.save(toPurse, { transaction });
    const remittance = new RemittanceResultDto();
    remittance.fromId = fromId;
    remittance.toId = toId;
    remittance.fromBalance = fromPurse.balance;
    remittance.sum = sum;
    return remittance;
  }

  async topUpPurse(purseId: number, sum: number) {
    const purse = await this.purseRepository.findOne(purseId);
    if (purse === undefined) {
      throw new Error(NOT_FOUND_PURSE_WITH_PURSE_ID(purseId));
    }
    if (sum < 1) {
      throw new Error('The sum cannot be less than 1');
    }
    purse.balance += sum;
    return this.purseRepository.save(purse);
  }
}
