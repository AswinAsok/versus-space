import { BarChart3, Zap, Users } from 'lucide-react';

interface HomeProps {
  onNavigate: (path: string) => void;
}

export function Home({ onNavigate }: HomeProps) {
  return (
    <div className="home-container">
      <section className="hero">
        <h1 className="hero-title">versus.space</h1>
        <p className="hero-subtitle">
          Create engaging polls and watch votes pour in real-time
        </p>
        <div className="hero-actions">
          <button onClick={() => onNavigate('/auth')} className="btn-primary btn-large">
            Get Started
          </button>
        </div>
      </section>

      <section className="features">
        <div className="feature-card">
          <div className="feature-icon">
            <Zap size={32} />
          </div>
          <h3>Real-time Voting</h3>
          <p>Watch votes update instantly with live WebSocket connections</p>
        </div>

        <div className="feature-card">
          <div className="feature-icon">
            <BarChart3 size={32} />
          </div>
          <h3>Beautiful Visualizations</h3>
          <p>Split-screen interface with smooth animations and transitions</p>
        </div>

        <div className="feature-card">
          <div className="feature-icon">
            <Users size={32} />
          </div>
          <h3>Unlimited Polls</h3>
          <p>Create as many polls as you want with multiple options</p>
        </div>
      </section>
    </div>
  );
}
