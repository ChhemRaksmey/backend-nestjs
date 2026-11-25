import { Column, Entity, PrimaryColumn, ViewColumn, ViewEntity } from 'typeorm';
import { IsNotEmpty, IsString, Length, MaxLength } from 'class-validator';

@Entity({ name: 'sys_modules' })
export class SysModule {
  @PrimaryColumn({ name: 'recid', type: 'varchar', length: 35 })
  recid: string;

  @Column({ name: 'json_data', type: 'jsonb', nullable: true })
  jsonData: Record<string, unknown> | null;

  @Column({ name: 'json_audit', type: 'jsonb', nullable: true })
  jsonAudit: Record<string, unknown> | null;
}

@ViewEntity({ name: 'vw_sys_modules', synchronize: false })
export class mdSysModules {
  @ViewColumn()
  id_module: string;

  @ViewColumn()
  full_name: string;

  @ViewColumn()
  base_url: string;

  @ViewColumn()
  enable_status: string;
}

export class ValidateCreate {
  @IsNotEmpty({ message: 'Record ID can not be empty' })
  @IsString({ message: 'Record ID must be string' })
  @Length(1, 35, { message: 'length of Record ID can not be greater than 35' })
  recid: string;

  @IsNotEmpty({ message: 'Full Name can not be empty' })
  @IsString({ message: 'Full Name must be string' })
  @MaxLength(100, { message: 'length of Full Name can not greater then 100' })
  full_name: string;

  @IsNotEmpty({ message: 'Base Url can not be empty' })
  @IsString({ message: 'Base Url must be string' })
  @MaxLength(100, { message: 'length of Base Url can not greater then 100' })
  base_url: string;

  @IsNotEmpty({ message: 'Status can not be empty' })
  enable_status: string;

}

