import ItemsForm from "../ItemsForm/ItemsForm.component"
import NavbarLayout from "./Navbar.layout";

export default function Navbar() {
  return (
    <NavbarLayout 
      getItemsForm={(props) => (
        <ItemsForm 
        newItem={props.isAddingNewUser} 
        onClose={props.onClose} 
        />
      )}
    />
  )
}