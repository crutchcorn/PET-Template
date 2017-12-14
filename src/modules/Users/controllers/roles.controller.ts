import {Request, Response} from 'express';
import {getManager} from 'typeorm';
import {Role} from '../models/role.model';

/**
 * Saves given post.
 */
export async function roleSaveAction(req: Request, res: Response) {

  // get a post repository to perform operations with post
  const roleRepository = getManager().getRepository(Role);

  // create a real post object from post json object sent over http
  const newRole = roleRepository.create(req.body);

  // save received post
  await roleRepository.persist(newRole);

  // return saved post back
  res.send(newRole);
}

export async function roleGetAllAction(req: Request, res: Response) {

  // get a post repository to perform operations with post
  const roleRepository = getManager().getRepository(Role);

  // load a post by a given post id
  const roles = await roleRepository.find();

  // return loaded posts
  res.send(roles);
}
