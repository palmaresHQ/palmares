import { useState } from "react";

export default function NavbarLayout(props: {
  getItemsForm: (props: {
    isAddingNewUser: boolean, 
    onClose: () => void
  }) => JSX.Element;
}) {
  const [isAddingNewUser, setIsAddingNewUser] = useState(false);

  return (
    <nav className={"flex flex-col w-full p-2 border-b-2 border-gray-200 mb-1"}>
      <ul className={"flex flex-row w-full justify-between items-center"}>
        <li className={"mr-4"}>
          <h1 className="font-bold text-xl select-none">Velozient Computers</h1>
        </li>
        <li className={"p-3 border-t-[1px] text-blue-600 font-bold hover:text-blue-800 rounded-b-md"}>
          <button type="button" className="flex text-center" 
          onClick={() => setIsAddingNewUser((prevValue) => !prevValue)}>+ Add computer</button>
          {props.getItemsForm({
            isAddingNewUser,
            onClose: () => setIsAddingNewUser(false)
          })}
          
        </li>
      </ul>
    </nav>
  )
}