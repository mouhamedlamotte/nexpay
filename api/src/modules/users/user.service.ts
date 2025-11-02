import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  OnModuleInit,
  UnauthorizedException,
} from '@nestjs/common';

import {
  FilterConfig,
  FilterService,
  HashService,
  LoggerService,
  PaginationService,
  PrismaService,
} from 'src/lib';
import { ConfigService } from '@nestjs/config';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { GetUserDto } from './dto/get-users-dto';
import { ResetPasswordDto } from './dto/reset-password.dto';

@Injectable()
export class UserService implements OnModuleInit {
  constructor(
    private readonly logger: LoggerService,
    private readonly prisma: PrismaService,
    private readonly hash: HashService,
    private readonly pagination: PaginationService,
    private readonly filter: FilterService,
    private readonly env: ConfigService,
  ) {
    this.logger.setContext(UserService.name);
  }

  onModuleInit() {
    this.logger.log('Admin service initialized');
    this.logger.log('seeding admin');
    this.seedUser();
  }

  private readonly seedUser = async () => {
    const defaultPassword = this.env.get('ADMIN_PASSWORD');
    const password = await this.hash.hashPassword(defaultPassword);
    const admin = await this.prisma.user.upsert({
      where: { email: this.env.get('ADMIN_EMAIL') },
      update: {
        password: password,
        hasDefaultPassword: true,
        isSuperUser: true,
        deletedAt: null,
        isActive: true,
      },
      create: {
        email: this.env.get('ADMIN_EMAIL'),
        firstName: '',
        isSuperUser: true,
        lastName: '',
        hasDefaultPassword: true,
        password: password,
      },
    });

    this.logger.log(`Admin ${admin.email} created`);
  };

  private getUsersFilterConfig(): FilterConfig {
    return {
      baseWhere: {},
      allowedFilters: ['isActive'],
      searchConfig: {
        searchFields: ['email', 'firstName', 'lastName'],
        searchKey: 'search',
      },
    };
  }

  async create(createdById: string, data: CreateUserDto) {
    const password = await this.hash.hashPassword(data.password);
    try {
      const user = await this.prisma.user.create({
        data: {
          ...data,
          password: password,
          createdById: createdById,
        },
      });

      delete user.password;
      return user;
    } catch (error) {
      this.logger.error(error.message, error.stack);
      throw error;
    }
  }

  async update(id: string, data: UpdateUserDto) {
    if (!data) {
      throw new BadRequestException('No data provided');
    }

    const newData: any = {
      ...data,
    };

    if (data.isActive) {
      newData.deletedAt = null;
    }

    try {
      const user = await this.prisma.user.update({
        where: { id: id },
        data: {
          ...newData,
        },
      });
      delete user.password;
      return user;
    } catch (error) {
      this.logger.error(error.message, error.stack);
      throw error;
    }
  }

  async findAll(dto: GetUserDto) {
    try {
      const config = this.getUsersFilterConfig();
      const where = this.filter.buildDynamicFilters(dto, config);

      const orderBy = this.pagination.buildOrderBy(dto.sortBy, dto.sortOrder);

      const result = await this.pagination.paginate(this.prisma.user, {
        page: dto.page,
        limit: dto.limit,
        where,
        orderBy,
      });

      return result;
    } catch (error) {
      this.logger.error(error.message, error.stack);
      throw error;
    }
  }

  async findOne(id: string) {
    try {
      const user = await this.prisma.user.findUnique({ where: { id: id } });
      return user;
    } catch (error) {
      this.logger.error(error.message, error.stack);
      throw error;
    }
  }

  async findOneByEmail(email: string) {
    try {
      const user = await this.prisma.user.findUnique({ where: { email } });
      return user;
    } catch (error) {
      this.logger.error(error.message, error.stack);
      throw error;
    }
  }

  async remove(id: string) {
    try {
      const user = await this.prisma.user.update({
        where: { id: id },
        data: {
          deletedAt: new Date(),
          isActive: false,
        },
      });

      return user;
    } catch (error) {
      this.logger.error(error.message, error.stack);
      throw error;
    }
  }

  async validateEmailAndPasswordUser(email: string, password: string) {
    try {
      const user = await this.prisma.user.findUnique({
        where: { email },
      });

      const doesUserExist = !!user;

      if (!doesUserExist) return null;

      const isPasswordValid = await this.hash.verifyPassword(
        password,
        user.password,
      );

      if (!isPasswordValid) return null;

      if (user.deletedAt) {
        throw new UnauthorizedException(
          'Your account has been deleted, contact admin to restore it',
        );
      }

      if (!user.isActive) {
        throw new UnauthorizedException(
          'Your account has been disabled, contact admin to restore it',
        );
      }

      return { id: user.id };
    } catch (error) {
      this.logger.log("une erreur s'est produite :", error?.message);
      throw error;
    }
  }

  async deleteMyAccount(id: string) {
    try {
      const isAtLeatOneSuperUser = await this.prisma.user.count({
        where: {
          isSuperUser: true,
          isActive: true,
          deletedAt: null,
        },
      });

      if (isAtLeatOneSuperUser <= 1) {
        throw new ForbiddenException(
          'The app must have at least one super user',
        );
      }

      await this.prisma.user.update({
        where: { id: id },
        data: {
          deletedAt: new Date(),
          isActive: false,
        },
      });

      return true;
    } catch (error) {
      this.logger.error(error.message, error.stack);
      throw error;
    }
  }

  // async forgotPassword(email: string) {
  //   try {
  //     const admin = await this.prisma.admin.findUnique({
  //       where: { email },
  //     });
  //     if (!admin) {
  //       throw new Error('admin not found');
  //     }
  //     const opt = await this.otp.generateOtp(`admin:${admin.email}`);
  //     this.logger.debug(`OTP generated for email: ${admin.email}, otp: ${opt}`);
  //     await this.authPublisher.publishForgetPasswordOtp(admin.email, opt);

  //     return { otp: opt, note: 'will be removed on production' };
  //   } catch (error) {
  //     this.logger.error(error.message, error.stack);
  //     throw error;
  //   }
  // }

  // async verifyForgotPasswordOtp(email: string, otp: string) {
  //   try {
  //     await this.otp.verifyOtp(`admin:${email}`, otp);
  //     const token = this.tokens.generateCryptoToken();
  //     await this.keyv.set(token, email);
  //     return { token };
  //   } catch (error) {
  //     this.logger.error(error.message, error.stack);
  //     throw error;
  //   }
  // }

  async resetPassword(id: string, dto: ResetPasswordDto) {
    try {
      const user = await this.prisma.user.findUnique({ where: { id } });
      const isPasswordValid = await this.hash.verifyPassword(
        dto.currentPassword,
        user.password,
      );
      if (!isPasswordValid) {
        throw new BadRequestException('Password is incorrect');
      }
      const hashedPassword = await this.hash.hashPassword(dto.newPassword);
      return await this.prisma.user.update({
        where: { id },
        data: {
          hasDefaultPassword: false,
          password: hashedPassword,
        },
      });
    } catch (error) {
      this.logger.error(error.message, error.stack);
      throw error;
    }
  }
}
