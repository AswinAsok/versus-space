import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useLocation,
  useNavigate,
  useParams,
} from 'react-router-dom';
import { useAuth } from './hooks/useAuth';
import { Header } from './components/Layout/Header';
import { DashboardLayout } from './components/Layout/DashboardLayout';
import { Home } from './components/Home/Home';
import { AuthForm } from './components/Auth/AuthForm';
import { DashboardHome } from './components/Dashboard/DashboardHome';
import { MyPolls } from './components/Dashboard/MyPolls';
import { Settings } from './components/Settings/Settings';
import { Profile } from './components/Profile/Profile';
import { Analytics } from './components/Analytics/Analytics';
import { CreatePoll } from './components/Poll/CreatePoll';
import { PollView } from './components/Poll/PollView';
import { Blog } from './components/Blog/Blog';
import { BlogPostPage } from './components/Blog/BlogPost';
import { MouseLoader } from './components/Loading/MouseLoader';
import appStyles from './components/App.module.css';

// Wrapper that reads router state and renders the correct views.
function RoutedApp() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const isPollView = location.pathname.startsWith('/poll/');
  const isDashboardView = location.pathname.startsWith('/dashboard');

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
            element={
              user ? (
                <DashboardLayout user={user} />
              ) : (
                <Navigate to="/auth" replace />
              )
            }
          >
            <Route index element={<DashboardHome user={user!} />} />
            <Route path="polls" element={<MyPolls user={user!} />} />
            <Route path="create" element={<CreatePoll user={user!} onSuccess={(pollId) => navigate(`/poll/${pollId}`)} />} />
            <Route path="settings" element={<Settings user={user!} />} />
            <Route path="profile" element={<Profile user={user!} />} />
            <Route path="analytics" element={<Analytics user={user!} />} />
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
      <Header user={user} onNavigate={navigate} />

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
              user ? (
                <Navigate to="/dashboard/create" replace />
              ) : (
                <Navigate to="/auth" replace />
              )
            }
          />
          <Route path="/poll/:pollId" element={<PollRoute />} />
          {/* Explore redirects to home with leaderboard */}
          <Route path="/explore" element={<Navigate to="/#leaderboard" replace />} />
          {/* Blog routes for SEO content */}
          <Route path="/blog" element={<Blog />} />
          <Route path="/blog/:slug" element={<BlogPostPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  );
}

// Poll route wrapper for param extraction and fallback behavior.
function PollRoute() {
  const { pollId } = useParams();
  if (!pollId) {
    return <Navigate to="/" replace />;
  }
  return <PollView pollId={pollId} />;
}

function App() {
  return (
    <BrowserRouter>
      <RoutedApp />
    </BrowserRouter>
  );
}

export default App;
