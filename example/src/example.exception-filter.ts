import { ArgumentsHost, ExceptionFilter } from '@nestjs/common';
import { Response } from 'express';

export class ExampleExceptionFilter implements ExceptionFilter {
  catch(exception: any, host: ArgumentsHost): any {
    const context = host.switchToHttp();
    const response = context.getResponse<Response>();
    const isError = exception instanceof Error;
    const status = exception.status ?? 500;
    const message = isError ? exception.message : exception.toString();
    response.status(status).json({
      code: status,
      message,
    });
  }

}