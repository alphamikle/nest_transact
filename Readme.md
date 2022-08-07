[![npm](https://img.shields.io/npm/v/nest-transact)](https://www.npmjs.com/package/nest-transact)
![GitHub package.json version](https://img.shields.io/github/package-json/v/alphamikle/nest_transact?label=GitHub%20Version)
![npm](https://img.shields.io/npm/dw/nest-transact?label=Downloads%20per%20week)
![npm](https://img.shields.io/npm/dt/nest-transact?label=Total%20downloads)

## Current supported versions of Nest.js, Typeorm and other packages

The major version of this package will always match the major version of Nest.js, so if you see `nest-transact v9.x.x` it means that this version of the package is compatible with Nest.js `^9.x.x`.

![npm peer dependency version](https://img.shields.io/npm/dependency-version/nest-transact/peer/@nestjs/common)
![npm peer dependency version](https://img.shields.io/npm/dependency-version/nest-transact/peer/typeorm)
![npm peer dependency version](https://img.shields.io/npm/dependency-version/nest-transact/peer/@nestjs/core)
![npm peer dependency version](https://img.shields.io/npm/dependency-version/nest-transact/peer/reflect-metadata)
![npm peer dependency version](https://img.shields.io/npm/dependency-version/nest-transact/peer/rxjs)

## Description

This package takes the use of transactions in Nest.js with TypeORM to the next level. The easiest and fastest way to keep your data intact.

## Changelog

Since `v9.0.0` of `@nestjs/typeorm` and `v0.3.0` of `typeorm` you can not create custom repositories with class style, like it showed below:

```ts
/**
 * Unfortunatelly, this is a deprecated method of creation of custom repositories, since typeorm ^0.3.0 was released
 * For additional information see: https://github.com/typeorm/typeorm/pull/8616
 * and https://typeorm.io/changelog under the 0.3.0 version changelog (search by "Old ways of custom repository creation were dropped.")
 */
@EntityRepository(Purse)
export class PurseRepository extends Repository<Purse> {
  async findPurseById(purseId: number): Promise<Maybe<Purse>> {
    return await this.findOne({ where: { id: purseId } });
  }
}
```

Because of that your custom repositories, created in that way will be broken, if you update typeorm or will use `@nestjs/typeorm v9.0.0` or newer. Also, that means that those repositories can't be used in transactions too.

The modern way to create a custom repo, by opinion of typeorm-developers should look like this:

```ts
/**
 * This is a new way (from typeorm creators -_-) for creation of custom repositories, which might be helpful
 */
export const NewPurseRepository = new DataSource(Config.typeOrmConfig as DataSourceOptions).getRepository(Purse).extend({
  async findPurseById(purseId: number): Promise<Maybe<Purse>> {
    return await this.findOne({ where: { id: purseId } });
  },
});
```

and here is an official example:

```ts
export const UserRepository = myDataSource.getRepository(UserEntity).extend({
  findUsersWithPhotos() {
    return this.find({
      relations: {
        photos: true,
      },
    });
  },
});
```

If you don't agree with that decision, please write your comment [here](https://github.com/typeorm/typeorm/issues/9013).

## Example

### Controller

```ts
// ./example/src/transfer/transfer.controller.ts

import { Body, Controller, Post } from '@nestjs/common';
import { ApiResponse, ApiTags } from '@nestjs/swagger';
import { TransferOperationResultDto } from './dto/transfer-operation-result.dto';
import { TransferParamsDTO } from './dto/transfer-params.dto';
import { TransferService } from './transfer.service';
import { DataSource } from 'typeorm';

@Controller('transfer')
@ApiTags('transfer')
export class TransferController {
  constructor(
    private readonly transferService: TransferService,
    /**
     * DataSource instance needed to us to start a transaction
     */
    private readonly dataSource: DataSource,
  ) {
  }

  @Post()
  @ApiResponse({
    type: TransferOperationResultDto,
  })
  async makeRemittanceWithTransaction(@Body() dto: TransferParamsDTO) {
    return this.dataSource.transaction(manager => {
      /**
       * [withTransaction] - is the new method, which provided by [TransactionFor<T>] class
       * and its allow us to start transaction with [transferService] and all its dependencies
       */
      return this.transferService.withTransaction(manager).makeTransfer(
        dto.userIdFrom,
        dto.userIdTo,
        dto.sum,
        dto.withError,
      );
    });
  }
  
  @Post('without-transaction')
  @ApiResponse({
    type: TransferOperationResultDto,
  })
  async makeRemittanceWithoutTransaction(@Body() dto: TransferParamsDTO) {
    return this.transferService.makeTransfer(
      dto.userIdFrom,
      dto.userIdTo,
      dto.sum,
      dto.withError,
    );
  }
}
```

### Services

All the services shown below will make database calls within a single transaction initiated by a controller method launched in a transaction - `transferController.makeRemittanceWithTransaction`.

```ts
// ./example/src/transfer/transfer.service.ts

import { HttpException, Injectable } from '@nestjs/common';
import { ModuleRef } from '@nestjs/core';
import { TransactionFor } from 'nest-transact';
import { isNotDefined } from '../tools';
import { constants } from 'http2';
import { TransferOperationResultDto } from './dto/transfer-operation-result.dto';
import { UserService } from '../user/user.service';
import { PurseService } from './purse.service';

@Injectable()
export class TransferService extends TransactionFor<TransferService> {
  constructor(
    /**
     * All these services will be recreated and be a participants of the same transaction
     */
    private readonly purseService: PurseService,
    private readonly userService: UserService,
    /**
     * This is the needed thing for [TransactionFor<T>] logic working
     */
    moduleRef: ModuleRef,
  ) {
    super(moduleRef);
  }

  async makeTransfer(fromId: number, toId: number, sum: number, withError = false): Promise<TransferOperationResultDto> {
    if (fromId === toId) {
      throw new HttpException('USERS MUST HAVE DIFFERENT IDS', 400);
    }
    const fromUser = await this.userService.findUserById(fromId);
    const toUser = await this.userService.findUserById(toId);
    if (isNotDefined(fromUser.defaultPurseId)) {
      throw new HttpException(`USER "${fromId}" DON NOT HAVE A DEFAULT PURSE`, 500);
    }
    if (isNotDefined(toUser.defaultPurseId)) {
      throw new HttpException(`USER "${toId}" DON NOT HAVE A DEFAULT PURSE`, 500);
    }
    const fromPurse = await this.purseService.findPurseById(fromUser.defaultPurseId);
    const toPurse = await this.purseService.findPurseById(toUser.defaultPurseId);
    const modalSum = Math.abs(sum);
    if (fromPurse.balance < modalSum) {
      throw new HttpException(`USER "${fromId}" NOT ENOUGH MONEY: "${fromPurse.balance} < ${modalSum}"`, 400);
    }
    fromPurse.balance -= sum;
    toPurse.balance += sum;
    await this.purseService.savePurse(fromPurse);
    if (withError) {
      throw new HttpException('UNEXPECTED ERROR WAS THROWN WHILE TRANSFER WAS IN PROGRESS', constants.HTTP_STATUS_TEAPOT);
    }
    await this.purseService.savePurse(toPurse);
    return new TransferOperationResultDto({
      sum,
      fromId,
      toId,
      fromBalance: fromPurse.balance,
      toBalance: toPurse.balance,
    });
  }
}
```

```ts
// ./example/src/transfer/purse.service.ts

import { HttpException, Injectable } from '@nestjs/common';
import { isNotDefined } from '../tools';
import { Purse } from './model/purse.model';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class PurseService {
  constructor(
    /**
     * For now this is the only way to inject repositories into services without additional complex logic
     * which needed for the new custom repository api from the typeorm creators
     */
    @InjectRepository(Purse)
    private readonly purePurseRepository: Repository<Purse>,
  ) {
  }

  async findPurseById(purseId: number): Promise<Purse> {
    const purse = await this.purePurseRepository.findOne({ where: { id: purseId } });
    if (isNotDefined(purse)) {
      throw new HttpException(`NOT FOUND PURSE WITH ID "${purseId}"`, 404);
    }
    return purse;
  }

  async savePurse(purse: Purse): Promise<Purse> {
    return this.purePurseRepository.save(purse);
  }
}
```

---

## Excluding something from the recreation flow

Also, you can pass some class-types into the `.withTransaction(manager, { excluded: [...yourClasses] })` method to exclude them (and its dependencies) from the recreation flow. It can be, for example, some cache services, or anything, which you don't want to recreate and which is not a part of transaction logic:

```ts
// ./example/src/transfer/info.controller.ts

import { Controller, Get } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { InfoService } from './info.service';
import { CacheService } from './cache.service';

@Controller('info')
export class InfoController {
  constructor(
    private readonly infoService: InfoService,
    private readonly dataSource: DataSource,
  ) {
  }

  @Get()
  async getInfo() {
    return this.dataSource.transaction(manager => {
      return this.infoService.withTransaction(manager, { excluded: [CacheService] }).getInfo();
    });
  }
}
```

```ts
// ./example/src/transfer/info.service.ts

import { Injectable } from '@nestjs/common';
import { TransactionFor } from '../../../lib/with-transaction';
import { CacheService } from './cache.service';
import { ModuleRef } from '@nestjs/core';

@Injectable()
export class InfoService extends TransactionFor<InfoService> {
  constructor(
    private readonly cacheService: CacheService,
    moduleRef: ModuleRef,
  ) {
    super(moduleRef);
  }

  async getInfo() {
    return [];
  }
}
```

Well, to use transactions with this package you must inject **ModuleRef** into your provider and extends your provider from the **TransactionFor** class.

Then in your controller you must create a transaction entity manager and inject this to your
providers with `.withTransaction(manager)` method. This method will recreate you provider and all its dependencies and do what you want.
