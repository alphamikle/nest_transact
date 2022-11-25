import { forwardRef, Module } from '@nestjs/common';
import { CommonModule } from '../common/common.module';
import { CircularService } from './circular.service';

@Module({
  imports: [forwardRef(() => CommonModule)],
  providers: [CircularService],
  exports: [CircularService],
})
export class CircularModule { }