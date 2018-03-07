import { Injectable } from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs/Observable';
import {User} from './user';

@Injectable()
export class UserService {

  constructor(private http: HttpClient) {
  }

  fetchUser(): Observable<User> {
    return this.http
      .get<User>('/api/users/me');
  }
}
