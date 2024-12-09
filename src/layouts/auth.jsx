import { Routes, Route } from "react-router-dom";
import { getRoutes } from "@/routes";

export function Auth() {

  return (
    <div className="relative min-h-screen w-full">
      <Routes>
        {getRoutes().map(
          ({ layout, pages }) =>
            layout === "auth" &&
            pages.map(({ path, element }) => (
              <Route exact path={path} element={element} />
            ))
        )}
      </Routes>
    </div>
  );
}

Auth.displayName = "/src/layout/Auth.jsx";

export default Auth;
