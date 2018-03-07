import {
  Entity, PrimaryGeneratedColumn, Column, ManyToMany, JoinTable, UpdateDateColumn,
  CreateDateColumn, ManyToOne
} from 'typeorm';
import {Category} from '../../Categories/models/Category';
import {User} from '../../Users/models/user.model';


@Entity()
export class Post {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @Column('text')
  text: string;

  @ManyToMany(type => Category, {
    cascadeInsert: true
  })
  @JoinTable()
  categories: Category[];

  @UpdateDateColumn()
  updated: Date;

  @CreateDateColumn()
  created: Date;

  @ManyToOne(type => User, user => user.posts, {cascadeAll: true, eager: true})
  user: User;
}
