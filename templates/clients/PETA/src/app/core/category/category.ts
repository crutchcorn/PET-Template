export class Category {
  id?: number;
  name: string;

  constructor(category: Category = null) {
    this.id = category.id;
    this.name = category.name;
  }
}
