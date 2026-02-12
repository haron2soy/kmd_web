import { Routes, Route } from "react-router-dom"
import NoaaNcepPage from "../pages/products/NoaaNcepPage"

export default function AppRoutes() {
  return (
    <Routes>
      <Route
        path="/products/noaa-ncep"
        element={<NoaaNcepPage />}
      />
    </Routes>
  )
}
