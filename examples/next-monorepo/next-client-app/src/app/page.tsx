'use client';

import { useEffect, useState } from 'react';

export default function Home() {
  const [data, setData] = useState(undefined);

  useEffect(() => {
    fetch('http://localhost:3000/test/api', { cache: 'no-cache' })
      .then((res) => res.json())
      .then((data) => {
        setData(data);
      });
  }, []);

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <p>{(data as any)?.message}</p>
    </main>
  );
}
