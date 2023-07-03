import { useSession } from "next-auth/react";
import Layout from "./Components/Layout";

export default function Home() {
  const { data: session } = useSession();
  return(
    <Layout>
      <div className="text-blue-900 flex justify-between">
        <h2>Olá, <b> { session?.user?.name } </b></h2>
        <div className="flex bg-gray-300 gap-1 text-black rounded-lg overflow-hidden">
          <img className="w-8 h-8" src={session?.user?.image} alt="ProfilePhoto" ></img>
          <span className="px-2 py-1">
            { session?.user?.name }
          </span>
        </div>
        </div>
    </Layout>
  )
}
