import { ApiModelProperty } from '@nestjs/swagger/dist/decorators/api-model-property.decorator';

export class RemittanceResultDto {
  @ApiModelProperty()
  sum!: number;

  @ApiModelProperty()
  fromId!: number;

  @ApiModelProperty()
  toId!: number;

  @ApiModelProperty()
  fromBalance!: number;
}