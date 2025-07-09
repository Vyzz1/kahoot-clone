import { Outlet } from "react-router-dom";

const LayoutDefault = () => {
  return (
    <div className="antialiased">
      <div>Header</div>
      <main className="min-h-screen ">
        <Outlet />
      </main>

      <div>Footer</div>
    </div>
  );
};

export default LayoutDefault;
