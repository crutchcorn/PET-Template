import {NextFunction, Request, Response} from 'express';
import {getManager} from 'typeorm';
import {User} from '../models/user.model';
// errorHandler = require(path.resolve('./modules/core/server/controllers/errors.server.controller'));

const userRepository = getManager().getRepository(User);

/**
 * Show the current user
 */
export async function read(req, res) {
  try {
    const user = await userRepository.findOne(req.params.userId);
    res.json(user);
  } catch (err) {
    res.status(500).send({message: 'Could not read the current user'});
  }
}

/**
 * Update a User
 */
export async function update(req: Request, res: Response) {
  userRepository.findOne(req.params.userId)
    .then(user => {
      if (user) {
        // For security purposes only merge these parameters
        user.firstName = req.body.firstName;
        user.lastName = req.body.lastName;
        user.displayName = user.firstName + ' ' + user.lastName;
        user.roles = req.body.roles;

        userRepository.save(user)
          .then(user => res.json(user))
          .catch(err => res.status(500).send({message: 'There was an error updating the user'}));
      } else {
        res.status(404).send({message: 'Could\'nt find a user with that ID'});
      }
    })
    .catch(err => res.status(500).send({message: 'There was an error updating the user'}));
}

/**
 * Delete a user
 */
export function deleteUser(req: Request, res: Response) {
  userRepository.findOne(req.params.userId)
    .then(async (user) => {
      if (user) {
        try {
          await userRepository.remove(user);
          res.json(user);
        } catch (err) {
          res.status(500).send({message: 'There was an error deleting that user'});
        }
      } else {
        res.status(404).send({message: 'Couldn\'t find a user with that ID'});
      }
    })
    .catch(err => res.status(500).send({message: 'There was an error finding that user'}));
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
  next();
};
