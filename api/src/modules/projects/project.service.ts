import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { FilterConfig, FilterService } from 'src/lib/services/filter.service';
import { PaginationService } from 'src/lib/services/pagination.service';
import { GetProjectsDto } from './dto/get-project.dto';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { PrismaService } from 'src/lib';

@Injectable()
export class ProjectService {
  private readonly logger = new Logger(ProjectService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly filter: FilterService,
    private readonly pagination: PaginationService,
  ) {}

  private getFilterConfig(): FilterConfig {
    return {
      searchConfig: {
        searchKey: 'search',
        searchFields: ['name', 'description'],
        mode: 'insensitive',
        operator: 'contains',
      },
    };
  }

  async findAll(query: GetProjectsDto) {
    try {
      const config = this.getFilterConfig();
      const filters = this.filter.buildDynamicFilters(query, config);

      const orderBy = this.pagination.buildOrderBy(
        query.sortBy,
        query.sortOrder,
      );

      const result = await this.pagination.paginate(this.prisma.project, {
        page: query.page,
        limit: query.limit,
        where: filters,
        orderBy,
      });

      return result;
    } catch (error) {
      this.logger.error('Error fetching services', error);
      throw error;
    }
  }

  async findOneById(id: string) {
    try {
      const service = await this.prisma.project.findUnique({
        where: { id },
      });
      if (!service) {
        this.logger.warn(`Service with id ${id} not found`);
        throw new NotFoundException(`Service with id ${id} not found`);
      }
      return service;
    } catch (error) {
      throw error;
    }
  }

  async findOneByName(name: string) {
    try {
      return await this.prisma.project.findUnique({
        where: { name },
      });
    } catch (error) {
      throw error;
    }
  }

  async create(data: CreateProjectDto) {
    try {
      const callbackUrls = data.callbackUrls;
      delete data.callbackUrls;
      const project = await this.prisma.project.create({
        data: {
          ...data,
        },
      });

      if (callbackUrls) {
        await this.prisma.callback.create({
          data: {
            projectId: project.id,
            ...callbackUrls,
          },
        });
      }
      return {
        ...project,
        callbackUrls,
      };
    } catch (error) {
      this.logger.error('Error creating service', error);
      throw error;
    }
  }

  async update(id: string, data: UpdateProjectDto) {
    try {
      const callbackUrls = data.callbackUrls;
      delete data.callbackUrls;
      const project = await this.prisma.project.update({
        where: { id },
        data: {
          ...data,
        },
      });
      if (callbackUrls) {
        await this.prisma.callback.upsert({
          where: { projectId: project.id },
          create: {
            projectId: project.id,
            ...callbackUrls,
          },
          update: {
            ...callbackUrls,
          },
        });
      }
      return {
        ...project,
        callbackUrls,
      };
    } catch (error) {
      this.logger.error('Error updating service', error);
      throw error;
    }
  }

  async remove(id: string) {
    try {
      return await this.prisma.project.delete({
        where: { id },
      });
    } catch (error) {
      this.logger.error('Error deleting service', error);
      throw error;
    }
  }
}
