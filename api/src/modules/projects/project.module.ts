import { Module } from '@nestjs/common';
import { ProjectsController } from './project.controller';
import { ProjectService } from './project.service';

@Module({
  controllers: [ProjectsController],
  providers: [ProjectService],
})
export class ProjectModule {}
