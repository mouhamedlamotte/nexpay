import { Injectable, Logger } from '@nestjs/common';

export interface FilterConfig {
  baseWhere?: any;
  allowedFilters?: string[];
  dateFields?: DateFieldConfig[];
  searchConfig?: SearchConfig;
  relationFilters?: RelationFilterConfig[];
  customFilters?: CustomFilterConfig[];
  numericFilters?: NumericFilterConfig[];
  arrayFilters?: string[];
}

export interface DateFieldConfig {
  field: string;
  fromKey: string;
  toKey: string;
  exactKey?: string; // Pour une date exacte
}

export interface SearchConfig {
  searchKey: string;
  searchFields: string[];
  relationSearchFields?: RelationSearchField[];
  mode?: 'insensitive' | 'default';
  operator?: 'contains' | 'startsWith' | 'endsWith';
}

export interface RelationSearchField {
  relation: string;
  fields: string[];
  nested?: boolean;
  isArray?: boolean;
}

export interface RelationFilterConfig {
  relation: string;
  field: string;
  filterKey: string;
  operator?: 'equals' | 'in' | 'contains';
}

export interface CustomFilterConfig {
  key: string;
  handler: (value: any, where: any) => any;
}

export interface NumericFilterConfig {
  field: string;
  minKey?: string;
  maxKey?: string;
  exactKey?: string;
}

@Injectable()
export class FilterService {
  private readonly logger = new Logger(FilterService.name);

  /**
   * Construire des filtres complètement dynamiques
   */
  buildDynamicFilters<T>(dto: T, config: FilterConfig): any {
    try {
      let where = { ...config.baseWhere };

      // 1. Filtres simples
      if (config.allowedFilters?.length > 0) {
        where = this.buildSimpleFilters(dto, config.allowedFilters, where);
      }

      // 2. Filtres de dates
      if (config.dateFields?.length > 0) {
        where = this.buildDateFilters(dto, config.dateFields, where);
      }

      // 3. Filtres numériques
      if (config.numericFilters?.length > 0) {
        where = this.buildNumericFilters(dto, config.numericFilters, where);
      }

      // 4. Filtres de relations
      if (config.relationFilters?.length > 0) {
        where = this.buildRelationFilters(dto, config.relationFilters, where);
      }

      // 5. Filtres pour les arrays
      if (config.arrayFilters?.length > 0) {
        where = this.buildArrayFilters(dto, config.arrayFilters, where);
      }

      // 6. Filtres personnalisés
      if (config.customFilters?.length > 0) {
        where = this.buildCustomFilters(dto, config.customFilters, where);
      }

      // 7. Recherche
      if (config.searchConfig) {
        where = this.buildSearchFilter(dto, config.searchConfig, where);
      }

      return where;
    } catch (error) {
      this.logger.error('Error building dynamic filters:', error);
      throw new Error('Failed to build filters');
    }
  }

  /**
   * Filtres simples (égalité)
   */
  private buildSimpleFilters<T>(
    dto: T,
    allowedFilters: string[],
    where: any,
  ): any {
    allowedFilters.forEach((filter) => {
      const value = dto[filter];
      if (this.isValidValue(value)) {
        // Support pour les valeurs multiples séparées par virgule
        if (typeof value === 'string' && value.includes(',')) {
          where[filter] = { in: value.split(',').map((v) => v.trim()) };
        } else {
          where[filter] = value;
        }
      }
    });
    return where;
  }

  /**
   * Filtres de dates
   */
  private buildDateFilters<T>(
    dto: T,
    dateFields: DateFieldConfig[],
    where: any,
  ): any {
    dateFields.forEach(({ field, fromKey, toKey, exactKey }) => {
      const dateFilter: any = {};

      // Date exacte
      if (exactKey && dto[exactKey]) {
        where[field] = new Date(dto[exactKey]);
        return;
      }

      // Plage de dates
      if (dto[fromKey]) {
        dateFilter.gte = new Date(dto[fromKey]);
      }

      if (dto[toKey]) {
        // Ajouter 23:59:59 à la date de fin pour inclure toute la journée
        const endDate = new Date(dto[toKey]);
        endDate.setHours(23, 59, 59, 999);
        dateFilter.lte = endDate;
      }

      if (Object.keys(dateFilter).length > 0) {
        where[field] = dateFilter;
      }
    });
    return where;
  }

