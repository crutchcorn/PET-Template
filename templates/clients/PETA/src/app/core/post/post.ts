import {Category} from '../category/category';

export class Post {
  id: number;
  title: string;
  text: string;
  categories: Category[];

  constructor(post: Post) {
    this.id = post.id;
    this.title = post.title;
    this.text = post.text;
    this.categories = post.categories;
  }

}
