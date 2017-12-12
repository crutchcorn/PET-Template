import {Request, Response} from 'express';
import {getManager} from 'typeorm';
import {Post} from '../models/post.model';

/**
 * Saves given post.
 */
export async function postSaveAction(req: Request, res: Response) {

  // get a post repository to perform operations with post
  const postRepository = getManager().getRepository(Post);

  // create a real post object from post json object sent over http
  const newPost = postRepository.create(req.body);

  // save received post
  await postRepository.save(newPost);

  // return saved post back
  res.send(newPost);
}

export async function postGetByIdAction(req: Request, res: Response) {

  // get a post repository to perform operations with post
  const postRepository = getManager().getRepository(Post);

  // load a post by a given post id
  const post = await postRepository.findOneById(req.params.id);

  // if post was not found return 404 to the client
  if (!post) {
    res.status(404);
    res.end();
    return;
  }

  // return loaded post
  res.send(post);
}

export async function postGetAllAction(req: Request, res: Response) {

  // get a post repository to perform operations with post
  const postRepository = getManager().getRepository(Post);

  // load a post by a given post id
  const posts = await postRepository.find();

  // return loaded posts
  res.send(posts);
}

export function setDb(req: Request, res: Response, next: Function) {
  console.log("Set DB");
  next();
}

export function postByID(req: Request, res: Response, next: Function, id: string) {
  console.log(id);
  next();
}