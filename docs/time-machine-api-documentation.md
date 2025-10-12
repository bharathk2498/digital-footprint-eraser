# Time Machine Erasure API Documentation

## Overview

The Time Machine Erasure API enables programmatic access to temporal data scanning and removal capabilities. Built for enterprise integration, compliance automation, and custom workflows.

**Base URL**: `https://api.timemachine-eraser.com/v1`

**Authentication**: Bearer token (API keys managed in dashboard)

**Rate Limits**: 
- Free tier: 100 requests/hour
- Professional: 1,000 requests/hour
- Enterprise: 10,000 requests/hour

---

## Authentication

All API requests require authentication via Bearer token in the Authorization header.

### Obtain API Key

1. Log in to dashboard: https://app.timemachine-eraser.com
2. Navigate to Settings > API Keys
3. Generate new API key
4. Store securely (displayed only once)

### Request Format

```bash
curl https://api.timemachine-eraser.com/v1/endpoint \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json"
```

### API Key Scopes

- `scans:read` - View scan results
- `scans:write` - Initiate new scans
- `removals:write` - Execute removal requests
- `admin:all` - Full account access

---

## Core Endpoints

### 1. Initiate Temporal Scan

**Endpoint**: `POST /v1/scans`

**Description**: Start a comprehensive temporal data scan across multiple sources.

**Request Body**:
```json
{
  "target": "john.doe@example.com",
  "target_type": "email",
  "scope": ["archive", "cdn", "ai_datasets", "search_cache", "academic", "breach"],
  "temporal_range": "20_years",
  "priority": "normal",
  "webhook_url": "https://your-app.com/webhook"
}
```

**Parameters**:
- `target` (required): Email, username, domain, or full name to scan
- `target_type` (required): One of `email`, `username`, `domain`, `name`
- `scope` (optional): Array of sources to scan. Default: all sources
- `temporal_range` (optional): `5_years`, `10_years`, `20_years`. Default: `20_years`
- `priority` (optional): `low`, `normal`, `high`. Default: `normal`
- `webhook_url` (optional): URL to receive scan completion notification

**Response**:
```json
{
  "scan_id": "scan_1a2b3c4d5e6f",
  "status": "queued",
  "created_at": "2025-01-15T10:30:00Z",
  "estimated_completion": "2025-01-15T10:45:00Z",
  "scope": ["archive", "cdn", "ai_datasets", "search_cache", "academic", "breach"],
  "temporal_range": "20_years"
}
```

**Status Codes**:
- `201 Created` - Scan initiated successfully
- `400 Bad Request` - Invalid parameters
- `401 Unauthorized` - Invalid API key
- `429 Too Many Requests` - Rate limit exceeded

---

### 2. Get Scan Status

**Endpoint**: `GET /v1/scans/{scan_id}`

**Description**: Retrieve current status and results of a scan.

**Request**:
```bash
curl https://api.timemachine-eraser.com/v1/scans/scan_1a2b3c4d5e6f \
  -H "Authorization: Bearer YOUR_API_KEY"
```

**Response**:
```json
{
  "scan_id": "scan_1a2b3c4d5e6f",
  "status": "completed",
  "created_at": "2025-01-15T10:30:00Z",
  "completed_at": "2025-01-15T10:42:00Z",
  "target": "john.doe@example.com",
  "findings": {
    "internet_archive": {
      "snapshots_found": 147,
      "date_range": "2005-03-12 to 2024-11-03",
      "urls_affected": 23,
      "oldest_snapshot": "2005-03-12T08:15:00Z"
    },
    "cdn_cache": {
      "caches_found": 73,
      "providers": ["cloudflare", "akamai", "fastly"],
      "edge_locations": 45
    },
    "ai_datasets": {
      "matches_found": 18,
      "datasets": ["common_crawl_2023_10", "laion_5b", "c4"],
      "training_models_affected": 7
    },
    "search_cache": {
      "google_cache": 32,
      "bing_cache": 14
    },
    "academic_repos": {
      "papers_found": 7,
      "citations": 12,
      "institutions": ["MIT", "Stanford", "Berkeley"]
    },
    "breach_databases": {
      "breaches_found": 3,
      "records_exposed": 2847,
      "most_recent": "2023-08-15"
    }
  },
  "risk_score": 72,
  "recommendations": [
    "Immediate removal recommended for breach databases",
    "High priority: 147 archive snapshots spanning 20 years",
    "AI dataset removal requires GDPR requests"
  ]
}
```

