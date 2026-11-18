import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PaginationData, PaginationUtil } from '../utils/pagination.util';
import { SysEBLookUpView } from '../models/sys_eblookup.entity';

export interface SysEBLookupDetail {
  main_list: string;
  link_name: string;
  items: string | null;
}

export interface SysEBLookupPage extends PaginationData {
  records: SysEBLookUpView[];
}

@Injectable()
export class SysEBLookUpService {

  constructor(
    @InjectRepository(SysEBLookUpView)
    private readonly mdlView: Repository<SysEBLookUpView>,
  ) {}

  async getRecords(page: number, pageSize: number): Promise<SysEBLookupPage> {

    const total      = await this.mdlView.count();
    const pagination = PaginationUtil.create(page, pageSize, total);
    const records  = await this.mdlView.find({
      order: { id_item: 'ASC', item_narrative: 'ASC' },
      skip: pagination.skip,
      take: pageSize,
    });
  
    return PaginationUtil.withData(pagination, { records });
  }

  async getRecord(recid: string): Promise<SysEBLookUpView> {
    const customer = await this.mdlView.findOneBy({ id_item: recid });
    if (!customer) {
      throw new NotFoundException(`record not found!`);
    }
    return customer;
  }

  async getListSummary(page: number, pageSize: number): Promise<PaginationData & { records: SysEBLookupDetail[] }> {

    const [{ total }] = await this.mdlView.query(
      `SELECT COUNT(*) AS total
       FROM (
         SELECT (string_to_array(id_item, '*'))[1] AS main_list, item_link
         FROM vw_sys_eblookup
         GROUP BY (string_to_array(id_item, '*'))[1], item_link
       ) AS grouped_lists`,
    );
    
    const pagination = PaginationUtil.create(page, pageSize, Number(total));

    const records: SysEBLookupDetail[] = await this.mdlView.query(
      `SELECT
         (string_to_array(id_item, '*'))[1] AS main_list,
         item_link AS link_name,
         string_agg(item_narrative, ', ') AS items
       FROM vw_sys_eblookup
       GROUP BY (string_to_array(id_item, '*'))[1], item_link
       ORDER BY (string_to_array(id_item, '*'))[1], item_link
       LIMIT $1 OFFSET $2`,
      [ pageSize, pagination.skip ],
    );

    return PaginationUtil.withData(pagination, { records });
  }

  async getListDetail(page: number, pageSize: number): Promise<PaginationData & { records: SysEBLookupDetail[] }> {

    const [{ total }] = await this.mdlView.query(
      `SELECT COUNT(*) AS total
       FROM (
         SELECT (string_to_array(id_item, '*'))[1] AS main_list, item_link
         FROM vw_sys_eblookup
         GROUP BY (string_to_array(id_item, '*'))[1], item_link
       ) AS grouped_lists`,
    );

    const pagination = PaginationUtil.create(page, pageSize, Number(total));

    const records: SysEBLookupDetail[] = await this.mdlView.query(
      `SELECT
         (string_to_array(id_item, '*'))[1] AS main_list,
         item_link AS link_name,
         string_agg(item_narrative, ', ') AS items
       FROM vw_sys_eblookup
       GROUP BY (string_to_array(id_item, '*'))[1], item_link
       ORDER BY (string_to_array(id_item, '*'))[1], item_link
       LIMIT $1 OFFSET $2`,
      [ pageSize, pagination.skip ],
    );

    return PaginationUtil.withData(pagination, { records });
  }

}
