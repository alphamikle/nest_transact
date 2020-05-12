[NPM](https://www.npmjs.com/package/nest-transact)
This package was created for simplest using transactions in Nestjs with TypeORM.
Example of using:
```typescript
// some.controller.ts

@Controller()
export class SomeController {
  constructor(
    private readonly someService: SomeService,
    private readonly emailService: EmailService,
    private connection: Connection,
  ) {
  }
  
  async makeBuilding(payload: SomePayload): Promise<SomeResponse> {
    return this.connection.transaction(async transactionEntityManager => {
      const result = await this.someService.withTransaction(transactionEntityManager).someFunctionWhichWillUseTransactions(payload);
      await this.emailService.withTransaction(transactionEntityManager).sendNotificationMessage();
      return result;
    });
  }

}
```

```typescript
// some.service.ts

@Injectable()
export class SomeService extends TransactionFor<SomeService> {
  constructor(
    // This repository is a transactional
    @InjectRepository(SomeEntity)
    private readonly someRepository: Repository<SomeEntity>,
    // This injected service is a transactional too
    private readonly someOtherService: SomeOtherSeervice,
    moduleRef: ModuleRef,
  ) {
    super(moduleRef);
  }
  
  async someFunctionWhichWillUseTransactions(param: SomeParam): Promise<SomeResponse> {
    await this.someMethod();
    const someResponse = await this.someOtherMethod(param);
    await this.someOtherService.someMethod(someResponse);
    return someResponse;
  }

  // ...some other methods
}
```

Well, to use transactions with this package you must inject **ModuleRef** into your
provider and extends your provider from **TransactionFor** class. Then in your
controller you must create a transaction entity manager and inject this to your
providers with .withTransaction(transactionEntityManager) method. This method will
recreate you provider and all it depencies and do what you want.
