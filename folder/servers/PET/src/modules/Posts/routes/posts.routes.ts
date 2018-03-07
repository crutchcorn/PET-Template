import {isAllowed} from '../policies/posts.policy';
import {
  postSaveAction, postGetByIdAction, postGetAllAction, postByID, postDeleteAction, postUpdateAction
} from '../controllers/posts.controller';

export default function (app) {
  app.route('/api/posts').all(isAllowed)
    .get(postGetAllAction)
    .post(postSaveAction);

  app.route('/api/posts/:postId').all(isAllowed)
    .get(postGetByIdAction)
    .put(postUpdateAction)
    .delete(postDeleteAction);

  app.param('postId', postByID);
};
