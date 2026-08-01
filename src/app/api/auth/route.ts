import { NextApiRequest, NextApiResponse } from 'next';

interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data?: T;
  error?: unknown;
}

const defaultUsers = [
  { id: 't1', email: 'jane.doe@school.com', password: 'password123', name: 'Jane Doe', role: 'teacher' },
  { id: 't2', email: 'john.smith@school.com', password: 'password123', name: 'John Smith', role: 'teacher' },
  { id: 's1', email: 'alex.doe@school.com', password: 'password123', name: 'Alex Doe', role: 'student', grade: '10th Grade', teacherId: 't1' },
  { id: 's2', email: 'sam.wilson@school.com', password: 'password123', name: 'Sam Wilson', role: 'student', grade: '10th Grade', teacherId: 't1' },
  { id: 's3', email: 'maria.hill@school.com', password: 'password123', name: 'Maria Hill', role: 'student', grade: '11th Grade', teacherId: 't2' },
];

function findUserByEmail(email: string) {
  return defaultUsers.find(u => u.email.toLowerCase() === email.toLowerCase());
}

function findUserById(id: string) {
  return defaultUsers.find(u => u.id === id);
}

function successResponse<T>(data: T, message: string = 'Success'): ApiResponse<T> {
  return { success: true, message, data };
}

function errorResponse(message: string, error?: unknown): ApiResponse {
  return { success: false, message, error };
}

function generateToken(user: { id: string; email: string; role: string }): string {
  const payload = { userId: user.id, email: user.email, role: user.role };
  return Buffer.from(JSON.stringify(payload)).toString('base64');
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { method } = req;

  if (method === 'POST' && req.url?.includes('/login')) {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json(errorResponse('Email and password are required'));
    }

    const user = findUserByEmail(email);
    
    if (!user || user.password !== password) {
      return res.status(401).json(errorResponse('Invalid email or password'));
    }

    const { password: _, ...userWithoutPassword } = user;
    const accessToken = generateToken(user);
    
    return res.status(200).json(successResponse({
      user: userWithoutPassword,
      tokens: { accessToken, refreshToken: accessToken },
    }, 'Login successful'));
  }

  if (method === 'POST' && req.url?.includes('/register')) {
    const { email, password, name, role, grade, teacherId } = req.body;
    
    if (!email || !password || !name || !role) {
      return res.status(400).json(errorResponse('Email, password, name, and role are required'));
    }

    const existingUser = findUserByEmail(email);
    if (existingUser) {
      return res.status(409).json(errorResponse('Email already registered'));
    }

    const id = `${role}${Date.now()}`;
    const newUser = { id, email, password, name, role, grade, teacherId };
    defaultUsers.push(newUser);

    const { password: _p, ...userWithoutPassword } = newUser;
    const accessToken = generateToken(newUser);
    
    return res.status(201).json(successResponse({
      user: userWithoutPassword,
      tokens: { accessToken, refreshToken: accessToken },
    }, 'Registration successful'));
  }

  if (method === 'POST' && req.url?.includes('/refresh')) {
    const { refreshToken } = req.body;
    
    if (!refreshToken) {
      return res.status(400).json(errorResponse('Refresh token is required'));
    }

    try {
      const payload = JSON.parse(Buffer.from(refreshToken, 'base64').toString());
      const user = findUserById(payload.userId);
      
      if (!user) {
        return res.status(401).json(errorResponse('User not found'));
      }

      const newAccessToken = generateToken(user);
      
      return res.status(200).json(successResponse({
        accessToken: newAccessToken,
        refreshToken,
      }, 'Token refreshed'));
    } catch {
      return res.status(401).json(errorResponse('Invalid refresh token'));
    }
  }

  if (method === 'GET' && req.url?.includes('/me')) {
    const authHeader = req.headers.authorization;
    
    if (!authHeader) {
      return res.status(401).json(errorResponse('No authorization header'));
    }

    const [type, token] = authHeader.split(' ');
    
    if (type !== 'Bearer' || !token) {
      return res.status(401).json(errorResponse('Invalid authorization format'));
    }

    try {
      const payload = JSON.parse(Buffer.from(token, 'base64').toString());
      const user = findUserById(payload.userId);
      
      if (!user) {
        return res.status(401).json(errorResponse('User not found'));
      }

      const { password: _pw, ...userWithoutPassword } = user;
      
      return res.status(200).json(successResponse(userWithoutPassword, 'Success'));
    } catch {
      return res.status(401).json(errorResponse('Invalid token'));
    }
  }

  return res.status(404).json(errorResponse('Not found'));
}
