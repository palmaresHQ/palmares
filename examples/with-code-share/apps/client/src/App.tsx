import { QueryClientProvider } from "@tanstack/react-query";
import Main from "./components/main";
import { queryClient } from "./utils";

function App() {
  return (
    <>
      <QueryClientProvider client={queryClient}>
        <Main />
      </QueryClientProvider>
    </>
  )
}

export default App
