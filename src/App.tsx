import { useState, useEffect } from 'react';
import { useAuth } from './hooks/useAuth';
import { Header } from './components/Layout/Header';
import { Home } from './components/Home/Home';
import { AuthForm } from './components/Auth/AuthForm';
import { Dashboard } from './components/Dashboard/Dashboard';
import { CreatePoll } from './components/Poll/CreatePoll';
import { PollView } from './components/Poll/PollView';

type Route = 'home' | 'auth' | 'dashboard' | 'create' | 'poll';

interface RouteState {
  route: Route;
  pollId?: string;
}

function App() {
  const { user, loading } = useAuth();
  const [routeState, setRouteState] = useState<RouteState>({ route: 'home' });

  useEffect(() => {
    const path = window.location.pathname;
    if (path.startsWith('/poll/')) {
      const pollId = path.split('/poll/')[1];
      setRouteState({ route: 'poll', pollId });
    } else if (path === '/dashboard') {
      setRouteState({ route: 'dashboard' });
    } else if (path === '/create') {
      setRouteState({ route: 'create' });
    } else if (path === '/auth') {
      setRouteState({ route: 'auth' });
    } else {
      setRouteState({ route: 'home' });
    }
  }, []);

  const navigate = (path: string) => {
    window.history.pushState({}, '', path);

    if (path.startsWith('/poll/')) {
      const pollId = path.split('/poll/')[1];
      setRouteState({ route: 'poll', pollId });
    } else if (path === '/dashboard') {
      setRouteState({ route: 'dashboard' });
    } else if (path === '/create') {
      setRouteState({ route: 'create' });
    } else if (path === '/auth') {
      setRouteState({ route: 'auth' });
    } else {
      setRouteState({ route: 'home' });
    }
  };

  useEffect(() => {
    const handlePopState = () => {
      const path = window.location.pathname;
      if (path.startsWith('/poll/')) {
        const pollId = path.split('/poll/')[1];
        setRouteState({ route: 'poll', pollId });
      } else if (path === '/dashboard') {
        setRouteState({ route: 'dashboard' });
      } else if (path === '/create') {
        setRouteState({ route: 'create' });
      } else if (path === '/auth') {
        setRouteState({ route: 'auth' });
      } else {
        setRouteState({ route: 'home' });
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  if (loading) {
    return (
      <div className="app">
        <div className="loading">Loading...</div>
      </div>
    );
  }

  const renderContent = () => {
    switch (routeState.route) {
      case 'auth':
        if (user) {
          navigate('/dashboard');
          return null;
        }
        return <AuthForm onSuccess={() => navigate('/dashboard')} />;

      case 'dashboard':
        if (!user) {
          navigate('/auth');
          return null;
        }
        return <Dashboard user={user} onNavigate={navigate} />;

      case 'create':
        if (!user) {
          navigate('/auth');
          return null;
        }
        return <CreatePoll user={user} onSuccess={(pollId) => navigate(`/poll/${pollId}`)} />;

      case 'poll':
        if (!routeState.pollId) {
          navigate('/');
          return null;
        }
        return <PollView pollId={routeState.pollId} />;

      case 'home':
      default:
        return <Home onNavigate={navigate} />;
    }
  };

  return (
    <div className="app">
      {routeState.route !== 'poll' && (
        <>
          <div className="decorative-bg">
            <div className="geometric-shape"></div>
            <div className="geometric-shape square"></div>
            <div className="geometric-shape"></div>
            <div className="geometric-shape square"></div>
          </div>
          <Header user={user} onNavigate={navigate} />
        </>
      )}
      <main className="app-main">{renderContent()}</main>
    </div>
  );
}

export default App;
