import { useHasteHealth } from "@haste-health/components";
import { Outlet, useNavigate } from "react-router";

export default function Layout() {
  const navigation = useNavigate();
  const hasteHealth = useHasteHealth();

  return (
    <>
      <div className="flex px-8 py-4 justify-center items-center sticky top-0 bg-white border-b z-20 text-orange-950">
        <div>
          <h1
            className="text-2xl font-bold cursor-pointer hover:text-orange-600"
            onClick={(_e) => {
              navigation("/");
            }}
          >
            Haste Health Sample Web App
          </h1>
        </div>
        <div className="flex grow" />
        <div
          className="cursor-pointer hover:text-orange-600"
          onClick={(_e) => {
            hasteHealth.logout(window.location.origin);
          }}
        >
          <span>Logout</span>
        </div>
      </div>
      <div className="mt-2 container mx-auto">
        <Outlet />
      </div>
    </>
  );
}
