import { Column, Entity, JoinColumn, OneToMany, OneToOne, PrimaryGeneratedColumn } from 'typeorm';
import { ApiModelProperty, ApiModelPropertyOptional } from '@nestjs/swagger/dist/decorators/api-model-property.decorator';
import { Purse } from '../../transfer/model/purse.model';

@Entity({ name: 'user' })
export class User {
  @ApiModelProperty()
  @PrimaryGeneratedColumn()
  id!: number;

  @ApiModelProperty()
  @Column()
  name!: string;

  @ApiModelPropertyOptional()
  @Column({ nullable: true })
  defaultPurseId?: number;

  @ApiModelPropertyOptional({
    type: () => Purse,
  })
  @OneToOne(() => Purse, purse => purse.user)
  @JoinColumn()
  defaultPurse?: Purse;

  @ApiModelPropertyOptional({
    type: () => Purse,
    isArray: true,
  })
  @OneToMany(() => Purse, purse => purse.user)
  purses?: Purse[];
}