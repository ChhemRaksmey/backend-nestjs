

import { PublicController } from '../controllers/public.controller';
import { ValidationExampleController } from '../controllers/validation-example.controller';

import { Customer } from '../models/customer.entity';
import { CustomersService } from '../services/customers.service';
import { CustomersController } from '../controllers/customers.controller';

import { mdSysModules } from '../models/sys_modules.entity';
import { SysModulesService } from '../services/sys_modules.service';
import { SysModulesController } from '../controllers/sys_modules.controller';

import { SysApplicationsView } from '../models/sys_applications.entity';
import { SysApplicationsService } from '../services/sys_applications.service';
import { SysApplicationsController } from '../controllers/sys_applications.controller';

import { SysEBLookUpView } from '../models/sys_eblookup.entity';
import { SysEBLookUpService } from '../services/sys_eblookup.service';
import { SysEBLookUpController } from '../controllers/sys_eblookup.controller';



export const entities = [
    Customer,
    mdSysModules, SysApplicationsView, SysEBLookUpView,
];

export const providers = [
    CustomersService,
    SysModulesService, SysApplicationsService, SysEBLookUpService,
];

export const controllers = [
    PublicController,
    ValidationExampleController,
    CustomersController,
    SysModulesController, SysApplicationsController, SysEBLookUpController,
];

export const middlewareController = [
    PublicController,
    ValidationExampleController,
    CustomersController,
    SysModulesController, SysApplicationsController, SysEBLookUpController,
];
