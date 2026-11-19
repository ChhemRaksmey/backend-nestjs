import {
  Controller, BadRequestException,
  Query, Body, Res, Get, Post,
} from '@nestjs/common';
import type { ClassConstructor } from 'class-transformer';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { Response } from 'express';
import { PaginationUtil } from '../utils/pagination.util';
import { SysUsersService } from '../services/sys_users.service';
import { ValidateCreate, ValidateEdit, ValidateResetPassword } from '../models/sys_users.entity';
import { getClientAction, getCheckSubmitRecid, getValidateForm, getFormMianInfo } from '../utils/form_check';

const routes = {
  baseurl: '/core-system/users',
} as const;

const views = {
  listing: 'sys_users/listing',
  create: 'sys_users/create',
  update: 'sys_users/edit',
  reset_password: 'sys_users/reset_password',
  view: 'sys_users/view',
  authorize: 'sys_users/authorize',
} as const;

@Controller([routes.baseurl])
export class SysUsersController {

  private readonly pageSize = 10;
  private readonly pageinfo = {
    pageTitle: 'System Users',
    pageDscr: 'Create and mantenance system user info.',
    baseurl: routes.baseurl,
  };

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
      case 'page-create'         : this.pageCreate(response); return;
      case 'page-update'         : await this.pageUpdate(response, recid); return;
      case 'page-reset-password' : await this.pageResetPassword(response, recid); return;
      case 'page-view'           : await this.pageView(response, recid); return;
      case 'page-authorize'      : await this.pageAuthorize(response, recid); return;
      default: await this.pageListing(response, msg, pageParam); return;
    }
  }

  @Post()
  async submitPost(
    @Body() body: Record<string, unknown>,
    @Res() response: Response,
  ): Promise<void> {
    const action = getClientAction(body);

    switch (action) {
      case 'cancel': response.redirect(routes.baseurl); return;
      case 'submit-create'         : await this.saveCreate(response, body); return;
      case 'submit-update'         : await this.saveUpdate(response, body); return;
      case 'submit-reset-password' : await this.saveResetPassword(response, body); return;
      case 'submit-approve'        : await this.saveApprove(response, body); return;
      case 'submit-delete'         : await this.saveDelete(response, body); return;
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
      PaginationUtil.withData(
        records,
        getFormMianInfo(msg ?? '', this.pageinfo),
      ),
    );
  }

  private pageCreate(response: Response): void {
    response.render(views.create, {
      ...getFormMianInfo('', this.pageinfo),
      oldvalue: this.emptyUserValues(),
    });
  }

  private async pageUpdate(response: Response, recid?: string): Promise<void> {
    const record = await this.service.getRecord(getCheckSubmitRecid(recid));
    response.render(views.update, {
      ...getFormMianInfo('', this.pageinfo),
      oldvalue: record,
    });
  }

  private async pageResetPassword(response: Response, recid?: string): Promise<void> {
    const record = await this.service.getRecord(getCheckSubmitRecid(recid));
    response.render(views.reset_password, {
      ...getFormMianInfo('', this.pageinfo),
      oldvalue: record,
    });
  }

  private async pageView(response: Response, recid?: string): Promise<void> {
    const record = await this.service.getRecord(getCheckSubmitRecid(recid));
    response.render(views.view, {
      ...getFormMianInfo('', this.pageinfo),
      oldvalue: record,
    });
  }

  private async pageAuthorize(response: Response, recid?: string): Promise<void> {
    const record = await this.service.getRecord(getCheckSubmitRecid(recid));
    response.render(views.authorize, {
      ...getFormMianInfo('', this.pageinfo),
      oldvalue: record,
    });
  }

  private async saveCreate(
    response: Response,
    body: Record<string, unknown>,
  ): Promise<void> {

    const submitform = {
      staff_id: body.staff_id ?? '',
      signon_name: body.signon_name ?? '',
      full_name: body.full_name ?? '',
      id_branch: body.id_branch ?? '',
      date_start: body.date_start ?? '',
      date_end: body.date_end ?? '',
      time_start: body.time_start ?? '',
      time_end: body.time_end ?? '',
      id_privilege: body.id_privilege ?? '',
    };
    const errors = await getValidateForm(submitform, ValidateCreate);

    if (Object.keys(errors).length > 0) {
      response.status(422).render(views.create, {
        ...getFormMianInfo('', this.pageinfo),
        oldvalue: submitform,
        errors,
      });
      return;
    }

    response.redirect(routes.baseurl +"?msg=record had been create");
    return;
  }

  private async saveUpdate(
    response: Response,
    body: Record<string, unknown>,
  ): Promise<void> {

    const recid = getCheckSubmitRecid(
      typeof body.recid === 'string' ? body.recid : undefined,
    );

    const submitform = {
      id_user      : body.recid ?? '',
      staff_id     : body.staff_id ?? '',
      signon_name  : body.signon_name ?? '',
      full_name    : body.full_name ?? '',
      id_branch    : body.id_branch ?? '',
      date_start   : body.date_start ?? '',
      date_end     : body.date_end ?? '',
      time_start   : body.time_start ?? '',
      time_end     : body.time_end ?? '',
      id_privilege : body.id_privilege ?? '',
    };
    const errors = await getValidateForm(submitform, ValidateEdit);
    const oldvalue = { ...submitform, id_user: recid };

    if (Object.keys(errors).length > 0) {
      response.status(422).render(views.update, {
        ...getFormMianInfo('', this.pageinfo),
        oldvalue,
        errors,
      });
      return;
    }

    response.redirect(`${routes.baseurl}?client-action=page-view&recid=${recid}`);
    return;
  }
  
  private async saveResetPassword(
    response: Response,
    body: Record<string, unknown>,
  ): Promise<void> {

    const recid = getCheckSubmitRecid(
      typeof body.recid === 'string' ? body.recid : undefined,
    );

    const submitform = {
      id_user            : body.recid ?? '',
      staff_id           : body.staff_id ?? '',
      signon_name        : body.signon_name ?? '',
      full_name          : body.full_name ?? '',
      NewPassword        : body.NewPassword ?? '',
      ConfirmNewPassword : body.ConfirmNewPassword ?? '',
    };
    const errors = await getValidateForm(submitform, ValidateResetPassword);

    if (Object.keys(errors).length > 0) {
      const record = await this.service.getRecord(recid);
      response.status(422).render(views.reset_password, {
        ...getFormMianInfo('', this.pageinfo),
        oldvalue: {
          ...record,
          reset_type: body.reset_type ?? 'ATTEMP.PASSWORD',
        },
        errors,
      });
      return;
    }

    response.redirect(`${routes.baseurl}?msg=user had been reseted ${body.full_name}`);
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

}
