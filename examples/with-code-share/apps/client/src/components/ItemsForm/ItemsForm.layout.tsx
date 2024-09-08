import { useEffect, useState } from "react";

import { InventoryInput, InventoryOutput, getInventorySchemaWithSave } from "@examples/with-code-share-shared";

import Modal from "../Modal/Modal.component";
import { formatErrors, MutationErrors, uuid } from "../../utils";

export default function ItemsFormLayout(props: {
  newItem?: boolean;
  item?: InventoryInput,
  onClose?: () => void,
  onAddOrUpdateData: (item: InventoryInput) => Promise<InventoryOutput | Error| MutationErrors>,
}) {
  const [isOpen, setIsOpen] = useState(props.item ? true : typeof props.newItem === 'boolean' ? props.newItem : false);
  const [item, setItem] = useState<InventoryInput | undefined>(props.item ? props.item : props.newItem ? getNewUser() : undefined);
  const [errors, setErrors] = useState<Record<string, {
    code: string;
    message: string;
  }>>({});

  function getNewUser() {
    return {
      uuid: uuid(),
      manufacturer: "Apple",
      serial: "",
      purchaseDate: new Date().toISOString(),
      warrantyExpiryDate: new Date().toISOString(),
      specifications: "",
      imageUrl: "",
      status: "available",
      userId: null,
    } satisfies InventoryInput
  }

  function onSubmit() {
    if (item) {
      getInventorySchemaWithSave(async (item) => {
        props.onAddOrUpdateData(item).then(() => {
          setErrors({});
          setIsOpen(false);
          setItem(undefined);
          if (props.onClose) props.onClose();
        }).catch((error) => {
          if (error instanceof MutationErrors) setErrors(formatErrors(error.errors));
        });
        return item;
      })
      .validate({ ...item }, {})
        .then((validateData) => {
          console.log(validateData);
          if (validateData.isValid === false) return setErrors(formatErrors(validateData.errors));
          else validateData.save();
      })
    }
  }

  useEffect(() => {
    if (typeof props.item === 'object') {
      if (props.item) setIsOpen(true);
      else setIsOpen(false);
      setItem(props.item);
    }
  }, [props.item]);

  useEffect(() => {
    if (typeof props.newItem === 'boolean') {
      if (props.newItem) setIsOpen(true);
      else setIsOpen(false);
      setItem(getNewUser());
    }
  }, [props.newItem]);

  return (
    <Modal title={'Manage Computer'} open={isOpen} onOpen={(isOpen) => {
      if (isOpen === false) {
        setItem(undefined);
        props.onClose?.();
      }
      setIsOpen(isOpen);
    }}>
      <form
      className="flex flex-col min-w-96 w-[50vw] max-w-[624px]"
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit()
      }}
      >
        <div className="flex flex-col p-3">
          <div className="flex flex-col pb-3">
            <label htmlFor="manufacturer" className="text-gray-400 text-sm font-normal select-none">
              Manufacturer
            </label>
            <select
              id="manufacturer"
              className="pr-3 pl-3 pt-1 pb-1 border-[1px] border-gray-200 rounded-md font-normal"
              value={item?.manufacturer === null ? undefined : item?.manufacturer }
              onChange={(e) => {
                const manufacturerAsType = e.target.value as InventoryInput["manufacturer"];
                if (item) setItem({ ...item, manufacturer: manufacturerAsType });
              }}
            >
              <option value="Apple">Apple</option>
              <option value="Dell">Dell</option>
              <option value="HP">HP</option>
              <option value="Lenovo">Lenovo</option>
            </select>
          </div>
          <div className="flex flex-col pb-3">
            <label htmlFor="serial" className="text-gray-400 text-sm font-normal select-none">Serial</label>
            <input
              className="pr-3 pl-3 pt-1 pb-1 border-[1px] border-gray-200 rounded-md font-normal"
              type="text"
              id="serial"
              value={item?.serial || ''}
              onChange={(e) => {
              if (item) setItem({ ...item, serial: e.target.value });
            }} />
            <small className="text-red-400 font-light text-[8pt]">{errors['serial']?.message}</small>
          </div>
          <div className="flex flex-col pb-3">
            <label
            htmlFor="purchaseDate"
            className="text-gray-400 text-sm font-normal"
            >
              Purchase Date
            </label>
            <input
              type="date"
              className="pr-3 pl-3 pt-1 pb-1 border-[1px] border-gray-200 rounded-md font-normal"
              id="purchaseDate"
              value={Intl.DateTimeFormat('en-CA').format(item?.purchaseDate ? new Date(item.purchaseDate) : new Date())}
              onChange={(e) => {
                if (item) setItem({ ...item, purchaseDate: new Date(e.target.value).toISOString() });
              }}
            />
            <small className="text-red-400 font-light text-[8pt]">{errors['purchaseDate']?.message}</small>
          </div>
          <div className="flex flex-col pb-3">
            <label htmlFor="warrantyExpiryDate" className="text-gray-400 text-sm font-normal">
              Warranty Expiry Date
            </label>
            <input
              type="date"
              id="warrantyExpiryDate"
              className="pr-3 pl-3 pt-1 pb-1 border-[1px] border-gray-200 rounded-md font-normal"
              value={Intl.DateTimeFormat('en-CA').format(item?.warrantyExpiryDate ? new Date(item.warrantyExpiryDate) : new Date())}
              onChange={(e) => {
                if (item) setItem({ ...item, warrantyExpiryDate: new Date(e.target.value).toISOString() });
              }}
            />
            <small className="text-red-400 font-light text-[8pt]">{errors['warrantyExpiryDate']?.message}</small>
          </div>
          <div className="flex flex-col pb-3">
            <label htmlFor="specifications" className="text-gray-400 text-sm font-normal">
              Specifications
            </label>
            <textarea
              id="specifications"
              className="pr-3 pl-3 pt-1 pb-1 border-[1px] border-gray-200 rounded-md font-normal"
              value={item?.specifications || ''}
              onChange={(e) => {
                if (item) setItem({ ...item, specifications: e.target.value });
              }}
            />
            <small className="text-red-400 font-light text-[8pt]">{errors['specifications']?.message}</small>
          </div>
          <div className="flex flex-col pb-3">
            <label htmlFor="imageUrl" className="text-gray-400 text-sm font-normal">
              Image URL
            </label>
            <input
              type="text"
              className="pr-3 pl-3 pt-1 pb-1 border-[1px] border-gray-200 rounded-md font-normal"
              id="imageUrl"
              value={item?.imageUrl || ''}
              onChange={(e) => {
                if (item) setItem({ ...item, imageUrl: e.target.value })
              }}
            />
            <small className="text-red-400 font-light text-[8pt]">{errors['imageUrl']?.message}</small>
          </div>
          <div className="flex flex-row">
            <input
              type="checkbox"
              id="status"
              checked={item?.status === 'maintenance'}
              onChange={(e) => {
                if (item) {
                  if (e.target.checked) setItem({ ...item, status: 'maintenance', userId: null, user: null, assignmentDate: null });
                  else setItem({ ...item, status: 'available', userId: null, user: null, assignmentDate: null });
                }
              }}
            />
            <label htmlFor="status" className="ml-1 font-bold text-gray-600 text-sm select-none cursor-pointer">Is in maintenance</label>
          </div>
        </div>
        <button type="submit" className="p-3 border-t-[1px] text-blue-600 font-bold hover:bg-gray-50 rounded-b-md">Save</button>
      </form>
    </Modal>
  );
}
