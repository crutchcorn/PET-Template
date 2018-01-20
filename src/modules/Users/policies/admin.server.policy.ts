import * as Acl from 'acl';
import {NextFunction, Request, Response} from 'express';
import {User} from '../models/user.model';

// Using the memory backend
let acl = new Acl(new Acl.memoryBackend());

/**
 * Invoke Admin Permissions
 */
export function invokeRolesPolicies() {
  acl.allow([{
    roles: ['admin'],
    allows: [{
      resources: '/api/users',
      permissions: '*'
    }, {
      resources: '/api/users/:userId',
      permissions: '*'
    }]
  }, {
    roles: ['user'],
    allows: [{
      resources: '/api/users/me',
      permissions: 'get'
    }]
  }]);
};

/**
 * Check If Admin Policy Allows
 */
export function isAllowed(req: Request, res: Response, next: NextFunction) {
  const roles = (req.user) ? (<User>req.user).roles.map(role => role.name) : ['guest'];

  // Check for user roles
  acl.areAnyRolesAllowed(roles, req.route.path, req.method.toLowerCase(), function (err, isAllowed) {
    if (err) {
      // An authorization error occurred
      return res.status(500).send('Unexpected authorization error');
    } else {
      if (isAllowed) {
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
