import { ViewColumn, ViewEntity } from 'typeorm';
import { IsNotEmpty, IsString, MaxLength, MinLength } from 'class-validator';

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

