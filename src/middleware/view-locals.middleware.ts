import { Injectable, NestMiddleware } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';
import { DateFormatter } from '../utils/date-formatter.util';
import { SysApplicationsService } from '../services/sys_applications.service';

@Injectable()
export class ViewLocalsMiddleware implements NestMiddleware {
  constructor(private readonly applicationsService: SysApplicationsService) {}

  async use(
    request: Request,
    response: Response,
    next: NextFunction,
  ): Promise<void> {
    response.locals.appName = 'Backend System - NestJS';
    response.locals.currentPath = request.path;
    response.locals.title = '';
    response.locals.queryNotice = typeof request.query.notice === 'string' ? request.query.notice : '';
    response.locals.errorMessage = '';
    response.locals.formatDate = DateFormatter.shortDate;

    try {
      response.locals.sidebarItems = await this.applicationsService.getSidebarItems();
      next();
    } catch (error) {
      next(error);
    }
  }
}
