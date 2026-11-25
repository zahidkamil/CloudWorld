import type { InfrastructureGraph } from '@/engine/graph/types';
import type { Finding, Severity } from './types';

/** Ports that should almost never be open to the whole internet. */
export const SENSITIVE_PORTS: Record<number, { service: string; severity: Severity }> = {
  22: { service: 'SSH', severity: 'high' },
  23: { service: 'Telnet', severity: 'critical' },
  3389: { service: 'Remote Desktop (RDP)', severity: 'critical' },
  1433: { service: 'SQL Server', severity: 'critical' },
  3306: { service: 'MySQL', severity: 'critical' },
  5432: { service: 'PostgreSQL', severity: 'critical' },
  6379: { service: 'Redis', severity: 'critical' },
  9200: { service: 'Elasticsearch', severity: 'high' },
  27017: { service: 'MongoDB', severity: 'critical' },
};

export interface SecurityRule {
  id: string;
  title: string;
  evaluate(graph: InfrastructureGraph): Finding[];
}

const portLabel = (from: number, to: number) => (from === to ? String(from) : `${from}-${to}`);

/**
 * Security groups that allow the whole internet (0.0.0.0/0 or ::/0) to reach a sensitive port,
 * or every port. Ports 80 and 443 are expected on web-facing groups and are not flagged.
 */
export const openSensitivePort: SecurityRule = {
  id: 'open-sensitive-port',
  title: 'Sensitive port open to the internet',
  evaluate(graph) {
    const findings: Finding[] = [];
    for (const r of graph.resources) {
      for (const rule of r.exposure?.openIngress ?? []) {
        const allPorts = rule.fromPort <= 0 && rule.toPort >= 65535;
        const exposed = allPorts
          ? [{ port: 0, service: 'every port', severity: 'critical' as Severity }]
          : Object.entries(SENSITIVE_PORTS)
              .map(([port, info]) => ({ port: Number(port), ...info }))
              .filter((p) => p.port >= rule.fromPort && p.port <= rule.toPort);
        for (const hit of exposed) {
          const where = allPorts ? 'all ports' : `${hit.service} on port ${hit.port}`;
          findings.push({
            id: `open-sensitive-port:${r.id}:${allPorts ? 'all' : hit.port}`,
            ruleId: 'open-sensitive-port',
            severity: hit.severity,
            title: allPorts ? 'Every port is open to the internet' : `${hit.service} is open to the internet`,
            resourceId: r.id,
            resourceName: r.name,
            evidence: `${r.name} accepts traffic from anywhere (0.0.0.0/0) on ${where}${
              rule.protocol === '-1' ? '' : ` over ${rule.protocol.toUpperCase()}`
            }, range ${portLabel(rule.fromPort, rule.toPort)}.`,
            hints: [
              'Look at the security groups. Which one lets the whole internet knock on a door that should be private?',
              `Check the ingress rules of ${r.name}. One rule uses the source 0.0.0.0/0.`,
              allPorts
                ? 'A rule opens every port. Admin and database ports should only be reachable from trusted addresses.'
                : `Port ${hit.port} (${hit.service}) is reachable from any address. It should only be reachable from trusted addresses.`,
            ],
            remediations: [
              {
                id: 'restrict-source',
                label: 'Limit the source to a trusted network, such as a VPN or office range',
                correct: true,
                explanation:
                  'Correct. Narrowing the source CIDR keeps the service reachable for the people who need it and closed to everyone else.',
              },
              {
                id: 'private-access',
                label:
                  'Remove the rule and use private access instead, such as Session Manager or a bastion in a private subnet',
                correct: true,
                explanation:
                  'Correct. With no public ingress rule there is nothing for an attacker to find, and access can still be audited.',
              },
              {
                id: 'rely-on-password',
                label: 'Leave it open and rely on a strong password',
                correct: false,
                explanation:
                  'Not quite. A strong password does not stop scanning, brute force, or future vulnerabilities in the service.',
              },
              {
                id: 'rename-group',
                label: 'Rename the security group so it is harder to find',
                correct: false,
                explanation:
                  'Not quite. Names do not affect who can connect. The ingress rule is what matters.',
              },
            ],
          });
        }
      }
    }
    return findings;
  },
};

export const RULES: readonly SecurityRule[] = [openSensitivePort];
