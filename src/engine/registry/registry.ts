/**
 * Data-driven AWS resource registry.
 *
 * Every entry says what the resource is, where it belongs, which safe scalar attributes can appear in
 * the inspector, which relationship fields matter, and which visual family a world library should resolve.
 * Task 5 / 6 libraries use `family` as the fallback when an exact type has no GLB.
 *
 * Provider schema spot checks: ECS cluster, EKS cluster, CloudFront distribution, and WAFv2 Web ACL were
 * confirmed with the Terraform MCP against hashicorp/aws 6.73.0. Terraform AWS provider v6 adds optional
 * per-resource `region` to most regional resources; global services stay explicitly global here.
 */
export type ResourceCategory =
  | 'network'
  | 'compute'
  | 'containers'
  | 'serverless'
  | 'storage'
  | 'database'
  | 'security'
  | 'integration'
  | 'edge'
  | 'monitoring'
  | 'other';

/** Family keys match entries in each world's resources.md / library.json (`family:<name>`). */
export type ResourceFamily =
  | 'compute'
  | 'containers'
  | 'serverless'
  | 'database'
  | 'storage'
  | 'gateway'
  | 'loadbalancer'
  | 'edge'
  | 'messaging'
  | 'security'
  | 'monitoring'
  | 'generic';

export interface RegistryEntry {
  /** Exact Terraform resource type, such as `aws_instance`. */
  type: string;
  category: ResourceCategory;
  /** `global` = one per account; `zonal` = one AZ where it can be determined. */
  scope: 'global' | 'regional' | 'zonal';
  label: string;
  /** Fallback visual library key when the exact type has no model. */
  family: ResourceFamily;
  /** Plain scalar, non-sensitive attributes safe to show in the inspector. */
  attributes: readonly string[];
  /** Terraform arguments that should read as relationships. Edge extraction also supports generic references. */
  relationshipFields: readonly string[];
}

const e = (
  type: string,
  category: ResourceCategory,
  scope: RegistryEntry['scope'],
  label: string,
  family: ResourceFamily,
  attributes: readonly string[] = [],
  relationshipFields: readonly string[] = [],
): RegistryEntry => ({ type, category, scope, label, family, attributes, relationshipFields });

