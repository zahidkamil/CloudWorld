import type { ResourceCategory, ResourceFamily } from '@/engine/registry/registry';
import type { PlanAction } from '@/engine/terraform/types';

export type PlacementScope = 'global' | 'region' | 'az' | 'unresolved';

export interface Placement {
  scope: PlacementScope;
  region?: string;
  az?: string;
  /** For region-level resources that span zones (load balancer, multi-AZ database): the zones they link to. */
  azs?: string[];
  /** How the placement was decided, e.g. "region attribute". */
  source: string;
}

/** A security group rule that accepts traffic from anywhere on the internet. */
export interface OpenIngress {
  fromPort: number;
  toPort: number;
  /** `tcp`, `udp`, `icmp`, or `-1` for every protocol. */
  protocol: string;
}

/** Safe, non-secret facts the security rules read. Only set when the resource has them. */
export interface ResourceExposure {
  openIngress: OpenIngress[];
}

export interface CloudResource {
  /** Terraform address, e.g. `module.web.aws_instance.app[0]`. */
  id: string;
  type: string;
  /** Display name: the Name tag, else resource name plus index. */
  name: string;
  label: string;
  module?: string;
  index?: string | number;
  category: ResourceCategory;
  /** Visual fallback family, resolved by a world's library if an exact model is absent. */
  family: ResourceFamily;
  placement: Placement;
  /** Allowlisted, non-sensitive scalar attributes only. */
  attributes: Record<string, string | number | boolean>;
  /** Exposure facts for security rules (security groups only for now). */
  exposure?: ResourceExposure;
  action: PlanAction;
}

/** `from` depends on, or sits inside, `to`. `to` is `var.<name>` for variable edges. */
export interface GraphEdge {
  from: string;
  to: string;
  kind: 'contains' | 'references' | 'network' | 'attached' | 'variable';
  /** The argument that created the edge, e.g. `vpc_security_group_ids`. */
  via?: string;
}

export type SharedGroupKind =
  'security-group' | 'subnet' | 'iam-role' | 'target-group' | 'kms-key' | 'variable';

/** A shared component and the resources that use it. */
export interface SharedGroup {
  id: string;
  kind: SharedGroupKind;
  consumers: string[];
}

export interface RegionInfo {
  name: string;
  azs: string[];
  resourceCount: number;
}

/** Pure data: no rendering fields (R2.1). */
export interface InfrastructureGraph {
  resources: CloudResource[];
  edges: GraphEdge[];
  groups: SharedGroup[];
  regions: RegionInfo[];
  warnings: string[];
}
