//import { useEffect, useState } from "react";
export default async function Home() {
  //const [data, setData] = useState(undefined);

  const data =  await fetch('http://localhost:3000/test/api').then((res) => res.json())
/*useEffect(() => {
    fetch('http://localhost:3000/test/api').then((res) => res.json()).then((data) => {
      setData(data);
    })
  }, [])*/
  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <p>
        {(data as any)?.message}
      </p>
    </main>
  );
}
