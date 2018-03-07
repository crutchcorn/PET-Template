import * as Acl from 'acl';
import {NextFunction, Response} from 'express';
import {User} from '../../Users/models/user.model';
import {PostRequest} from '../controllers/posts.controller';

// Using the memory backend
let acl = new Acl(new Acl.memoryBackend());

/**
 * Invoke System logs Permissions
 */
export function invokeRolesPolicies() {
  acl.allow([{
    roles: ['admin'],
    allows: [{
      resources: '/api/posts',
      permissions: '*'
    }, {
      resources: '/api/posts/:postId',
      permissions: '*'
    }]
  }, {
    roles: ['user'],
    allows: [{
      resources: '/api/posts',
      permissions: ['get', 'post']
    }, {
      resources: '/api/posts/:postId',
      permissions: ['get', 'put', 'delete']
    }]
  }, {
    roles: ['guest'],
    allows: [{
      resources: '/api/posts',
      permissions: 'get'
    }, {
      resources: '/api/posts/:postId',
      permissions: 'get'
    }]
  }]);
};

/**
 * Check If System logs Policy Allows
 */
export function isAllowed(req: PostRequest, res: Response, next: NextFunction) {
  const roles: string[] = (req.user) ? (<User>req.user).roles.map(role => role.name) : ['guest'];
  const isAdmin: boolean = roles.includes('admin');
  const ownsPost: boolean = !req.post || (req.post && req.user && req.post.user && req.post.user.id === req.user.id);
  const restrictedMethods: string[] = ['post', 'put', 'delete'];

  // Check for user roles
  acl.areAnyRolesAllowed(roles, req.route.path, req.method.toLowerCase(), function (err, isAllowed) {
    if (err) {
      // An authorization error occurred
      return res.status(500).send('Unexpected authorization error');
    } else {
      // Make sure user owns post/is admin in order to modify it
      if (isAllowed && (!restrictedMethods.includes(req.method.toLowerCase()) || ownsPost || isAdmin)) {
        // Access granted! Invoke next middleware
        return next();
      } else {
        return res.status(403).json({
          message: 'User is not authorized'
        });
      }
    }
  });
};
