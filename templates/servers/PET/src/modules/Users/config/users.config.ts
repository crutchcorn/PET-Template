import {User} from '../models/user.model';
import {getManager} from 'typeorm';
import {serializeUser, deserializeUser, initialize, session} from 'passport';
import {resolve as resolvePath, join} from 'path';
const config = require(resolvePath('./src/config/config'));

let userRepository = getManager().getRepository(User);
export default function (app) {
  // Serialize sessions
  // TODO: Make done function more type safe
  serializeUser(function (user: User, done: Function) {
    done(null, user.id);
  });

  // Deserialize sessions
  deserializeUser(function (id, done) {
    userRepository
      .createQueryBuilder('row')
      .addSelect('row.password')
      .addSelect('row.salt')
      .leftJoinAndSelect("row.roles", "role")
      .where('row.id = :id', {id: id})
      .getOne()
      .then((user) => {
        done(null, user);
      }).catch((err) => {
        done(err, null);
      })
  });

  // Initialize strategies
  config.utils.getGlobbedPaths(join(__dirname, './strategies/**/*.js')).forEach(function (strategy) {
    require(resolvePath(strategy)).default(config);
  });

  // Add passport's middleware
  app.use(initialize());
  app.use(session());
}