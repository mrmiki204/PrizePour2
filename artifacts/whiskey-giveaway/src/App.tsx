import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Home } from "@/pages/Home";
import { GiveawayDetail } from "@/pages/GiveawayDetail";
import { DrawPage } from "@/pages/DrawPage";
import { AdminDashboard } from "@/pages/AdminDashboard";
import { Terms } from "@/pages/Terms";
import { Privacy } from "@/pages/Privacy";
import { Rules } from "@/pages/Rules";
import { MyReferrals } from "@/pages/MyReferrals";
import { Profile } from "@/pages/Profile";
import NotFound from "@/pages/not-found";

const queryClient = new QueryClient();

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/giveaway/:id" component={GiveawayDetail} />
      <Route path="/draw/:id" component={DrawPage} />
      <Route path="/admin" component={AdminDashboard} />
      <Route path="/terms" component={Terms} />
      <Route path="/privacy" component={Privacy} />
      <Route path="/rules" component={Rules} />
      <Route path="/my-referrals" component={MyReferrals} />
      <Route path="/profile" component={Profile} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          <Router />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
