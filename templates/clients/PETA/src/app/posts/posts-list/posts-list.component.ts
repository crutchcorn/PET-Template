import { Component, OnInit } from '@angular/core';
import {PostService} from '../../core/post/post.service';
import {map, share, take} from 'rxjs/operators';
import {Post} from '../../core/post/post';
import {getUser, State} from '../../core/reducers';
import {Store} from '@ngrx/store';
import {User} from '../../core/user/user';
type EditablePost = Post & {editing: boolean, editText: string};

@Component({
  selector: '{{dashCase name}}-posts-list',
  templateUrl: './posts-list.component.html',
  styleUrls: ['./posts-list.component.scss']
})
export class PostsListComponent implements OnInit {
  posts: EditablePost[];

  getUserID$ = this.store.select(getUser)
    .pipe(map((user: User) => (user && user.id) || null))
    .pipe(share());

  constructor(private postService: PostService,
              private store: Store<State>) { }

  ngOnInit() {
    this.postService.fetchPosts()
      .pipe(take(1))
      .subscribe(list => this.posts = list.map(p =>
        ({...p, editing: false, editText: p.text})));
    this.getUserID$
      .pipe(take(1))
      .subscribe(id => {
        if (!id) {
          // TODO: Add call to get user and add to store
          // HACK: This should be a resolver of an @ngrx/effect
          // this.store.
        }
      })
  }

  created(post: Post) {
    this.posts = [...this.posts, {...post, editing: false, editText: post.text}]
  }

  delete(post: Post) {
    this.postService.deletePost(post.id)
      .pipe(take(1))
      .subscribe(() =>
        this.posts = this.posts.filter(postItem => postItem.id !== post.id))
  }

  savePost(post: EditablePost) {
    // TODO: Add title change as well
    this.postService.updatePost(post.id, {id: post.id, text: post.editText})
      .pipe(take(1))
      .subscribe(newPost => post = {...newPost, editing: false, editText: post.text})
  }

  cancelEdit(post: EditablePost) {
    post.editing = false;
    post.editText = post.text;
  }
}
