import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Home } from "@/pages/Home";
import { GiveawayDetail } from "@/pages/GiveawayDetail";
import { DrawPage } from "@/pages/DrawPage";
import { AdminDashboard } from "@/pages/AdminDashboard";
import { AdminGuard } from "@/components/AdminGuard";
import { Terms } from "@/pages/Terms";
import { Privacy } from "@/pages/Privacy";
import { Rules } from "@/pages/Rules";
import { MyReferrals } from "@/pages/MyReferrals";
import { Profile } from "@/pages/Profile";
import { BushmillsExperience } from "@/pages/BushmillsExperience";
import { HowItWorks } from "@/pages/HowItWorks";
import { ResponsibleDrinking } from "@/pages/ResponsibleDrinking";
import { Faq } from "@/pages/Faq";
import { WinnerSelection } from "@/pages/WinnerSelection";
import { PreLaunchChecklist } from "@/pages/PreLaunchChecklist";
import { AdminDraws } from "@/pages/AdminDraws";
import NotFound from "@/pages/not-found";
import { AgeGate } from "@/components/AgeGate";

const queryClient = new QueryClient();

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/giveaway/:id" component={GiveawayDetail} />
      <Route path="/draw/:id" component={DrawPage} />
      <Route path="/admin">{() => <AdminGuard><AdminDashboard /></AdminGuard>}</Route>
      <Route path="/admin/pre-launch-checklist">{() => <AdminGuard><PreLaunchChecklist /></AdminGuard>}</Route>
      <Route path="/admin/draws">{() => <AdminGuard><AdminDraws /></AdminGuard>}</Route>
      <Route path="/terms" component={Terms} />
      <Route path="/privacy" component={Privacy} />
      <Route path="/rules" component={Rules} />
      <Route path="/my-referrals" component={MyReferrals} />
      <Route path="/profile" component={Profile} />
      <Route path="/experiences/bushmills" component={BushmillsExperience} />
      <Route path="/how-it-works" component={HowItWorks} />
      <Route path="/responsible-drinking" component={ResponsibleDrinking} />
      <Route path="/faq" component={Faq} />
      <Route path="/how-winners-are-selected" component={WinnerSelection} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AgeGate>
          <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
            <Router />
          </WouterRouter>
          <Toaster />
        </AgeGate>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
