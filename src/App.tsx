import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import HomePage from "./pages/Index";
import MenuPage from "./pages/Menu";
import OrderPage from "./pages/Order";
import BulkOrderPage from "./pages/BulkOrder";
import FAQPage from "./pages/FAQ";
import ContactPage from "./pages/Contact";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Layout><HomePage /></Layout>} />
          <Route path="/menu" element={<Layout><MenuPage /></Layout>} />
          <Route path="/order" element={<Layout><OrderPage /></Layout>} />
          <Route path="/bulk-order" element={<Layout><BulkOrderPage /></Layout>} />
          <Route path="/faq" element={<Layout><FAQPage /></Layout>} />
          <Route path="/contact" element={<Layout><ContactPage /></Layout>} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
