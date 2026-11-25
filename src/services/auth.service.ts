import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { randomBytes } from 'crypto';
import { Repository } from 'typeorm';
import { SysUser, SysUserPassword } from '../models/sys_users.entity';
import { SysPrivilege } from '../models/sys_privileges.entity';
import { SysApplicationsView } from '../models/sys_applications.entity';

export interface AuthUser {
  idUser: string;
  fullName: string;
  signonName: string;
  privilegeIds: string[];
}

export interface AuthSession {
  user: AuthUser;
}

@Injectable()
export class AuthService {
  private readonly sessions = new Map<string, AuthSession>();

  constructor(
    @InjectRepository(SysUser)
    private readonly userTable: Repository<SysUser>,
    @InjectRepository(SysUserPassword)
    private readonly passwordTable: Repository<SysUserPassword>,
    @InjectRepository(SysPrivilege)
    private readonly privilegeTable: Repository<SysPrivilege>,
    @InjectRepository(SysApplicationsView)
    private readonly applicationView: Repository<SysApplicationsView>,
  ) {}

  async authenticate(signonName: string, password: string): Promise<{ sid: string; session: AuthSession }> {
    const users = await this.userTable.find();
    const user = users.find((item) =>
      String(item.jsonData?.c2 ?? '') === signonName.trim() &&
      String(item.jsonData?.c11 ?? '') !== 'Inactive',
    );
    if (!user) {
      throw new UnauthorizedException('Invalid signon name or password');
    }

    const passwordRecord = await this.passwordTable.findOneBy({ recid: user.recid });
    if (!passwordRecord || String(passwordRecord.jsonData?.c3 ?? '') !== password) {
      throw new UnauthorizedException('Invalid signon name or password');
    }

    const privilegeIds = this.toStringArray(user.jsonData?.c10);
    const authUser: AuthUser = {
      idUser: user.recid,
      fullName: String(user.jsonData?.c3 ?? ''),
      signonName: String(user.jsonData?.c2 ?? ''),
      privilegeIds,
    };
    const sid = randomBytes(32).toString('hex');
    const session = { user: authUser };
    this.sessions.set(sid, session);
    return { sid, session };
  }

  getSession(sid?: string): AuthSession | undefined {
    return sid ? this.sessions.get(sid) : undefined;
  }

  destroySession(sid?: string): void {
    if (sid) this.sessions.delete(sid);
  }

  async canAccess(
    session: AuthSession,
    path: string,
    method: string,
    submittedAction?: string,
  ): Promise<boolean> {
    const applications = await this.applicationView.find({
      where: { enable_status: 'Y' },
    });
    const application = applications.find((item) =>
      path === item.base_url ||
      path.startsWith(`${item.base_url}/`),
    );
    if (!application) return true;

    const requiredPermission = this.getRequiredPermission(method, path, submittedAction);
    if (!requiredPermission) return true;

    for (const privilegeId of session.user.privilegeIds) {
      const privilege = await this.privilegeTable.findOneBy({ recid: privilegeId });
      if (!privilege) continue;
      if (String(privilege.jsonData?.c2 ?? '') === 'N') continue;

      const grants = privilege.jsonData?.c3;
      if (this.hasApplicationGrant(grants, application.id_application, requiredPermission)) {
        return true;
      }
    }

    if (session.user.privilegeIds.includes('CORE.SYSTEM')) return true;
    return false;
  }

  private getRequiredPermission(method: string, path: string, submittedAction?: string): string | null {
    if (method === 'POST') {
      if (submittedAction === 'submit-create') return 'APP.PERM*CREATE';
      if (submittedAction === 'submit-update') return 'APP.PERM*EDIT';
      if (submittedAction === 'submit-approve') return 'APP.PERM*APPROVE';
      if (submittedAction === 'submit-delete') return 'APP.PERM*DELETE';
      if (path.includes('/update/')) return 'APP.PERM*EDIT';
      if (path.includes('/create')) return 'APP.PERM*CREATE';
      if (path.includes('/authorize/')) return 'APP.PERM*APPROVE';
      return 'APP.PERM*EDIT';
    }

    if (path.includes('/create')) return 'APP.PERM*CREATE';
    if (path.includes('/update/')) return 'APP.PERM*EDIT';
    if (path.includes('/authorize/')) return 'APP.PERM*APPROVE';
    return 'APP.PERM*VIEW';
  }

  private hasApplicationGrant(
    grants: unknown,
    applicationId: string,
    requiredPermission: string,
  ): boolean {
    if (!grants || typeof grants !== 'object') return false;

    const scan = (value: unknown): boolean => {
      if (!value || typeof value !== 'object') return false;
      for (const [key, child] of Object.entries(value)) {
        if (key === applicationId) {
          if (child && typeof child === 'object') {
            if ((child as Record<string, unknown>).no_auth === '1') return true;
            if (
              requiredPermission === 'APP.PERM*VIEW' &&
              (
                'label' in (child as Record<string, unknown>) ||
                Object.keys(child).length > 0
              )
            ) {
              return true;
            }
            for (const [permissionKey, permissionValue] of Object.entries(child)) {
              if (permissionKey === requiredPermission && permissionValue !== 'N') return true;
              if (permissionValue === 'on') {
                if (permissionKey === requiredPermission) return true;
              }
              if (permissionValue && typeof permissionValue === 'object') {
                const nested = permissionValue as Record<string, unknown>;
                if (nested.label === this.permissionLabel(requiredPermission)) return true;
                if (permissionKey === requiredPermission) return true;
              }
            }
          }
          return false;
        }
        if (scan(child)) return true;
      }
      return false;
    };

    return scan(grants);
  }

  private permissionLabel(permission: string): string {
    switch (permission) {
      case 'APP.PERM*VIEW': return 'View';
      case 'APP.PERM*CREATE': return 'Create';
      case 'APP.PERM*EDIT': return 'Edit';
      case 'APP.PERM*APPROVE': return 'Approve';
      case 'APP.PERM*DELETE': return 'Delete';
      case 'APP.PERM*REVERSE': return 'Reverse';
      default: return '';
    }
  }

  private toStringArray(value: unknown): string[] {
    if (Array.isArray(value)) return value.map(String);
    if (typeof value === 'string' && value) return [value];
    return [];
  }
}
