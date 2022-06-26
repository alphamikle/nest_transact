import { ApiModelProperty } from '@nestjs/swagger/dist/decorators/api-model-property.decorator';

export class TransferOperationResultDto {
  constructor({ sum, fromId, toId, fromBalance, toBalance }: TransferOperationResultDto) {
    this.sum = sum;
    this.fromId = fromId;
    this.toId = toId;
    this.fromBalance = fromBalance;
    this.toBalance = toBalance;
  }

  @ApiModelProperty()
  sum!: number;

  @ApiModelProperty()
  fromId!: number;

  @ApiModelProperty()
  toId!: number;

  @ApiModelProperty()
  fromBalance!: number;

  @ApiModelProperty()
  toBalance!: number;
}