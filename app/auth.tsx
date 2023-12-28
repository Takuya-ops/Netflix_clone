import Input from "./Input";

const Auth = () => {
  return (
    <div className="relative h-full w-full bg-[url('/images/image2.png')] bg-no-repeat  bg-fixed bg-cover">
      <div className="flex justify-center">
        <div className="bg-black bg-opacity-90 px-16 py-16 self-center lg:w-2/5 lg:max-w-md rounded-md">
          <h2 className="text-white text-4xl mb-8 font-semibold">
            Sign In
          </h2>
          <Input/>
        </div>
      </div>
    </div>
  );
}

export default Auth;