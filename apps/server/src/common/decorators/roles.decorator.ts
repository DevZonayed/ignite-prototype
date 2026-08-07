import { SetMetadata } from '@nestjs/common';

export type UserRole =
  | 'platform_admin'
  | 'curriculum_admin'
  | 'principal'
  | 'teacher'
  | 'learner'
  | 'parent';

export const UserRoles: Record<string, UserRole> = {
  PLATFORM_ADMIN: 'platform_admin',
  CURRICULUM_ADMIN: 'curriculum_admin',
  PRINCIPAL: 'principal',
  TEACHER: 'teacher',
  LEARNER: 'learner',
  PARENT: 'parent',
} as const;

export const ROLES_KEY = 'roles';

/**
 * Decorator that restricts route access to specific user roles.
 *
 * @example
 * @Roles('platform_admin', 'curriculum_admin')
 * @Get('admin/dashboard')
 * getAdminDashboard() { ... }
 */
export const Roles = (...roles: UserRole[]) => SetMetadata(ROLES_KEY, roles);
