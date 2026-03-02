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

import { AuthProvider } from "../features/user_authentication/AuthContext";
import Login from "../features/user_authentication/Login";
import ProtectedRoute from "../features/user_authentication/ProtectedRoute";
import ForgotPassword from "@/features/ForgotPassword";
import {PageLayout} from "@/shared/components/layout/PageLayout";

import Register from "@/features/user_authentication/User_Registeration";
import VerifyEmail from "@/features/user_authentication/VerifyEmail";


function Router() {
  return (
    <AuthProvider>
      <PageLayout>
        <Switch>
          <Route path="/register" component={Register} />
          {/* Auth routes */}
          <Route path="/login" component={Login} />
          <Route path="/verify-email/:token?" component={VerifyEmail} />
          <Route path="/forgot-password" component={ForgotPassword} />
          
          <ProtectedRoute path="/"> <Home /> </ProtectedRoute> 
          <Route path="/contact" component={Contact} />
          <ProtectedRoute path="/pages/:slug"> <DynamicPage /> </ProtectedRoute> 
          
          
          
          <Route path="/news">
            <PlaceholderPage title="News & Announcements" />
          </Route>

          <Route path="/publications">
            <PlaceholderPage title="Publications & Documents" />
          </Route>
          <ProtectedRoute path="/products"> <ProductsLanding /> </ProtectedRoute>
          <Route path="/products/uk-tephigrams" component={UKTephigrams} />
          <Route path="/products/uk-eps" component={UKEPS} />
          <Route path="/products/lake-victoria" component={LakeVictoria} />
          <Route path="/products/noaa-ncep" component={NOAANCEP} />
          <Route path="/products/uk-africa-vcp" component={UKAfricaVCP} />
          
          <ProtectedRoute path="/nwp-models"> <NWPLanding /> </ProtectedRoute> 
          <ProtectedRoute path="/nwp-models/wrf"> <WrfViewer /> </ProtectedRoute> 

          <ProtectedRoute path="/forecasts" > <ForecastLanding /> </ProtectedRoute> 
          <ProtectedRoute path="/forecasts/day-1" > <Day1 /> </ProtectedRoute> 
          <ProtectedRoute path="/forecasts/day-2" > <Day2 /> </ProtectedRoute> 
          <ProtectedRoute path="/forecasts/risk-table-short" > <RiskTableShort /> </ProtectedRoute> 
          <ProtectedRoute path="/forecasts/discussion-short" > <DiscussionShort /> </ProtectedRoute>
     

          <ProtectedRoute path="/forecasts/day-3" > <Day3 /> </ProtectedRoute> 
          <ProtectedRoute path="/forecasts/day-4" > <Day4 /> </ProtectedRoute> 
          <ProtectedRoute path="/forecasts/day-5" > <Day5 /> </ProtectedRoute> 
          <ProtectedRoute path="/forecasts/risk-table-medium" > <RiskTableMedium /> </ProtectedRoute> 
          <ProtectedRoute path="/forecasts/discussion-medium" > <DiscussionMedium /> </ProtectedRoute>
          
          <ProtectedRoute path="/forecasts/archive" > <ArchivePage /> </ProtectedRoute> 
          <ProtectedRoute path="/swfp-evaluation" > <SWFPLanding /> </ProtectedRoute>
          <ProtectedRoute path="/swfp-evaluation/event-table" > <EventTable /> </ProtectedRoute> 
          <ProtectedRoute path="/swfp-evaluation/quarterly-report" > <QuarterlyReport /> </ProtectedRoute>
        
                    
          <Route path = "/news/:slug" component={NewsDetail} />
          <Route path = "/national" component={NationalMetServicesLanding} />
          <Route path = "/national/:slug" component={RedirectPage} />
          
          <Route path = "/regional-international" component={RegionalInternationalLanding} />
          <Route path = "/regional-international/:slug" component={RedirectRegionalInternational} />
          
          
          
          <Route component={NotFound} />
          
        </Switch>
      </PageLayout>
    </AuthProvider>
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
