import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it } from 'vitest';
import { DEFAULT_SETTINGS, SETTINGS_KEY } from './settings';
import { App } from './App';
import { useSession } from './store';

describe('App navigation', () => {
  beforeEach(() => {
    window.localStorage.clear();
    useSession.setState({
      screen: 'title',
      mode: 'explorer',
      themeId: 'modern-city',
      settings: DEFAULT_SETTINGS,
      graph: null,
    });
  });

  it('opens on a start menu with World and Settings', () => {
    render(<App />);
    expect(screen.getByRole('heading', { name: 'CloudWorld' })).toBeInTheDocument();
    const menu = screen.getByRole('navigation', { name: 'Main menu' });
    expect(within(menu).getByRole('button', { name: /World/ })).toBeInTheDocument();
    expect(within(menu).getByRole('button', { name: /Settings/ })).toBeInTheDocument();
  });

  it('World -> choose a world -> choose a mission starts the game', async () => {
    const user = userEvent.setup();
    render(<App />);
    await user.click(screen.getByRole('button', { name: /^World/ }));
    expect(screen.getByRole('heading', { name: 'Choose your world' })).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /Haunted World/ }));
    const dialog = screen.getByRole('dialog', { name: 'Choose your mission' });
    await user.click(within(dialog).getByRole('button', { name: /Start Attack Path/ }));

    expect(useSession.getState()).toMatchObject({
      screen: 'world',
      themeId: 'haunted-world',
      mode: 'defender',
    });
    expect(screen.getByLabelText('Theme')).toHaveValue('haunted-world');
    expect(screen.getByRole('button', { name: 'Attack Path' })).toHaveAttribute('aria-pressed', 'true');

    await user.click(screen.getByRole('button', { name: /Menu/ }));
    expect(screen.getByRole('heading', { name: 'CloudWorld' })).toBeInTheDocument();
  });

  it('closes the mission picker with Escape', async () => {
    const user = userEvent.setup();
    render(<App />);
    await user.click(screen.getByRole('button', { name: /^World/ }));
    await user.click(screen.getByRole('button', { name: /Modern City/ }));
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    await user.keyboard('{Escape}');
    expect(screen.queryByRole('dialog')).toBeNull();
  });

  it('shows the locked world as coming soon and cannot be entered', async () => {
    const user = userEvent.setup();
    render(<App />);
    await user.click(screen.getByRole('button', { name: /^World/ }));
    const aqua = screen.getByRole('button', { name: /Aqua World.*Coming soon/ });
    expect(aqua).toBeDisabled();
  });

  it('settings change the default world and mission, and they are saved and preselected', async () => {
    const user = userEvent.setup();
    render(<App />);
    await user.click(screen.getByRole('button', { name: /Settings/ }));
    await user.click(screen.getByRole('radio', { name: 'Haunted World' }));
    await user.click(screen.getByRole('radio', { name: /Attack Path/ }));
    expect(screen.getByRole('status')).toHaveTextContent(/Attack Path is now your default mission/);

    expect(JSON.parse(window.localStorage.getItem(SETTINGS_KEY) ?? '{}')).toMatchObject({
      defaultWorld: 'haunted-world',
      defaultMission: 'defender',
    });

    await user.click(screen.getByRole('button', { name: /Back/ }));
    expect(screen.getByRole('button', { name: /Quick play/ })).toHaveTextContent(
      'Haunted World · Attack Path',
    );

    await user.click(screen.getByRole('button', { name: /^World/ }));
    const tile = screen.getByRole('button', { name: /Haunted World\./ });
    expect(within(tile).getByText('Default')).toBeInTheDocument();
    await user.click(tile);
    expect(within(screen.getByRole('dialog')).getByText('Your default')).toBeInTheDocument();
  });

  it('quick play enters the default world and mission', async () => {
    const user = userEvent.setup();
    render(<App />);
    await user.click(screen.getByRole('button', { name: /Quick play/ }));
    expect(useSession.getState()).toMatchObject({
      screen: 'world',
      themeId: 'modern-city',
      mode: 'explorer',
    });
  });

  it('switches theme without leaving the world', async () => {
    const user = userEvent.setup();
    render(<App />);
    await user.click(screen.getByRole('button', { name: /Quick play/ }));
    await user.selectOptions(screen.getByLabelText('Theme'), 'haunted-world');
    expect(useSession.getState()).toMatchObject({ themeId: 'haunted-world', screen: 'world' });
  });
});
