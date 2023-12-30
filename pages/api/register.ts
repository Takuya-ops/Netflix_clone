import bcrypt from 'bcrypt'
import { NextApiRequest, NextApiResponse } from 'next'
import prismadb from '@/lib/prismadb'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    // 例えばWeb APIがgetメソッドしか受けつけていないのに、POSTでリクエストされたときなどに405エラーが返される
    return res.status(405).end()
  }
  try {
    // アカウント登録画面で入力された情報
    const {email, name, password} = req.body
    const existingUser = await prismadb.user.findUnique({
      // emailがすでに登録されていれば既存ユーザーとみなす
      where: {
        email,
      }
    });

    if (existingUser) {
      return res.status(422).json({error: 'Email token'})
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const user = await prismadb.user.create({
      data: {
        email,
        name,
        hashedPassword,
        image:'',
        emailVerified: new Date(),
      }
    });
    return res.status(200).json(user)
   } catch (error) {
    console.log(error)
    return res.status(400).end()
  }
}