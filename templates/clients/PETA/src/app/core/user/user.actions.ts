import { Action } from '@ngrx/store';
import { User } from './user';

export enum UserActionTypes {
  LoadUser = '[User] Load User',
  UnloadUser = '[User] Unload User'
}

export class LoadUser implements Action {
  readonly type = UserActionTypes.LoadUser;

  constructor(public payload: User) {}
}

export class UnloadUser implements Action {
  readonly type = UserActionTypes.UnloadUser;

  constructor() {}
}


export type UserActions = LoadUser | UnloadUser;
