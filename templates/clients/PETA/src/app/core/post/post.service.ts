import { Injectable } from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs/Observable';
import {Post} from './post';

@Injectable()
export class PostService {

  constructor(private http: HttpClient) {
  }

  fetchPosts(): Observable<Post> {
    return this.http
      .get<Post>('/api/posts');
  }

  createPost(post: Post): Observable<Post> {
    return this.http
      .post<Post>('/api/posts', post);
  }

  fetchPost(postId: string): Observable<Post> {
    return this.http
      .get<Post>(`/api/posts/${postId}`);
  }
}
