import bcrypt from 'bcrypt'
import { NextApiRequest, NextApiResponse } from 'next'
import prismadb from '@/lib/prismadb'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    // 例えばWeb APIがgetメソッドしか受けつけていないのに、POSTでリクエストされたときなどに405エラーが返される
    return res.status(405).end()
  } 
}