import { Body, Controller, Get, Post, Query, Req, Res } from '@nestjs/common';
import type { Request, Response } from 'express';
import { AuthService } from '../services/auth.service';

const cookieName = 'sid';

@Controller()
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Get('/login')
  loginPage(
    @Req() request: Request,
    @Res() response: Response,
    @Query('error') error?: string,
  ): void {
    const sid = this.readSid(request);
    if (this.authService.getSession(sid)) {
      response.redirect('/');
      return;
    }
    response.render('auth/login', {
      layout: false,
      error: error ?? '',
    });
  }

  @Post('/login')
  async login(
    @Req() request: Request,
    @Res() response: Response,
    @Body() body: Record<string, unknown>,
  ): Promise<void> {
    try {
      const result = await this.authService.authenticate(
        String(body.signon_name ?? ''),
        String(body.password ?? ''),
      );
      response.cookie(cookieName, result.sid, {
        httpOnly: true,
        sameSite: 'lax',
      });
      response.redirect('/');
    } catch {
      response.redirect('/login?error=Invalid+signon+name+or+password');
    }
  }

  @Get('/logout')
  logout(@Req() request: Request, @Res() response: Response): void {
    this.authService.destroySession(this.readSid(request));
    response.clearCookie(cookieName);
    response.redirect('/login');
  }

  private readSid(request: Request): string | undefined {
    const header = request.headers.cookie ?? '';
    return header
      .split(';')
      .map((part) => part.trim())
      .find((part) => part.startsWith(`${cookieName}=`))
      ?.slice(cookieName.length + 1);
  }
}
