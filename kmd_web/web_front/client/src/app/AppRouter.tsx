import { Switch, Route } from "wouter";
import { queryClient } from "@/lib/queryClients";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/shared/components/ui/toaster";
import { TooltipProvider } from "@/shared/components/ui/tooltip";
import WrfViewer from "@/features/nwp/pages/WrfViewer";

import { BackendGuard } from "@/shared/guards/BackendGuards";

import NotFound from "@/features/home/not-found";
//import Home from "@/features/home/Home";
import DynamicPage from "@/features/home/pages/DynamicPage";
import Contact from "@/features/home/Contact";
import PlaceholderPage from "@/features/home/PlaceholderPage";
import ProductsLanding from "@/features/products/Global/ProductsLanding";
import MarineForecastDaily from "@/features/forecasts/Guidance/MarineForecastDaily";
import MarineForecastSevenDays from "@/features/forecasts/Guidance/MarineForecastSevenDays";
import EAswfpDiscussion from "@/features/forecasts/Guidance/EAswfpDiscussion";
import NWPLanding from "@/features/nwp/pages/NWPLanding";
import GuidanceArchive from "@/features/forecasts/Guidance/GuidanceArchive";

import ForecastLanding from "@/features/forecasts/ForecastLanding";
import GuidanceLanding from "@/features/forecasts/Guidance/GuidanceLanding";

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
//import Login from "../features/user_authentication/Login";
import ProtectedRoute from "../features/user_authentication/ProtectedRoute";
import ForgotPassword from "@/features/ForgotPassword";
import {PageLayout} from "@/shared/components/layout/PageLayout";

import Register from "@/features/user_authentication/User_Registration";
//import VerifyEmail from "@/features/user_authentication/VerifyEmail";

import RedirectProducts from "@/features/products/pages/RedirectProducts";

import ResetPassword from "@/features/user_authentication/ResetPassword";
import SetPassword from "@/features/user_authentication/SetPassword";
import { BackendProvider } from "@/shared/guards/BackendProvider";
import RootRoute from "./RootRoute";


function Router() {
  return (
    <AuthProvider>
      <PageLayout>
        <Switch>
          <Route path="/register" component={Register} />
          {/* Auth routes */}
          <Route path="/" component={RootRoute} />

          <Route path="/forgot-password" component={ForgotPassword} />
          <Route path="/reset-password/:uid/:token" component={ResetPassword} />
          <Route path="/set-password/:uid/:token" component={SetPassword} />
          
          <Route path="/contact" component={Contact} />
          <ProtectedRoute path="/pages/:slug"> <DynamicPage /> </ProtectedRoute> 
          
          
          
          <Route path="/news">
            <PlaceholderPage title="News & Announcements" />
          </Route>

          <Route path="/publications">
            <PlaceholderPage title="Publications & Documents" />
          </Route>
          <ProtectedRoute path="/products"> <ProductsLanding /> </ProtectedRoute>
          
          <Route path = "/products/:slug" component={RedirectProducts} />
          

          <ProtectedRoute path="/nwp-models"> <NWPLanding /> </ProtectedRoute> 
          <ProtectedRoute path="/nwp-models/:modelId"> <WrfViewer /> </ProtectedRoute>

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
          <ProtectedRoute path="/guidance/archive" > <GuidanceArchive /> </ProtectedRoute> 
          
          
          <ProtectedRoute path="/guidance" > <GuidanceLanding /> </ProtectedRoute> 
          <ProtectedRoute path="/guidance/marine-forecast-daily" > <MarineForecastDaily /> </ProtectedRoute> 
          <ProtectedRoute path="/guidance/marine-forecast-seven-days" > <MarineForecastSevenDays /> </ProtectedRoute> 
          <ProtectedRoute path="/guidance/easwfp-discussion-daily" > <EAswfpDiscussion /> </ProtectedRoute> 
          
          <ProtectedRoute path="/swfp-evaluation" > <SWFPLanding /> </ProtectedRoute>
          <ProtectedRoute path="/swfp-evaluation/event-table" > <EventTable /> </ProtectedRoute> 
          <ProtectedRoute path="/swfp-evaluation/quarterly-report" > <QuarterlyReport /> </ProtectedRoute>
          <ProtectedRoute path="/national" > <NationalMetServicesLanding /> </ProtectedRoute>
          <ProtectedRoute path="/national/:slug" > <RedirectPage /> </ProtectedRoute>
                            
          <ProtectedRoute path = "/news/:slug"> <NewsDetail /> </ProtectedRoute>

                    
          <ProtectedRoute path = "/regional-international"> <RegionalInternationalLanding /> </ProtectedRoute>
          <ProtectedRoute path = "/regional-international/:slug"> <RedirectRegionalInternational /> </ProtectedRoute>

          <ProtectedRoute path = "/regional-international"> <RegionalInternationalLanding /> </ProtectedRoute>
          <ProtectedRoute path = "/regional-international/:slug"> <RedirectRegionalInternational /> </ProtectedRoute>
          
          
          
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

        <BackendProvider>
          <BackendGuard>
            <Router />
          </BackendGuard>
        </BackendProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
