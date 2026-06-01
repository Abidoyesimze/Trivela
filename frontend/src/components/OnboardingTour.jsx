import { useEffect, useRef, useState } from 'react';
import { driver } from 'driver.js';
import 'driver.js/dist/driver.css';
import { useTour } from '../hooks/useTour.js';

const TOUR_STEPS = [
  {
    popover: {
      title: 'Welcome to Trivela',
      description:
        'Trivela is a Stellar-powered campaign platform where you complete tasks and earn on-chain rewards. Let us show you around.',
      side: 'bottom',
      align: 'center',
    },
  },
  {
    element: '[data-tour="campaign-grid"]',
    popover: {
      title: 'Browse Campaigns',
      description:
        'These are the active campaigns. Each card shows the name, reward, and available spots. Click any card to see full details.',
      side: 'bottom',
      align: 'start',
    },
  },
  {
    element: '[data-tour="connect-wallet"]',
    popover: {
      title: 'Connect Your Wallet',
      description:
        'Use a Stellar-compatible wallet (e.g. Freighter) to connect. Your wallet address identifies you on-chain so rewards are sent directly to you.',
      side: 'bottom',
      align: 'end',
    },
  },
  {
    element: '[data-tour="campaign-register"]',
    popover: {
      title: 'Register & Earn',
      description:
        'Once connected, click Register on any active campaign. Your on-chain registration is recorded immediately and points start accumulating.',
      side: 'bottom',
      align: 'start',
    },
  },
  {
    element: '[data-tour="rewards-display"]',
    popover: {
      title: 'Track Your Rewards',
      description:
        'Your earned points and reward balance appear here after you register. Claim them from the campaign detail page at any time.',
      side: 'bottom',
      align: 'end',
    },
  },
];

export default function OnboardingTour({ onComplete, onRestart }) {
  const { shouldShow, markComplete } = useTour();
  const driverRef = useRef(null);
  const [ready, setReady] = useState(false);

  const startTour = () => {
    if (driverRef.current) {
      driverRef.current.destroy();
    }

    const d = driver({
      animate: true,
      showProgress: true,
      showButtons: ['next', 'previous', 'close'],
      nextBtnText: 'Next',
      prevBtnText: 'Back',
      doneBtnText: 'Finish',
      steps: TOUR_STEPS,
      onDestroyed: () => {
        markComplete();
        if (onComplete) onComplete();
      },
    });

    driverRef.current = d;
    d.drive();
  };

  useEffect(() => {
    if (!shouldShow) return;
    const timeout = setTimeout(() => {
      setReady(true);
      startTour();
    }, 600);
    return () => clearTimeout(timeout);
  }, [shouldShow]);

  useEffect(() => {
    if (onRestart) {
      onRestart.current = startTour;
    }
  }, [onRestart]);

  useEffect(() => {
    const handleKey = (e) => {
      if (!driverRef.current) return;
      if (e.key === 'ArrowRight') driverRef.current.moveNext();
      else if (e.key === 'ArrowLeft') driverRef.current.movePrevious();
      else if (e.key === 'Escape') driverRef.current.destroy();
    };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, []);

  if (!ready) return null;

  return null;
}

export function useRestartTour() {
  const restartRef = useRef(null);
  const restart = () => {
    if (restartRef.current) restartRef.current();
  };
  return { restartRef, restart };
}