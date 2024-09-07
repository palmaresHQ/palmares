import { Fragment,  PropsWithChildren } from 'react';
import { VirtualItem } from '@tanstack/react-virtual';

import type { ArrayInventoryOutput } from 'shared';


export default function ItemLayout(props: PropsWithChildren<{
  isLoaderRow: boolean,
  virtualRow: VirtualItem,
  hasMore: boolean,
  item?: ArrayInventoryOutput[number], 
  onRemove: () => void;
  onOpenEdit: () => void;
  onOpenAssign: () => void;
}>) {
  const textByStatus = {
    available: 'Available',
    use: 'In Use',
    maintenance: 'In Maintenance',
  };
  const warrantyExpiryDate = new Date(props.item?.warrantyExpiryDate as string);
  const today = new Date();
  const isExpired = warrantyExpiryDate < today;
  const isExpiringSoon = warrantyExpiryDate < new Date(today.setDate(today.getDate() + 30));
  
  return (
    <Fragment>
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: `${props.virtualRow.size}px`,
          transform: `translateY(${props.virtualRow.start}px)`,
        }}
      >
        {props.item === undefined ? (
          props.isLoaderRow
            ? props.hasMore
              ? (
                <div className="w-full flex flex-col items-center">
                  <p>Loading...</p>
                </div>
              )
              : null
            : 'No items found'
        ) : (
          <div className="w-full flex flex-col items-center mb-3 relative">
            <div 
            className="flex flex-row items-center justify-between max-w-[748px] w-full border-gray-500 border-[1px] p-6 rounded-lg md:flex-col md:pb-3"
            >
              <div className="flex flex-row items-center md:flex-col">
                <div className="flex w-24 h-24 bg-black rounded-md overflow-hidden">
                  <img src={props.item.imageUrl} alt={`The photo of computer with serial ${props.item.serial}`}/>
                </div>
                <div className="flex flex-col ml-16 w-60 md:w-52 md:self-start md:mr-0 md:ml-0 md:mt-3 whitespace-nowrap overflow-hidden">
                  <p className="text-sm"><span className="text-gray-400 select-none">Serial Number: </span>{props.item.serial}</p>
                  <p className="text-sm"><span className="text-gray-400 select-none">Manufacturer: </span>{props.item.manufacturer}</p>
                  <p className="text-sm">
                    <span className="text-gray-400 select-none ">Status: </span>
                    <span className={props.item.status === 'maintenance' ? `text-red-400` : props.item.status === 'available' ? 'text-green-400' : ''}>
                      {textByStatus[props.item.status]}
                    </span>
                  </p>
                  <p className="text-sm text-ellipsis max-w-48 md:max-w-52 whitespace-nowrap overflow-hidden"><span className="text-gray-400 select-none">Specification: </span>{props.item.specifications}</p>
                </div>
                <div className="flex flex-col mr-3 md:self-start md:mr-0 md:ml-0 md:mt-3 whitespace-nowrap overflow-hidden">
                  <p className="text-sm"><span className="text-gray-400 select-none ">Purchased on: </span>
                    {Intl.DateTimeFormat('en-US').format(new Date(props.item.purchaseDate as string))}
                  </p>
                  <p className="text-sm"><span className={`text-gray-400 select-none`}>Warranty until: </span>
                    <span className={`${isExpired ? 'text-red-400' : isExpiringSoon ? 'text-yellow-400' : 'text-green-400'}`}>
                      {Intl.DateTimeFormat('en-US').format(new Date(props.item.warrantyExpiryDate as string))}
                    </span>
                  </p>
                  <p className="text-sm"><span className="text-gray-400 select-none">Assigned on: </span>
                    {props.item?.user ? `${props.item?.user?.firstName} ${props.item?.user?.lastName}` : (
                      <span className="text-gray-300 select-none">No person assigned</span>
                    )}
                  </p>
                  <p className="text-sm"><span className="text-gray-400 select-none">Assigned to: </span>
                    {props.item?.user ? `${props.item?.user?.firstName} ${props.item?.user?.lastName}` : (
                      <span className="text-gray-300 select-none">No person assigned</span>
                    )}
                  </p>
                </div>
              </div>
              <div className="flex flex-col self-stretch justify-between md:flex-row md:pt-3">
                <button 
                className='hover:bg-gray-100 p-2 rounded-full' 
                type="button" 
                title="Assign user"
                onClick={() => props.onOpenAssign()}
                >
                  <svg viewBox='0 0 50 50' className="w-5 h-5">
                    <path d='M 3 45 Q 25 0 47 45 L 3 45' stroke='black' strokeWidth='2' fill={'transparent'} />
                    <circle cx='25' cy='20' r='14' stroke='black' strokeWidth='2' fill={'white'}/>
                  </svg>
                </button>
                <button 
                className='hover:bg-gray-100 p-2 rounded-full' 
                type="button" 
                title="Edit item" 
                onClick={() => props.onOpenEdit()}
                >
                  <svg viewBox='0 0 50 50' className="w-5 h-5">
                    <path 
                      d='M30.2697 8.24847L41.7516 19.7304M3 47H14.4819L44.6218 16.8599C46.1444 15.3373 47 13.2722 47 11.119C47 8.96567 46.1444 6.90059 44.6218 5.37798C43.0994 3.85539 41.0343 3 38.8808 3C36.7276 3 34.6625 3.85539 33.1399 5.37798L3 35.518V47Z' 
                      stroke='black' 
                      strokeWidth='2'
                      fill="transparent"
                    />
                  </svg>
                </button>
                <button 
                className='hover:bg-gray-100 p-2 rounded-full' 
                type="button" 
                title="Remove item"
                onClick={() => { 
                  if (props.item) props.onRemove();
                }}
                >
                  <svg viewBox='0 0 50 50' className="w-5 h-5">
                    <path d='M 3 3 L 47 47 M 3 47 L 47 3' stroke='black' strokeWidth='2' />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
      {props.children}
    </Fragment>
  );
}