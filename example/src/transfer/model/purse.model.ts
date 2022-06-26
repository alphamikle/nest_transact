import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { ApiModelProperty, ApiModelPropertyOptional } from '@nestjs/swagger/dist/decorators/api-model-property.decorator';
import { Min } from 'class-validator';
import { User } from '../../user/model/user.model';

export interface NewPurse {
  id: number;
  balance: number;
  userId: number;
}

@Entity({ name: 'purse' })
export class Purse implements NewPurse {
  @ApiModelProperty()
  @PrimaryGeneratedColumn()
  id: number;

  @ApiModelProperty()
  @Min(0)
  @Column({ nullable: false, default: 0, type: 'integer' })
  balance: number;

  @ApiModelProperty()
  @Column({ nullable: false })
  userId: number;

  @ApiModelPropertyOptional({
    type: () => User,
  })
  @ManyToOne(() => User, user => user.purses)
  user?: User;

  constructor();
  constructor(params: NewPurse);

  constructor(params?: NewPurse) {
    this.id = params?.id ?? 0;
    this.balance = params?.balance ?? 0;
    this.userId = params?.userId ?? 0;
  }
}