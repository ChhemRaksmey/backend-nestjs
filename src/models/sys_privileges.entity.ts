import { Column, Entity, PrimaryColumn, ViewColumn, ViewEntity } from 'typeorm';
import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

@ViewEntity({ name: 'vw_sys_privilges', synchronize: false })
export class SysPrivilegesView {

  @ViewColumn()
  id_privilege;
  
  @ViewColumn()
  full_name;
  
  @ViewColumn()
  module_status;
  
  @ViewColumn()
  main_label;
  
  @ViewColumn()
  id_application;
  
  @ViewColumn()
  applciation_status;
  
  @ViewColumn()
  base_url;
  
  @ViewColumn()
  labels;
  
  @ViewColumn()
  no_auth;

}

export class ValidateCreate {
  
  @IsNotEmpty({ message: 'Full Name can not be empty' })
  full_name;
  
  @IsNotEmpty({ message: 'Status can not be empty' })
  enable_status;

}

@Entity({ name: 'sys_privileges' })
export class SysPrivilege {
  @PrimaryColumn({ name: 'recid', type: 'varchar', length: 35 })
  recid: string;

  @Column({ name: 'json_data', type: 'jsonb', nullable: true })
  jsonData: Record<string, unknown> | null;

  @Column({ name: 'json_audit', type: 'jsonb', nullable: true })
  jsonAudit: Record<string, unknown> | null;
}

