# Design — Game Foundation and Gameplay

## Module layout

```
src/engine/terraform/   parse + validate plan JSON -> RawResource[] (pure, no DOM)
src/engine/graph/       InfrastructureGraph types, edge extraction, dependency groups
src/engine/registry/    AWS resource registry (data-driven entries)
src/engine/topology/    region / AZ / global / unresolved placement
src/engine/layout/      deterministic world layout (campuses, districts, lots)
src/engine/render/      shared React Three Fiber scene, camera, highlight materials
src/engine/security/    SecurityRule[] -> Finding[] + attack paths
src/apps/explorer/      Explorer overlays and interactions
src/apps/defender/      Defender scoring, remediation cards, guided mission
```

Engine modules are pure TypeScript except `render/`. Apps depend on the engine; the engine never imports apps or UI.

## Key contracts

```ts
interface CloudResource {
  id: string; // Terraform address, e.g. module.web.aws_instance.app[0]
  type: string; // aws_instance
  name: string; // display name (Name tag or resource name + index)
  module?: string;
  index?: string | number; // count / for_each key
  category: ResourceCategory;
  placement: {
    scope: 'global' | 'region' | 'az' | 'unresolved';
    region?: string;
    az?: string;
    source: string;
  };
  attributes: Record<string, string | number | boolean>; // allowlisted, non-sensitive only
  action?: 'create' | 'update' | 'delete' | 'replace' | 'no-op' | 'read';
}
interface GraphEdge {
  from: string;
  to: string;
  kind: 'contains' | 'references' | 'network' | 'attached' | 'variable';
  via?: string;
}
interface InfrastructureGraph {
  resources: CloudResource[];
  edges: GraphEdge[];
  groups: SharedGroup[];
  regions: RegionInfo[];
  warnings: string[];
}
```

`SharedGroup` = a shared component (security group, subnet, role, target group, KMS key, or `var.*`) plus its consumers. Selection lookups are precomputed once per graph.

## Edge extraction

1. `configuration` expressions: `references` arrays give resource addresses (`aws_security_group.web`) and variables (`var.env`).
2. `planned_values` attribute IDs: known IDs are matched against other resources' `id`/`arn` when present.
3. Registry relationship fields (e.g. `vpc_security_group_ids`, `subnet_id`, `role`, `kms_key_id`, `target_group_arn`) classify edge kind.
   Configuration addresses are mapped to instance addresses by stripping indexes and expanding to all instances.

## Topology resolution

Order: resource `region` attribute (AWS provider v6 per-resource region) -> `availability_zone` -> parent (subnet/VPC) -> provider config (`provider_config_key` alias region constant or safe variable) -> ARN -> unresolved. Each decision records `source`.

## Rendering

- One `<Canvas>` with an orthographic-style isometric perspective camera and Drei `MapControls`/`OrbitControls` with clamped polar angle and zoom.
- Layout: regions placed on a ring/grid as islands; AZ districts are sub-grids inside each island; global hub at the centre.
- Landmarks resolved by `registry.renderer` -> theme kit component. Repeated props use `InstancedMesh`.
- Highlight state from a Zustand selection store drives emissive/outline uniforms; no re-layout on selection.

## Relationship arcs

On selection, `relationshipsOf(graph, id)` (already implemented, Task 2) gives dependencies and consumers. `RelationArcs` (engine/render)
draws one Drei `QuadraticBezierLine` per related resource: dashed, lifted at the midpoint by a height proportional to distance,
`dashOffset` animated for flow (static under reduced motion). Colors come from the theme palette (dependency vs. used-by).
Peers are shown by glow, not arcs. Arcs are cheap (one Line2 each, capped), and need only layout positions, so they ship with Task 3.

## Security engine

`SecurityRule = { id, title, severity, evaluate(graph): Finding[] }`. Attack paths are BFS over network/reference edges from an internet-exposed entry to sensitive targets. Remediation state is a separate `Set<findingId>`.

## Testing

Vitest unit tests for parser, edges, topology, layout determinism, rules. Component tests for import preview. Playwright for camera, selection, legend, and Defender flows.
