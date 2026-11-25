import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Brackets, QueryFailedError, Repository } from 'typeorm';
import { PaginationData, PaginationUtil } from '../utils/pagination.util';
import { SysApplication, SysApplicationsView } from '../models/sys_applications.entity';

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
    @InjectRepository(SysApplication)
    private readonly mdlTable: Repository<SysApplication>,
  ) {}

  async getRecords(
      page: number,
      pageSize: number,
      filterSearch = '',
      filterModule = '',
      filterStatus = 'Y',
    ): Promise<CustomerPage> {

      const id_module = filterModule.trim();
      const search    = filterSearch.trim();
      const status    = filterStatus.trim();
  
      const createFilteredQuery = () => {
        const qusery = this.mdlView.createQueryBuilder('records');
  
        if (id_module) {
          qusery.andWhere('records.id_module = :id_module', { id_module });
        }

        if (status) {
          qusery.andWhere('records.enable_status = :status', { status });
        }
  
        if (search) {
          const searchValue = `%${search}%`;
          qusery.andWhere(new Brackets((where) => {
            where
              .where('records.id_application = :exactSearch', { exactSearch: search })
              .orWhere('records.full_name ILIKE :search', { search: searchValue })
              .orWhere('records.base_url ILIKE :search', { search: searchValue });
          }));
        }
  
        return qusery;
      };
  
      const total = await createFilteredQuery().getCount();
      const pagination = PaginationUtil.create(page, pageSize, total);
      const records = await createFilteredQuery()
        .orderBy('records.full_name', 'ASC')
        .skip(pagination.skip)
        .take(pageSize)
        .getMany()
      ;
    
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
    const customer = await this.mdlView.findOneBy({ id_application: recid });
    if (!customer) {
      throw new NotFoundException(`record not found!`);
    }
    return customer;
  }

  async create(data: {
    recid: string;
    id_module: string;
    full_name: string;
    base_url: string;
    enable_status: string;
  }): Promise<SysApplication> {
    const existing = await this.mdlTable.findOneBy({ recid: data.recid });
    if (existing) {
      throw new ConflictException(`Record ${data.recid} already exists`);
    }

    return this.mdlTable.save(this.mdlTable.create({
      recid: data.recid,
      jsonData: {
        recid: data.recid,
        c1: data.id_module,
        c2: data.full_name,
        c3: data.base_url,
        c4: [],
        c5: data.enable_status,
      },
      jsonAudit: null,
    }));
  }

  async update(recid: string, data: {
    id_module: string;
    full_name: string;
    base_url: string;
    enable_status: string;
  }): Promise<SysApplication> {
    const record = await this.mdlTable.findOneBy({ recid });
    if (!record) {
      throw new NotFoundException(`Record ${recid} not found`);
    }

    record.jsonData = {
      recid,
      c1: data.id_module,
      c2: data.full_name,
      c3: data.base_url,
      c4: Array.isArray(record.jsonData?.c4) ? record.jsonData.c4 : [],
      c5: data.enable_status,
    };
    return this.mdlTable.save(record);
  }
  
}
