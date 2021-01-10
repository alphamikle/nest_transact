import { aShowConfig } from './config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ExampleExceptionFilter } from './example.exception-filter';

aShowConfig();

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalFilters(new ExampleExceptionFilter());
  const options = new DocumentBuilder().setTitle('Nest Transact Example').setDescription('Showcase with transactions').setVersion('1.0').build();
  const document = SwaggerModule.createDocument(app, options);
  SwaggerModule.setup('api', app, document);
  await app.listen(3000);
}

bootstrap();