  /**
   * Filtres numériques (min/max)
   */
  private buildNumericFilters<T>(
    dto: T,
    numericFields: NumericFilterConfig[],
    where: any,
  ): any {
    numericFields.forEach(({ field, minKey, maxKey, exactKey }) => {
      const numericFilter: any = {};

      // Valeur exacte
      if (exactKey && dto[exactKey] !== undefined) {
        where[field] = Number(dto[exactKey]);
        return;
      }

      // Plage numérique
      if (minKey && dto[minKey] !== undefined) {
        numericFilter.gte = Number(dto[minKey]);
      }

      if (maxKey && dto[maxKey] !== undefined) {
        numericFilter.lte = Number(dto[maxKey]);
      }

      if (Object.keys(numericFilter).length > 0) {
        where[field] = numericFilter;
      }
    });
    return where;
  }

  /**
   * Filtres de relations
   */
  private buildRelationFilters<T>(
    dto: T,
    relationFilters: RelationFilterConfig[],
    where: any,
  ): any {
    relationFilters.forEach(
      ({ relation, field, filterKey, operator = 'equals' }) => {
        const value = dto[filterKey];
        if (this.isValidValue(value)) {
          if (!where[relation]) {
            where[relation] = {};
          }

          switch (operator) {
            case 'in':
              const values =
                typeof value === 'string' ? value.split(',') : [value];
              where[relation][field] = { in: values };
              break;
            case 'contains':
              where[relation][field] = { contains: value, mode: 'insensitive' };
              break;
            default:
              where[relation][field] = value;
          }
        }
      },
    );
    return where;
  }

  /**
   * Filtres pour les arrays
   */
  private buildArrayFilters<T>(
    dto: T,
    arrayFilters: string[],
    where: any,
  ): any {
    arrayFilters.forEach((filter) => {
      const value = dto[filter];
      if (this.isValidValue(value)) {
        const values = Array.isArray(value) ? value : [value];
        where[filter] = { in: values };
      }
    });
    return where;
  }

  /**
   * Filtres personnalisés
   */
  private buildCustomFilters<T>(
    dto: T,
    customFilters: CustomFilterConfig[],
    where: any,
  ): any {
    customFilters.forEach(({ key, handler }) => {
      const value = dto[key];
      if (this.isValidValue(value)) {
        where = handler(value, where);
      }
    });
    return where;
  }

  /**
   * Filtre de recherche avec support des relations
   */
  private buildSearchFilter<T>(
    dto: T,
    searchConfig: SearchConfig,
    where: any,
  ): any {
    const searchValue = dto[searchConfig.searchKey];
    if (!this.isValidValue(searchValue)) return where;

    const {
      searchFields,
      relationSearchFields = [],
      mode = 'insensitive',
      operator = 'contains',
    } = searchConfig;

    const searchConditions: any[] = [];

    // 1. Recherche dans les champs directs
    if (searchFields.length > 0) {
      const directConditions = searchFields.map((field) => {
        const condition: any = { [operator]: searchValue };
        if (mode === 'insensitive') {
          condition.mode = 'insensitive';
        }
        return { [field]: condition };
      });
      searchConditions.push(...directConditions);
    }

    // 2. Recherche dans les relations
    if (relationSearchFields.length > 0) {
      const relationConditions = this.buildRelationSearchConditions(
        searchValue,
        relationSearchFields,
        { mode, operator },
      );
      searchConditions.push(...relationConditions);
    }

    // 3. Combiner toutes les conditions de recherche
    if (searchConditions.length > 0) {
      if (where.OR) {
        // Si OR existe déjà, on combine intelligemment
        where.OR = [...where.OR, ...searchConditions];
      } else {
        where.OR = searchConditions;
      }
    }

    return where;
  }

  /**
   * Construire les conditions de recherche pour les relations
   */
  private buildRelationSearchConditions(
    searchValue: string,
    relationSearchFields: RelationSearchField[],
    options: { mode: string; operator: string },
  ): any[] {
    const conditions: any[] = [];

    relationSearchFields.forEach(
      ({ relation, fields, nested = false, isArray = false }) => {
        fields.forEach((field) => {
          const searchCondition: any = {
            [options.operator]: searchValue,
          };

          if (options.mode === 'insensitive') {
            searchCondition.mode = 'insensitive';
          }

          if (nested) {
            // Pour les relations imbriquées (ex: invoice.client.organization.name)
            const relationPath = relation.split('.');
            let condition = { [field]: searchCondition };

            // Construire la condition imbriquée de l'intérieur vers l'extérieur
            for (let i = relationPath.length - 1; i >= 0; i--) {
              const currentRelation = relationPath[i];

              // Vérifier si cette partie de la relation est un array
              // (vous pourriez avoir besoin d'une config plus avancée pour ça)
              condition = { [currentRelation]: condition };
            }

            conditions.push(condition);
          } else {
            // Relation simple
            if (isArray) {
              // Pour les relations de type liste (one-to-many, many-to-many)
              conditions.push({
                [relation]: {
                  some: {
                    [field]: searchCondition,
                  },
                },
              });
            } else {
              // Pour les relations simples (one-to-one, many-to-one)
              conditions.push({
                [relation]: {
                  [field]: searchCondition,
                },
              });
            }
          }
        });
      },
    );

    return conditions;
  }

