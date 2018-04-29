  import {Role} from '../role/role';

  export class UserWithoutRole {
    id: number;
    firstName?: string;
    lastName?: string;
    displayName?: string;
    email: string;
    username: string;
    password?: string; // This is ONLY for sign-up purposes, this does not actually get saved to
    profileImageURL?: string;
    provider?: string;
    updated?: Date;
    created?: Date;
    resetPasswordToken?: string;
    resetPasswordExpires?: Date;

    // TODO: There has to be a better way of doing this
    constructor(user: User) {
        this.id = user.id;
        this.firstName = user.firstName;
        this.lastName = user.lastName;
        this.displayName = user.displayName;
        this.email = user.email;
        this.username = user.username;
        this.password = user.password;
        this.profileImageURL = user.profileImageURL;
        this.provider = user.provider;
        this.updated = user.updated;
        this.created = user.created;
        this.resetPasswordToken = user.resetPasswordToken;
        this.resetPasswordExpires = user.resetPasswordExpires;
    }
  }

  export class User extends UserWithoutRole {
    // TODO: This might need to be done on the server :thinking_face:
    roles: Role[];
    get rolestr(): string[] {
      return this.roles.map(role => role.name);
    }

    set rolestr(roles: string[]) {
      roles.filter(role => !this.rolestr.includes(role))
           .forEach(role => this.roles.push(new Role({name: role})));

    }

    constructor(user: User) {
      super(user);
      this.roles = user.roles;
    }
  }

