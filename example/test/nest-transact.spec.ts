import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { ExampleAppModule } from '../src/example-app.module';
import * as request from 'supertest';
import { isNotDefined } from '../src/tools';
import { constants } from 'http2';
import { TransferParamsDTO } from '../src/transfer/dto/transfer-params.dto';
import { CircularService } from '../src/circular/circular.service';
import { DataSource } from 'typeorm';

describe('Nest Transact E2E Testing', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        ExampleAppModule,
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it('Normal transfer checking (From USER 1 to USER 2)', async () => {
    const result = await request(app.getHttpServer()).post('/transfer').send(TransferParamsDTO.new({
      sum: 100,
      userIdFrom: 1,
      userIdTo: 2,
      withError: false,
    }));
    expect(sumOfResponse(result.body)).toBe(2000);
  });

  it('Normal transfer checking (From USER 2 to USER 1)', async () => {
    const result = await request(app.getHttpServer()).post('/transfer').send(TransferParamsDTO.new({
      sum: 100,
      userIdFrom: 2,
      userIdTo: 1,
      withError: false,
    }));
    expect(sumOfResponse(result.body)).toBe(2000);
  });

  it('Aborted transfer with transaction', async () => {
    const requester = request(app.getHttpServer());
    const errorResult = await requester.post('/transfer').send(TransferParamsDTO.new({
      sum: 100,
      userIdFrom: 1,
      userIdTo: 2,
      withError: true,
    }));
    const okResult = await requester.post('/transfer').send(TransferParamsDTO.new({
      sum: 100,
      userIdFrom: 1,
      userIdTo: 2,
      withError: false,
    }));
    expect(errorResult.statusCode).toBe(constants.HTTP_STATUS_TEAPOT);
    expect(sumOfResponse(okResult.body)).toBe(2000);
  });

  it('Aborted transfer without transaction', async () => {
    const requester = request(app.getHttpServer());
    const errorResult = await requester.post('/transfer/without-transaction').send(TransferParamsDTO.new({
      sum: 100,
      userIdFrom: 1,
      userIdTo: 2,
      withError: true,
    }));
    const okResult = await requester.post('/transfer/without-transaction').send(TransferParamsDTO.new({
      sum: 100,
      userIdFrom: 1,
      userIdTo: 2,
      withError: false,
    }));
    expect(errorResult.statusCode).toBe(constants.HTTP_STATUS_TEAPOT);
    expect(sumOfResponse(okResult.body)).toBe(1900);
  });

  it('Import modules using forwardRef', async () => {
    const service = app.get(CircularService);
    const dataSource = app.get(DataSource);

    await dataSource.transaction(async manager => {
      service.withTransaction(manager);
    });
  })

  afterAll(async () => {
    await app.close();
  });
});

function sumOfResponse(response: any) {
  if (isNotDefined(response)) {
    return 0;
  }
  return response.fromBalance + response.toBalance;
}