  /**
   * Construire des conditions de recherche avancées (méthode publique pour compatibilité)
   */
  buildAdvancedSearchConditions(
    search: string,
    config: {
      directFields?: string[];
      relationFields?: RelationSearchField[];
      mode?: 'insensitive' | 'default';
      operator?: 'contains' | 'startsWith' | 'endsWith';
    },
  ) {
    if (!search) return {};

    const {
      directFields = [],
      relationFields = [],
      mode = 'insensitive',
      operator = 'contains',
    } = config;

    const conditions: any[] = [];

    // Champs directs
    if (directFields.length > 0) {
      const directConditions = directFields.map((field) => {
        const condition: any = { [operator]: search };
        if (mode === 'insensitive') {
          condition.mode = 'insensitive';
        }
        return { [field]: condition };
      });
      conditions.push(...directConditions);
    }

    // Champs de relations
    if (relationFields.length > 0) {
      const relationConditions = this.buildRelationSearchConditions(
        search,
        relationFields,
        { mode, operator },
      );
      conditions.push(...relationConditions);
    }

    return conditions.length > 0 ? { OR: conditions } : {};
  }

  /**
   * Construire des conditions de recherche simples (pour compatibilité)
   */
  buildSearchConditions(
    search: string,
    searchFields: string[],
    mode: 'insensitive' | 'default' = 'insensitive',
  ) {
    if (!search || !searchFields.length) return {};

    return {
      OR: searchFields.map((field) => ({
        [field]: {
          contains: search,
          mode: mode === 'insensitive' ? 'insensitive' : undefined,
        },
      })),
    };
  }

  /**
   * Utilitaire pour construire des filtres booléens
   */
  buildBooleanFilter(value: any): boolean | undefined {
    if (value === 'true' || value === true) return true;
    if (value === 'false' || value === false) return false;
    return undefined;
  }

  /**
   * Utilitaire pour construire des filtres d'enum avec validation
   */
  buildEnumFilter<T>(value: any, allowedValues: T[]): T | T[] | undefined {
    if (!this.isValidValue(value)) return undefined;

    if (typeof value === 'string' && value.includes(',')) {
      const values = value.split(',').map((v) => v.trim());
      const validValues = values.filter((v) => allowedValues.includes(v as T));
      return validValues.length > 0 ? (validValues as T[]) : undefined;
    }

    return allowedValues.includes(value as T) ? (value as T) : undefined;
  }

  /**
   * Construire des filtres de texte avec options avancées
   */
  buildTextFilter(
    value: string,
    options: {
      exact?: boolean;
      startsWith?: boolean;
      endsWith?: boolean;
      caseSensitive?: boolean;
    } = {},
  ) {
    if (!this.isValidValue(value)) return undefined;

    const {
      exact = false,
      startsWith = false,
      endsWith = false,
      caseSensitive = false,
    } = options;

    if (exact) {
      return { equals: value, mode: caseSensitive ? undefined : 'insensitive' };
    }

    if (startsWith) {
      return {
        startsWith: value,
        mode: caseSensitive ? undefined : 'insensitive',
      };
    }

    if (endsWith) {
      return {
        endsWith: value,
        mode: caseSensitive ? undefined : 'insensitive',
      };
    }

    return { contains: value, mode: caseSensitive ? undefined : 'insensitive' };
  }

  /**
   * Vérifier si une valeur est valide pour un filtre
   */
  private isValidValue(value: any): boolean {
    return value !== undefined && value !== null && value !== '';
  }

  /**
   * Utilitaire pour combiner plusieurs conditions where avec AND
   */
  combineWithAnd(...conditions: any[]): any {
    const validConditions = conditions.filter(
      (condition) => condition && Object.keys(condition).length > 0,
    );

    if (validConditions.length === 0) return {};
    if (validConditions.length === 1) return validConditions[0];

    return { AND: validConditions };
  }

  /**
   * Utilitaire pour combiner plusieurs conditions where avec OR
   */
  combineWithOr(...conditions: any[]): any {
    const validConditions = conditions.filter(
      (condition) => condition && Object.keys(condition).length > 0,
    );

    if (validConditions.length === 0) return {};
    if (validConditions.length === 1) return validConditions[0];

    return { OR: validConditions };
  }

  /**
   * Debug: Afficher la structure du where généré
   */
  debugWhere(where: any, label = 'Generated WHERE'): void {
    if (process.env.NODE_ENV === 'development') {
      this.logger.debug(`${label}:`, JSON.stringify(where, null, 2));
    }
  }
}
