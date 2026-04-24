import { Navigate, Route, Routes } from "react-router-dom";
import { AppLayout } from "./components/AppLayout";
import { AdminRoute } from "./components/AdminRoute";
import ErrorBoundary from "./components/ErrorBoundary";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { PublicLayout } from "./components/PublicLayout";
import { PublicOnlyRoute } from "./components/PublicOnlyRoute";
import { Toaster } from "./components/ui/sonner";
import { ThemeProvider } from "./contexts/ThemeContext";
import {
  DashboardPage,
  LandingPage,
  LoginPage,
  NewTicketPage,
  SettingsPage,

  TicketDetailPage,
} from "./pages";
import { ClientInvoicesPage } from "./pages/ClientInvoicesPage";
import { ClientInvoiceDetailPage } from "./pages/ClientInvoiceDetailPage";

/* Admin pages */
import AdminLayout from "./pages/admin/AdminLayout";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminClients from "./pages/admin/AdminClients";
import AdminNewClient from "./pages/admin/AdminNewClient";
import AdminClientDetail from "./pages/admin/AdminClientDetail";
import AdminProjects from "./pages/admin/AdminProjects";
import AdminInvoices from "./pages/admin/AdminInvoices";
import AdminNewInvoice from "./pages/admin/AdminNewInvoice";
import AdminInvoiceDetail from "./pages/admin/AdminInvoiceDetail";
import AdminMessages from "./pages/admin/AdminMessages";
import AdminTickets from "./pages/admin/AdminTickets";

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="dark" switchable={false}>
        <Toaster />
        <Routes>
          <Route element={<PublicLayout />}>
            <Route path="/" element={<LandingPage />} />
            <Route element={<PublicOnlyRoute />}>
              <Route path="/login" element={<LoginPage />} />
              {/* Signup disabled — admin creates client accounts */}
            </Route>
          </Route>

          {/* Client Portal */}
          <Route element={<ProtectedRoute />}>
            <Route element={<AppLayout />}>
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/invoices" element={<ClientInvoicesPage />} />
              <Route path="/invoices/:invoiceId" element={<ClientInvoiceDetailPage />} />
              <Route path="/tickets/new" element={<NewTicketPage />} />
              <Route path="/tickets/:ticketId" element={<TicketDetailPage />} />
              <Route path="/settings" element={<SettingsPage />} />
            </Route>
          </Route>

          {/* Admin CRM — only accessible by admin email */}
          <Route element={<AdminRoute />}>
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<AdminDashboard />} />
              <Route path="clients" element={<AdminClients />} />
              <Route path="clients/new" element={<AdminNewClient />} />
              <Route path="clients/:clientId" element={<AdminClientDetail />} />
              <Route path="projects" element={<AdminProjects />} />
              <Route path="invoices" element={<AdminInvoices />} />
              <Route path="invoices/new" element={<AdminNewInvoice />} />
              <Route path="invoices/:invoiceId" element={<AdminInvoiceDetail />} />
              <Route path="messages" element={<AdminMessages />} />
              <Route path="tickets" element={<AdminTickets />} />
            </Route>
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
