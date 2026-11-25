import {
  Controller, Render,
  Get, Post,
  Req, Res, Body, Query, Param, 
} from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { Response } from 'express';
import { PaginationUtil } from '../utils/pagination.util';
import { SysApplicationsService } from '../services/sys_applications.service';
import { SysModulesService } from '../services/sys_modules.service';
import { ValidateCreate } from '../models/sys_applications.entity';

const routes = {
  baseurl   : '/core-system/applications',
  create    : '/create',
  update    : '/update/:recid',
  view      : '/view/',
  authorize : '/authorize/:recid',
} as const;

const views = {
  listing   : 'sys_applications/listing',
  create    : 'sys_applications/create',
  update    : 'sys_applications/edit',
  view      : 'sys_applications/view',
  authorize : 'sys_applications/authorize',
} as const;

@Controller([routes.baseurl])
export class SysApplicationsController {

  private readonly pageTitle = "System Applications";
  private readonly pageDscr = "Define all applications under modules and actions of application.";
  private readonly pageSize = 10;
  
  constructor(
    private readonly service: SysApplicationsService,
    private readonly srvModule: SysModulesService
  ) {}

  @Get()
  @Render(views.listing)
  async pageListing(
    @Query('msg') msg?: string,
    @Query('page') pageParam?: string,
    @Query('filter-search') filterSearch?: string,
    @Query('filter-module') filterModule?: string,
    @Query('filter-status') filterStatus?: string,
  ) {

    const list_modules = await this.srvModule.getRecords(PaginationUtil.parsePage(pageParam), this.pageSize, '', 'Y');

    const records = await this.service.getRecords(
      PaginationUtil.parsePage(pageParam),
      this.pageSize,
      filterSearch ?? '',
      filterModule ?? '',
      filterStatus ?? 'Y',
    );

    return PaginationUtil.withData(
      records, {
        pageTitle: this.pageTitle,
        pageDscr: this.pageDscr,
        baseurl: routes.baseurl,
        msg: msg,
        list_modules: list_modules,
        filterSearch: filterSearch ?? '',
        filterModule: filterModule ?? '',
        filterStatus: filterStatus ?? 'Y',
      })
    ;
  }

  @Get(routes.create)
  @Render(views.create)
  async pageCreate(@Query('page') pageParam?: string) {

    const list_modules = await this.srvModule.getRecords(PaginationUtil.parsePage(pageParam), this.pageSize, '', 'Y');

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
      list_modules: list_modules,
    };
  }

  @Get(routes.update)
  @Render(views.update)
  async pageUpdate(@Param('recid') recid: string) {
    const record = await this.service.getRecord(recid);
    const list_modules = await this.srvModule.getRecords(
      1,
      this.pageSize,
      '',
      'Y',
    );
    return {
      pageTitle: this.pageTitle,
      pageDscr: this.pageDscr,
      baseurl: routes.baseurl,
      values: record,
      errors: {},
      msg: '',
      list_modules,
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
      id_module     : body.id_module ?? '',
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
      const list_modules = await this.srvModule.getRecords(
        1,
        this.pageSize,
        '',
        'Y',
      );
      response.status(422).render(views.create, {
        pageTitle: this.pageTitle,
        pageDscr: this.pageDscr,
        baseurl: routes.baseurl,
        values,
        errors,
        msg: '',
        list_modules,
      });
      return;
    }

    const recid = `APP.${Date.now()}`;
    await this.service.create({
      recid,
      id_module: String(values.id_module),
      full_name: String(values.full_name),
      base_url: String(values.base_url),
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
      id_module     : body.id_module ?? '',
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
      const list_modules = await this.srvModule.getRecords(1,this.pageSize,'','Y',);
      response.status(422).render(views.update, {
        pageTitle: this.pageTitle,
        pageDscr: this.pageDscr,
        baseurl: routes.baseurl,
        values: {
          ...values,
          id_application: recid,
        },
        errors,
        msg: '',
        list_modules,
      });
      return;
    }

    await this.service.update(recid, {
      id_module: String(values.id_module),
      full_name: String(values.full_name),
      base_url: String(values.base_url),
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
