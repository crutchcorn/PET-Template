import {Category} from '../category/category';
import {User} from '../user/user';

export class Post {
  id?: number;
  title: string;
  text: string;
  categories?: Category[];
  user?: User;

  constructor(post: Partial<Post>) {
    this.id = post.id;
    this.title = post.title;
    this.text = post.text;
    this.categories = post.categories;
    this.user = post.user;
  }
}
