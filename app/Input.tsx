const Input = () => {
  return (
    <div>
      <input
        className="
          block
          rounded-md
          px-4
          pt-4
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
        placeholder="　"
      />
      <label
      // 入力時はplaceholderの文字が上側に表示されるようにする
      className="

      "
      htmlFor="email">
        Email
      </label>
    </div>
  )
}
export default Input