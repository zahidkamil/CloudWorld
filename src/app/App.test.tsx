import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it } from 'vitest';
import { App } from './App';
import { useSession } from './store';

describe('App navigation', () => {
  beforeEach(() => {
    useSession.setState({ screen: 'landing', mode: 'explorer', themeId: 'modern-city' });
  });

  it('shows the landing screen with both built-in worlds', () => {
    render(<App />);
    expect(screen.getByRole('heading', { name: 'CloudWorld' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Enter Modern City/ })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Enter Haunted World/ })).toBeInTheDocument();
  });

  it('enters a world in the selected mode and returns to the menu', async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByRole('radio', { name: /Defender/ }));
    await user.click(screen.getByRole('button', { name: /Enter Haunted World in Defender mode/ }));

    expect(screen.getByLabelText('Theme')).toHaveValue('haunted-world');
    expect(screen.getByRole('button', { name: 'Defender' })).toHaveAttribute('aria-pressed', 'true');

    await user.click(screen.getByRole('button', { name: /Menu/ }));
    expect(screen.getByRole('heading', { name: 'CloudWorld' })).toBeInTheDocument();
  });

  it('switches theme without leaving the world', async () => {
    const user = userEvent.setup();
    render(<App />);
    await user.click(screen.getByRole('button', { name: /Enter Modern City/ }));
    await user.selectOptions(screen.getByLabelText('Theme'), 'haunted-world');
    expect(useSession.getState().themeId).toBe('haunted-world');
    expect(useSession.getState().screen).toBe('world');
  });
});
