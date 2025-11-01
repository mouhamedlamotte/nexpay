import {
  BadRequestException,
  Inject,
  Injectable,
  OnModuleInit,
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
import { TokensService } from 'src/lib/services/tokens.service';
import Keyv from 'keyv';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { GetUserDto } from './dto/get-users-dto';

@Injectable()
export class UserService implements OnModuleInit {
  constructor(
    private readonly logger: LoggerService,
    private readonly prisma: PrismaService,
    private readonly hash: HashService,
    private readonly pagination: PaginationService,
    private readonly filter: FilterService,
    private readonly env: ConfigService,
    @Inject('KEYV') private keyv: Keyv,
    // private readonly otp: OtpService,
    private readonly tokens: TokensService,
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
      },
      create: {
        email: this.env.get('ADMIN_EMAIL'),
        firstName: 'NEXPAY',
        lastName: 'ADMIN',
        password: password,
      },
    });

    this.logger.log(`Admin ${admin.email} created`);
  };

  private getUsersFilterConfig(): FilterConfig {
    return {
      baseWhere: {
        deletedAt: null,
      },
      allowedFilters: ['isActive'],
      searchConfig: {
        searchFields: ['email', 'firstName', 'lastName'],
        searchKey: 'search',
      },
    };
  }

  async create(createdById: string, data: CreateUserDto) {
    const defaultPassword = process.env.DEFAUL_PASSWORD;
    const password = await this.hash.hashPassword(defaultPassword);
    try {
      const user = await this.prisma.user.create({
        data: {
          ...data,
          password: password,
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

    try {
      const user = await this.prisma.user.update({
        where: { id: id },
        data: {
          ...data,
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
      const user = await this.prisma.user.findUnique({ where: { email } });

      const doesUserExist = !!user;

      if (!doesUserExist) return null;

      const isPasswordValid = await this.hash.verifyPassword(
        password,
        user.password,
      );

      if (!isPasswordValid) return null;

      return { id: user.id };
    } catch (error) {
      this.logger.log("une erreur s'est produite :", error?.message);
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

  async resetPassword(token: string, password: string) {
    try {
      const email = await this.keyv.get(token);
      if (!email) {
        throw new Error('Invalid token');
      }
      const hashedPassword = await this.hash.hashPassword(password);
      const user = await this.prisma.user.update({
        where: { email },
        data: {
          password: hashedPassword,
        },
      });
      return user;
    } catch (error) {
      this.logger.error(error.message, error.stack);
      throw error;
    }
  }
}
