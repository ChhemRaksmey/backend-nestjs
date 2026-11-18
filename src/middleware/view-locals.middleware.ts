import { Injectable, NestMiddleware } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';
import { DateFormatter } from '../utils/date-formatter.util';

@Injectable()
export class ViewLocalsMiddleware implements NestMiddleware {
  use(request: Request, response: Response, next: NextFunction): void {
    response.locals.appName = 'NestJS Customer Desk';
    response.locals.currentPath = request.path;
    response.locals.title = '';
    response.locals.queryNotice = typeof request.query.notice === 'string' ? request.query.notice : '';
    response.locals.errorMessage = '';
    response.locals.formatDate = DateFormatter.shortDate;
    next();
  }
}
