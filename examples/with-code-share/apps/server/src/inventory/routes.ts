import { path, pathNested } from "@palmares/server";
import { editInventoryController, inventoryController } from "./controllers";

export const inventoryPath = path('/inventory');
export const editInventoryPath = pathNested<typeof inventoryPath>()('/<uuid: {[\\w-]+}:string>');

const route = inventoryPath.nested([
  inventoryController,
  editInventoryPath.nested([editInventoryController])
]);

export default route;
