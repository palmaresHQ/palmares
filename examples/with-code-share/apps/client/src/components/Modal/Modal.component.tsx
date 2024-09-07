import { PropsWithChildren, useEffect, useRef, useState } from "react";

export default function Modal(props: PropsWithChildren<{ title: string; open: boolean, onOpen: (isOpen: boolean) => void }>) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [isOpen, setIsOpen] = useState(props.open);
  
  useEffect(() => {
    setIsOpen(props.open);
  }, [props.open]);

  return (
    <dialog ref={dialogRef} open={isOpen} className={`${isOpen ? 'flex' : 'none'} fixed z-10 top-0 bottom-0 flex-col w-[100vw] h-[100vh] bg-black bg-opacity-30`}
    >
      <div className="flex self-center justify-center w-full h-full">
        <div className="flex flex-col self-center justify-between bg-white rounded-md">
          <div className="flex flex-row w-full self-start items-center justify-between border-b-2 border-gray-100">
            <h1 className="ml-3 font-bold text-xl text-gray-800">
              {props.title}
            </h1>
            <button
            className="flex p-3 rounded-md hover:bg-gray-50 text-blue-500"
            type="button"
            onClick={() => {
              dialogRef.current?.close();
              props.onOpen(false)
              setIsOpen(false)
            }}>
              Close
            </button>
          </div>
          {props.children}
        </div>
      </div>
    </dialog>
  )
}