import { Injectable } from '@nestjs/common';

// services/pagination.service.ts
@Injectable()
export class PaginationService {
  /**
   * Helper générique pour la pagination avec Prisma
   */
  async paginate<T>(
    model: any,
    options: {
      page: number;
      limit: number;
      where?: any;
      include?: any;
      orderBy?: any;
      select?: any;
      omit?: any;
    },
  ): Promise<{
    data: T[];
    pagination: {
      currentPage: number;
      totalPages: number;
      totalItems: number;
      itemsPerPage: number;
      hasNextPage: boolean;
      hasPreviousPage: boolean;
    };
  }> {
    const { page, limit, where, include, orderBy, select, omit } = options;

    const skip = (page - 1) * limit;

    // Requête parallèle pour les données et le count
    const [data, totalItems] = await Promise.all([
      model.findMany({
        skip,
        take: limit,
        where,
        include,
        orderBy,
        select,
        omit,
      }),
      model.count({ where }),
    ]);

    const totalPages = Math.ceil(totalItems / limit);

    return {
      data,
      pagination: {
        currentPage: page,
        totalPages,
        totalItems,
        itemsPerPage: limit,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
      },
    };
  }

  /**
   * Construire les conditions de tri dynamiquement
   */
  buildOrderBy(sortBy?: string, sortOrder: 'asc' | 'desc' = 'desc') {
    if (!sortBy) return { createdAt: sortOrder };

    // Support pour les relations (ex: "client.name")
    if (sortBy.includes('.')) {
      const [relation, field] = sortBy.split('.');
      return { [relation]: { [field]: sortOrder } };
    }

    return { [sortBy]: sortOrder };
  }

  /**
   * Construire les conditions de recherche
   */
  buildSearchConditions(search: string, searchFields: string[]) {
    if (!search || !searchFields.length) return {};

    return {
      OR: searchFields.map((field) => ({
        [field]: {
          contains: search,
          mode: 'insensitive',
        },
      })),
    };
  }
}
