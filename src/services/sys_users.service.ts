import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PaginationData, PaginationUtil } from '../utils/pagination.util';
import { SysUser, SysUsersView, SysUserPassword } from '../models/sys_users.entity';

export interface CustomerPage extends PaginationData {
  records: SysUsersView[];
}

@Injectable()
export class SysUsersService {

  constructor(
    @InjectRepository(SysUsersView)
    private readonly mdlView: Repository<SysUsersView>,
    @InjectRepository(SysUser)
    private readonly mdlTable: Repository<SysUser>,
    @InjectRepository(SysUserPassword)
    private readonly passwordTable: Repository<SysUserPassword>,
  ) {}

  async create(recid: string, data: Record<string, unknown>): Promise<SysUser> {
    if (await this.mdlTable.findOneBy({ recid })) {
      throw new ConflictException(`Record ${recid} already exists`);
    }
    const created = await this.mdlTable.save(this.mdlTable.create({
      recid,
      jsonData: this.toJsonData(recid, data),
      jsonAudit: null,
    }));
    await this.passwordTable.save(this.passwordTable.create({
      recid,
      jsonData: {
        recid,
        c1: data.staff_id ?? '',
        c2: '20260101000001',
        c3: '123456789',
      },
      jsonAudit: null,
    }));
    return created;
  }

  async update(recid: string, data: Record<string, unknown>): Promise<SysUser> {
    const record = await this.mdlTable.findOneBy({ recid });
    if (!record) throw new NotFoundException(`Record ${recid} not found`);
    record.jsonData = this.toJsonData(recid, data);
    return this.mdlTable.save(record);
  }

  private toJsonData(recid: string, data: Record<string, unknown>): Record<string, unknown> {
    const privileges = data.id_privilege;
    return {
      recid,
      c1: data.staff_id ?? '',
      c2: data.signon_name ?? '',
      c3: data.full_name ?? '',
      c4: data.date_start ?? '',
      c5: data.date_end ?? '',
      c6: data.time_start ?? '',
      c7: data.time_end ?? '',
      c8: data.id_branch ?? '',
      c9: [],
      c10: Array.isArray(privileges) ? privileges : (privileges ?? ''),
      c11: 'Active',
      c12: '0',
    };
  }

  async resetPassword(
    recid: string,
    password: string,
    clearAttempts: boolean,
  ): Promise<void> {
    const user = await this.mdlTable.findOneBy({ recid });
    if (!user) throw new NotFoundException('record not found!');

    let passwordRecord = await this.passwordTable.findOneBy({ recid });
    if (!passwordRecord) {
      passwordRecord = this.passwordTable.create({
        recid,
        jsonData: {},
        jsonAudit: null,
      });
    }

    passwordRecord.jsonData = {
      recid,
      c1: user.jsonData?.c1 ?? '',
      c2: '20260101000001',
      c3: password,
    };
    await this.passwordTable.save(passwordRecord);

    if (clearAttempts) {
      user.jsonData = {
        ...user.jsonData,
        c12: '0',
      };
      await this.mdlTable.save(user);
    }
  }

  async clearAttempts(recid: string): Promise<void> {
    const user = await this.mdlTable.findOneBy({ recid });
    if (!user) throw new NotFoundException('record not found!');
    user.jsonData = {
      ...user.jsonData,
      c12: '0',
    };
    await this.mdlTable.save(user);
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

  async getRecord(recid: string): Promise<SysUsersView> {
    const record = await this.mdlView.findOneBy({ id_user: recid });
    if (!record) {
      throw new NotFoundException('record not found!');
    }
    return record;
  }
  
}
