import { Injectable } from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {Post} from './post';

@Injectable()
export class PostService {

  constructor(private http: HttpClient) {
  }

  fetchPosts(): Observable<Post[]> {
    return this.http
      .get<Post[]>('/api/posts');
  }

  createPost(post: Post): Observable<Post> {
    return this.http
      .post<Post>('/api/posts', post);
  }

  fetchPost(postId: number): Observable<Post> {
    return this.http
      .get<Post>(`/api/posts/${postId}`);
  }

  updatePost(postId: number, data: Partial<Post>): Observable<Post> {
    return this.http
      .post<Post>(`/api/posts/${postId}`, data);
  }

  deletePost(postId: number): Observable<Post> {
    return this.http
      .delete<Post>(`/api/posts/${postId}`);
  }
}
