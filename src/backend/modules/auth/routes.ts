import { NextApiRequest, NextApiResponse } from 'next';
import { Router } from '../../core/router';
import { AuthController } from './controller';
import { authenticate } from '../../core/middleware/auth';

function withAuth(handler: (req: NextApiRequest, res: NextApiResponse) => Promise<void>) {
  return async (req: NextApiRequest, res: NextApiResponse) => {
    return new Promise<void>((resolve, reject) => {
      authenticate(req, res, (user) => {
        resolve(handler(req, res));
      });
    });
  };
}

export function createAuthRoutes(router: Router, controller: AuthController): void {
  router.post('/auth/login', controller.login.bind(controller));
  router.post('/auth/register', controller.register.bind(controller));
  router.post('/auth/refresh', controller.refresh.bind(controller));
  router.get('/auth/me', withAuth(controller.me.bind(controller)));
  router.post('/auth/change-password', withAuth(controller.changePassword.bind(controller)));
}