/** Known types with bespoke or family-level landmarks. Unregistered aws_* resources still receive a generic entry. */
const ENTRIES: RegistryEntry[] = [
  // Networking
  e('aws_vpc', 'network', 'regional', 'VPC', 'gateway', ['cidr_block'], ['cidr_block']),
  e(
    'aws_subnet',
    'network',
    'zonal',
    'Subnet',
    'gateway',
    ['cidr_block', 'availability_zone', 'map_public_ip_on_launch'],
    ['vpc_id'],
  ),
  e(
    'aws_route_table',
    'network',
    'regional',
    'Route table',
    'gateway',
    [],
    ['vpc_id', 'gateway_id', 'nat_gateway_id'],
  ),
  e(
    'aws_route_table_association',
    'network',
    'regional',
    'Route table association',
    'gateway',
    [],
    ['subnet_id', 'route_table_id'],
  ),
  e('aws_internet_gateway', 'network', 'regional', 'Internet gateway', 'gateway', [], ['vpc_id']),
  e(
    'aws_nat_gateway',
    'network',
    'zonal',
    'NAT gateway',
    'gateway',
    ['connectivity_type'],
    ['allocation_id', 'subnet_id'],
  ),
  e('aws_eip', 'network', 'regional', 'Elastic IP', 'gateway', ['domain']),
  e('aws_network_acl', 'network', 'regional', 'Network ACL', 'gateway', ['vpc_id'], ['vpc_id', 'subnet_ids']),
  e(
    'aws_vpc_endpoint',
    'network',
    'regional',
    'VPC endpoint',
    'gateway',
    ['service_name', 'vpc_endpoint_type'],
    ['vpc_id', 'subnet_ids', 'security_group_ids', 'route_table_ids'],
  ),
  e('aws_ec2_transit_gateway', 'network', 'regional', 'Transit Gateway', 'gateway', ['description']),
  e(
    'aws_vpc_peering_connection',
    'network',
    'regional',
    'VPC peering connection',
    'gateway',
    ['peer_region'],
    ['vpc_id', 'peer_vpc_id'],
  ),

  // Compute, containers, and serverless
  e(
    'aws_instance',
    'compute',
    'zonal',
    'EC2 instance',
    'compute',
    ['instance_type', 'ami', 'availability_zone'],
    ['subnet_id', 'vpc_security_group_ids', 'iam_instance_profile'],
  ),
  e(
    'aws_autoscaling_group',
    'compute',
    'regional',
    'Auto Scaling group',
    'compute',
    ['name', 'min_size', 'max_size', 'desired_capacity'],
    ['launch_template', 'target_group_arns', 'vpc_zone_identifier'],
  ),
  e(
    'aws_launch_template',
    'compute',
    'regional',
    'Launch template',
    'compute',
    ['name', 'instance_type'],
    ['vpc_security_group_ids', 'iam_instance_profile'],
  ),
  e(
    'aws_spot_fleet_request',
    'compute',
    'regional',
    'Spot fleet request',
    'compute',
    ['iam_fleet_role', 'target_capacity'],
    ['iam_fleet_role'],
  ),
  e('aws_ecs_cluster', 'containers', 'regional', 'ECS cluster', 'containers', ['name'], ['kms_key_id']),
  e(
    'aws_ecs_service',
    'containers',
    'regional',
    'ECS service',
    'containers',
    ['name', 'desired_count', 'launch_type'],
    ['cluster', 'task_definition', 'network_configuration', 'load_balancer'],
  ),
  e(
    'aws_ecs_task_definition',
    'containers',
    'regional',
    'ECS task definition',
    'containers',
    ['family', 'network_mode'],
    ['task_role_arn', 'execution_role_arn'],
  ),
  e(
    'aws_eks_cluster',
    'containers',
    'regional',
    'EKS cluster',
    'containers',
    ['name', 'version'],
    ['role_arn', 'subnet_ids', 'security_group_ids'],
  ),
  e(
    'aws_eks_node_group',
    'containers',
    'regional',
    'EKS node group',
    'containers',
    ['node_group_name', 'capacity_type'],
    ['cluster_name', 'node_role_arn', 'subnet_ids'],
  ),
  e('aws_ecr_repository', 'containers', 'regional', 'ECR repository', 'containers', [
    'name',
    'image_tag_mutability',
  ]),
  e(
    'aws_lambda_function',
    'serverless',
    'regional',
    'Lambda function',
    'serverless',
    ['function_name', 'runtime', 'handler'],
    ['role', 'vpc_config', 'kms_key_arn'],
  ),
  e(
    'aws_lambda_alias',
    'serverless',
    'regional',
    'Lambda alias',
    'serverless',
    ['name', 'function_name'],
    ['function_name'],
  ),
  e(
    'aws_sfn_state_machine',
    'serverless',
    'regional',
    'Step Functions state machine',
    'serverless',
    ['name', 'type'],
    ['role_arn'],
  ),

  // Data and storage
  e('aws_db_subnet_group', 'database', 'regional', 'DB subnet group', 'database', ['name'], ['subnet_ids']),
  e(
    'aws_db_instance',
    'database',
    'regional',
    'RDS instance',
    'database',
    ['engine', 'engine_version', 'instance_class', 'multi_az', 'publicly_accessible', 'storage_encrypted'],
    ['kms_key_id', 'db_subnet_group_name', 'vpc_security_group_ids'],
  ),
  e(
    'aws_rds_cluster',
    'database',
    'regional',
    'Aurora cluster',
    'database',
    ['cluster_identifier', 'engine', 'engine_mode', 'storage_encrypted'],
    ['kms_key_id', 'db_subnet_group_name', 'vpc_security_group_ids'],
  ),
  e(
    'aws_dynamodb_table',
    'database',
    'regional',
    'DynamoDB table',
    'database',
    ['name', 'billing_mode', 'hash_key'],
    ['kms_key_arn'],
  ),
  e(
    'aws_elasticache_cluster',
    'database',
    'regional',
    'ElastiCache cluster',
    'database',
    ['cluster_id', 'engine', 'node_type'],
    ['security_group_ids', 'subnet_group_name'],
  ),
  e(
    'aws_elasticache_replication_group',
    'database',
    'regional',
    'ElastiCache replication group',
    'database',
    ['replication_group_id', 'engine', 'multi_az_enabled'],
    ['security_group_ids', 'subnet_group_name', 'kms_key_id'],
  ),
  e(
    'aws_opensearch_domain',
    'database',
    'regional',
    'OpenSearch domain',
    'database',
    ['domain_name', 'engine_version'],
    ['vpc_options', 'encrypt_at_rest'],
  ),
  e('aws_s3_bucket', 'storage', 'regional', 'S3 bucket', 'storage', ['bucket'], ['acl']),
  e(
    'aws_ebs_volume',
    'storage',
    'zonal',
    'EBS volume',
    'storage',
    ['availability_zone', 'size', 'encrypted'],
    ['kms_key_id'],
  ),
  e(
    'aws_efs_file_system',
    'storage',
    'regional',
    'EFS file system',
    'storage',
    ['encrypted', 'throughput_mode'],
    ['kms_key_id'],
  ),
  e(
    'aws_efs_mount_target',
    'storage',
    'zonal',
    'EFS mount target',
    'storage',
    ['ip_address'],
    ['file_system_id', 'subnet_id', 'security_groups'],
  ),
  e('aws_backup_vault', 'storage', 'regional', 'Backup vault', 'storage', ['name'], ['kms_key_arn']),

  // Integration and eventing
  e(
    'aws_lb',
    'network',
    'regional',
    'Load balancer',
    'loadbalancer',
    ['load_balancer_type', 'internal'],
    ['subnets', 'security_groups'],
  ),
  e(
    'aws_lb_target_group',
    'network',
    'regional',
    'Target group',
    'loadbalancer',
    ['port', 'protocol', 'target_type'],
    ['vpc_id'],
  ),
  e(
    'aws_lb_target_group_attachment',
    'network',
    'regional',
    'Target group attachment',
    'loadbalancer',
    [],
    ['target_group_arn', 'target_id'],
  ),
  e('aws_api_gateway_rest_api', 'integration', 'regional', 'API Gateway REST API', 'gateway', [
    'name',
    'description',
  ]),
  e('aws_apigatewayv2_api', 'integration', 'regional', 'API Gateway API', 'gateway', [
    'name',
    'protocol_type',
  ]),
  e(
    'aws_sqs_queue',
    'integration',
    'regional',
    'SQS queue',
    'messaging',
    ['name', 'fifo_queue'],
    ['kms_master_key_id'],
  ),
  e(
    'aws_sns_topic',
    'integration',
    'regional',
    'SNS topic',
    'messaging',
    ['name', 'fifo_topic'],
    ['kms_master_key_id'],
  ),
  e(
    'aws_kinesis_stream',
    'integration',
    'regional',
    'Kinesis stream',
    'messaging',
    ['name', 'shard_count'],
    ['kms_key_id'],
  ),
  e('aws_cloudwatch_event_rule', 'integration', 'regional', 'EventBridge rule', 'messaging', [
    'name',
    'schedule_expression',
  ]),
  e(
    'aws_cloudwatch_event_target',
    'integration',
    'regional',
    'EventBridge target',
    'messaging',
    ['rule', 'target_id'],
    ['arn', 'role_arn'],
  ),

  // Edge, security, and operations
  e('aws_route53_zone', 'edge', 'global', 'Route 53 zone', 'edge', ['name']),
  e(
    'aws_route53_record',
    'edge',
    'global',
    'Route 53 record',
    'edge',
    ['name', 'type'],
    ['alias', 'records'],
  ),
  e(
    'aws_cloudfront_distribution',
    'edge',
    'global',
    'CloudFront distribution',
    'edge',
    ['comment', 'enabled', 'price_class'],
    ['origin', 'web_acl_id'],
  ),
  e('aws_wafv2_web_acl', 'edge', 'regional', 'WAFv2 web ACL', 'edge', ['name', 'scope'], ['default_action']),
  e(
    'aws_wafv2_web_acl_association',
    'edge',
    'regional',
    'WAFv2 web ACL association',
    'edge',
    [],
    ['resource_arn', 'web_acl_arn'],
  ),
  e(
    'aws_security_group',
    'security',
    'regional',
    'Security group',
    'security',
    ['name', 'description'],
    ['vpc_id'],
  ),
  e('aws_iam_role', 'security', 'global', 'IAM role', 'security', ['name']),
  e('aws_iam_policy', 'security', 'global', 'IAM policy', 'security', ['name', 'path']),
  e(
    'aws_iam_role_policy_attachment',
    'security',
    'global',
    'IAM role policy attachment',
    'security',
    [],
    ['role', 'policy_arn'],
  ),
  e('aws_kms_key', 'security', 'regional', 'KMS key', 'security', ['description', 'multi_region']),
  e(
    'aws_secretsmanager_secret',
    'security',
    'regional',
    'Secrets Manager secret',
    'security',
    ['name', 'recovery_window_in_days'],
    ['kms_key_id'],
  ),
  e(
    'aws_cloudwatch_log_group',
    'monitoring',
    'regional',
    'CloudWatch log group',
    'monitoring',
    ['name', 'retention_in_days'],
    ['kms_key_id'],
  ),
  e(
    'aws_cloudwatch_metric_alarm',
    'monitoring',
    'regional',
    'CloudWatch alarm',
    'monitoring',
    ['alarm_name', 'comparison_operator', 'threshold'],
    ['alarm_actions'],
  ),
];