**Status Values**:
- `queued` - Scan is queued for processing
- `processing` - Scan is currently running
- `completed` - Scan finished successfully
- `failed` - Scan encountered errors
- `cancelled` - Scan was cancelled by user

---

### 3. List All Scans

**Endpoint**: `GET /v1/scans`

**Description**: Retrieve all scans for your account.

**Query Parameters**:
- `limit` (optional): Number of results per page (1-100). Default: 20
- `offset` (optional): Pagination offset. Default: 0
- `status` (optional): Filter by status. Values: `queued`, `processing`, `completed`, `failed`

**Request**:
```bash
curl "https://api.timemachine-eraser.com/v1/scans?limit=10&status=completed" \
  -H "Authorization: Bearer YOUR_API_KEY"
```

**Response**:
```json
{
  "scans": [
    {
      "scan_id": "scan_1a2b3c4d5e6f",
      "status": "completed",
      "target": "john.doe@example.com",
      "created_at": "2025-01-15T10:30:00Z",
      "findings_summary": {
        "total_findings": 291,
        "risk_score": 72
      }
    }
  ],
  "pagination": {
    "total": 45,
    "limit": 10,
    "offset": 0,
    "next_offset": 10
  }
}
```

---

### 4. Initiate Removal Request

**Endpoint**: `POST /v1/removals`

**Description**: Execute removal requests based on scan findings.

**Request Body**:
```json
{
  "scan_id": "scan_1a2b3c4d5e6f",
  "targets": [
    {
      "source": "internet_archive",
      "priority": "high",
      "method": "dmca"
    },
    {
      "source": "cdn_cache",
      "providers": ["cloudflare", "akamai"],
      "priority": "high"
    },
    {
      "source": "ai_datasets",
      "datasets": ["common_crawl_2023_10"],
      "method": "gdpr"
    }
  ],
  "webhook_url": "https://your-app.com/removal-webhook"
}
```

**Parameters**:
- `scan_id` (required): ID of completed scan
- `targets` (required): Array of removal targets
  - `source` (required): One of `internet_archive`, `cdn_cache`, `ai_datasets`, `search_cache`, `academic`, `breach`
  - `priority` (optional): `low`, `normal`, `high`. Default: `normal`
  - `method` (optional): Removal method (`dmca`, `gdpr`, `api`, `manual`)
  - Additional source-specific parameters

**Response**:
```json
{
  "removal_id": "rem_9z8y7x6w5v4u",
  "status": "initiated",
  "created_at": "2025-01-15T11:00:00Z",
  "estimated_completion": "2025-02-14T11:00:00Z",
  "targets": [
    {
      "source": "internet_archive",
      "requests_sent": 147,
      "method": "dmca"
    },
    {
      "source": "cdn_cache",
      "purges_initiated": 73,
      "providers": ["cloudflare", "akamai"]
    }
  ],
  "legal_documentation_url": "https://docs.timemachine-eraser.com/removal_9z8y7x6w5v4u.pdf"
}
```

---

### 5. Get Removal Status

**Endpoint**: `GET /v1/removals/{removal_id}`

**Description**: Check status of ongoing removal requests.

**Response**:
```json
{
  "removal_id": "rem_9z8y7x6w5v4u",
  "status": "in_progress",
  "created_at": "2025-01-15T11:00:00Z",
  "estimated_completion": "2025-02-14T11:00:00Z",
  "progress": {
    "internet_archive": {
      "total_requests": 147,
      "completed": 89,
      "success_rate": 92,
      "pending": 58
    },
    "cdn_cache": {
      "total_purges": 73,
      "completed": 73,
      "success_rate": 100,
      "verification_pending": 0
    },
    "ai_datasets": {
      "total_requests": 18,
      "submitted": 18,
      "acknowledged": 12,
      "completed": 3,
      "pending_response": 6
    }
  },
  "overall_completion": 68,
  "next_followup": "2025-01-22T11:00:00Z"
}
```

