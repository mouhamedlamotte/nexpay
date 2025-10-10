import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { catchError, Observable, throwError } from 'rxjs';
import { Prisma } from '@prisma/client';
import { AxiosError } from 'axios';

import { handlePrismaError } from './prisma-error';
import { handleAxiosError } from './axios-error';

function doException(err: any) {
  try {
    // Prisma
    if (err instanceof Prisma.PrismaClientKnownRequestError) {
      return handlePrismaError(err);
    }

    // Axios
    if (err.isAxiosError) {
      return handleAxiosError(err as AxiosError);
    }

    // Autres erreurs personnalisées
    if (err.status === 'error') {
      return new HttpException(
        {
          statusCode: HttpStatus.BAD_GATEWAY,
          message: 'Something went wrong',
        },
        HttpStatus.BAD_GATEWAY,
      );
    }

    // Fallback générique
    const statusCode = err.status || HttpStatus.BAD_REQUEST;
    const message = err.message || 'Bad Request';
    const details = err.response || {};

    return new HttpException(
      {
        statusCode,
        message,
        details,
      },
      statusCode,
    );
  } catch {
    return new HttpException(
      {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'Erreur interne inattendue',
      },
      HttpStatus.INTERNAL_SERVER_ERROR,
    );
  }
}

@Injectable()
export class ErrorInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next
      .handle()
      .pipe(catchError((err) => throwError(() => doException(err))));
  }
}
