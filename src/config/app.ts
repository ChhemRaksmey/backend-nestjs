
import { PublicController } from '../controllers/public.controller';
import { ValidationExampleController } from '../controllers/validation-example.controller';

import { Customer } from '../models/customer.entity';
import { CustomersService } from '../services/customers.service';
import { CustomersController } from '../controllers/customers.controller';

import { mdSysModules, SysModule } from '../models/sys_modules.entity';
import { SysModulesService } from '../services/sys_modules.service';
import { SysModulesController } from '../controllers/sys_modules.controller';

import { SysApplication, SysApplicationsView } from '../models/sys_applications.entity';
import { SysApplicationsService } from '../services/sys_applications.service';
import { SysApplicationsController } from '../controllers/sys_applications.controller';

import { SysEBLookup, SysEBLookUpView } from '../models/sys_eblookup.entity';
import { SysEBLookUpService } from '../services/sys_eblookup.service';
import { SysEBLookUpController } from '../controllers/sys_eblookup.controller';

import { SysPrivilege, SysPrivilegesView } from '../models/sys_privileges.entity';
import { SysPrivilegesService } from '../services/sys_privileges.service';
import { SysPrivilegesController } from '../controllers/sys_privileges.controller';

import { SysUser, SysUsersView, SysUserPassword } from '../models/sys_users.entity';
import { SysUsersService } from '../services/sys_users.service';
import { SysUsersController } from '../controllers/sys_users.controller';

import { HrisBranch, HrisBranchView } from '../models/hris_branch.entity';
import { HrisBranchService } from '../services/hris_branch.service';
import { HrisBranchController } from '../controllers/hris_branch.controller';
import { AuthController } from '../controllers/auth.controller';
import { AuthService } from '../services/auth.service';


export const entities = [
    Customer,
    SysModule, mdSysModules,
    SysApplication, SysApplicationsView,
    SysEBLookup, SysEBLookUpView,
    SysPrivilege, SysPrivilegesView,
    SysUser, SysUsersView, SysUserPassword,
    HrisBranch, HrisBranchView,
];

export const providers = [
    CustomersService,
    SysModulesService, SysApplicationsService, SysEBLookUpService,
    SysPrivilegesService, SysUsersService, HrisBranchService,
    AuthService,
];

export const controllers = [
    AuthController,
    PublicController,
    ValidationExampleController,
    CustomersController,
    SysModulesController, SysApplicationsController, SysEBLookUpController,
    SysPrivilegesController, SysUsersController, HrisBranchController,
];
