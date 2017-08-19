import {postGetAllAction} from "./modules/Posts/controllers/PostGetAllAction";
import {postGetByIdAction} from "./modules/Posts/controllers/PostGetByIdAction";
import {postSaveAction} from "./modules/Posts/controllers/PostSaveAction";

/**
 * All application routes.
 */
export const AppRoutes = [
    {
        path: "/posts",
        method: "get",
        action: postGetAllAction
    },
    {
        path: "/posts/:id",
        method: "get",
        action: postGetByIdAction
    },
    {
        path: "/posts",
        method: "post",
        action: postSaveAction
    }
];