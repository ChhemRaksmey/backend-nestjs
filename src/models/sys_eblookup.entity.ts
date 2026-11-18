import { ViewColumn, ViewEntity } from 'typeorm';
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

}

