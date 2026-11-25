import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { QueryFailedError, Repository } from 'typeorm';
import { PaginationData, PaginationUtil } from '../utils/pagination.util';
import { SysPrivilege, SysPrivilegesView } from '../models/sys_privileges.entity';

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
    @InjectRepository(SysPrivilege)
    private readonly mdlTable: Repository<SysPrivilege>,
  ) {}

  async getOptions(): Promise<Array<{ id_privilege: string; full_name: string }>> {
    const records = await this.mdlTable.find({ order: { recid: 'ASC' } });
    return records
      .filter((record) => record.jsonData?.c2 !== 'N')
      .map((record) => ({
        id_privilege: record.recid,
        full_name: String(record.jsonData?.c1 ?? record.recid),
      }));
  }

  async create(recid: string, fullName: string, status: string, permissions: unknown): Promise<SysPrivilege> {
    if (await this.mdlTable.findOneBy({ recid })) {
      throw new ConflictException(`Record ${recid} already exists`);
    }
    return this.mdlTable.save(this.mdlTable.create({
      recid,
      jsonData: { recid, c1: fullName, c2: status, c3: permissions ?? {} },
      jsonAudit: null,
    }));
  }

  async update(recid: string, fullName: string, status: string, permissions: unknown): Promise<SysPrivilege> {
    const record = await this.mdlTable.findOneBy({ recid });
    if (!record) throw new NotFoundException(`Record ${recid} not found`);
    record.jsonData = { recid, c1: fullName, c2: status, c3: permissions ?? {} };
    return this.mdlTable.save(record);
  }

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
    const tableRecord = recid
      ? await this.mdlTable.findOneBy({ recid })
      : null;

    if (recid && !tableRecord) {
      throw new NotFoundException(`record not found!`);
    }

    let oldvalue: Record<string, unknown> | null = null;
    let record: Record<string, unknown> | null = null;

    if (recid && tableRecord) {
      record = {
        id_privilege: recid,
        full_name: tableRecord.jsonData?.c1 ?? '',
        enable_status: tableRecord.jsonData?.c2 ?? 'Y',
        module_status: tableRecord.jsonData?.c2 ?? 'Y',
      };
      oldvalue = {
        id_privilege: recid,
        full_name: tableRecord.jsonData?.c1 ?? '',
        enable_status: tableRecord.jsonData?.c2 ?? 'Y',
        permission: tableRecord.jsonData?.c3 ?? {},
      };
    }

    const list_applications = await this.mdlView.query(
      `SELECT id_module, module_full_name, id_application, full_name
      FROM vw_sys_applications WHERE enable_status = 'Y'`,
    );
    const list_permissions = await this.mdlView.query(
      `SELECT DISTINCT (string_to_array(id_item, '*'))[2] AS recid, item_narrative AS narrative
      FROM vw_sys_eblookup WHERE id_item LIKE 'APP.PERM*%' AND enable_status = 'Y'`,
    );

    return { record, oldvalue, list_applications, list_permissions };
  }

  async getListSummary(page: number, pageSize: number) {
    const tableRecords = await this.mdlTable.find();
    const records: PrivilegeSummary[] = tableRecords
      .map((item) => ({
        id_privilege: item.recid,
        full_name: String(item.jsonData?.c1 ?? ''),
        enable_status: String(item.jsonData?.c2 ?? ''),
      }))
      .sort((a, b) =>
        a.full_name.localeCompare(b.full_name) ||
        a.id_privilege.localeCompare(b.id_privilege),
      );

    const pagination = PaginationUtil.create(page, pageSize, records.length);
    const pagedRecords = records.slice(pagination.skip, pagination.skip + pageSize);
  
    return PaginationUtil.withData(pagination, { records: pagedRecords });
  }
  
}
