import { HttpException, HttpStatus } from '@nestjs/common';
import { AxiosError } from 'axios';

export function handleAxiosError(err: AxiosError) {
  // Timeout
  if (err.code === 'ECONNABORTED') {
    return new HttpException(
      {
        statusCode: HttpStatus.GATEWAY_TIMEOUT,
        message: 'La requête a expiré (timeout).',
        details: err.message,
      },
      HttpStatus.GATEWAY_TIMEOUT,
    );
  }

  // Network errors
  if (err.code === 'ENOTFOUND' || err.code === 'ECONNREFUSED') {
    return new HttpException(
      {
        statusCode: HttpStatus.BAD_GATEWAY,
        message: "Impossible d'atteindre le service distant.",
        details: err.message,
      },
      HttpStatus.BAD_GATEWAY,
    );
  }

  // Response errors
  if (err.response) {
    return new HttpException(
      {
        statusCode: err.response.status || HttpStatus.BAD_GATEWAY,
        message:
          (err.response.data as any)?.message ||
          'Erreur retournée par le service distant.',
        details: err.response.data,
      },
      err.response.status || HttpStatus.BAD_GATEWAY,
    );
  }

  // No response
  if (err.request) {
    return new HttpException(
      {
        statusCode: HttpStatus.SERVICE_UNAVAILABLE,
        message: 'Aucune réponse du service distant.',
      },
      HttpStatus.SERVICE_UNAVAILABLE,
    );
  }

  // Fallback
  return new HttpException(
    {
      statusCode: HttpStatus.BAD_GATEWAY,
      message: err.message || 'Erreur Axios inconnue',
    },
    HttpStatus.BAD_GATEWAY,
  );
}
