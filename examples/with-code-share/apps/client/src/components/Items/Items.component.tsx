import Item from "../Item/Item.component";
import { useItems } from "../../hooks";
import ItemsLayout from "./Items.layout";

export default function Items() {
  const {
    data,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    status,
  } = useItems()

  return (
    <ItemsLayout
    data={data}
    fetchNextPage={fetchNextPage}
    hasNextPage={hasNextPage}
    isFetchingNextPage={isFetchingNextPage}
    error={error}
    status={status}
    onRenderItem={(key, props) => (
      <Item 
      key={key}
      {...props}
      />
    )}
    />
  );
}