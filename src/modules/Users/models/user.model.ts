import {hashSync, compareSync, genSaltSync} from 'bcrypt';
import {Entity, PrimaryGeneratedColumn, Column} from "typeorm";

@Entity()
export class User {

  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  email: string;

  @Column({select: false})
  password: string;

  generateHash(password) {
    return hashSync(password, genSaltSync(8));
  };

// checking if password is valid
  validPassword(password) {
    return compareSync(password, this.password);
  };
}

