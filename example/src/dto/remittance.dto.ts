import { ApiModelProperty } from '@nestjs/swagger/dist/decorators/api-model-property.decorator';

export class RemittanceDto {
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
}