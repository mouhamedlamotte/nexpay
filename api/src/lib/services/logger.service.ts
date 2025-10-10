import {
  Injectable,
  LoggerService as NestLoggerService,
  Scope,
} from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';

@Injectable({ scope: Scope.TRANSIENT })
export class LoggerService implements NestLoggerService {
  private context = 'AppLogger';
  private logDir = path.resolve('logs');

  constructor() {
    if (!fs.existsSync(this.logDir)) {
      fs.mkdirSync(this.logDir, { recursive: true });
    }
  }

  setContext(context: string) {
    this.context = context;
  }

  log(message: any, context?: string) {
    this.write('LOG', message, context);
  }

  error(message: any, trace?: string, context?: string) {
    this.write('ERROR', message + (trace ? `\nTRACE: ${trace}` : ''), context);
  }

  warn(message: any, context?: string) {
    this.write('WARN', message, context);
  }

  debug(message: any, context?: string) {
    this.write('DEBUG', message, context);
  }

  verbose(message: any, context?: string) {
    this.write('VERBOSE', message, context);
  }

  private write(level: string, message: any, context?: string) {
    const timestamp = new Date().toISOString();
    const ctx = context || this.context;
    const formatted = `[${timestamp}] [${level}] [${ctx}] ${message}`;

    // console
    if (level === 'ERROR') {
      console.error(formatted);
    } else if (level === 'WARN') {
      console.warn(formatted);
    } else {
      console.log(formatted);
    }

    // fichier
    const file = path.join(this.logDir, `${level.toLowerCase()}.log`);
    fs.appendFileSync(file, formatted + '\n');
  }
}
