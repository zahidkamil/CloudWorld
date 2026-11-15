import { Landing } from '@/ui/landing/Landing';
import { WorldShell } from '@/ui/world/WorldShell';
import { useSession } from './store';

export function App() {
  const screen = useSession((s) => s.screen);
  return screen === 'landing' ? <Landing /> : <WorldShell />;
}
