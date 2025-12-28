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
import { Home } from './components/Home/Home';
import { AuthForm } from './components/Auth/AuthForm';
import { Dashboard } from './components/Dashboard/Dashboard';
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

  if (loading) {
    return (
      <div className={appStyles.app}>
        <MouseLoader />
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
          <Route
            path="/dashboard"
            element={
              user ? (
                <Dashboard user={user} onNavigate={navigate} />
              ) : (
                <Navigate to="/auth" replace />
              )
            }
          />
          <Route
            path="/create"
            element={
              user ? (
                <CreatePoll user={user} onSuccess={(pollId) => navigate(`/poll/${pollId}`)} />
              ) : (
                <Navigate to="/auth" replace />
              )
            }
          />
          <Route path="/poll/:pollId" element={<PollRoute />} />
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
