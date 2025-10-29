import {
  Controller,
  Post,
  Get,
  Delete,
  UseGuards,
  Request,
  Body,
  Param,
  Query,
  HttpStatus,
  Put,
  Req,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBody,
  ApiResponse,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { UserService } from './user.service';
import { TokensService } from 'src/lib/services/tokens.service';
import { LoginDto } from './dto/login.dto';
import { JwtAuthGuard } from 'src/guards/auth/jwt/jwt.guard';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { GetUserDto } from './dto/get-users-dto';

@ApiTags('Authentication')
@Controller('')
export class UserController {
  constructor(
    private readonly user: UserService,
    private readonly tokens: TokensService,
  ) {}

  @Post('auth/login')
  @UseGuards(AuthGuard('local'))
  @ApiOperation({ summary: 'Authentifier un administrateur' })
  @ApiBody({ type: LoginDto })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Connexion réussie, retourne un JWT ou user',
  })
  @ApiResponse({ status: 401, description: 'Identifiants invalides' })
  async login(@Request() req: any) {
    const tokens = await this.tokens.genrerateAccessAndRefreshToken(
      req.user.id,
    );

    return {
      message: 'Login success',
      user: req.user,
      ...tokens,
    };
  }

  @Post('users/create')
  @ApiOperation({ summary: 'Créer un administrateur' })
  @ApiBody({ type: CreateUserDto })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Administrateur créé avec succès',
  })
  @UseGuards(JwtAuthGuard())
  async create(@Body() dto: CreateUserDto, @Request() req: any) {
    const admin = await this.user.create(req.user.id, dto);
    return {
      statusCode: HttpStatus.CREATED,
      message: 'Admin created successfully',
      admin,
    };
  }

  @Put('users/update')
  @UseGuards(JwtAuthGuard())
  @ApiOperation({ summary: 'Modifier ladmin connecté' })
  @ApiBody({ type: UpdateUserDto })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Administrateur mis à jour avec succès',
  })
  async update(@Body() dto: UpdateUserDto, @Request() req: any) {
    const id = req.user.id;
    const admin = await this.user.update(id, dto);
    return {
      statusCode: HttpStatus.OK,
      message: 'Admin updated successfully',
      admin,
    };
  }

  @Get('users')
  @UseGuards(JwtAuthGuard())
  @ApiOperation({
    summary: 'Lister tous les administrateurs (avec pagination et filtres)',
  })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 10 })
  @ApiQuery({
    name: 'search',
    required: false,
    type: String,
    example: 'lamotte',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Liste paginée des administrateurs',
  })
  async findAll(@Query() query: GetUserDto) {
    const res = await this.user.findAll(query);
    return {
      statusCode: HttpStatus.OK,
      message: 'Admins retrieved successfully',
      ...res,
    };
  }

  @Get('users/:id')
  @UseGuards(JwtAuthGuard())
  @ApiOperation({ summary: 'Récupérer un administrateur par son ID' })
  @ApiParam({ name: 'id', type: String, description: 'ID de l’admin' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Détails de l’administrateur',
  })
  async findOne(@Param('id') id: string) {
    return await this.user.findOne(id);
  }

  @Delete('users/:id')
  @UseGuards(JwtAuthGuard())
  @ApiOperation({ summary: 'Supprimer (soft delete) un administrateur' })
  @ApiParam({
    name: 'id',
    type: String,
    description: 'ID de l’admin à supprimer',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Administrateur supprimé avec succès',
  })
  async remove(@Param('id') id: string) {
    const admin = await this.user.remove(id);
    return {
      statusCode: HttpStatus.OK,
      message: 'Admin deleted successfully',
      admin,
    };
  }

  @Get('users/me')
  @UseGuards(JwtAuthGuard())
  @ApiOperation({ summary: 'Profile de l’administrateur connecté' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Administrateur supprimé avec succès',
  })
  async me(@Req() req: any) {
    const admin = await this.user.findOne(req.user.id);
    delete admin.password;
    return {
      statusCode: HttpStatus.OK,
      message: 'Admin retrieved successfully',
      admin,
    };
  }
}
