import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it } from 'vitest';
import { useSession } from '@/app/store';
import { makePlan } from '@/engine/terraform/testPlans';
import { ImportDialog } from './ImportDialog';

const queue = makePlan([
  { address: 'aws_sqs_queue.q', type: 'aws_sqs_queue', name: 'q', after: { region: 'eu-west-1' } },
]);

function paste(text: string) {
  // user.type treats braces as key descriptors, so set the value directly.
  const box = screen.getByLabelText('Plan JSON');
  const setter = Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype, 'value')!.set!;
  setter.call(box, text);
  box.dispatchEvent(new Event('input', { bubbles: true }));
}

describe('ImportDialog', () => {
  beforeEach(() => useSession.setState({ graph: null, importOpen: true }));

  it('previews the bundled sample and loads it only after confirmation', async () => {
    const user = userEvent.setup();
    render(<ImportDialog />);
    await user.click(screen.getByRole('button', { name: /Multi-region sample/ }));
    expect(await screen.findByText(/60/)).toBeInTheDocument();
    expect(screen.getByText('us-east-1')).toBeInTheDocument();
    expect(screen.getByText('us-west-2')).toBeInTheDocument();
    expect(useSession.getState().graph).toBeNull();
    await user.click(screen.getByRole('button', { name: 'Load world' }));
    expect(useSession.getState().graph?.resources).toHaveLength(60);
    expect(useSession.getState().importOpen).toBe(false);
  });

  it('previews pasted JSON and shows warnings', async () => {
    const user = userEvent.setup();
    render(<ImportDialog />);
    paste(makePlan([{ address: 'aws_sqs_queue.q', type: 'aws_sqs_queue', name: 'q' }]));
    await user.click(screen.getByRole('button', { name: 'Preview' }));
    expect(screen.getByRole('list', { name: 'Warnings' })).toHaveTextContent('could not be placed');
  });

  it('shows an error and keeps the current graph when validation fails', async () => {
    const user = userEvent.setup();
    const existing = { resources: [], edges: [], groups: [], regions: [], warnings: [] };
    useSession.setState({ graph: existing });
    render(<ImportDialog />);
    paste('{"format_version":"2.0","resource_changes":[]}');
    await user.click(screen.getByRole('button', { name: 'Preview' }));
    expect(await screen.findByRole('alert')).toHaveTextContent('Unsupported plan format_version');
    expect(useSession.getState().graph).toBe(existing);
  });

  it('keeps the current graph when cancelled after a preview', async () => {
    const user = userEvent.setup();
    const existing = { resources: [], edges: [], groups: [], regions: [], warnings: [] };
    useSession.setState({ graph: existing });
    render(<ImportDialog />);
    paste(queue);
    await user.click(screen.getByRole('button', { name: 'Preview' }));
    await user.click(screen.getByRole('button', { name: 'Cancel' }));
    expect(useSession.getState().graph).toBe(existing);
    expect(useSession.getState().importOpen).toBe(false);
  });

  it('rejects uploaded files above 15 MB', async () => {
    const user = userEvent.setup();
    render(<ImportDialog />);
    const big = new File(['x'], 'plan.json', { type: 'application/json' });
    Object.defineProperty(big, 'size', { value: 16 * 1024 * 1024 });
    await user.upload(screen.getByLabelText('Plan JSON file'), big);
    await waitFor(() => expect(screen.getByRole('alert')).toHaveTextContent('15 MB'));
  });

  it('closes on Escape', async () => {
    const user = userEvent.setup();
    render(<ImportDialog />);
    await user.keyboard('{Escape}');
    expect(useSession.getState().importOpen).toBe(false);
  });
});
