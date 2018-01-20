import {isAllowed} from '../policies/posts.policy';
import {postSaveAction, postGetByIdAction, postGetAllAction, postByID, setDb} from '../controllers/posts.controller';

export default function (app) {
  app.route('/api/posts').all(isAllowed, setDb)
    .get(isAllowed, postGetAllAction)
    .post(isAllowed, postSaveAction);

  app.route('/api/posts/:id').all(isAllowed, setDb)
    .get(isAllowed, postGetByIdAction);

  app.param('id', postByID);
};
