import {Request, Response} from "express";
import {getEntityManager} from "typeorm";
import {Post} from "../models/Post";

/**
 * Loads all posts from the database.
 */
export async function postGetAllAction(request: Request, response: Response) {

    // get a post repository to perform operations with post
    const postRepository = getEntityManager().getRepository(Post);

    // load a post by a given post id
    const posts = await postRepository.find();

    // return loaded posts
    response.send(posts);
}