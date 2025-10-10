import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

// Classe de base pour toutes les réponses
export abstract class BaseApiResponse {
  @ApiProperty()
  statusCode: number;

  @ApiProperty()
  message: string;
}

// Classe pour les réponses d'erreur
export class BadrequestResponse extends BaseApiResponse {
  @ApiProperty({
    description: "Détails de l'erreur",
    example: {
      message: "Référence invalide : l'entité liée est introuvable.",
      error: 'Bad Request',
      statusCode: 400,
      meta: {
        modelName: 'Item',
        constraint: 'Item_taxId_fkey',
      },
    },
  })
  details: {
    message: string;
    error: string;
    statusCode: number;
    meta?: any;
  };
}
export class UnAuthorizedResponse extends BaseApiResponse {
  @ApiProperty({
    description: "Détails de l'erreur",
    example: {
      message: 'Unauthorized',
      error: 'Unauthorized',
      statusCode: 401,
    },
  })
  details: {
    message: string;
    error: string;
    statusCode: number;
  };
}

export class ForbiddenResponse extends BaseApiResponse {
  @ApiProperty({
    description: "Détails de l'erreur",
    example: {
      message: 'Forbidden resource',
      error: 'Forbidden resource',
      statusCode: 403,
    },
  })
  details: {
    message: string;
    error: string;
    statusCode: number;
  };
}

export class NotFoundResponse extends BaseApiResponse {
  @ApiProperty({
    description: "Détails de l'erreur",
    example: {
      message: 'Not Found',
      error: 'Not Found',
      statusCode: 404,
    },
  })
  details: {
    message: string;
    error: string;
    statusCode: number;
  };
}

export class InternalServerErrorResponse extends BaseApiResponse {
  @ApiProperty({
    description: "Détails de l'erreur",
    example: {
      message: 'Internal Server Error',
      error: 'Internal Server Error',
      statusCode: 500,
    },
  })
  details: {
    message: string;
    error: string;
    statusCode: number;
  };
}

export class ConflictResponse extends BaseApiResponse {
  @ApiProperty({
    description: "Détails de l'erreur",
    example: {
      message: 'Conflict',
      error: 'Conflict',
      statusCode: 409,
    },
  })
  details: {
    message: string;
    error: string;
    statusCode: number;
  };
}

// Classe de base pour les réponses avec données
export abstract class BaseDataResponse<T> extends BaseApiResponse {
  abstract data: T;
}
// Interface pour la pagination (correspond à votre format)
export class PaginationMeta {
  @ApiProperty()
  currentPage: number;

  @ApiProperty()
  totalPages: number;

  @ApiProperty()
  totalItems: number;

  @ApiProperty()
  itemsPerPage: number;

  @ApiProperty()
  hasNextPage: boolean;

  @ApiProperty()
  hasPreviousPage: boolean;
}

// Classe de base pour les réponses avec pagination
export abstract class BasePaginatedResponse<T> extends BaseApiResponse {
  abstract data: T[];

  @ApiProperty({
    description: 'Informations de pagination',
    example: {
      currentPage: 1,
      totalPages: 1,
      totalItems: 7,
      itemsPerPage: 10,
      hasNextPage: false,
      hasPreviousPage: false,
    },
  })
  pagination: PaginationMeta;
}

// Classe générique pour les réponses de succès simples (sans data)
export class SuccessResponse extends BaseApiResponse {
  @ApiPropertyOptional({
    description: 'Données optionnelles de la réponse',
  })
  data?: any;
}

// Classe générique pour les réponses de suppression
export class DeleteResponse extends BaseApiResponse {
  @ApiProperty({
    example: "L'élément a été supprimé avec succès.",
  })
  message: string;
}
