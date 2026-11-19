import {
  Controller, BadRequestException,
  Query, Body, Res,
  Get, Post,
} from '@nestjs/common';
import { Response } from 'express';
import { PaginationUtil } from '../utils/pagination.util';
import { SysUsersService } from '../services/sys_users.service';

const routes = {
  baseurl: '/core-system/users',
} as const;

const views = {
  listing: 'sys_users/listing',
  create: 'sys_users/create',
  update: 'sys_users/edit',
  view: 'sys_users/view',
  authorize: 'sys_users/authorize',
} as const;

@Controller([routes.baseurl])
export class SysUsersController {

  private readonly pageTitle = 'System Users';
  private readonly pageDscr = 'Create and mantenance system user info.';
  private readonly pageSize = 10;

  constructor(private readonly service: SysUsersService) {}

  @Get()
  async submitGet(
    @Res() response: Response,
    @Query('client-action') action?: string,
    @Query('recid') recid?: string,
    @Query('msg') msg?: string,
    @Query('page') pageParam?: string,
  ): Promise<void> {
    switch (action ?? 'listing') {
      case 'page-create'  : this.pageCreate(response); return;
      case 'page-update'  : await this.pageUpdate(response, recid); return;
      case 'page-view'    : await this.pageView(response, recid); return;
      case 'page-approve' : 
      case 'page-delete'  : await this.pageAuthorize(response, recid); return;
      default: await this.pageListing(response, msg, pageParam); return;
    }
  }

  @Post()
  async submitPost(
    @Body() body: Record<string, unknown>,
    @Res() response: Response,
  ): Promise<void> {
    const action = this.getClientAction(body);

    switch (action) {
      case 'cancel': response.redirect(routes.baseurl); return;
      case 'submit-create'  : this.saveCreate(response, body); return;
      case 'submit-update'  : this.saveUpdate(response, body); return;
      case 'submit-approve' : await this.saveApprove(response, body); return;
      case 'submit-delete'  : await this.saveDelete(response, body); return;
      default: throw new BadRequestException('A supported client-action is required.');
    }
  }

  private async pageListing(
    response: Response,
    msg?: string,
    pageParam?: string,
  ): Promise<void> {
    const records = await this.service.getRecords(
      PaginationUtil.parsePage(pageParam),
      this.pageSize,
    );

    response.render(
      views.listing,
      PaginationUtil.withData(records, this.pageData(msg ?? '')),
    );
  }

  private pageCreate(response: Response): void {
    response.render(views.create, {
      ...this.pageData(),
      oldvalue: this.emptyUserValues(),
    });
  }

  private async pageUpdate(response: Response, recid?: string): Promise<void> {
    const record = await this.service.getRecord(this.requireRecid(recid));
    response.render(views.update, {
      ...this.pageData(),
      oldvalue: record,
    });
  }

  private async pageView(response: Response, recid?: string): Promise<void> {
    const record = await this.service.getRecord(this.requireRecid(recid));
    response.render(views.view, {
      ...this.pageData(),
      oldvalue: record,
    });
  }

  private async pageAuthorize(response: Response, recid?: string): Promise<void> {
    const record = await this.service.getRecord(this.requireRecid(recid));
    response.render(views.authorize, {
      ...this.pageData(),
      oldvalue: record,
    });
  }

  private saveCreate(
    response: Response,
    body: Record<string, unknown>,
  ): void {
    response.redirect(routes.baseurl +"?msg=record had been create");
    return;
  }

  private saveUpdate(
    response: Response,
    body: Record<string, unknown>,
  ): void {
    
    const recid = this.requireRecid(
      typeof body.recid === 'string' ? body.recid : undefined,
    );

    response.redirect(
      `${routes.baseurl}?client-action=page-view&recid=${encodeURIComponent(recid)}`,
    );
    return;
  }

  private async saveDelete(
    response: Response,
    body: Record<string, unknown>,
  ): Promise<void> {
    response.redirect(routes.baseurl +"?msg=unauthorize record had been deleted");
    return;
  }
  
  private async saveApprove(
    response: Response,
    body: Record<string, unknown>,
  ): Promise<void> {
    response.redirect(routes.baseurl +"?msg=record had been approved");
    return;
  }

  private pageData(msg = '') {
    return {
      pageTitle: this.pageTitle,
      pageDscr: this.pageDscr,
      baseurl: routes.baseurl,
      errors: {},
      msg,
    };
  }

  private emptyUserValues() {
    return {
      staff_id: '',
      signon_name: '',
      full_name: '',
      id_branch: '',
      date_start: '',
      date_end: '',
      time_start: '00:00',
      time_end: '23:45',
      id_privilege: '',
    };
  }

  private getClientAction(body: Record<string, unknown>): string {
    return typeof body['client-action'] === 'string'
      ? body['client-action']
      : '';
  }

  private requireRecid(recid?: string): string {
    if (!recid) {
      throw new BadRequestException('recid is required for this request.');
    }
    return recid;
  }

}
