import { ArgumentsHost, ExceptionFilter } from '@nestjs/common';
export declare class ExampleExceptionFilter implements ExceptionFilter {
    catch(exception: any, host: ArgumentsHost): any;
}
