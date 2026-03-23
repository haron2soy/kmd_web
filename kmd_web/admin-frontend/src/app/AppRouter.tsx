import { BrowserRouter, Routes, Route } from "react-router-dom";
import AdminDashboard from "../features/pages/AdminDashboard";
import ProtectedRoute from "../shared/components/protected/ProtectedRoute";
import Login from "../features/user_authentication/Login";
import Register from "../features/user_authentication/Register";
import Logout from "../features/user_authentication/Logout";
import { PageLayout } from "../shared/components/layout/PageLayout";

function Router() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<PageLayout />}>
            {/* Public route */}
            {/* <Route path="/login" element={<Login />} /> */}

            {/* Protected admin route */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/logout" element={<Logout />} />
            

            <Route
              path="/"
                element={
                  <ProtectedRoute>
                    <AdminDashboard />
                  </ProtectedRoute>
                }
            />
        </Route>
            {/* 404 fallback */}
            <Route path="*" element={<h1>404 - Not Found</h1>} />
      </Routes>
    </BrowserRouter>
  );
}

export default Router;