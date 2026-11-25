import { Column, Entity, PrimaryColumn, ViewColumn, ViewEntity } from 'typeorm';
import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

@ViewEntity({ name: 'vw_sys_eblookup', synchronize: false })
export class SysEBLookUpView {

  @ViewColumn()
  id_item: string;

  @ViewColumn()
  item_link: string;

  @ViewColumn()
  item_narrative: string;

  @ViewColumn()
  enable_status: string;

}

export class ValidateCreate {
  @IsNotEmpty({ message: 'Item Link can not be empty' })
  @IsString({ message: 'Item Link must be string' })
  @MaxLength(100, { message: 'length of Item Link can not greater than 100' })
  item_link: string;

  @IsNotEmpty({ message: 'Item Narrative can not be empty' })
  @IsString({ message: 'Item Narrative must be string' })
  @MaxLength(100, { message: 'length of Item Narrative can not greater than 100' })
  item_narrative: string;

  @IsNotEmpty({ message: 'Status can not be empty' })
  enable_status: string;
}

@Entity({ name: 'sys_eb_lookup' })
export class SysEBLookup {
  @PrimaryColumn({ name: 'recid', type: 'varchar', length: 35 })
  recid: string;

  @Column({ name: 'json_data', type: 'jsonb', nullable: true })
  jsonData: Record<string, unknown> | null;

  @Column({ name: 'json_audit', type: 'jsonb', nullable: true })
  jsonAudit: Record<string, unknown> | null;
}

