import {Component, EventEmitter, Output} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {PostService} from '../../core/post/post.service';
import {take} from 'rxjs/operators';
import {Post} from '../../core/post/post';

@Component({
  selector: '{{dashCase name}}-posts-create',
  templateUrl: './posts-create.component.html',
  styleUrls: ['./posts-create.component.scss']
})
export class PostsCreateComponent {
  @Output() created = new EventEmitter<Post>();
  form: FormGroup = this.fb.group({
    title: ['', Validators.required],
    text: ['', Validators.required]
  });
  submitted: boolean = false;

  constructor(private fb: FormBuilder,
              private postService: PostService) { }

  create() {
    if (this.form.valid) {
      this.postService.createPost(this.form.value)
        .pipe(take(1))
        .subscribe(res => {
          this.created.emit(res);
          this.form.reset();
          this.submitted = false;
        })
    } else {
      this.submitted = true;
    }
  }

}
