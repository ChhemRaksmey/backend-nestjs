import { ViewColumn, ViewEntity } from 'typeorm';
import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

@ViewEntity({ name: 'vw_sys_users', synchronize: false })
export class SysUsersView {

  @ViewColumn()
  id_user;
  
  @ViewColumn()
  staff_id;
  
  @ViewColumn()
  signon_name;
  
  @ViewColumn()
  full_name;
  
  @ViewColumn()
  date_start;
  
  @ViewColumn()
  date_end;
  
  @ViewColumn()
  time_start;
  
  @ViewColumn()
  time_end;
  
  @ViewColumn()
  id_branch;
  
  @ViewColumn()
  id_privilege;
  
  @ViewColumn()
  user_status;
  
  @ViewColumn()
  current_attempts;

}

export class ValidateCreate {

  @IsNotEmpty({ message: 'mandatory Staff ID' })
  staff_id;
  
  @IsNotEmpty({ message: 'mandatory Signon Name' })
  signon_name;
  
  @IsNotEmpty({ message: 'mandatory Full Name' })
  full_name;
  
  @IsNotEmpty({ message: 'mandatory Date Start' })
  date_start;
  
  @IsNotEmpty({ message: 'mandatory Date End' })
  date_end;
  
  @IsNotEmpty({ message: 'mandatory Time Start' })
  time_start;
  
  @IsNotEmpty({ message: 'mandatory Time End' })
  time_end;
  
  @IsNotEmpty({ message: 'mandatory Default Branch' })
  id_branch;
  
  // @IsNotEmpty({ message: 'mandatory Default Privilege' })
  // id_privilege;

}

