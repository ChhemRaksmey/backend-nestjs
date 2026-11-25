import { Column, Entity, PrimaryColumn, ViewColumn, ViewEntity } from 'typeorm';
import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

@Entity({ name: 'hris_branch' })
export class HrisBranch {
  @PrimaryColumn({ name: 'recid', type: 'varchar', length: 35 })
  recid: string;

  @Column({ name: 'json_data', type: 'jsonb', nullable: true })
  jsonData: Record<string, unknown> | null;

  @Column({ name: 'json_audit', type: 'jsonb', nullable: true })
  jsonAudit: Record<string, unknown> | null;
}

@ViewEntity({ name: 'vw_hris_branch', synchronize: false })
export class HrisBranchView {

  @ViewColumn()
  id_branch: string;

  @ViewColumn()
  short_name: string;

  @ViewColumn()
  full_name: string;

  @ViewColumn()
  branch_type: string;

  @ViewColumn()
  enable_status: string;

}

export class ValidateCreate {

  @IsNotEmpty({ message: 'Short Name can not be empty' })
  short_name: string;

  @IsNotEmpty({ message: 'Full Name can not be empty' })
  @IsString({ message: 'Full Name must be string' })
  @MaxLength(100, { message: 'length of Full Name can not greater then 100' })
  full_name: string;

  @IsNotEmpty({ message: 'Branch Type can not be empty' })
  @IsString({ message: 'Branch Type must be string' })
  @MaxLength(100, { message: 'length of Branch Type can not greater then 100' })
  branch_type: string;

  @IsNotEmpty({ message: 'Status can not be empty' })
  enable_status: string;

}

