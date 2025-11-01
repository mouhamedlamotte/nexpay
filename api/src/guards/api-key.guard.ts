import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
  ForbiddenException,
  SetMetadata,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';

// Types de permissions disponibles
export enum ApiKeyPermission {
  READ = 'READ',
  WRITE = 'WRITE',
}

// Décorateur pour spécifier les permissions requises
export const RequireApiKey = (...permissions: ApiKeyPermission[]) =>
  SetMetadata('apiKeyPermissions', permissions);

@Injectable()
export class ApiKeyGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();

    // Récupérer les permissions requises depuis les métadonnées
    const requiredPermissions = this.reflector.getAllAndOverride<
      ApiKeyPermission[]
    >('apiKeyPermissions', [context.getHandler(), context.getClass()]);

    // Si aucune permission n'est spécifiée, refuser l'accès
    if (!requiredPermissions || requiredPermissions.length === 0) {
      throw new ForbiddenException('No API key permissions configured');
    }

    // Extraire l'API key de la requête
    const apiKey = this.extractApiKeyFromRequest(request);
    if (!apiKey) {
      throw new UnauthorizedException('API key is required');
    }

    // Vérifier si l'API key correspond à l'une des permissions requises
    const hasValidKey = this.validateApiKey(apiKey, requiredPermissions);
    if (!hasValidKey) {
      throw new ForbiddenException(
        'Invalid API key or insufficient permissions',
      );
    }

    // Stocker la permission détectée dans la requête (optionnel)
    request.apiKeyPermission = this.detectPermission(apiKey);

    return true;
  }

  private extractApiKeyFromRequest(request: any): string | null {
    console.log('headers', request.headers);
    const apiKeyHeader = request.headers['x-api-key'];
    console.log('api-key');

    return apiKeyHeader || null;
  }

  private validateApiKey(
    apiKey: string,
    requiredPermissions: ApiKeyPermission[],
  ): boolean {
    console.log('read', process.env.X_READ_KEY);
    console.log('write', process.env.X_WRITE_KEY);

    for (const permission of requiredPermissions) {
      if (
        permission === ApiKeyPermission.READ &&
        apiKey === process.env.X_READ_KEY
      ) {
        return true;
      }
      if (
        permission === ApiKeyPermission.WRITE &&
        apiKey === process.env.X_WRITE_KEY
      ) {
        return true;
      }
    }
    return false;
  }

  private detectPermission(apiKey: string): ApiKeyPermission | null {
    if (apiKey === process.env.X_READ_KEY) {
      return ApiKeyPermission.READ;
    }
    if (apiKey === process.env.X_WRITE_KEY) {
      return ApiKeyPermission.WRITE;
    }
    return null;
  }
}
