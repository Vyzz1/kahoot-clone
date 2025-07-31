import { Outlet } from "react-router-dom";
import Header from "@/components/header";

const LayoutDefault = () => {
  return (
    <div className="antialiased">
      <Header />
      <main className="min-h-screen ">
        <Outlet />
      </main>
    </div>
  );
};

export default LayoutDefault;
