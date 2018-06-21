import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PostsCreateComponent } from './posts-create.component';

describe('PostsCreateComponent', () => {
  let component: PostsCreateComponent;
  let fixture: ComponentFixture<PostsCreateComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PostsCreateComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PostsCreateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
