interface InputProps {
  id: string;
  onChange: any;
  value: string;
  label: string;
  type?: string;
}

const Input: React.FC<InputProps> = ({
  id,
  onChange,
  value,
  label,
  type,
}) => {
  return (
    // inputタグとlabelタグの位置を揃えるには、親タグのclassNameにrelativeを指定する
    <div className="relative">
      <input
        id={id}
        type={type}
        value={value}
        onChange={onChange}
        className="
          block
          rounded-md
          px-6
          pt-7
          pb-3
          w-full
          text-md
          text-white
          bg-neutral-700
          appearance-none
          focus:outline-none
          focus:ring-0
          peer
        "
        // この空のplaceholderがないと、カーソルを合わせる前から文字が小さくなってしまう。
        placeholder=""
        />
      <label
      // 入力時はplaceholderの文字が上側に表示されるようにする
      className="
        absolute
        text-md
        text-zinc-400
        duration-150
        transform
        -translate-y-3
        scale-75
        top-5
        z-10
        origin-[0]
        left-5
        peer-placeholder-shown:scale-100
        peer-placeholder-shown:translate-y-0
        peer-focus:scale-75
        peer-focus:-translate-y-4
      "
      htmlFor={id}>
        {label}
      </label>
    </div>
  )
}
export default Input