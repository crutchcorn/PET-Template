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
  try {
    await roleRepository.save(newRole);
    res.send(newRole);
  } catch (err) {
    res.status(500).send({message: "There was an error saving the role"});
  }
}

export async function roleGetAllAction(req: Request, res: Response) {
  const roleRepository = getManager().getRepository(Role);
  try {
    const roles = await roleRepository.find();
    res.send(roles);
  } catch (err) {
    res.status(500).send({message: 'There was an error finding that role'});
  }
}
