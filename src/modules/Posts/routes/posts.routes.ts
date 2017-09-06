import {isAllowed} from '../policies/posts.policy';
import {postSaveAction, postGetByIdAction, postGetAllAction, postByID, setDb} from '../controllers/posts.controller';

export default function (app) {
  app.route('/api/posts').all(isAllowed, setDb)
    .get(postGetAllAction)
    .post(postSaveAction);

  app.route('/api/posts/:id').all(isAllowed, setDb)
    .get(postGetByIdAction);

  app.param('id', postByID);
};
