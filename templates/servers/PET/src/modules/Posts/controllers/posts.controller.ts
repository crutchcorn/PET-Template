import {Request, Response} from 'express';
import {getManager} from 'typeorm';
import {Post} from '../models/post.model';

export interface PostRequest extends Request {
  post?: Post
}

const postRepository = getManager().getRepository(Post);

export async function postSaveAction(req: Request, res: Response) {
  try {
    const newPost = postRepository.create({
      ...req.body,
      user: req.user
    });
    await postRepository.save(newPost);
    res.send(newPost);
  } catch (err) {
    res.status(500).send({message: 'There was an error with saving the post'});
  }
}

export function postGetByIdAction(req: PostRequest, res: Response) {
  res.send(req.post);
}

export async function postUpdateAction(req: PostRequest, res: Response) {
  try {
    const post = await postRepository.findOne(req.post.id);
    if (!post) {
      return res.status(404).send({message: 'No post with that ID could be found'});
    }
    const updatedPost = postRepository.create({
      ...post, ...{
        ...req.body,
        user: undefined
      }
    });
    await postRepository.save(updatedPost);
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
  try {
    const posts = await postRepository.find();
    res.send(posts);
  } catch (err) {
    res.status(500).send({message: 'There was an error getting posts'});
  }
}

export async function postByID(req: PostRequest, res: Response, next: Function, id: string) {
  try {
    const post = await postRepository.findOne(id);
    if (!post) {
      res.status(404).send({message: 'Couldn\'t find a post with that ID'});
    } else {
      req.post = post;
      next();
    }
  } catch (err) {
    res.status(500).send({message: 'There was an error finding that post'});
  }
}