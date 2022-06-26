import { ApiModelProperty } from '@nestjs/swagger/dist/decorators/api-model-property.decorator';

export class TransferParamsDTO {
  // constructor();
  // constructor(params: TransferParamsDTO);
  //
  // constructor(params?: TransferParamsDTO) {
  //   this.sum = params?.sum ?? 0;
  //   this.userIdFrom = params?.userIdFrom ?? 0;
  //   this.userIdTo = params?.userIdTo ?? 0;
  //   this.withError = params?.withError ?? false;
  // }

  @ApiModelProperty({
    default: 200,
  })
  sum!: number;

  @ApiModelProperty({
    default: 1,
  })
  userIdFrom!: number;

  @ApiModelProperty({
    default: 2,
  })
  userIdTo!: number;

  @ApiModelProperty({
    default: false,
  })
  withError!: boolean;

  static new({ sum, userIdTo, userIdFrom, withError }: TransferParamsDTO) {
    const it = new TransferParamsDTO();
    it.sum = sum;
    it.userIdTo = userIdTo;
    it.userIdFrom = userIdFrom;
    it.withError = withError;
    return it;
  }
}