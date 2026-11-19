import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PaginationData, PaginationUtil } from '../utils/pagination.util';
import { SysUsersView } from '../models/sys_users.entity';

export interface CustomerPage extends PaginationData {
  records: SysUsersView[];
}

@Injectable()
export class SysUsersService {

  constructor(
    @InjectRepository(SysUsersView)
    private readonly mdlView: Repository<SysUsersView>,
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

  async getRecord(recid: string): Promise<SysUsersView> {
    const record = await this.mdlView.findOneBy({ id_user: recid });
    if (!record) {
      throw new NotFoundException('record not found!');
    }
    return record;
  }
  
}