**Status Values**:
- `initiated` - Removal requests sent
- `in_progress` - Actively processing removals
- `completed` - All removals finished
- `partially_completed` - Some removals failed
- `failed` - Critical failures encountered

---

### 6. Cancel Scan or Removal

**Endpoint**: `DELETE /v1/scans/{scan_id}` or `DELETE /v1/removals/{removal_id}`

**Description**: Cancel an ongoing scan or removal process.

**Response**:
```json
{
  "id": "scan_1a2b3c4d5e6f",
  "status": "cancelled",
  "cancelled_at": "2025-01-15T10:35:00Z",
  "partial_results_available": true
}
```

---

## Webhooks

### Overview

Receive real-time notifications when scans complete or removals progress.

### Configuration

1. Specify `webhook_url` when initiating scan/removal
2. Configure webhook signature verification (recommended)
3. Handle POST requests to your endpoint

### Webhook Payload

**Scan Completion**:
```json
{
  "event": "scan.completed",
  "timestamp": "2025-01-15T10:42:00Z",
  "data": {
    "scan_id": "scan_1a2b3c4d5e6f",
    "status": "completed",
    "findings_summary": {
      "total_findings": 291,
      "risk_score": 72
    },
    "details_url": "https://api.timemachine-eraser.com/v1/scans/scan_1a2b3c4d5e6f"
  }
}
```

**Removal Progress**:
```json
{
  "event": "removal.progress",
  "timestamp": "2025-01-20T14:30:00Z",
  "data": {
    "removal_id": "rem_9z8y7x6w5v4u",
    "overall_completion": 68,
    "sources_completed": ["cdn_cache"],
    "sources_in_progress": ["internet_archive", "ai_datasets"]
  }
}
```

### Webhook Signature Verification

```python
import hmac
import hashlib

def verify_webhook(payload, signature, secret):
    expected = hmac.new(
        secret.encode(),
        payload.encode(),
        hashlib.sha256
    ).hexdigest()
    return hmac.compare_digest(signature, expected)
```

---

## Error Handling

### Error Response Format

```json
{
  "error": {
    "code": "invalid_target",
    "message": "The target format is invalid. Expected email or domain.",
    "details": "Received: @invalid.format",
    "documentation_url": "https://docs.timemachine-eraser.com/errors#invalid_target"
  }
}
```

### Common Error Codes

| Code | HTTP Status | Description |
|------|-------------|-------------|
| `invalid_target` | 400 | Target format is invalid |
| `invalid_scope` | 400 | Scope parameter contains invalid values |
| `scan_not_found` | 404 | Scan ID does not exist |
| `unauthorized` | 401 | Invalid or missing API key |
| `insufficient_permissions` | 403 | API key lacks required scope |
| `rate_limit_exceeded` | 429 | Too many requests |
| `scan_in_progress` | 409 | Scan already running for this target |
| `server_error` | 500 | Internal server error |

### Retry Logic

```python
import time
import requests

def api_request_with_retry(url, headers, max_retries=3):
    for attempt in range(max_retries):
        response = requests.get(url, headers=headers)
        
        if response.status_code == 429:
            retry_after = int(response.headers.get('Retry-After', 60))
            time.sleep(retry_after)
            continue
            
        if response.status_code >= 500:
            time.sleep(2 ** attempt)
            continue
            
        return response
    
    raise Exception(f"Failed after {max_retries} retries")
```

---

## Code Examples

### Python

