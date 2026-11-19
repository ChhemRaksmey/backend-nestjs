import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PaginationData, PaginationUtil } from '../utils/pagination.util';
import { SysApplicationsView } from '../models/sys_applications.entity';

export interface CustomerPage extends PaginationData {
  records: SysApplicationsView[];
}

@Injectable()
export class SysApplicationsService {
  private sidebarItems: SysApplicationsView[] | undefined;
  private sidebarItemsPromise: Promise<SysApplicationsView[]> | undefined;

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

  async getSidebarItems(): Promise<SysApplicationsView[]> {
    if (this.sidebarItems !== undefined) {
      return this.sidebarItems;
    }

    let pending = this.sidebarItemsPromise;
    if (!pending) {
      pending = this.mdlView.find({
        select: {
          id_module: true,
          module_full_name: true,
          id_application: true,
          full_name: true,
          base_url: true,
        },
        where: { enable_status: 'Y' },
        order: { id_module: 'ASC', full_name: 'ASC' },
      });
      this.sidebarItemsPromise = pending;
    }

    try {
      const items = await pending;
      this.sidebarItems = items;
      return items;
    } finally {
      if (this.sidebarItemsPromise === pending) {
        this.sidebarItemsPromise = undefined;
      }
    }
  }

  async getRecord(recid: string): Promise<SysApplicationsView> {
    const customer = await this.mdlView.findOneBy({ id_module: recid });
    if (!customer) {
      throw new NotFoundException(`record not found!`);
    }
    return customer;
  }
  
}
