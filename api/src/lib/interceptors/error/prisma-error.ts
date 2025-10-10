import { HttpException, HttpStatus } from '@nestjs/common';
import { Prisma } from '@prisma/client';

export function handlePrismaError(err: Prisma.PrismaClientKnownRequestError) {
  switch (err.code) {
    case 'P2002':
      return new HttpException(
        {
          statusCode: HttpStatus.CONFLICT,
          message: 'Un enregistrement avec ce champ existe déjà (conflit).',
          meta: err.meta,
          target: err.meta?.target || null,
        },
        HttpStatus.CONFLICT,
      );

    case 'P2003':
      return new HttpException(
        {
          statusCode: HttpStatus.BAD_REQUEST,
          message: "Référence invalide : l'entité liée est introuvable.",
          meta: err.meta,
        },
        HttpStatus.BAD_REQUEST,
      );

    case 'P2014':
      return new HttpException(
        {
          statusCode: HttpStatus.BAD_REQUEST,
          message:
            'Violation de contrainte relationnelle : la modification ou suppression casserait une relation requise.',
          meta: err.meta,
        },
        HttpStatus.BAD_REQUEST,
      );

    case 'P2025':
      return new HttpException(
        {
          statusCode: HttpStatus.NOT_FOUND,
          message: "L'enregistrement à modifier ou supprimer est introuvable.",
        },
        HttpStatus.NOT_FOUND,
      );

    default:
      return new HttpException(
        {
          statusCode: HttpStatus.BAD_REQUEST,
          message: `Erreur Prisma (${err.code})`,
          meta: err.meta,
        },
        HttpStatus.BAD_REQUEST,
      );
  }
}
