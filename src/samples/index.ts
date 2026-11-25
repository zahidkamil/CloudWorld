export interface BundledSample {
  id: string;
  name: string;
  description: string;
  /** Loaded on demand so the plan stays out of the initial bundle. */
  load: () => Promise<string>;
}

export const BUNDLED_SAMPLES: BundledSample[] = [
  {
    id: 'multi-region',
    name: 'Multi-region sample',
    description: 'Two regions, three AZs each, a reusable network module, shared security groups.',
    load: async () => JSON.stringify((await import('./multi-region.plan.json')).default),
  },
  {
    id: 'single-az',
    name: 'Single-AZ sample',
    description: 'One region and one availability zone: a small web app with a network load balancer.',
    load: async () => JSON.stringify((await import('./single-az.plan.json')).default),
  },
];
