import {
  Controller, Render,
  Get, Post,
  Req, Res, Body, Query, Param, 
} from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { Response } from 'express';
import { PaginationUtil } from '../utils/pagination.util';
import { SysModulesService } from '../services/sys_modules.service';
import { ValidateCreate } from '../models/sys_modules.entity';

const routes = {
  baseurl   : '/core-system/modules',
  create    : '/create',
  update    : '/update/:recid',
  view      : '/view/',
  authorize : '/authorize/:recid',
} as const;

const views = {
  listing   : 'sys_modules/listing',
  create    : 'sys_modules/create',
  update    : 'sys_modules/edit',
  view      : 'sys_modules/view',
  authorize : 'sys_modules/authorize',
} as const;

@Controller([routes.baseurl])
export class SysModulesController {

  private readonly pageTitle = "System Modules";
  private readonly pageDscr = "Define the main module of each applications.";
  private readonly pageSize = 10;
  
  constructor(private readonly service: SysModulesService) {}

  @Get()
  @Render(views.listing)
  async pageListing(
    @Query('msg') msg?: string,
    @Query('page') pageParam?: string
  ) {

    const records = await this.service.getRecords(
      PaginationUtil.parsePage(pageParam),
      this.pageSize,
    );

    return PaginationUtil.withData(
      records, {
        pageTitle: this.pageTitle,
        pageDscr: this.pageDscr,
        baseurl: routes.baseurl,
        msg: msg
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
        full_name: '',
        base_url: '',
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
      full_name     : body.full_name ?? '',
      base_url      : body.base_url ?? '',
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
      full_name     : body.full_name ?? '',
      base_url      : body.base_url ?? '',
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
