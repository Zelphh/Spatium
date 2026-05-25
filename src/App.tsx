import { Toaster } from "@/components/ui/toaster";
import NotificationManager from "@/components/notificationManager";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import { AccentProvider } from "@/contexts/AccentContext";
import { AppLayout } from "@/components/layout/AppLayout";
import HomePage from "./pages/Home";
import Index from "./pages/Timer/Index";
import History from "./pages/History";
import Stats from "./pages/Stats";
import Settings from "./pages/Settings";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
      <AccentProvider>
        <TooltipProvider>
          <Toaster />
          <NotificationManager />
          <BrowserRouter>
            <Routes>
              <Route element={<AppLayout />}>
                <Route path="/" element={<HomePage />} />
                <Route path="/timer" element={<Index />} />
                <Route path="/history" element={<History />} />
                <Route path="/stats" element={<Stats />} />
                <Route path="/settings" element={<Settings />} />
              </Route>
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </AccentProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