const BY_TYPE = new Map(ENTRIES.map((x) => [x.type, x]));

/** Services without a region: any resource whose type starts with one of these is global. */
const GLOBAL_PREFIXES = ['aws_iam_', 'aws_route53_', 'aws_cloudfront_', 'aws_waf_'];

/** Infer a visual family for unknown aws_* types. Exact known entries always win. */
function fallbackFamily(type: string): ResourceFamily {
  if (/^(aws_ecs_|aws_eks_|aws_ecr_)/.test(type)) return 'containers';
  if (/^(aws_lambda_|aws_sfn_)/.test(type)) return 'serverless';
  if (/^(aws_rds_|aws_db_|aws_dynamodb_|aws_elasticache_|aws_opensearch_)/.test(type)) return 'database';
  if (/^(aws_s3_|aws_ebs_|aws_efs_|aws_backup_)/.test(type)) return 'storage';
  if (/^(aws_lb_|aws_alb_|aws_elb_)/.test(type)) return 'loadbalancer';
  if (/^(aws_api_gateway_|aws_apigateway|aws_vpc_|aws_ec2_transit_)/.test(type)) return 'gateway';
  if (/^(aws_sqs_|aws_sns_|aws_kinesis_|aws_cloudwatch_event_)/.test(type)) return 'messaging';
  if (/^(aws_route53_|aws_cloudfront_|aws_wafv2_)/.test(type)) return 'edge';
  if (/^(aws_iam_|aws_kms_|aws_secretsmanager_)/.test(type)) return 'security';
  if (/^aws_cloudwatch_/.test(type)) return 'monitoring';
  if (/^(aws_instance|aws_autoscaling_|aws_launch_)/.test(type)) return 'compute';
  return 'generic';
}

function categoryForFamily(family: ResourceFamily): ResourceCategory {
  if (family === 'gateway' || family === 'loadbalancer') return 'network';
  if (family === 'messaging') return 'integration';
  if (family === 'generic') return 'other';
  return family;
}

export function lookupRegistry(type: string): RegistryEntry {
  const known = BY_TYPE.get(type);
  if (known) return known;
  const family = fallbackFamily(type);
  const global = GLOBAL_PREFIXES.some((p) => type.startsWith(p));
  return {
    type,
    category: categoryForFamily(family),
    scope: global ? 'global' : 'regional',
    label: type.replace(/^aws_/, '').replaceAll('_', ' '),
    family,
    attributes: [],
    relationshipFields: [],
  };
}

export function isRegistered(type: string): boolean {
  return BY_TYPE.has(type);
}

/** Public, sorted list used by registry documentation tests and extension guides. */
export function registeredEntries(): readonly RegistryEntry[] {
  return [...ENTRIES].sort((a, b) => a.type.localeCompare(b.type));
}
