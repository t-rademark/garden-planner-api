import { Request } from 'express';

export interface AuthenticatedUser {
  sub: string;
  aud?: string | string[];
  iss?: string;
}

export type AuthenticatedRequest = Request & {
  user?: AuthenticatedUser;
};
