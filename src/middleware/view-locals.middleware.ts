import { ForbiddenException, Injectable, NestMiddleware } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';
import { DateFormatter } from '../utils/date-formatter.util';
import { SysApplicationsService } from '../services/sys_applications.service';
import { AuthService } from '../services/auth.service';

@Injectable()
export class ViewLocalsMiddleware implements NestMiddleware {
  constructor(
    private readonly applicationsService: SysApplicationsService,
    private readonly authService: AuthService,
  ) {}

  async use(
    request: Request,
    response: Response,
    next: NextFunction,
  ): Promise<void> {
    if (
      request.path === '/login' ||
      request.path === '/logout' ||
      request.path.startsWith('/assets/')
    ) {
      await this.setBaseLocals(request, response);
      next();
      return;
    }

    const sid = this.readSid(request);
    const session = this.authService.getSession(sid);
    if (!session) {
      response.redirect(`/login?redirect=${encodeURIComponent(request.originalUrl)}`);
      return;
    }

    const submittedAction =
      typeof request.body?.['client-action'] === 'string'
        ? request.body['client-action']
        : typeof request.body?.['client-submt'] === 'string'
          ? request.body['client-submt']
          : undefined;
    if (!(await this.authService.canAccess(session, request.path, request.method, submittedAction))) {
      throw new ForbiddenException('You do not have permission to access this page.');
    }

    await this.setBaseLocals(request, response);
    response.locals.authenticated = true;
    response.locals.currentUser = session.user;
    response.locals.sidebarItems = (
      await Promise.all(
        response.locals.sidebarItems.map(async (item) =>
          await this.authService.canAccess(session, item.base_url, 'GET')
            ? item
            : null,
        ),
      )
    ).filter((item) => item !== null);
    next();
  }

  private async setBaseLocals(request: Request, response: Response): Promise<void> {
    response.locals.appName = 'Backend System - NestJS';
    response.locals.currentPath = request.path;
    response.locals.title = '';
    response.locals.queryNotice = typeof request.query.notice === 'string' ? request.query.notice : '';
    response.locals.errorMessage = '';
    response.locals.formatDate = DateFormatter.shortDate;

    try {
      response.locals.sidebarItems = await this.applicationsService.getSidebarItems();
    } catch (error) {
      throw error;
    }
  }

  private readSid(request: Request): string | undefined {
    const header = request.headers.cookie ?? '';
    return header
      .split(';')
      .map((part) => part.trim())
      .find((part) => part.startsWith('sid='))
      ?.slice(4);
  }
}
