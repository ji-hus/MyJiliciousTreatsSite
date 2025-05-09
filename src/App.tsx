import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, createBrowserRouter, RouterProvider } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { MenuProvider } from "@/contexts/MenuContext";
import { OrderProvider } from "@/contexts/OrderContext";
import Layout from "./components/Layout";
import HomePage from "./pages/Index";
import MenuPage from "./pages/Menu";
import OrderPage from "./pages/Order";
import FAQPage from "./pages/FAQ";
import ContactPage from "./pages/Contact";
import AdminPage from "./pages/Admin";
import LoginPage from "./pages/Login";
import OrderManagement from "./pages/OrderManagement";
import InventoryManagement from "./pages/InventoryManagement";
import ProtectedRoute from "./components/ProtectedRoute";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const router = createBrowserRouter([
  {
    path: "/",
    element: <Layout><HomePage /></Layout>
  },
  {
    path: "/menu",
    element: <Layout><MenuPage /></Layout>
  },
  {
    path: "/order",
    element: <Layout><OrderPage /></Layout>
  },
  {
    path: "/faq",
    element: <Layout><FAQPage /></Layout>
  },
  {
    path: "/contact",
    element: <Layout><ContactPage /></Layout>
  },
  {
    path: "/login",
    element: <Layout><LoginPage /></Layout>
  },
  {
    path: "/admin",
    element: (
      <Layout>
        <ProtectedRoute>
          <AdminPage />
        </ProtectedRoute>
      </Layout>
    )
  },
  {
    path: "/admin/orders",
    element: (
      <Layout>
        <ProtectedRoute>
          <OrderManagement />
        </ProtectedRoute>
      </Layout>
    )
  },
  {
    path: "/admin/inventory",
    element: (
      <Layout>
        <ProtectedRoute>
          <InventoryManagement />
        </ProtectedRoute>
      </Layout>
    )
  },
  {
    path: "*",
    element: <NotFound />
  }
]);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <MenuProvider>
        <OrderProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <RouterProvider router={router} />
          </TooltipProvider>
        </OrderProvider>
      </MenuProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
