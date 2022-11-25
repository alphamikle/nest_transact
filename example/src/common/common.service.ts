import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { CircularService } from '../circular/circular.service';

@Injectable()
export class CommonService {
  constructor(
    @Inject(forwardRef(() => CircularService))
    private circularService: CircularService
  ) { }
}