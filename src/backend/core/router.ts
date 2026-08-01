import { NextApiRequest, NextApiResponse } from 'next';

export type RequestHandler = (req: NextApiRequest, res: NextApiResponse) => Promise<void>;

export interface Route {
  method: string;
  path: string;
  handler: RequestHandler;
}

export interface Router {
  get(path: string, handler: RequestHandler): void;
  post(path: string, handler: RequestHandler): void;
  put(path: string, handler: RequestHandler): void;
  patch(path: string, handler: RequestHandler): void;
  delete(path: string, handler: RequestHandler): void;
  all(path: string, handler: RequestHandler): void;
}

export function createRouter(): Router {
  const routes: Route[] = [];

  const router: Router = {
    get: (path: string, handler: RequestHandler) => {
      routes.push({ method: 'GET', path, handler });
    },
    post: (path: string, handler: RequestHandler) => {
      routes.push({ method: 'POST', path, handler });
    },
    put: (path: string, handler: RequestHandler) => {
      routes.push({ method: 'PUT', path, handler });
    },
    patch: (path: string, handler: RequestHandler) => {
      routes.push({ method: 'PATCH', path, handler });
    },
    delete: (path: string, handler: RequestHandler) => {
      routes.push({ method: 'DELETE', path, handler });
    },
    all: (path: string, handler: RequestHandler) => {
      routes.push({ method: '*', path, handler });
    },
  };

  return router;
}

export function matchRoute(routes: Route[], req: NextApiRequest): Route | null {
  const method = req.method || 'GET';
  const path = req.url?.split('?')[0] || '/';

  const route = routes.find(r => {
    if (r.method !== method && r.method !== '*') {
      return false;
    }
    
    const routeParts = r.path.split('/');
    const pathParts = path.split('/');

    if (routeParts.length !== pathParts.length) {
      return false;
    }

    return routeParts.every((part, i) => {
      if (part.startsWith(':')) {
        return true;
      }
      return part === pathParts[i];
    });
  });

  return route || null;
}