```python
import requests

API_KEY = "your_api_key_here"
BASE_URL = "https://api.timemachine-eraser.com/v1"

headers = {
    "Authorization": f"Bearer {API_KEY}",
    "Content-Type": "application/json"
}

# Initiate scan
scan_data = {
    "target": "john.doe@example.com",
    "target_type": "email",
    "scope": ["archive", "cdn", "ai_datasets"],
    "temporal_range": "20_years"
}

response = requests.post(
    f"{BASE_URL}/scans",
    json=scan_data,
    headers=headers
)

scan = response.json()
scan_id = scan["scan_id"]

print(f"Scan initiated: {scan_id}")

# Poll for completion
import time

while True:
    response = requests.get(
        f"{BASE_URL}/scans/{scan_id}",
        headers=headers
    )
    scan_status = response.json()
    
    if scan_status["status"] == "completed":
        print("Scan completed!")
        print(f"Findings: {scan_status['findings']}")
        break
    
    print(f"Status: {scan_status['status']}")
    time.sleep(10)

# Initiate removal
removal_data = {
    "scan_id": scan_id,
    "targets": [
        {"source": "internet_archive", "priority": "high"},
        {"source": "cdn_cache"}
    ]
}

response = requests.post(
    f"{BASE_URL}/removals",
    json=removal_data,
    headers=headers
)

removal = response.json()
print(f"Removal initiated: {removal['removal_id']}")
```

### JavaScript (Node.js)

```javascript
const axios = require('axios');

const API_KEY = 'your_api_key_here';
const BASE_URL = 'https://api.timemachine-eraser.com/v1';

const headers = {
  'Authorization': `Bearer ${API_KEY}`,
  'Content-Type': 'application/json'
};

// Initiate scan
async function initiateScan() {
  const scanData = {
    target: 'john.doe@example.com',
    target_type: 'email',
    scope: ['archive', 'cdn', 'ai_datasets'],
    temporal_range: '20_years'
  };

  const response = await axios.post(
    `${BASE_URL}/scans`,
    scanData,
    { headers }
  );

  return response.data.scan_id;
}

// Check scan status
async function checkScanStatus(scanId) {
  const response = await axios.get(
    `${BASE_URL}/scans/${scanId}`,
    { headers }
  );

  return response.data;
}

// Main execution
(async () => {
  const scanId = await initiateScan();
  console.log(`Scan initiated: ${scanId}`);

  // Poll for completion
  let scan;
  do {
    await new Promise(resolve => setTimeout(resolve, 10000));
    scan = await checkScanStatus(scanId);
    console.log(`Status: ${scan.status}`);
  } while (scan.status !== 'completed');

  console.log('Scan completed!');
  console.log('Findings:', scan.findings);
})();
```

### cURL

```bash
# Initiate scan
curl -X POST https://api.timemachine-eraser.com/v1/scans \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "target": "john.doe@example.com",
    "target_type": "email",
    "scope": ["archive", "cdn", "ai_datasets"],
    "temporal_range": "20_years"
  }'

# Check scan status
curl https://api.timemachine-eraser.com/v1/scans/scan_1a2b3c4d5e6f \
  -H "Authorization: Bearer YOUR_API_KEY"

# Initiate removal
curl -X POST https://api.timemachine-eraser.com/v1/removals \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "scan_id": "scan_1a2b3c4d5e6f",
    "targets": [
      {"source": "internet_archive", "priority": "high"},
      {"source": "cdn_cache"}
    ]
  }'
```

---

## Rate Limiting

### Limits by Tier

| Tier | Requests/Hour | Burst Limit |
|------|---------------|-------------|
| Free | 100 | 10 |
| Professional | 1,000 | 50 |
| Enterprise | 10,000 | 200 |

### Headers

All responses include rate limit headers:

```
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 847
X-RateLimit-Reset: 1642345678
```

### 429 Response

```json
{
  "error": {
    "code": "rate_limit_exceeded",
    "message": "API rate limit exceeded",
    "retry_after": 3600
  }
```

---

## Changelog

### v1.0.0 (2025-01-15)
- Initial API release
- Core scan and removal endpoints
- Webhook support
- Python and JavaScript examples

---

## Support

**API Issues**: api-support@timemachine-eraser.com
**Documentation**: docs.timemachine-eraser.com
**Status Page**: status.timemachine-eraser.com
