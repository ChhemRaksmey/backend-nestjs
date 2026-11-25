import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PaginationData, PaginationUtil } from '../utils/pagination.util';
import { SysEBLookup, SysEBLookUpView } from '../models/sys_eblookup.entity';

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
    @InjectRepository(SysEBLookup)
    private readonly mdlTable: Repository<SysEBLookup>,
  ) {}

  async getRecords(
    page: number,
    pageSize: number,
    filterSearch = '',
    filterStatus = 'Y',
  ): Promise<SysEBLookupPage> {
    const search = filterSearch.trim().toLowerCase();
    const status = filterStatus.trim();

    const tableRecords = await this.mdlTable.find({
      order: { recid: 'ASC' },
    });
    const records: SysEBLookUpView[] = tableRecords
      .map((item) => ({
        id_item: item.recid,
        item_link: String(item.jsonData?.c1 ?? ''),
        item_narrative: String(item.jsonData?.c2 ?? ''),
        enable_status: String(item.jsonData?.c3 ?? ''),
      }))
      .filter((item) => {
        if (status && item.enable_status !== status) {
          return false;
        }
        if (search) {
          return (
            item.id_item.toLowerCase().includes(search) ||
            item.item_link.toLowerCase().includes(search) ||
            item.item_narrative.toLowerCase().includes(search)
          );
        }
        return true;
      })
      .sort((a, b) =>
        a.id_item.localeCompare(b.id_item) ||
        a.item_narrative.localeCompare(b.item_narrative),
      );

    const pagination = PaginationUtil.create(page, pageSize, records.length);
    const pagedRecords = records.slice(pagination.skip, pagination.skip + pageSize);
  
    return PaginationUtil.withData(pagination, { records: pagedRecords });
  }

  async getRecord(recid: string): Promise<SysEBLookUpView> {
    const record = await this.mdlTable.findOneBy({ recid });
    if (!record) {
      throw new NotFoundException(`record not found!`);
    }
    return {
      id_item: record.recid,
      item_link: String(record.jsonData?.c1 ?? ''),
      item_narrative: String(record.jsonData?.c2 ?? ''),
      enable_status: String(record.jsonData?.c3 ?? ''),
    };
  }

  async create(data: {
    recid: string;
    item_link: string;
    item_narrative: string;
    enable_status: string;
  }): Promise<SysEBLookup> {
    if (await this.mdlTable.findOneBy({ recid: data.recid })) {
      throw new ConflictException(`Record ${data.recid} already exists`);
    }
    return this.mdlTable.save(this.mdlTable.create({
      recid: data.recid,
      jsonData: {
        recid: data.recid,
        c1: data.item_link,
        c2: data.item_narrative,
        c3: data.enable_status,
      },
      jsonAudit: null,
    }));
  }

  async update(recid: string, data: {
    item_link: string;
    item_narrative: string;
    enable_status: string;
  }): Promise<SysEBLookup> {
    const record = await this.mdlTable.findOneBy({ recid });
    if (!record) {
      throw new NotFoundException(`Record ${recid} not found`);
    }
    record.jsonData = {
      recid,
      c1: data.item_link,
      c2: data.item_narrative,
      c3: data.enable_status,
    };
    return this.mdlTable.save(record);
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
