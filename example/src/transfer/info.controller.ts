import { Controller, Get } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { InfoService } from './info.service';
import { CacheService } from './cache.service';

@Controller('info')
export class InfoController {
  constructor(
    private readonly infoService: InfoService,
    private readonly dataSource: DataSource,
  ) {
  }

  @Get()
  async getInfo() {
    return this.dataSource.transaction(manager => {
      return this.infoService.withTransaction(manager, { excluded: [CacheService] }).getInfo();
    });
  }
}
