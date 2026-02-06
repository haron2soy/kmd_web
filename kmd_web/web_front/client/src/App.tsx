import { Switch, Route } from "wouter";
import { queryClient } from "@/lib/queryClients";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";

import { BackendGuard } from "@/components/backendguard";

import NotFound from "@/pages/not-found";
import Home from "@/pages/Home";
import DynamicPage from "@/pages/DynamicPage";
import Contact from "@/pages/Contact";
import PlaceholderPage from "@/pages/PlaceholderPage";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/contact" component={Contact} />
      <Route path="/pages/:slug" component={DynamicPage} />

      <Route path="/news">
        <PlaceholderPage title="News & Announcements" />
      </Route>

      <Route path="/publications">
        <PlaceholderPage title="Publications & Documents" />
      </Route>

      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />

        <BackendGuard>
          <Router />
        </BackendGuard>

      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
