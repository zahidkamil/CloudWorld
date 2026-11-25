import { ImportDialog } from '@/ui/import/ImportDialog';
import { SettingsScreen } from '@/ui/menu/SettingsScreen';
import { TitleScreen } from '@/ui/menu/TitleScreen';
import { WorldSelect } from '@/ui/menu/WorldSelect';
import { WorldShell } from '@/ui/world/WorldShell';
import { useSession } from './store';

export function App() {
  const screen = useSession((s) => s.screen);
  const importOpen = useSession((s) => s.importOpen);
  return (
    <>
      {screen === 'title' && <TitleScreen />}
      {screen === 'worlds' && <WorldSelect />}
      {screen === 'settings' && <SettingsScreen />}
      {screen === 'world' && <WorldShell />}
      {importOpen && <ImportDialog />}
    </>
  );
}
