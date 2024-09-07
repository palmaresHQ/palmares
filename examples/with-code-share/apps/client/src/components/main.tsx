import Items from "./Items/Items.component";
import Navbar from "./Navbar/Navbar.component";

export default function Main() {
  return (
  <main
  className="flex flex-col w-[100vw] h-[100vh] overflow-hidden"
  >
    <Navbar />
    <Items />
  </main>)
}