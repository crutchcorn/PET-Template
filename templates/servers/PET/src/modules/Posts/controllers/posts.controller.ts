import {Request, Response} from 'express';
import {getManager} from 'typeorm';
import {Post} from '../models/post.model';

export interface PostRequest extends Request {
  post?: Post
}

const postRepository = getManager().getRepository(Post);

/**
 * Saves given post.
 */

export async function postSaveAction(req: Request, res: Response) {
  const newPost = postRepository.create({
    ...req.body,
    user: req.user
  });
  postRepository.save(newPost)
    .then(post => res.send(post))
    .catch(err => res.status(500).send({message: 'There was an error with saving the post'}));
}

export function postGetByIdAction(req: PostRequest, res: Response) {
  res.send(req.post);
}


export async function postUpdateAction(req: PostRequest, res: Response) {
  // TODO: Model is not returning any data
  try {
    const updatedPost = await postRepository.update(req.post.id, {
      ...req.body,
      user: undefined
    });
    res.send(updatedPost);
  } catch (err) {
    res.status(500).send({message: 'There was an error while updating the post'});
  }
}

export async function postDeleteAction(req: PostRequest, res: Response) {
  try {
    await postRepository.delete(req.post);
    res.send({message: 'Post was deleted'});
  } catch (err) {
    res.status(500).send({message: 'There was an error trying to delete the post'});
  }
}

export async function postGetAllAction(req: Request, res: Response) {
  postRepository.find()
    .then(posts => res.send(posts))
    .catch(err => res.status(500).send({message: 'There was an error getting posts'}));
}

export async function postByID(req: PostRequest, res: Response, next: Function, id: string) {
  postRepository.findOne(id)
    .then(post => {
      if (!post) {
        res.status(404).send({message: 'Couldn\'t find a post with that ID'});
      } else {
        req.post = post;
        next();
      }
    })
    .catch(err => res.status(500).send({message: 'There was an error finding that post'}));
}
