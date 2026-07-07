import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Mail, Lock, ArrowRight, Briefcase, AlertCircle, Sparkles } from 'lucide-react';

const Signup = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { signup } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (password.length < 6) {
      return setError('Password must be at least 6 characters long.');
    }

    if (password !== confirmPassword) {
      return setError('Passwords do not match.');
    }

    setLoading(true);

    try {
      await signup(email, password);
      navigate('/');
    } catch (err) {
      setError(err.message || 'Signup failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'grid',
      gridTemplateColumns: '1.1fr 0.9fr',
      background: 'var(--bg-main)'
    }} className="animate-fade">
      {/* Left side: Hero & Visual Preview */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(15, 20, 34, 0.95) 0%, rgba(8, 11, 17, 0.98) 100%)',
        borderRight: '1px solid var(--border-color)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: '50px',
        position: 'relative',
        overflow: 'hidden'
      }} className="hero-section">
        {/* Glow overlay */}
        <div style={{
          position: 'absolute',
          top: '-20%',
          left: '-20%',
          width: '600px',
          height: '600px',
          background: 'radial-gradient(circle, rgba(6, 182, 212, 0.15) 0%, transparent 70%)',
          pointerEvents: 'none'
        }} />
        <div style={{
          position: 'absolute',
          bottom: '-10%',
          right: '-10%',
          width: '500px',
          height: '500px',
          background: 'radial-gradient(circle, rgba(124, 58, 237, 0.08) 0%, transparent 70%)',
          pointerEvents: 'none'
        }} />

        {/* Brand */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', zIndex: 2 }}>
          <div style={{
            background: 'linear-gradient(135deg, var(--color-primary) 0%, var(--color-accent) 100%)',
            width: '40px',
            height: '40px',
            borderRadius: '10px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 0 15px rgba(124, 58, 237, 0.4)'
          }}>
            <Briefcase size={20} color="#fff" />
          </div>
          <span style={{
            fontFamily: "'Outfit', sans-serif",
            fontWeight: 800,
            fontSize: '1.4rem',
            letterSpacing: '-0.03em',
            background: 'linear-gradient(to right, #fff, #9CA3AF)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}>
            CAREERFLOW
          </span>
        </div>

        {/* Hero Copy */}
        <div style={{ maxWidth: '480px', margin: 'auto 0', zIndex: 2 }}>
          <h1 style={{
            fontSize: '3.2rem',
            lineHeight: 1.1,
            color: '#fff',
            marginBottom: '20px',
            fontFamily: "'Outfit', sans-serif",
            fontWeight: 800,
            letterSpacing: '-0.04em'
          }}>
            Organize your <br />
            <span style={{
              background: 'linear-gradient(135deg, var(--color-accent-light) 0%, var(--color-primary-light) 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}>application pipeline.</span>
          </h1>
          <p style={{
            color: 'var(--text-secondary)',
            fontSize: '1.05rem',
            lineHeight: 1.6,
            marginBottom: '40px'
          }}>
            Create a free account to track applications, group by categories, and monitor application count statistics in a beautifully unified UI.
          </p>

          {/* Interactive Card Preview */}
          <div className="glass-panel" style={{
            padding: '24px',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px',
            maxWidth: '400px',
            transform: 'perspective(1000px) rotateY(5deg)',
            boxShadow: '25px 25px 50px rgba(0,0,0,0.4)',
            transition: 'transform 0.4s ease'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h4 style={{ color: '#fff', fontSize: '1.1rem' }}>Staff React Developer</h4>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Vercel Inc.</p>
              </div>
              <span className="badge badge-offer">Offer</span>
            </div>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.8rem', borderTop: '1px solid var(--border-color)', paddingTop: '12px', color: 'var(--text-muted)' }}>
              <span>Applied: July 01, 2026</span>
              <span style={{ color: 'var(--color-primary-light)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Sparkles size={12} /> Base Salary Offered
              </span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem', zIndex: 2 }}>
          &copy; 2026 CareerFlow. Inspired by Tran Mau Tri Tam.
        </div>
      </div>

      {/* Right side: Auth Form */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '50px'
      }}>
        <div className="glass-panel animate-slide" style={{
          width: '100%',
          maxWidth: '440px',
          padding: '40px',
          background: 'rgba(17, 24, 39, 0.45)',
          borderRadius: '20px'
        }}>
          <h2 style={{
            fontSize: '2rem',
            color: '#fff',
            marginBottom: '8px',
            fontFamily: "'Outfit', sans-serif"
          }}>
            Create Account
          </h2>
          <p style={{
            color: 'var(--text-secondary)',
            fontSize: '0.95rem',
            marginBottom: '30px'
          }}>
            Get started with your free tracker dashboard today.
          </p>

          {error && (
            <div style={{
              background: 'rgba(239, 68, 68, 0.1)',
              border: '1px solid rgba(239, 68, 68, 0.2)',
              borderRadius: '10px',
              padding: '12px 16px',
              color: '#F87171',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              fontSize: '0.9rem',
              marginBottom: '20px'
            }}>
              <AlertCircle size={18} style={{ flexShrink: 0 }} />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="input-group">
              <label className="input-label" htmlFor="email">Email Address</label>
              <div style={{ position: 'relative' }}>
                <Mail size={18} style={{
                  position: 'absolute',
                  left: '14px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: 'var(--text-muted)'
                }} />
                <input
                  id="email"
                  type="email"
                  className="form-input"
                  style={{ paddingLeft: '44px' }}
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="input-group">
              <label className="input-label" htmlFor="password">Password</label>
              <div style={{ position: 'relative' }}>
                <Lock size={18} style={{
                  position: 'absolute',
                  left: '14px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: 'var(--text-muted)'
                }} />
                <input
                  id="password"
                  type="password"
                  className="form-input"
                  style={{ paddingLeft: '44px' }}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="input-group" style={{ marginBottom: '30px' }}>
              <label className="input-label" htmlFor="confirmPassword">Confirm Password</label>
              <div style={{ position: 'relative' }}>
                <Lock size={18} style={{
                  position: 'absolute',
                  left: '14px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: 'var(--text-muted)'
                }} />
                <input
                  id="confirmPassword"
                  type="password"
                  className="form-input"
                  style={{ paddingLeft: '44px' }}
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
              style={{
                width: '100%',
                padding: '14px',
                fontSize: '1rem',
                display: 'flex',
                justifyContent: 'center',
                gap: '10px'
              }}
            >
              {loading ? 'CREATING ACCOUNT...' : (
                <>
                  GET STARTED <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>

          <p style={{
            textAlign: 'center',
            color: 'var(--text-secondary)',
            fontSize: '0.9rem',
            marginTop: '25px'
          }}>
            Already have an account?{' '}
            <Link to="/login" style={{
              color: 'var(--color-accent-light)',
              fontWeight: 600,
              textDecoration: 'none'
            }}>
              Log in
            </Link>
          </p>
        </div>
      </div>
      <style>{`
        @media (max-width: 900px) {
          grid-template-columns: 1fr;
          .hero-section { display: none !important; }
        }
      `}</style>
    </div>
  );
};

export default Signup;
