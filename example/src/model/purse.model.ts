import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { User } from './user.model';
import { ApiModelProperty, ApiModelPropertyOptional } from '@nestjs/swagger/dist/decorators/api-model-property.decorator';

@Entity({ name: 'purse' })
export class Purse {
  @ApiModelProperty()
  @PrimaryGeneratedColumn()
  id!: number;

  @ApiModelProperty()
  @Column({ nullable: false, default: 0, type: 'integer' })
  balance!: number;

  @ApiModelProperty()
  @Column({ nullable: false })
  userId!: number;

  @ApiModelPropertyOptional({
    type: () => User,
  })
  @ManyToOne(() => User, user => user.purses)
  user?: User;
}