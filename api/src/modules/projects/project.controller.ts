import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';
import { ProjectService } from './project.service';
import { GetProjectsDto } from './dto/get-project.dto';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { JwtAuthGuard } from 'src/guards/auth/jwt/jwt.guard';

@ApiTags('Projects')
@Controller('projects')
@UseGuards(JwtAuthGuard())
export class ProjectsController {
  constructor(private readonly service: ProjectService) {}

  // ---- GET ALL ----
  @Get()
  @ApiOperation({ summary: 'Get a paginated list of projects with filters' })
  @ApiResponse({ status: 200, description: 'List of projects' })
  async findAll(@Query() query: GetProjectsDto) {
    const result = await this.service.findAll(query);
    return {
      statusCode: 200,
      message: 'Projects retrieved successfully',
      ...result,
    };
  }

  // ---- GET ONE BY ID ----
  @Get('default')
  @ApiOperation({ summary: 'Get default project' })
  @ApiResponse({ status: 200, description: 'project found' })
  @ApiResponse({ status: 404, description: 'project not found' })
  async getDefaultProject() {
    const result = await this.service.getDefaultProject();
    return {
      statusCode: 200,
      message: 'Project retrieved successfully',
      data: result,
    };
  }

  // ---- GET ONE BY ID ----
  @Get(':id')
  @ApiOperation({ summary: 'Get a project by ID' })
  @ApiResponse({ status: 200, description: 'project found' })
  @ApiResponse({ status: 404, description: 'project not found' })
  async findOneById(@Param('id') id: string) {
    const result = await this.service.findOneById(id);
    return {
      statusCode: 200,
      message: 'Project retrieved successfully',
      data: result,
    };
  }

  // ---- GET ONE BY NAME ----
  @Get('name/:name')
  @ApiOperation({ summary: 'Get a project by name' })
  @ApiResponse({ status: 200, description: 'project found' })
  @ApiResponse({ status: 404, description: 'project not found' })
  async findOneByName(@Param('name') name: string) {
    const result = this.service.findOneByName(name);
    return {
      statusCode: 200,
      message: 'Project retrieved successfully',
      result,
    };
  }

  // ---- CREATE ----
  @Post()
  @ApiOperation({ summary: 'Create a new Project' })
  @ApiBody({ type: CreateProjectDto })
  @ApiResponse({ status: 201, description: 'Project created successfully' })
  async create(@Body() data: CreateProjectDto) {
    const result = await this.service.create(data);
    return {
      statusCode: 201,
      message: 'Project created successfully',
      result,
    };
  }

  // ---- UPDATE ----
  @Put(':id')
  @ApiOperation({ summary: 'Update an existing project' })
  @ApiBody({ type: UpdateProjectDto })
  @ApiResponse({ status: 200, description: 'project updated successfully' })
  @ApiResponse({ status: 404, description: 'project not found' })
  async update(@Param('id') id: string, @Body() data: UpdateProjectDto) {
    const result = await this.service.update(id, data);
    return {
      statusCode: 200,
      message: 'Project updated successfully',
      result,
    };
  }

  // ---- DELETE ----
  @Delete(':id')
  @ApiOperation({ summary: 'Delete a project' })
  @ApiResponse({ status: 200, description: 'project deleted successfully' })
  @ApiResponse({ status: 404, description: 'project not found' })
  async remove(@Param('id') id: string) {
    const result = await this.service.remove(id);
    return {
      statusCode: 200,
      message: 'Project deleted successfully',
      result,
    };
  }
}
