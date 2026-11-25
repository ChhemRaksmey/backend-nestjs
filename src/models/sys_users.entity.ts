import { Column, Entity, PrimaryColumn, ViewColumn, ViewEntity } from 'typeorm';
import {
  IsNotEmpty,
  IsString,
  MinLength,
  MaxLength,
  Validate,
  ValidationArguments,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';

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
  
  // @IsNotEmpty({ message: 'mandatory Default Branch' })
  // id_branch;

}

export class ValidateEdit {

  @IsNotEmpty({ message: 'record id is mandatory' })
  id_user;

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
  
  // @IsNotEmpty({ message: 'mandatory Default Branch' })
  // id_branch;

}

@ValidatorConstraint({ name: 'passwordsMatch', async: false })
class PasswordsMatchConstraint implements ValidatorConstraintInterface {
  validate(
    confirmPassword: unknown,
    args?: ValidationArguments,
  ): boolean {
    if (
      !args ||
      typeof confirmPassword !== 'string' ||
      confirmPassword.length === 0
    ) {
      return true;
    }

    const { NewPassword } = args.object as { NewPassword?: unknown };
    return typeof NewPassword !== 'string' || NewPassword.length === 0
      ? true
      : confirmPassword === NewPassword;
  }

  defaultMessage(): string {
    return 'Confirm New Password must match New Password';
  }
}

export class ValidateResetPassword {

  @IsNotEmpty({ message: 'record id is mandatory' })
  id_user: string;

  @IsString({ message: 'New Password must be a string' })
  @IsNotEmpty({ message: 'mandatory New Password' })
  @Validate(PasswordsMatchConstraint)
  NewPassword: string;
  
  @IsString({ message: 'Confirm New Password must be a string' })
  @IsNotEmpty({ message: 'mandatory Confirm New Password' })
  @Validate(PasswordsMatchConstraint)
  ConfirmNewPassword: string;

}
@Entity({ name: 'sys_users' })
export class SysUser {
  @PrimaryColumn({ name: 'recid', type: 'varchar', length: 35 })
  recid: string;

  @Column({ name: 'json_data', type: 'jsonb', nullable: true })
  jsonData: Record<string, unknown> | null;

  @Column({ name: 'json_audit', type: 'jsonb', nullable: true })
  jsonAudit: Record<string, unknown> | null;
}

@Entity({ name: 'sys_user_password' })
export class SysUserPassword {
  @PrimaryColumn({ name: 'recid', type: 'varchar', length: 35 })
  recid: string;

  @Column({ name: 'json_data', type: 'jsonb', nullable: true })
  jsonData: Record<string, unknown> | null;

  @Column({ name: 'json_audit', type: 'jsonb', nullable: true })
  jsonAudit: Record<string, unknown> | null;
}
