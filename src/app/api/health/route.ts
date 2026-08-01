import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { method } = req;

  if (method !== 'GET') {
    return res.status(405).json({
      success: false,
      message: 'Method not allowed',
    });
  }

  return res.status(200).json({
    success: true,
    message: 'OK',
    data: {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || 'development',
    },
  });
}
