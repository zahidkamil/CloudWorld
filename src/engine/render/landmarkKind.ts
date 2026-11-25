import type { ResourceCategory } from '@/engine/registry/registry';

/** The silhouette family a resource is drawn with. Library models (Blender) replace these in Tasks 5 and 6. */
export type LandmarkKind =
  | 'tower'
  | 'drum'
  | 'silos'
  | 'gate'
  | 'roundabout'
  | 'vault'
  | 'pavilion'
  | 'mailbox'
  | 'mast'
  | 'fence'
  | 'pad'
  | 'block';

const BY_TYPE: Record<string, LandmarkKind> = {
  aws_instance: 'tower',
  aws_autoscaling_group: 'tower',
  aws_launch_template: 'pad',
  aws_lambda_function: 'pavilion',
  aws_db_instance: 'drum',
  aws_rds_cluster: 'drum',
  aws_dynamodb_table: 'drum',
  aws_elasticache_cluster: 'drum',
  aws_s3_bucket: 'silos',
  aws_efs_file_system: 'silos',
  aws_ebs_volume: 'silos',
  aws_lb: 'roundabout',
  aws_alb: 'roundabout',
  aws_internet_gateway: 'gate',
  aws_nat_gateway: 'gate',
  aws_api_gateway_rest_api: 'gate',
  aws_apigatewayv2_api: 'gate',
  aws_ec2_transit_gateway: 'gate',
  aws_kms_key: 'vault',
  aws_iam_role: 'vault',
  aws_iam_policy: 'vault',
  aws_secretsmanager_secret: 'vault',
  aws_security_group: 'fence',
  aws_sqs_queue: 'mailbox',
  aws_sns_topic: 'mailbox',
  aws_kinesis_stream: 'mailbox',
  aws_cloudwatch_event_rule: 'mailbox',
  aws_route53_zone: 'mast',
  aws_cloudfront_distribution: 'mast',
  aws_wafv2_web_acl: 'fence',
  aws_vpc: 'pad',
  aws_subnet: 'pad',
  aws_route_table: 'pad',
  aws_route_table_association: 'pad',
  aws_eip: 'pad',
  aws_lb_target_group: 'pad',
  aws_lb_target_group_attachment: 'pad',
  aws_db_subnet_group: 'pad',
};

const BY_CATEGORY: Record<ResourceCategory, LandmarkKind> = {
  network: 'pad',
  compute: 'tower',
  containers: 'tower',
  serverless: 'pavilion',
  storage: 'silos',
  database: 'drum',
  security: 'vault',
  integration: 'mailbox',
  edge: 'mast',
  monitoring: 'mast',
  other: 'block',
};

export function landmarkKindOf(type: string, category: ResourceCategory): LandmarkKind {
  return BY_TYPE[type] ?? BY_CATEGORY[category];
}

/** Rough footprint height used for beacons, labels, and camera focus. */
export const LANDMARK_HEIGHT: Record<LandmarkKind, number> = {
  tower: 4.2,
  drum: 2.8,
  silos: 2.6,
  gate: 2.8,
  roundabout: 1.2,
  vault: 2.2,
  pavilion: 2.4,
  mailbox: 2,
  mast: 4.6,
  fence: 1.2,
  pad: 0.5,
  block: 2,
};
