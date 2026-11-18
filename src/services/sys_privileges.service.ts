import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { QueryFailedError, Repository } from 'typeorm';
import { PaginationData, PaginationUtil } from '../utils/pagination.util';
import { SysPrivilegesView } from '../models/sys_privileges.entity';

export interface CustomerPage extends PaginationData {
  records: SysPrivilegesView[];
}

export interface PrivilegeSummary {
  id_privilege: string;
  full_name: string;
  enable_status: string;
}

@Injectable()
export class SysPrivilegesService {

  constructor(
    @InjectRepository(SysPrivilegesView)
    private readonly mdlView: Repository<SysPrivilegesView>,
  ) {}

  async getRecords(page: number, pageSize: number): Promise<CustomerPage> {

    const total      = await this.mdlView.count();
    const pagination = PaginationUtil.create(page, pageSize, total);
    const records  = await this.mdlView.find({
      order: { full_name: 'ASC' },
      skip: pagination.skip,
      take: pageSize,
    });
  
    return PaginationUtil.withData(pagination, { records });
  }

  async getRecord(recid: string) {

    const record = await this.mdlView.findOneBy({ id_privilege: recid });
    const list_applications = await this.mdlView.query(
      `SELECT id_module, module_full_name, id_application, full_name
      FROM vw_sys_applications WHERE enable_status = 'Y'`,
    );
    const list_permissions = await this.mdlView.query(
      `SELECT DISTINCT (string_to_array(id_item, '*'))[2] AS recid, item_narrative AS narrative
      FROM vw_sys_eblookup WHERE id_item LIKE 'APP.PERM*%' AND enable_status = 'Y'`,
    );

    return { record: record, list_applications, list_permissions };
  }

  async getListSummary(page: number, pageSize: number) {
  
    const [{ total }] = await this.mdlView.query(
      `SELECT COUNT(*) AS total
       FROM (
         SELECT DISTINCT id_privilege, full_name, module_status AS enable_status
         FROM vw_sys_privilges
       ) AS privilege_summaries`,
    );
    
    const pagination = PaginationUtil.create(page, pageSize, Number(total));
  
    const records: PrivilegeSummary[] = await this.mdlView.query(
      `SELECT DISTINCT
         id_privilege,
         full_name,
         module_status AS enable_status
       FROM vw_sys_privilges
       ORDER BY full_name, id_privilege
       LIMIT $1 OFFSET $2`,
      [ pageSize, pagination.skip ],
    );
  
    return PaginationUtil.withData(pagination, { records });
  }
  
}
