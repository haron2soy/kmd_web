import { Switch, Route } from "wouter";
import { queryClient } from "@/lib/queryClients";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/shared/components/ui/toaster";
import { TooltipProvider } from "@/shared/components/ui/tooltip";

import { BackendGuard } from "@/shared/guards/BackendGuards";

import NotFound from "@/features/home/not-found";
import Home from "@/features/home/Home";
import DynamicPage from "@/features/cms/pages/DynamicPage";
import Contact from "@/features/home/Contact";
import PlaceholderPage from "@/features/home/PlaceholderPage";
import ProductsLanding from "@/features/products/pages/ProductsLanding";
import UKTephigrams from "@/features/products/pages/Regional/UKTephigrams";
import UKEPS from "@/features/products/pages/Regional/UKEPS";
import LakeVictoria from "@/features/products/pages/Regional/LakeVictoria";
import NOAANCEP from "@/features/products/pages/Global/NOAANCEP";
import UKAfricaVCP from "@/features/products/pages/Global/UKAfricaVCP";
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
      <Route path="/products" component={ProductsLanding} />
      <Route path="/products/uk-tephigrams" component={UKTephigrams} />
      <Route path="/products/uk-eps" component={UKEPS} />
      <Route path="/products/lake-victoria" component={LakeVictoria} />
      <Route path="/products/noaa-ncep" component={NOAANCEP} />
      <Route path="/products/uk-africa-vcp" component={UKAfricaVCP} />
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
