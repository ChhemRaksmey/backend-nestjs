import { Column, Entity, PrimaryColumn, ViewColumn, ViewEntity } from 'typeorm';
import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

@ViewEntity({ name: 'vw_sys_applications', synchronize: false })
export class SysApplicationsView {

  @ViewColumn()
  id_module: string;

  @ViewColumn()
  module_full_name: string;
  
  @ViewColumn()
  id_application: string;

  @ViewColumn()
  full_name: string;

  @ViewColumn()
  base_url: string;

  @ViewColumn()
  enable_status: string;

}

export class ValidateCreate {

  @IsNotEmpty({ message: 'Main Module can not be empty' })
  id_module: string;

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

@Entity({ name: 'sys_applications' })
export class SysApplication {
  @PrimaryColumn({ name: 'recid', type: 'varchar', length: 35 })
  recid: string;

  @Column({ name: 'json_data', type: 'jsonb', nullable: true })
  jsonData: Record<string, unknown> | null;

  @Column({ name: 'json_audit', type: 'jsonb', nullable: true })
  jsonAudit: Record<string, unknown> | null;
}

