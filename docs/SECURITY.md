# Security Policy

This document defines how we handle security for Unified Repository Analyzer.

## Supported Versions

We release patches for security vulnerabilities based on severity (CVSS v3.1).

| Version range | Status                            |
| ------------- | --------------------------------- |
| 1.x.x         | Supported                         |
| 0.x.x         | Best-effort (critical fixes only) |

## Reporting a Vulnerability

Email: security@unified-repo-analyzer.com

Include:
- Affected component(s) and version(s)
- Vulnerability description and impact
- Reproduction steps or PoC
- Any suggested mitigation

SLA targets:
- Acknowledge within 24 hours
- Triage update within 72 hours
- Fix ETA provided after triage based on severity

We support encrypted reports upon request.

## Security Response Process

1) Triage and severity
- Assess impact, exploitability, and scope
- Assign CVSS vector and provisional score

2) Remediation
- Develop and verify fix with targeted tests
- Prepare backports as needed

3) Release
- Publish patched versions
- Update changelog with “Security” section

4) Disclosure
- Coordinated disclosure; typical window 30 days post-fix, may vary by risk

## Secure Defaults and Hardening

- Rate limiting on sensitive endpoints
- Input validation and output encoding
- Principle of least privilege for services and data access
- HTTPS/TLS recommended in production
- Secrets managed via platform secret stores (Docker/K8s secrets)

## Security Headers (web)

We recommend the following headers for the frontend and any reverse proxy:

- Content-Security-Policy (CSP)
- Strict-Transport-Security (HSTS)
- X-Content-Type-Options: nosniff
- X-Frame-Options: DENY or SAMEORIGIN
- Referrer-Policy: no-referrer or strict-origin-when-cross-origin
- Permissions-Policy: restrict sensitive APIs

## Dependency and Supply Chain

- Automated dependency updates with security advisories
- Lockfile committed
- Vulnerability scanning in CI (SCA)
- Integrity checks and provenance where available

## Kubernetes and Container Security

- Use read-only root filesystems where possible
- Drop unnecessary Linux capabilities
- Run as non-root
- Resource requests/limits defined
- Secrets mounted from K8s Secrets; avoid in images
- Network policies to restrict traffic

## Responsible Disclosure

We appreciate coordinated disclosure and request that reporters:
- Refrain from public disclosure until a fix is available
- Avoid privacy or data integrity violations during testing
- Follow applicable laws and ethical guidelines

Thank you for helping keep users safe.
