import axios from "axios"
import { useCallback, useState } from "react";
import Input from "../components/Input";

const Auth = () => {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  // ログイン画面、アカウント登録画面の切り替え
  const [variant, setVariant] = useState('login')
  
  // 初期状態(loginがTrueの時)は登録画面、create acountのボタンが押されたらlogin画面に変わる。今回だと、このtoggleVariantを、buttonタグのonclickと紐づけている。
  const toggleVariant = useCallback(() => {
    setVariant((currentVariant) => currentVariant === 'login' ? 'register' : 'login')
  }, [])

  const register = useCallback(async () => {
    try {
      await axios.post('/api/register', {
        email,
        name,
        password
      });
    } catch (error) {
      console.log(error);
    }
  }, []);

  return (
    <div className="relative h-full w-full bg-[url('/images/image1.png')] bg-no-repeat  bg-fixed bg-cover">
      <div className="bg-black w-full h-full lg:bg-opacity-50">
        <nav className="">
          <img src="/images/logo.png" alt="Logo" className="h-24 w-auto" />
        </nav>
        <div className="flex justify-center">
          <div className="bg-black bg-opacity-90 px-14 py-14 self-center lg:w-2/5 lg:max-w-md rounded-md">
            <h2 className="text-white text-4xl mb-8 font-semibold">
              {/* 登録済みの場合、Sign In, 未登録の場合はRegister */}
              {/* 反映されないときは、npm run devで再起動してみる */}
              {variant === 'login' ? 'Sign In' : 'Register'}
            </h2>
            {/* 入力欄の間隔を若干空ける */}
            <div className="flex flex-col gap-4">
              {/* 氏名は登録時のみ入力 */}
              {variant === 'register' && (
                <Input
                  id="name"
                  onChange={(event:any) => setName(event.target.value)}
                  type="name"
                  label="Name"
                  value={name}
                />
              )}
              {/* inputコンポーネントの再利用 */}
              <Input
                id="email"
                onChange={(event:any) => setEmail(event.target.value)}
                type="email"
                label="Email"
                value={email}
              />
              
              <Input
                id="password"
                // eventにanyを指定しないとエラーになるが、typescriptの恩恵を受けられていない？
                onChange={(event:any) => setPassword(event.target.value)}
                type="password"
                label="Password"
                // usestateのpassword
                value={password}
              />
              </div>
              <button className="bg-red-600 py-3 text-white rounded-md w-full mt-10 hover:bg-red-700 transition">
                {variant === 'login' ? 'Login' : 'Sign Up'}
              </button>
              <p className="text-neutral-500 mt-7">
                {variant === 'login' ? 'First time using Netflix?' : 'Already have an account?'}
                {/* このボタンを押したときに、アカウント作成、ログインの画面が切り替わるようにする */}
                <span onClick={toggleVariant} className="text-white ml-1 hover:underline cursor-pointer">
                  {variant === 'login' ? 'Create an account' : 'Sign In'}
                </span>
              </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Auth;