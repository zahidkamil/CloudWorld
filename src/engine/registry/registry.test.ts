import { describe, expect, it } from 'vitest';
import { isRegistered, lookupRegistry, registeredEntries, type ResourceFamily } from './registry';

const expected: [string, string, ResourceFamily][] = [
  ['aws_ecs_cluster', 'ECS cluster', 'containers'],
  ['aws_eks_cluster', 'EKS cluster', 'containers'],
  ['aws_api_gateway_rest_api', 'API Gateway REST API', 'gateway'],
  ['aws_cloudfront_distribution', 'CloudFront distribution', 'edge'],
  ['aws_dynamodb_table', 'DynamoDB table', 'database'],
  ['aws_elasticache_cluster', 'ElastiCache cluster', 'database'],
  ['aws_efs_file_system', 'EFS file system', 'storage'],
  ['aws_ebs_volume', 'EBS volume', 'storage'],
  ['aws_sqs_queue', 'SQS queue', 'messaging'],
  ['aws_sns_topic', 'SNS topic', 'messaging'],
  ['aws_kinesis_stream', 'Kinesis stream', 'messaging'],
  ['aws_cloudwatch_event_rule', 'EventBridge rule', 'messaging'],
  ['aws_route53_zone', 'Route 53 zone', 'edge'],
  ['aws_cloudwatch_log_group', 'CloudWatch log group', 'monitoring'],
  ['aws_kms_key', 'KMS key', 'security'],
  ['aws_secretsmanager_secret', 'Secrets Manager secret', 'security'],
  ['aws_wafv2_web_acl', 'WAFv2 web ACL', 'edge'],
  ['aws_vpc_endpoint', 'VPC endpoint', 'gateway'],
  ['aws_ec2_transit_gateway', 'Transit Gateway', 'gateway'],
];

describe('AWS resource registry', () => {
  it.each(expected)('registers %s as %s in family %s', (type, label, family) => {
    expect(lookupRegistry(type)).toMatchObject({ type, label, family });
    expect(isRegistered(type)).toBe(true);
  });

  it('gives every entry category, scope, family, safe attributes and relationship metadata', () => {
    for (const entry of registeredEntries()) {
      expect(entry.type).toMatch(/^aws_/);
      expect(entry.label.trim().length).toBeGreaterThan(2);
      expect(['global', 'regional', 'zonal']).toContain(entry.scope);
      expect(entry.family).toBeTruthy();
      expect(Array.isArray(entry.attributes)).toBe(true);
      expect(Array.isArray(entry.relationshipFields)).toBe(true);
    }
  });

  it('infers a useful family for unsupported AWS resources', () => {
    expect(lookupRegistry('aws_ecs_capacity_provider').family).toBe('containers');
    expect(lookupRegistry('aws_lambda_permission').family).toBe('serverless');
    expect(lookupRegistry('aws_cloudwatch_dashboard').family).toBe('monitoring');
    expect(lookupRegistry('aws_totally_new_service').family).toBe('generic');
  });

  it('keeps global service families global', () => {
    for (const type of [
      'aws_iam_user',
      'aws_route53_health_check',
      'aws_cloudfront_function',
      'aws_waf_rule',
    ]) {
      expect(lookupRegistry(type).scope).toBe('global');
    }
  });

  it('returns a sorted public list without duplicates', () => {
    const entries = registeredEntries();
    expect(new Set(entries.map((e) => e.type)).size).toBe(entries.length);
    expect(entries.map((e) => e.type)).toEqual(
      [...entries.map((e) => e.type)].sort((a, b) => a.localeCompare(b)),
    );
  });
});
