import {
  Controller, Render,
  Get, Post,
  Req, Res, Body, Query, Param, 
} from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { Response } from 'express';
import { PaginationUtil } from '../utils/pagination.util';
import { SysEBLookUpService } from '../services/sys_eblookup.service';
import { ValidateCreate } from '../models/sys_eblookup.entity';

const routes = {
  baseurl   : '/core-system/eb-lookup',
  create    : '/create',
  update    : '/update/:recid',
  view      : '/view/',
  authorize : '/authorize/:recid',
} as const;

const views = {
  listing   : 'sys_eblookup/listing',
  create    : 'sys_eblookup/create',
  update    : 'sys_eblookup/edit',
  view      : 'sys_eblookup/view',
  authorize : 'sys_eblookup/authorize',
} as const;

@Controller([routes.baseurl])
export class SysEBLookUpController {

  private readonly pageTitle = "System EB Lookup";
  private readonly pageDscr = "Define All system group of listing and listing items in one place.";
  private readonly pageSize = 10;
  
  constructor(private readonly service: SysEBLookUpService) {}

  @Get()
  @Render(views.listing)
  async pageListing(
    @Query('msg') msg?: string,
    @Query('page') pageParam?: string,
    @Query('filter-search') filterSearch?: string,
    @Query('filter-status') filterStatus?: string,
  ) {

    const records = await this.service.getRecords(
      PaginationUtil.parsePage(pageParam),
      this.pageSize,
      filterSearch ?? '',
      filterStatus ?? 'Y',
    );

    return PaginationUtil.withData(
      records, {
        pageTitle: this.pageTitle,
        pageDscr: this.pageDscr,
        baseurl: routes.baseurl,
        msg,
        filterSearch: filterSearch ?? '',
        filterStatus: filterStatus ?? 'Y',
      })
    ;
  }

  @Get(routes.create)
  @Render(views.create)
  pageCreate() {
    return {
      pageTitle: this.pageTitle,
      pageDscr: this.pageDscr,
      baseurl: routes.baseurl,
      values: {
        item_link: '',
        item_narrative: '',
        enable_status: 'Y',
      },
      errors: {},
      msg: '',
    };
  }

  @Get(routes.update)
  @Render(views.update)
  async pageUpdate(@Param('recid') recid: string) {
    const record = await this.service.getRecord(recid);
    return {
      pageTitle: this.pageTitle,
      pageDscr: this.pageDscr,
      baseurl: routes.baseurl,
      values: record,
      errors: {},
      msg: '',
    };
  }

  @Get(routes.view + ":recid")
  @Render(views.view)
  async pageview(@Param('recid') recid: string) {
    const record = await this.service.getRecord(recid);
    return {
      pageTitle: this.pageTitle,
      pageDscr: this.pageDscr,
      baseurl: routes.baseurl,
      values: record,
      errors: {},
      msg: '',
    };
  }

  @Get(routes.authorize)
  @Render(views.authorize)
  async pageAuthorize(@Param('recid') recid: string,) {
    const record = await this.service.getRecord(recid);
    return {
      pageTitle: this.pageTitle,
      pageDscr: this.pageDscr,
      baseurl: routes.baseurl,
      values: record,
      errors: {},
      msg: '',
    };
  }
  
  @Post(routes.create)
  async submitCreate(
    @Body() body: Record<string, unknown>,
    @Res() response: Response,
  ): Promise<void> {

    if (body['client-submt'] === 'cancel') {
      response.redirect(routes.baseurl);
      return;
    }

    const values = {
      item_link     : body.item_link ?? '',
      item_narrative: body.item_narrative ?? '',
      enable_status : body.enable_status ?? '',
    };
    const submitform = plainToInstance(ValidateCreate, values);
    const validationErrors = await validate(submitform);
    const errors: Record<string, string[]> = {};

    for (const validationError of validationErrors) {
      errors[validationError.property] = Object.values(
        validationError.constraints ?? {},
      );
    }

    if (Object.keys(errors).length > 0) {
      response.status(422).render(views.create, {
        pageTitle: this.pageTitle,
        pageDscr: this.pageDscr,
        baseurl: routes.baseurl,
        values,
        errors,
        msg: '',
      });
      return;
    }

    const recid = `EB.${Date.now()}`;
    await this.service.create({
      recid,
      item_link: String(values.item_link),
      item_narrative: String(values.item_narrative),
      enable_status: String(values.enable_status),
    });

    response.redirect(routes.baseurl + '?msg=record success created');
    return;
  }

  @Post(routes.update)
  async submitUpdate(
    @Param('recid') recid: string,
    @Body() body: Record<string, unknown>,
    @Res() response: Response,
  ): Promise<void> {

    if (body['client-submt'] === 'cancel') {
      response.redirect(routes.baseurl);
      return;
    }

    const values = {
      item_link     : body.item_link ?? '',
      item_narrative: body.item_narrative ?? '',
      enable_status : body.enable_status ?? '',
    };
    const submitform = plainToInstance(ValidateCreate, values);
    const validationErrors = await validate(submitform);
    const errors: Record<string, string[]> = {};

    for (const validationError of validationErrors) {
      errors[validationError.property] = Object.values(
        validationError.constraints ?? {},
      );
    }

    if (Object.keys(errors).length > 0) {
      response.status(422).render(views.update, {
        pageTitle: this.pageTitle,
        pageDscr: this.pageDscr,
        baseurl: routes.baseurl,
        values: {
          ...values,
          id_item: recid,
        },
        errors,
        msg: '',
      });
      return;
    }

    await this.service.update(recid, {
      item_link: String(values.item_link),
      item_narrative: String(values.item_narrative),
      enable_status: String(values.enable_status),
    });

    response.redirect(routes.baseurl + routes.view + recid);
    return;
  }

  @Post(routes.authorize)
  async submitAuthorize(
    @Param('recid') recid: string,
    @Body() body: Record<string, unknown>,
    @Res() response: Response,
  ): Promise<void> {

    const cleint_action = body['client-submt'] ?? '';

    if (cleint_action === 'cancel') {
      response.redirect(routes.baseurl);
      return;
    }

    const label = cleint_action === "submit-approve" ? "Approved" : "Deleted";

    response.redirect(routes.baseurl + '?msg=record success '+ label);
    return;
  }
  
}
