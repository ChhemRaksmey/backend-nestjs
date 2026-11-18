import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { QueryFailedError, Repository } from 'typeorm';
import { PaginationData, PaginationUtil } from '../utils/pagination.util';
import { SysApplicationsView } from '../models/sys_applications.entity';

export interface CustomerPage extends PaginationData {
  records: SysApplicationsView[];
}

@Injectable()
export class SysApplicationsService {

  constructor(
    @InjectRepository(SysApplicationsView)
    private readonly mdlView: Repository<SysApplicationsView>,
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

  async getRecord(recid: string): Promise<SysApplicationsView> {
    const customer = await this.mdlView.findOneBy({ id_module: recid });
    if (!customer) {
      throw new NotFoundException(`record not found!`);
    }
    return customer;
  }
  
}
