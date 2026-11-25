import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Brackets, QueryFailedError, Repository } from 'typeorm';
import { PaginationData, PaginationUtil } from '../utils/pagination.util';
import { mdSysModules, SysModule } from '../models/sys_modules.entity';

export interface CustomerPage extends PaginationData {
  records: mdSysModules[];
}

@Injectable()
export class SysModulesService {

  constructor(
    @InjectRepository(mdSysModules)
    private readonly mdlView: Repository<mdSysModules>,
    @InjectRepository(SysModule)
    private readonly mdlTable: Repository<SysModule>,
  ) {}

  async getRecords(
    page: number,
    pageSize: number,
    filterSearch = '',
    filterStatus = 'Y',
  ): Promise<CustomerPage> {
    const search = filterSearch.trim();
    const status = filterStatus.trim();

    const createFilteredQuery = () => {
      const qusery = this.mdlView.createQueryBuilder('module');

      if (status) {
        qusery.andWhere('module.enable_status = :status', { status });
      }

      if (search) {
        const searchValue = `%${search}%`;
        qusery.andWhere(new Brackets((where) => {
          where
            .where('module.id_module = :exactSearch', { exactSearch: search })
            .orWhere('module.full_name ILIKE :search', { search: searchValue })
            .orWhere('module.base_url ILIKE :search', { search: searchValue });
        }));
      }

      return qusery;
    };

    const total = await createFilteredQuery().getCount();
    const pagination = PaginationUtil.create(page, pageSize, total);
    const records = await createFilteredQuery()
      .orderBy('module.full_name', 'ASC')
      .skip(pagination.skip)
      .take(pageSize)
      .getMany();
  
    return PaginationUtil.withData(pagination, { records });
  }

  async getRecord(recid: string): Promise<mdSysModules> {
    const customer = await this.mdlView.findOneBy({ id_module: recid });
    if (!customer) {
      throw new NotFoundException(`record not found!`);
    }
    return customer;
  }

  async create(data: {
    recid: string;
    full_name: string;
    base_url: string;
    enable_status: string;
  }): Promise<SysModule> {
    const existing = await this.mdlTable.findOneBy({ recid: data.recid });
    if (existing) {
      throw new ConflictException(`Record ${data.recid} already exists`);
    }

    const record = this.mdlTable.create({
      recid: data.recid,
      jsonData: {
        recid: data.recid,
        c1: data.full_name,
        c2: data.base_url,
        c3: data.enable_status,
      },
      jsonAudit: null,
    });

    try {
      return await this.mdlTable.save(record);
    } catch (error) {
      if (error instanceof QueryFailedError) {
        throw new ConflictException(`Record ${data.recid} could not be created`);
      }
      throw error;
    }
  }

  async update(recid: string, data: {
    full_name: string;
    base_url: string;
    enable_status: string;
  }): Promise<SysModule> {
    const record = await this.mdlTable.findOneBy({ recid });
    if (!record) {
      throw new NotFoundException(`Record ${recid} not found`);
    }

    record.jsonData = {
      recid,
      c1: data.full_name,
      c2: data.base_url,
      c3: data.enable_status,
    };

    return this.mdlTable.save(record);
  }
  
}
