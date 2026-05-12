import React from 'react';
import { RouterProvider, useRouter } from './components/Router';
import { Homepage } from './components/Homepage';
import { SignupScreen } from './components/SignupScreen';
import { LoginScreen } from './components/LoginScreen';
import { ForgotPasswordScreen } from './components/ForgotPasswordScreen';
import { Onboarding } from './components/Onboarding';
import { Dashboard } from './components/Dashboard';
import { PropertyDetails } from './components/PropertyDetails';
import { RenovationDashboard } from './components/RenovationDashboard';
import { UserProfile } from './components/UserProfile';
import { PropertyComparison } from './components/PropertyComparison';
import { MortgageCalculator } from './components/MortgageCalculator';
import { ScheduleVisit } from './components/ScheduleVisit';
import { Notifications } from './components/Notifications';
import { AddPropertyListing } from './components/AddPropertyListing';
import { MyListings } from './components/MyListings';

// Error Boundary to prevent blank screens
class ErrorBoundary extends React.Component<
  { children: React.ReactNode; onReset?: () => void },
  { hasError: boolean; error: Error | null }
> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="bg-white p-8 rounded-xl shadow-lg max-w-md text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">⚠️</span>
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Something went wrong</h2>
            <p className="text-sm text-gray-600 mb-4">
              {this.state.error?.message || 'An unexpected error occurred'}
            </p>
            <button
              onClick={() => {
                this.setState({ hasError: false, error: null });
                this.props.onReset?.();
              }}
              className="px-6 py-2 bg-gradient-to-r from-[#0984E3] to-[#74B9FF] text-white rounded-lg hover:opacity-90 transition"
            >
              Go Back to Dashboard
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

function AppContent() {
  const { currentScreen, navigate } = useRouter();

  const renderScreen = () => {
    switch (currentScreen) {
      case 'home':
        return <Homepage />;
      case 'signup':
        return <SignupScreen />;
      case 'login':
        return <LoginScreen />;
      case 'forgot-password':
        return <ForgotPasswordScreen />;
      case 'onboarding':
        return <Onboarding />;
      case 'dashboard':
        return <Dashboard />;
      case 'property-details':
        return <PropertyDetails />;
      case 'renovation':
        return <RenovationDashboard />;
      case 'profile':
        return <UserProfile />;
      case 'property-comparison':
        return <PropertyComparison />;
      case 'mortgage-calculator':
        return <MortgageCalculator />;
      case 'schedule-visit':
        return <ScheduleVisit />;
      case 'notifications':
        return <Notifications />;
      case 'add-listing':
        return <AddPropertyListing />;
      case 'my-listings':
        return <MyListings />;
      default:
        return <Homepage />;
    }
  };

  return (
    <div className="size-full">
      <ErrorBoundary onReset={() => navigate('dashboard')}>
        {renderScreen()}
      </ErrorBoundary>
    </div>
  );
}

export default function App() {
  return (
    <RouterProvider>
      <AppContent />
    </RouterProvider>
  );
}