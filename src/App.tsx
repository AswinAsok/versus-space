import { lazy, Suspense } from 'react';
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useLocation,
  useNavigate,
  useParams,
} from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useAuth } from './hooks/useAuth';
import { usePollById } from './hooks/usePollQueries';
import { Header } from './components/Layout/Header';
import { Home } from './components/Home/Home';
import { MouseLoader } from './components/Loading/MouseLoader';
import type { User } from './core/domain/auth';
import appStyles from './components/App.module.css';

const DashboardLayout = lazy(() =>
  import('./components/Layout/DashboardLayout').then((module) => ({
    default: module.DashboardLayout,
  }))
);
const AuthForm = lazy(() =>
  import('./components/Auth/AuthForm').then((module) => ({ default: module.AuthForm }))
);
const DashboardHome = lazy(() =>
  import('./components/Dashboard/DashboardHome').then((module) => ({
    default: module.DashboardHome,
  }))
);
const MyPolls = lazy(() =>
  import('./components/Dashboard/MyPolls').then((module) => ({ default: module.MyPolls }))
);
const Settings = lazy(() =>
  import('./components/Settings/Settings').then((module) => ({ default: module.Settings }))
);
const Profile = lazy(() =>
  import('./components/Profile/Profile').then((module) => ({ default: module.Profile }))
);
const CreatePoll = lazy(() =>
  import('./components/Poll/CreatePoll').then((module) => ({ default: module.CreatePoll }))
);
const PollView = lazy(() =>
  import('./components/Poll/PollView').then((module) => ({ default: module.PollView }))
);
const Explore = lazy(() =>
  import('./components/Explore/Explore').then((module) => ({ default: module.Explore }))
);
const Story = lazy(() =>
  import('./components/Story/Story').then((module) => ({ default: module.Story }))
);
const Analytics = lazy(() =>
  import('./components/Analytics/Analytics').then((module) => ({ default: module.Analytics }))
);

// Create a client with default options
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      gcTime: 1000 * 60 * 30, // 30 minutes (formerly cacheTime)
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

// Wrapper that reads router state and renders the correct views.
function RoutedApp() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const isPollView = location.pathname.startsWith('/poll/');
  const isDashboardView = location.pathname.startsWith('/dashboard');
  const isAuthPage = location.pathname === '/auth';

  if (loading) {
    return (
      <div className={appStyles.app}>
        <MouseLoader />
      </div>
    );
  }

  // Dashboard routes use their own layout with sidebar
  if (isDashboardView) {
    return (
      <div className={appStyles.app}>
        <Routes>
          <Route
            path="/dashboard/*"
            element={user ? <DashboardLayout user={user} /> : <Navigate to="/auth" replace />}
          >
            <Route index element={<DashboardHome user={user!} />} />
            <Route path="polls" element={<MyPolls user={user!} />} />
            <Route
              path="create"
              element={<CreatePoll user={user!} onSuccess={(slug) => navigate(`/poll/${slug}`)} />}
            />
            <Route
              path="edit/:pollId"
              element={
                <EditPollRoute user={user!} onSuccess={(slug) => navigate(`/poll/${slug}`)} />
              }
            />
            <Route path="settings" element={<Settings user={user!} />} />
            <Route path="profile" element={<Profile user={user!} />} />
            <Route path="analytics" element={<Analytics user={user!} />} />
            <Route path="explore" element={<Explore />} />
          </Route>
        </Routes>
      </div>
    );
  }

  return (
    <div className={appStyles.app}>
      {!isPollView && (
        <div className={appStyles.decorativeBg}>
          <div className={appStyles.geometricShape}></div>
          <div className={`${appStyles.geometricShape} ${appStyles.square}`}></div>
          <div className={appStyles.geometricShape}></div>
          <div className={`${appStyles.geometricShape} ${appStyles.square}`}></div>
        </div>
      )}
      <Header
        user={user}
        onNavigate={navigate}
        hideCreateButton={isAuthPage}
        centerLogo={isAuthPage}
      />

      <main className={appStyles.appMain}>
        <Routes>
          <Route path="/" element={<Home onNavigate={navigate} />} />
          <Route
            path="/auth"
            element={
              user ? (
                <Navigate to="/dashboard" replace />
              ) : (
                <AuthForm onSuccess={() => navigate('/dashboard')} />
              )
            }
          />
          {/* Redirect /create to dashboard/create */}
          <Route
            path="/create"
            element={
              user ? <Navigate to="/dashboard/create" replace /> : <Navigate to="/auth" replace />
            }
          />
          <Route path="/poll/:slug" element={<PollRoute />} />
          <Route path="/story" element={<Story />} />
          {/* Explore redirects to dashboard explore */}
          <Route path="/explore" element={<Navigate to="/dashboard/explore" replace />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  );
}

// Poll route wrapper for param extraction and fallback behavior.
function PollRoute() {
  const { slug } = useParams();
  if (!slug) {
    return <Navigate to="/" replace />;
  }
  return <PollView slug={slug} />;
}

// Edit poll route wrapper that fetches poll data
function EditPollRoute({ user, onSuccess }: { user: User; onSuccess: (slug: string) => void }) {
  const { pollId } = useParams();
  const { data: poll, isLoading, error } = usePollById(pollId);

  if (isLoading) {
    return <MouseLoader />;
  }

  if (error) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--color-text-muted)' }}>
        {error instanceof Error ? error.message : 'Failed to load poll'}
      </div>
    );
  }

  if (!poll) {
    return <Navigate to="/dashboard/polls" replace />;
  }

  if (poll.creator_id !== user.id) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--color-text-muted)' }}>
        You do not have permission to edit this poll
      </div>
    );
  }

  return <CreatePoll user={user} onSuccess={onSuccess} editPoll={poll} />;
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Suspense fallback={<MouseLoader />}>
          <RoutedApp />
        </Suspense>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
