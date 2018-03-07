export class Role {
  id?: number;
  name: string;

  constructor(role: Role) {
    this.id = role.id;
    this.name = role.name;
  }
}
