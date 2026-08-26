import React, { useState, useEffect } from 'react';
import { Download, X, Share, PlusSquare, Smartphone } from 'lucide-react';

export const PWAInstallBanner: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isIOS, setIsIOS] = useState(false);
  const [showBanner, setShowBanner] = useState(false);
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  useEffect(() => {
    // 1. Detect iOS Safari
    const ua = window.navigator.userAgent;
    const isIosDevice = /iPhone|iPad|iPod/.test(ua) && !(window as any).MSStream;
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone;

    if (isIosDevice && !isStandalone) {
      setIsIOS(true);
      setShowBanner(true);
    }

    // 2. Listen for Android / Chrome beforeinstallprompt event
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowBanner(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (isIOS) {
      setShowIOSGuide(true);
      return;
    }

    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setShowBanner(false);
      }
      setDeferredPrompt(null);
    }
  };

  if (!showBanner) return null;

  return (
    <>
      {/* IN-APP INSTALL BANNER */}
      <div
        style={{
          position: 'fixed',
          bottom: 'calc(65px + env(safe-area-inset-bottom, 0px))',
          left: '50%',
          transform: 'translateX(-50%)',
          width: 'calc(100% - 1.5rem)',
          maxWidth: '440px',
          backgroundColor: 'var(--toast-bg)',
          color: 'var(--toast-text)',
          padding: '0.875rem 1rem',
          borderRadius: 'var(--radius-lg)',
          boxShadow: 'var(--shadow-md)',
          zIndex: 990,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '0.75rem'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div
            style={{
              width: '36px',
              height: '36px',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'var(--color-accent)',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0
            }}
          >
            <Smartphone size={20} />
          </div>
          <div>
            <span style={{ fontWeight: 700, fontSize: '0.9rem', display: 'block', lineHeight: '1.2' }}>
              Install Lexora App
            </span>
            <span style={{ fontSize: '0.75rem', opacity: 0.8, display: 'block' }}>
              Access dictionary offline & fast
            </span>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <button
            onClick={handleInstallClick}
            style={{
              border: 'none',
              backgroundColor: 'var(--color-accent)',
              color: '#ffffff',
              padding: '0.45rem 0.875rem',
              borderRadius: 'var(--radius-sm)',
              fontSize: '0.8rem',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.35rem'
            }}
          >
            <Download size={14} />
            <span>Install</span>
          </button>
          <button
            onClick={() => setShowBanner(false)}
            aria-label="Dismiss banner"
            style={{ border: 'none', background: 'transparent', color: 'inherit', opacity: 0.6, cursor: 'pointer', padding: '0.25rem' }}
          >
            <X size={18} />
          </button>
        </div>
      </div>

      {/* iOS STEP-BY-STEP INSTALL MODAL */}
      {showIOSGuide && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.65)',
            zIndex: 1000,
            display: 'flex',
            alignItems: 'flex-end',
            justifyContent: 'center',
            backdropFilter: 'blur(4px)'
          }}
          onClick={() => setShowIOSGuide(false)}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{
              width: '100%',
              maxWidth: '460px',
              backgroundColor: 'var(--bg-surface)',
              borderTopLeftRadius: 'var(--radius-lg)',
              borderTopRightRadius: 'var(--radius-lg)',
              padding: '1.5rem 1.25rem 2rem 1.25rem',
              boxShadow: 'var(--shadow-md)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700, margin: 0 }}>Install on iPhone / iPad</h3>
              <button
                onClick={() => setShowIOSGuide(false)}
                style={{ border: 'none', background: 'transparent', color: 'var(--text-muted)', cursor: 'pointer' }}
              >
                <X size={20} />
              </button>
            </div>

            <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '1.25rem', lineHeight: '1.4' }}>
              Apple Safari requires adding Lexora to your Home Screen manually:
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.875rem', padding: '0.75rem', backgroundColor: 'var(--bg-subtle)', borderRadius: 'var(--radius-md)' }}>
                <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: 'var(--color-accent)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '0.875rem' }}>
                  1
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem', fontWeight: 600 }}>
                  <span>Tap the <strong>Share</strong> icon</span>
                  <Share size={18} color="var(--color-accent)" />
                  <span>at bottom bar</span>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.875rem', padding: '0.75rem', backgroundColor: 'var(--bg-subtle)', borderRadius: 'var(--radius-md)' }}>
                <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: 'var(--color-accent)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '0.875rem' }}>
                  2
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem', fontWeight: 600 }}>
                  <span>Scroll down & tap <strong>"Add to Home Screen"</strong></span>
                  <PlusSquare size={18} color="var(--color-accent)" />
                </div>
              </div>
            </div>

            <button
              onClick={() => setShowIOSGuide(false)}
              className="btn-primary"
              style={{ width: '100%', marginTop: '1.5rem' }}
            >
              <span>Got it</span>
            </button>
          </div>
        </div>
      )}
    </>
  );
};
