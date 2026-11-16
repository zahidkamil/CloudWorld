import { ImportDialog } from '@/ui/import/ImportDialog';
import { Landing } from '@/ui/landing/Landing';
import { WorldShell } from '@/ui/world/WorldShell';
import { useSession } from './store';

export function App() {
  const screen = useSession((s) => s.screen);
  const importOpen = useSession((s) => s.importOpen);
  return (
    <>
      {screen === 'landing' ? <Landing /> : <WorldShell />}
      {importOpen && <ImportDialog />}
    </>
  );
}
