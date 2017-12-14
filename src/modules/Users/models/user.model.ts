import {hashSync, compareSync, genSaltSync} from 'bcrypt';
import {Entity, PrimaryGeneratedColumn, Column, ManyToMany, JoinTable} from 'typeorm';
import {Role} from './role.model';

@Entity()
export class User {

  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  email: string;

  @Column({select: false})
  password: string;

  @ManyToMany(type => Role)
  @JoinTable()
  roles: Role[];

  generateHash(password) {
    return hashSync(password, genSaltSync(8));
  };

// checking if password is valid
  validPassword(password) {
    return compareSync(password, this.password);
  };
}

