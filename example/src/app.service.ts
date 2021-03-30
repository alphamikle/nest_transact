import { Injectable } from '@nestjs/common';
import { EntityManager, Repository, Transaction, TransactionManager } from 'typeorm';
import { TransactionFor } from 'nest-transact';
import { User } from './model/user.model';
import { Purse } from './model/purse.model';
import { InjectRepository } from '@nestjs/typeorm';
import { UserDto } from './dto/user.dto';
import { PurseDto } from './dto/purse.dto';
import { classToPlain, plainToClass } from 'class-transformer';
import { RemittanceResultDto } from './dto/remittance-result.dto';
import { ModuleRef } from '@nestjs/core';
import { AppServiceV2 } from './app.service-v2';

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
    private readonly appServiceV2: AppServiceV2,
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

  async makeRemittance(fromId: number, toId: number, sum: number, withError = false): Promise<RemittanceResultDto> {
    const fromUser = await this.userRepository.findOne(fromId);
    const toUser = await this.userRepository.findOne(toId);
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
    const fromPurse = await this.purseRepository.findOne(fromUser.defaultPurseId);
    const toPurse = await this.purseRepository.findOne(toUser.defaultPurseId);
    const modalSum = Math.abs(sum);
    if (fromPurse.balance < modalSum) {
      throw new Error(NOT_ENOUGH_MONEY(fromId));
    }
    fromPurse.balance -= sum;
    toPurse.balance += sum;
    await this.appServiceV2.savePurse(fromPurse);
    if (withError) {
      throw new Error('Unexpectable error was thrown while remittance');
    }
    await this.purseRepository.save(toPurse);
    const remittance = new RemittanceResultDto();
    remittance.fromId = fromId;
    remittance.toId = toId;
    remittance.fromBalance = fromPurse.balance;
    remittance.sum = sum;
    return remittance;
  }

  async makeRemittanceWithTypeOrmV1(transactionEntityManager: EntityManager, fromId: number, toId: number, sum: number, withError = false) {
    const fromUser = await transactionEntityManager.findOne(User, fromId);
    const toUser = await transactionEntityManager.findOne(User, toId);
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
    const fromPurse = await transactionEntityManager.findOne(Purse, fromUser.defaultPurseId);
    const toPurse = await transactionEntityManager.findOne(Purse, toUser.defaultPurseId);
    const modalSum = Math.abs(sum);
    if (fromPurse.balance < modalSum) {
      throw new Error(NOT_ENOUGH_MONEY(fromId));
    }
    fromPurse.balance -= sum;
    toPurse.balance += sum;
    await this.appServiceV2.savePurse(fromPurse);
    if (withError) {
      throw new Error('Unexpectable error was thrown while remittance');
    }
    await transactionEntityManager.save(toPurse);
    const remittance = new RemittanceResultDto();
    remittance.fromId = fromId;
    remittance.toId = toId;
    remittance.fromBalance = fromPurse.balance;
    remittance.sum = sum;
    return remittance;
  }

  @Transaction()
  async makeRemittanceWithTypeOrmV2(fromId: number, toId: number, sum: number, withError: boolean, @TransactionManager() transactionEntityManager: EntityManager = null) {
    const fromUser = await transactionEntityManager.findOne(User, fromId);
    const toUser = await transactionEntityManager.findOne(User, toId);
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
    const fromPurse = await transactionEntityManager.findOne(Purse, fromUser.defaultPurseId);
    const toPurse = await transactionEntityManager.findOne(Purse, toUser.defaultPurseId);
    const modalSum = Math.abs(sum);
    if (fromPurse.balance < modalSum) {
      throw new Error(NOT_ENOUGH_MONEY(fromId));
    }
    fromPurse.balance -= sum;
    toPurse.balance += sum;
    // Change savePurseInTransactionV2 to savePurseInTransaction for use method with decorators, and make sure, what it is broken
    await this.appServiceV2.savePurseInTransactionV2(fromPurse, transactionEntityManager);
    if (withError) {
      throw new Error('Unexpectable error was thrown while remittance');
    }
    await transactionEntityManager.save(toPurse);
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
