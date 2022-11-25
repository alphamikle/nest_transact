import { forwardRef, Module } from '@nestjs/common';
import { CircularModule } from '../circular/circular.module';
import { CommonService } from './common.service';

@Module({
  imports: [
    forwardRef(() => CircularModule),
  ],
  providers: [CommonService],
  exports: [CommonService],
})
export class CommonModule { }