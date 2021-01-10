import { ApiModelProperty } from '@nestjs/swagger/dist/decorators/api-model-property.decorator';

export class BalanceValueDto {
  @ApiModelProperty({
    minimum: 1,
  })
  sum!: number;
}