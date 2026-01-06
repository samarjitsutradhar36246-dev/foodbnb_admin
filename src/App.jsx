import { useEffect, useState, memo } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "./Firebase"; // Adjust path as needed
import "./App.css";
import Navbar from "./components/navbar/Navbar.jsx";
import Side_bar from "./components/Side_bar/Side_bar.jsx";
import Setting_page from "./components/setting_page/Setting_page.jsx";
import Charts from "./components/charts/Charts.jsx";
import Analytics from "./components/analytics/Analytics.jsx";
import Orders from "./components/orders/Orders.jsx";
import Customer from "./components/customers/Customer.jsx";
import Delivery from "./components/delivery/Delivery.jsx";
import Login_Auth from "./components/Login/AdminLogin.jsx";
import Restaurant from "./components/restaurant/Restaurant.jsx";

// Memoize page components to prevent re-renders when parent state changes
const MemoCharts = memo(Charts);
const MemoAnalytics = memo(Analytics);
const MemoOrders = memo(Orders);
const MemoCustomer = memo(Customer);
const MemoDelivery = memo(Delivery);
const MemoSettings = memo(Setting_page);
const MemoRestaurant = memo(Restaurant);

// Loading spinner component
function LoadingScreen() {
  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center">
      <div className="text-center">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
        <p className="mt-4 text-slate-400">Loading...</p>
      </div>
    </div>
  );
}

// Component to handle back button prevention for authenticated routes
function BackButtonBlocker() {
  const location = useLocation();

  useEffect(() => {
    // Only block back button on authenticated routes (not on login)
    if (location.pathname === "/login") return;

    // Push a state to history to intercept back button
    history.pushState(null, "", location.pathname);

    const blockBackNavigation = () => {
      // Push the current location again to prevent actual navigation
      history.pushState(null, "", location.pathname);
    };

    addEventListener("popstate", blockBackNavigation);

    return () => {
      removeEventListener("popstate", blockBackNavigation);
    };
  }, [location.pathname]);

  return null;
}

// Protected Route Component
function ProtectedRoute({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setIsAuthenticated(!!user);
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (isLoading) {
    return <LoadingScreen />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    const updateScreen = () => {
      const desktop = matchMedia("(min-width: 1024px)").matches;
      setIsDesktop(desktop);
      if (desktop) {
        setSidebarOpen(true);
      }
    };

    updateScreen();
    const mediaQuery = matchMedia("(min-width: 1024px)");

    // Modern approach using addEventListener for media queries
    mediaQuery.addEventListener("change", updateScreen);

    return () => mediaQuery.removeEventListener("change", updateScreen);
  }, []);

  const toggleSidebar = () => setSidebarOpen((prev) => !prev);
  const closeSidebar = () => setSidebarOpen(false);

  return (
    <Router>
      <BackButtonBlocker />
      <Routes>
        {/* Root route - Always redirect to login */}
        <Route path="/" element={<Navigate to="/login" replace />} />

        {/* Public Route - Login */}
        <Route path="/login" element={<Login_Auth />} />

        {/* Protected Routes - Dashboard */}
        <Route
          path="/charts"
          element={
            <ProtectedRoute>
              <>
                <Navbar
                  showMenuButton={!isDesktop}
                  onMenuClick={toggleSidebar}
                  sidebarOpen={sidebarOpen}
                />
                <Side_bar isOpen={sidebarOpen} onClose={closeSidebar} />
                <main className="fixed top-16 left-0 right-0 bottom-0 lg:left-64 overflow-y-auto">
                  <MemoCharts />
                </main>
              </>
            </ProtectedRoute>
          }
        />

        <Route
          path="/settings"
          element={
            <ProtectedRoute>
              <>
                <Navbar
                  showMenuButton={!isDesktop}
                  onMenuClick={toggleSidebar}
                  sidebarOpen={sidebarOpen}
                />
                <Side_bar isOpen={sidebarOpen} onClose={closeSidebar} />
                <main className="fixed top-16 left-0 right-0 bottom-0 lg:left-64 overflow-y-auto">
                  <MemoSettings />
                </main>
              </>
            </ProtectedRoute>
          }
        />

        <Route
          path="/analytics"
          element={
            <ProtectedRoute>
              <>
                <Navbar
                  showMenuButton={!isDesktop}
                  onMenuClick={toggleSidebar}
                  sidebarOpen={sidebarOpen}
                />
                <Side_bar isOpen={sidebarOpen} onClose={closeSidebar} />
                <main className="fixed top-16 left-0 right-0 bottom-0 lg:left-64 overflow-y-auto">
                  <MemoAnalytics />
                </main>
              </>
            </ProtectedRoute>
          }
        />

        <Route
          path="/orders"
          element={
            <ProtectedRoute>
              <>
                <Navbar
                  showMenuButton={!isDesktop}
                  onMenuClick={toggleSidebar}
                  sidebarOpen={sidebarOpen}
                />
                <Side_bar isOpen={sidebarOpen} onClose={closeSidebar} />
                <main className="fixed top-16 left-0 right-0 bottom-0 lg:left-64 overflow-y-auto">
                  <MemoOrders />
                </main>
              </>
            </ProtectedRoute>
          }
        />

        <Route
          path="/customers"
          element={
            <ProtectedRoute>
              <>
                <Navbar
                  showMenuButton={!isDesktop}
                  onMenuClick={toggleSidebar}
                  sidebarOpen={sidebarOpen}
                />
                <Side_bar isOpen={sidebarOpen} onClose={closeSidebar} />
                <main className="fixed top-16 left-0 right-0 bottom-0 lg:left-64 overflow-y-auto">
                  <MemoCustomer />
                </main>
              </>
            </ProtectedRoute>
          }
        />

        <Route
          path="/delivery"
          element={
            <ProtectedRoute>
              <>
                <Navbar
                  showMenuButton={!isDesktop}
                  onMenuClick={toggleSidebar}
                  sidebarOpen={sidebarOpen}
                />
                <Side_bar isOpen={sidebarOpen} onClose={closeSidebar} />
                <main className="fixed top-16 left-0 right-0 bottom-0 lg:left-64 overflow-y-auto">
                  <MemoDelivery />
                </main>
              </>
            </ProtectedRoute>
          }
        />

        <Route
          path="/restaurant"
          element={
            <ProtectedRoute>
              <>
                <Navbar
                  showMenuButton={!isDesktop}
                  onMenuClick={toggleSidebar}
                  sidebarOpen={sidebarOpen}
                />
                <Side_bar isOpen={sidebarOpen} onClose={closeSidebar} />
                <main className="fixed top-16 left-0 right-0 bottom-0 lg:left-64 overflow-y-auto">
                  <MemoRestaurant />
                </main>
              </>
            </ProtectedRoute>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
