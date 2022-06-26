[![npm](https://img.shields.io/npm/v/nest-transact)](https://www.npmjs.com/package/nest-transact)
![GitHub package.json version](https://img.shields.io/github/package-json/v/alphamikle/nest_transact?label=GitHub%20Version)
![npm](https://img.shields.io/npm/dw/nest-transact?label=Downloads%20per%20week)
![npm](https://img.shields.io/npm/dt/nest-transact?label=Total%20downloads)

## Current supported versions of Nest.js, Typeorm and other packages

![npm peer dependency version](https://img.shields.io/npm/dependency-version/nest-transact/peer/@nestjs/common)
![npm peer dependency version](https://img.shields.io/npm/dependency-version/nest-transact/peer/typeorm)
![npm peer dependency version](https://img.shields.io/npm/dependency-version/nest-transact/peer/@nestjs/core)
![npm peer dependency version](https://img.shields.io/npm/dependency-version/nest-transact/peer/reflect-metadata)
![npm peer dependency version](https://img.shields.io/npm/dependency-version/nest-transact/peer/rxjs)


## Description

This package takes the use of transactions in Nest.js with TypeORM to the next level. The easiest and fastest way to keep your data intact.

## Example

### Controller

```ts
@Injectable()
@Controller()
@ApiTags('example-app')
export class ExampleAppController {
  constructor(
    private readonly appService: ExampleAppService,
    // Connection instance needed to us anyway, to start a transaction
    private readonly connection: Connection,
  ) {
  }

  @Post('transfer')
  @ApiResponse({
    type: TransferOperationResultDto,
  })
  async makeRemittanceWithTransaction(@Body() dto: TransferParamsDTO) {
    return this.connection.transaction(manager => {
      return this.appService.withTransaction(manager)/* <-- this is interesting new thing */.makeTransfer(
        dto.userIdFrom,
        dto.userIdTo,
        dto.sum,
        dto.withError,
      );
    });
  }

  @Post('transfer-without-transaction')
  @ApiResponse({
    type: TransferOperationResultDto,
  })
  async makeRemittanceWithoutTransaction(@Body() dto: TransferParamsDTO) {
    return this.appService.makeTransfer(
      dto.userIdFrom,
      dto.userIdTo,
      dto.sum,
      dto.withError,
    );
  }
}

```

Well, to use transactions with this package you must inject **ModuleRef** into your
provider and extends your provider from **TransactionFor** class. Then in your
controller you must create a transaction entity manager and inject this to your
providers with .withTransaction(transactionEntityManager) method. This method will
recreate you provider and all it depencies and do what you want.
