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
import { ResetPasswordDto } from './dto/reset-password.dto';

@Controller('')
@ApiTags('Users')
export class UserController {
  constructor(
    private readonly user: UserService,
    private readonly tokens: TokensService,
  ) {}

  @ApiTags('Authentication')
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

  @Post('users')
  @ApiOperation({ summary: 'Créer un administrateur' })
  @ApiBody({ type: CreateUserDto })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Administrateur créé avec succès',
  })
  @UseGuards(JwtAuthGuard())
  async create(@Body() dto: CreateUserDto, @Request() req: any) {
    const data = await this.user.create(req.user.id, dto);
    return {
      statusCode: HttpStatus.CREATED,
      message: 'Admin created successfully',
      data,
    };
  }

  @Put('users')
  @UseGuards(JwtAuthGuard())
  @ApiOperation({ summary: 'Modifier ladmin connecté' })
  @ApiBody({ type: UpdateUserDto })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Administrateur mis à jour avec succès',
  })
  async update(@Body() dto: UpdateUserDto, @Request() req: any) {
    const id = req.user.id;
    const data = await this.user.update(id, dto);
    return {
      statusCode: HttpStatus.OK,
      message: 'Admin updated successfully',
      data,
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

  @Put('users/password/reset')
  @UseGuards(JwtAuthGuard())
  @ApiOperation({ summary: 'Change connected user password' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Administrateur supprimé avec succès',
  })
  async resetPassword(@Req() req: any, @Body() dto: ResetPasswordDto) {
    const data = await this.user.resetPassword(req.user.id, dto);
    delete data.password;
    return {
      statusCode: HttpStatus.OK,
      message: 'Password updated successfully',
      data,
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
    const data = await this.user.findOne(req.user.id);
    delete data.password;
    return {
      statusCode: HttpStatus.OK,
      message: 'Admin retrieved successfully',
      data,
    };
  }

  @Put('users/:id')
  @UseGuards(JwtAuthGuard())
  @ApiOperation({ summary: 'Modifier un user' })
  @ApiBody({ type: UpdateUserDto })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Utilisateur mis à jour avec succès',
  })
  async updateUser(@Body() dto: UpdateUserDto, @Param('id') id: string) {
    const data = await this.user.update(id, dto);
    return {
      statusCode: HttpStatus.OK,
      message: 'User updated successfully',
      data,
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
    const data = await this.user.findOne(id);
    return {
      statusCode: HttpStatus.OK,
      message: 'Admin retrieved successfully',
      data,
    };
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
    const data = await this.user.remove(id);
    return {
      statusCode: HttpStatus.OK,
      message: 'Admin deleted successfully',
      admin: data,
    };
  }
}
