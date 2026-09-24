import {
    ExceptionFilter,
    Catch,
    ArgumentsHost,
    HttpException,
    HttpStatus,
} from '@nestjs/common';
import { Request, Response } from 'express';
import * as Sentry from '@sentry/nestjs';

@Catch()
export class AllExceptionFilter implements ExceptionFilter{
    catch(exception: any, host: ArgumentsHost) {
        const ctx = host.switchToHttp()
        const response = ctx.getResponse<Response>();
        const request = ctx.getRequest<Request>();

    if(exception instanceof HttpException)
        {
            const status = exception.getStatus();
            const result = exception.getResponse();

            response.status(status).json({
                success:false,
                statusCode: status,
                timeStamp: new Date().toISOString(),
                path: request.url,
                error: result
            })
            return
        }

        Sentry.captureException(exception);
        console.error('Unhandled exception caught by AllExceptionFilter:', exception);

        response.status(HttpStatus.INTERNAL_SERVER_ERROR).json(
            {
                success:false,
                statusCode: 500,
                timeStamp: new Date().toISOString(),
                path: request.url,
                message: "Internal Server Error"
            })
    }
}