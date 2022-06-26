import { aShowConfig } from './config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { NestFactory } from '@nestjs/core';
import { ExampleAppModule } from './example-app.module';
import { ExampleExceptionFilter } from './example.exception-filter';
import { Logger } from '@nestjs/common';

aShowConfig();

async function bootstrap() {
  const app = await NestFactory.create(ExampleAppModule);
  app.useGlobalFilters(new ExampleExceptionFilter());
  const options = new DocumentBuilder().setTitle('Nest Transact Example').setDescription('Showcase with transactions').setVersion('1.0').build();
  const document = SwaggerModule.createDocument(app, options);
  SwaggerModule.setup('api', app, document);
  await app.listen(3000);
}

bootstrap().then(() => Logger.log(`App available at http://localhost:3000/api`, 'Main'));
