import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpStatus,
} from '@nestjs/common';

@Catch()
export class CustomExceptionFilter implements ExceptionFilter {
  catch(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();

    const status = exception.getStatus?.() || HttpStatus.BAD_REQUEST;
    const message = exception.message || 'Bad Request';
    const details = exception.response?.details || exception.response || {};

    response.status(status).json({
      statusCode: status,
      message,
      details,
    });
  }
}
