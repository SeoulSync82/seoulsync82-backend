import { Request } from 'express';

export type UserWithId = { id: string };

export type RequestWithUser = Request & { user: UserWithId };

export type RequestWithUserOrId = RequestWithUser | UserWithId;

export function instanceOfRequestWithUser(object: any): object is RequestWithUser {
  return 'user' in object;
}
