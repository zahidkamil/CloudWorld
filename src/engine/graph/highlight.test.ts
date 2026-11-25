import { describe, expect, it } from 'vitest';
import multi from '@/samples/multi-region.plan.json';
import { computeHighlights, NO_HIGHLIGHTS } from './highlight';
import { importPlan } from './importPlan';

const result = importPlan(JSON.stringify(multi));
if (!result.ok) throw new Error(result.error);
const graph = result.graph;
const ec2 = 'aws_instance.web_east[0]';

describe('computeHighlights', () => {
  it('does nothing without a selection or hover', () => {
    expect(computeHighlights(graph, null, null)).toBe(NO_HIGHLIGHTS);
  });

  it('highlights only the hovered resource when nothing is selected', () => {
    const h = computeHighlights(graph, null, ec2);
    expect([...h.states.entries()]).toEqual([[ec2, 'hover']]);
  });

  it('marks the selection, its direct dependencies, shared peers, and dims the rest', () => {
    const h = computeHighlights(graph, ec2, null);
    expect(h.states.get(ec2)).toBe('primary');
    expect(h.states.get('aws_security_group.web_east')).toBe('dependency');
    // The other two EC2 instances use the same security group, so they are peers.
    expect(h.states.get('aws_instance.web_east[1]')).toBe('peer');
    expect(h.states.get('aws_instance.web_east[2]')).toBe('peer');
    expect(h.states.get('aws_iam_role.app')).toBe('dim');
    expect(h.states.size).toBe(graph.resources.length);
  });

  it('draws one link per direct relationship, with no duplicates and none to itself', () => {
    const h = computeHighlights(graph, ec2, null);
    expect(h.links.length).toBeGreaterThan(0);
    expect(new Set(h.links.map((l) => `${l.from}>${l.to}`)).size).toBe(h.links.length);
    expect(h.links.every((l) => l.from === ec2 && l.to !== ec2)).toBe(true);
  });

  it('highlights every resource of a type from the legend and dims the rest', () => {
    const h = computeHighlights(graph, null, null, 'aws_instance');
    expect(h.states.get('aws_instance.web_east[0]')).toBe('type');
    expect(h.states.get('aws_instance.web_east[1]')).toBe('type');
    expect(h.states.get('aws_iam_role.app')).toBe('dim');
    expect(h.links).toEqual([]);
  });

  it('lets a dimmed resource light up on hover but keeps the selection primary', () => {
    expect(computeHighlights(graph, ec2, 'aws_iam_role.app').states.get('aws_iam_role.app')).toBe('hover');
    expect(computeHighlights(graph, ec2, ec2).states.get(ec2)).toBe('primary');
  });

  it('ignores a selection that is not in the graph, and never changes the graph', () => {
    const before = JSON.stringify(graph);
    expect(computeHighlights(graph, 'aws_nope.x', null)).toBe(NO_HIGHLIGHTS);
    computeHighlights(graph, ec2, null);
    expect(JSON.stringify(graph)).toBe(before);
  });
});
