import { Switch, Route } from "wouter";
import { queryClient } from "@/lib/queryClients";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/shared/components/ui/toaster";
import { TooltipProvider } from "@/shared/components/ui/tooltip";
import WrfViewer from "@/features/nwp/pages/WrfViewer";

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
import NWPLanding from "@/features/nwp/pages/NWPLanding";

import ForecastLanding from "@/features/forecasts/ForecastLanding";
import Day1 from "@/features/forecasts/ShortRange/Day1";
import Day2 from "@/features/forecasts/ShortRange/Day2";
import RiskTableShort from "@/features/forecasts/ShortRange/RiskTableShort";
import DiscussionShort from "@/features/forecasts/ShortRange/DiscussionShort";

import Day3 from "@/features/forecasts/MediumRange/Day3";
import Day4 from "@/features/forecasts/MediumRange/Day4";
import Day5 from "@/features/forecasts/MediumRange/Day5";
import RiskTableMedium from "@/features/forecasts/MediumRange/RiskTableMedium";
import DiscussionMedium from "@/features/forecasts/MediumRange/DiscussionMedium";

import ArchivePage from "@/features/forecasts/Archive/ArchivePage";

import SWFPLanding from "@/features/swfp/SWFPLanding";
import EventTable from "@/features/swfp/eventtable/EventTable";
import QuarterlyReport from "@/features/swfp/quarterlyreport/QuarterlyReport";

import NewsDetail from "@/features/home/NewsDetail";

import NationalMetServicesLanding from "@/features/national_met_services/NationalMetLanding";
import RedirectPage from "@/features/national_met_services/pages/RedirectPage";

import RegionalInternationalLanding  from "@/features/regional_and_international/RegionalInternationalLanding";
import RedirectRegionalInternational from "@/features/regional_and_international/pages/RedirectRegionalInternational";

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
      <Route path="/nwp-models" component={NWPLanding} />
      <Route path="/nwp-models/wrf" component={WrfViewer} />

      <Route path="/forecasts" component={ForecastLanding} />
      <Route path="/forecasts/day-1" component={Day1} />
      <Route path="/forecasts/day-2" component={Day2} />
      <Route path="/forecasts/risk-table-short" component={RiskTableShort} />
      <Route path="/forecasts/discussion-short" component={DiscussionShort} />

      <Route path="/forecasts/day-3" component={Day3} />
      <Route path="/forecasts/day-4" component={Day4} />
      <Route path="/forecasts/day-5" component={Day5} />
      <Route path="/forecasts/risk-table-medium" component={RiskTableMedium} />
      <Route path="/forecasts/discussion-medium" component={DiscussionMedium} />

      <Route path="/forecasts/archive" component={ArchivePage} />
      <Route path="/swfp-evaluation" component={SWFPLanding} />
      <Route path="/swfp-evaluation/event-table" component={EventTable} />
      <Route path="/swfp-evaluation/quarterly-report" component={QuarterlyReport} />
      
      <Route path = "/news/:slug" component={NewsDetail} />
      <Route path = "/national" component={NationalMetServicesLanding} />
      <Route path = "/national/:slug" component={RedirectPage} />
      
      <Route path = "/regional-international" component={RegionalInternationalLanding} />
      <Route path = "/regional-international/:slug" component={RedirectRegionalInternational} />
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
