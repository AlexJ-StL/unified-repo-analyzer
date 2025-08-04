# Unified Repository Analyzer - Deployment Guide (Overview)

This is a concise overview. For the canonical, detailed guide, see docs/DEPLOYMENT.md.

Quick Start
1) Prerequisites
- Docker and Docker Compose
- Bun 1.0+ (recommended) or Node.js 18+

2) Clone and configure
```bash
git clone <repository-url>
cd unified-repo-analyzer
cp packages/backend/.env.example packages/backend/.env
```

3) Configure environment (packages/backend/.env)
```env
NODE_ENV=production
PORT=3000
JWT_SECRET=your-secure-32-character-secret
SESSION_SECRET=your-secure-32-character-secret
ENCRYPTION_KEY=your-32-character-encryption-key
CLAUDE_API_KEY=your_claude_api_key
# GEMINI_API_KEY=...
# OPENROUTER_API_KEY=...
```

4) Deploy
```bash
bun run deploy:prod
# or:
./scripts/deploy.sh         # Linux/macOS
.\scripts\deploy.ps1        # Windows
```

5) Verify
```bash
curl http://localhost:3000/health
curl http://localhost/
```

References
- Canonical deployment guide: docs/DEPLOYMENT.md
- Kubernetes manifests: k8s/
- Security policy: docs/SECURITY.md
- Production checklist: docs/PRODUCTION_CHECKLIST.md