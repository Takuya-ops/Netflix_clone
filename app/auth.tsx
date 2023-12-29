import { useState } from "react";
import Input from "./Input";

const Auth = () => {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  return (
    <div className="relative h-full w-full bg-[url('/images/image2.png')] bg-no-repeat  bg-fixed bg-cover">
      <div className="flex justify-center">
        <div className="bg-black bg-opacity-90 px-16 py-16 self-center lg:w-2/5 lg:max-w-md rounded-md">
          <h2 className="text-white text-4xl mb-8 font-semibold">
            Sign In
          </h2>
          {/* 入力欄の間隔を若干空ける */}
          <div className="flex flex-col gap-4">
            <Input
              id="name"
              onChange={(event:any) => setName(event.target.value)}
              type="name"
              label="Name"
              value={name}
            />
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
        </div>
      </div>
    </div>
  );
}

export default Auth;