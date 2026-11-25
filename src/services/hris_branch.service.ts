import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PaginationData, PaginationUtil } from '../utils/pagination.util';
import { HrisBranch, HrisBranchView } from '../models/hris_branch.entity';

export interface CustomerPage extends PaginationData {
  records: HrisBranchView[];
}

@Injectable()
export class HrisBranchService {
  private sidebarItems: HrisBranchView[] | undefined;
  private sidebarItemsPromise: Promise<HrisBranchView[]> | undefined;

  constructor(
    @InjectRepository(HrisBranchView)
    private readonly mdlView: Repository<HrisBranchView>,
    @InjectRepository(HrisBranch)
    private readonly mdlTable: Repository<HrisBranch>,
  ) {}

  async getOptions(): Promise<Array<{ id_branch: string; full_name: string }>> {
    const records = await this.mdlTable.find({ order: { recid: 'ASC' } });
    return records
      .filter((record) => record.jsonData?.c4 !== 'N')
      .map((record) => ({
        id_branch: record.recid,
        full_name: String(record.jsonData?.c2 ?? record.recid),
      }));
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

  async getSidebarItems(): Promise<HrisBranchView[]> {
    if (this.sidebarItems !== undefined) {
      return this.sidebarItems;
    }

    let pending = this.sidebarItemsPromise;
    if (!pending) {
      pending = this.mdlView.find({
        select: {
          id_branch: true,
          short_name: true,
          full_name: true,
          branch_type: true,
        },
        where: { enable_status: 'Y' },
        order: { id_branch: 'ASC', full_name: 'ASC' },
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

  async getRecord(recid: string): Promise<HrisBranchView> {
    const customer = await this.mdlView.findOneBy({ id_branch: recid });
    if (!customer) {
      throw new NotFoundException(`record not found!`);
    }
    return customer;
  }

  async create(data: {
    recid: string;
    short_name: string;
    full_name: string;
    branch_type: string;
    enable_status: string;
  }): Promise<HrisBranch> {
    if (await this.mdlTable.findOneBy({ recid: data.recid })) {
      throw new ConflictException(`Record ${data.recid} already exists`);
    }
    return this.mdlTable.save(this.mdlTable.create({
      recid: data.recid,
      jsonData: {
        recid: data.recid,
        c1: data.short_name,
        c2: data.full_name,
        c3: data.branch_type,
        c4: data.enable_status,
      },
      jsonAudit: null,
    }));
  }

  async update(recid: string, data: {
    short_name: string;
    full_name: string;
    branch_type: string;
    enable_status: string;
  }): Promise<HrisBranch> {
    const record = await this.mdlTable.findOneBy({ recid });
    if (!record) throw new NotFoundException(`Record ${recid} not found`);
    record.jsonData = {
      recid,
      c1: data.short_name,
      c2: data.full_name,
      c3: data.branch_type,
      c4: data.enable_status,
    };
    return this.mdlTable.save(record);
  }
  
}
