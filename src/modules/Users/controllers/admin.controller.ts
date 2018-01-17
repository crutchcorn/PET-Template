import {NextFunction, Request, Response} from 'express';
import {getManager} from 'typeorm';
import {User} from '../models/user.model';
// errorHandler = require(path.resolve('./modules/core/server/controllers/errors.server.controller'));

const userRepository = getManager().getRepository(User);

/**
 * Show the current user
 */
export function read(req, res) {
  userRepository.findOneById(req.params.userId)
    .then(user => res.json(user));
}

/**
 * Update a User
 */
export async function update(req: Request, res: Response) {
  const user = await userRepository.findOneById(req.params.userId);

  // For security purposes only merge these parameters
  user.firstName = req.body.firstName;
  user.lastName = req.body.lastName;
  user.displayName = user.firstName + ' ' + user.lastName;
  user.roles = req.body.roles;

  await userRepository.save(user);

  res.json(user);
}

/**
 * Delete a user
 */
export async function deleteUser(req: Request, res: Response) {
  const user = await userRepository.findOneById(req.params.userId);

  await userRepository.remove(user);

  res.json(user);
}

/**
 * List of Users
 */
export async function list(req: Request, res: Response) {
  const users = await userRepository.find();

  res.json(users);
}

/**
 * User middleware
 */
export function userByID(req: Request, res: Response, next: NextFunction, id: string) {
  console.log(id);
  next();
};
