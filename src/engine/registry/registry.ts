/**
 * Data-driven AWS resource registry. Task 2 ships the core set plus the types used by the bundled
 * sample; Task 4 expands it. Unregistered `aws_*` types use the generic entry (R2.2).
 */
export type ResourceCategory =
  'network' | 'compute' | 'storage' | 'database' | 'security' | 'integration' | 'edge' | 'other';

export interface RegistryEntry {
  type: string;
  category: ResourceCategory;
  /** global = one per account; zonal = lives in one AZ when it can be determined. */
  scope: 'global' | 'regional' | 'zonal';
  label: string;
  /** Plain scalar attributes safe to show in the inspector. */
  attributes: readonly string[];
}

const e = (
  type: string,
  category: ResourceCategory,
  scope: RegistryEntry['scope'],
  label: string,
  attributes: readonly string[] = [],
): RegistryEntry => ({ type, category, scope, label, attributes });

const ENTRIES: RegistryEntry[] = [
  e('aws_vpc', 'network', 'regional', 'VPC', ['cidr_block']),
  e('aws_subnet', 'network', 'zonal', 'Subnet', [
    'cidr_block',
    'availability_zone',
    'map_public_ip_on_launch',
  ]),
  e('aws_route_table', 'network', 'regional', 'Route table'),
  e('aws_route_table_association', 'network', 'regional', 'Route table association'),
  e('aws_internet_gateway', 'network', 'regional', 'Internet gateway'),
  e('aws_nat_gateway', 'network', 'zonal', 'NAT gateway', ['connectivity_type']),
  e('aws_eip', 'network', 'regional', 'Elastic IP', ['domain']),
  e('aws_security_group', 'security', 'regional', 'Security group', ['name', 'description']),
  e('aws_instance', 'compute', 'zonal', 'EC2 instance', ['instance_type', 'ami', 'availability_zone']),
  e('aws_lb', 'network', 'regional', 'Load balancer', ['load_balancer_type', 'internal']),
  e('aws_lb_target_group', 'network', 'regional', 'Target group', ['port', 'protocol', 'target_type']),
  e('aws_lb_target_group_attachment', 'network', 'regional', 'Target group attachment'),
  e('aws_db_subnet_group', 'database', 'regional', 'DB subnet group'),
  e('aws_db_instance', 'database', 'regional', 'RDS instance', [
    'engine',
    'engine_version',
    'instance_class',
    'multi_az',
    'publicly_accessible',
    'storage_encrypted',
  ]),
  e('aws_s3_bucket', 'storage', 'regional', 'S3 bucket', ['bucket']),
  e('aws_lambda_function', 'compute', 'regional', 'Lambda function', ['function_name', 'runtime', 'handler']),
  e('aws_iam_role', 'security', 'global', 'IAM role', ['name']),
  e('aws_kms_key', 'security', 'regional', 'KMS key', ['description']),
  e('aws_dynamodb_table', 'database', 'regional', 'DynamoDB table', ['name', 'billing_mode']),
  e('aws_sqs_queue', 'integration', 'regional', 'SQS queue', ['name']),
  e('aws_route53_zone', 'edge', 'global', 'Route 53 zone', ['name']),
];

const BY_TYPE = new Map(ENTRIES.map((x) => [x.type, x]));

/** Services without a region: any resource whose type starts with one of these is global. */
const GLOBAL_PREFIXES = ['aws_iam_', 'aws_route53_', 'aws_cloudfront_'];

export function lookupRegistry(type: string): RegistryEntry {
  const known = BY_TYPE.get(type);
  if (known) return known;
  const global = GLOBAL_PREFIXES.some((p) => type.startsWith(p));
  return {
    type,
    category: 'other',
    scope: global ? 'global' : 'regional',
    label: type.replace(/^aws_/, '').replaceAll('_', ' '),
    attributes: [],
  };
}

export function isRegistered(type: string): boolean {
  return BY_TYPE.has(type);
}
