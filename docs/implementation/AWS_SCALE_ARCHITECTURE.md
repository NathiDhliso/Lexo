# AWS Architecture for Scale, Resilience & Robustness

**Date:** 2025-10-06  
**Status:** Architecture Planning  
**Purpose:** Scale LexoHub financial workflow with AWS services

---

## Current Architecture

### What We Have
- **Frontend:** React + TypeScript (Vite)
- **Backend:** Supabase (PostgreSQL + Auth + Storage)
- **State Management:** React hooks + Context API
- **Real-time Updates:** Supabase subscriptions
- **File Storage:** Supabase Storage

### Current Limitations
- Single region (Supabase hosted)
- No CDN for static assets
- No caching layer
- No queue system for async operations
- No dedicated search infrastructure
- Manual scaling
- Limited observability

---

## Proposed AWS Architecture

### Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                         USER LAYER                               │
├─────────────────────────────────────────────────────────────────┤
│  Web Browsers  │  Mobile Apps  │  API Clients                   │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                    CLOUDFRONT (CDN)                              │
│  - Global edge locations                                         │
│  - SSL/TLS termination                                          │
│  - DDoS protection (AWS Shield)                                 │
│  - Cache static assets                                          │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                    APPLICATION LAYER                             │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌──────────────────┐         ┌──────────────────┐            │
│  │   S3 Bucket      │         │  API Gateway     │            │
│  │  (Static Assets) │         │  (REST/WebSocket)│            │
│  │  - React build   │         │  - Rate limiting │            │
│  │  - Images        │         │  - Auth          │            │
│  └──────────────────┘         └──────────────────┘            │
│                                        ↓                        │
│                    ┌───────────────────────────────┐           │
│                    │   Lambda Functions (Node.js)  │           │
│                    │   - Invoice generation        │           │
│                    │   - PDF creation              │           │
│                    │   - Email notifications       │           │
│                    │   - Workflow automation       │           │
│                    └───────────────────────────────┘           │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                    CACHING & QUEUE LAYER                         │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌──────────────────┐         ┌──────────────────┐            │
│  │  ElastiCache     │         │      SQS         │            │
│  │  (Redis)         │         │  (Message Queue) │            │
│  │  - Session cache │         │  - Async tasks   │            │
│  │  - Query cache   │         │  - PDF jobs      │            │
│  │  - Rate limiting │         │  - Email queue   │            │
│  └──────────────────┘         └──────────────────┘            │
│                                                                  │
│  ┌──────────────────┐         ┌──────────────────┐            │
│  │  EventBridge     │         │   Step Functions │            │
│  │  (Event Bus)     │         │  (Orchestration) │            │
│  │  - Workflow      │         │  - Multi-step    │            │
│  │    events        │         │    workflows     │            │
│  └──────────────────┘         └──────────────────┘            │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                    DATA LAYER                                    │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌──────────────────┐         ┌──────────────────┐            │
│  │   RDS Aurora     │         │  OpenSearch      │            │
│  │   (PostgreSQL)   │         │  (Search Engine) │            │
│  │   - Multi-AZ     │         │  - Full-text     │            │
│  │   - Read replicas│         │  - Faceted search│            │
│  │   - Auto-scaling │         │  - Analytics     │            │
│  └──────────────────┘         └──────────────────┘            │
│                                                                  │
│  ┌──────────────────┐         ┌──────────────────┐            │
│  │   S3 Bucket      │         │   DynamoDB       │            │
│  │   (Documents)    │         │   (Session Store)│            │
│  │   - Invoices     │         │   - User sessions│            │
│  │   - Pro formas   │         │   - Cache data   │            │
│  │   - Attachments  │         │   - Counters     │            │
│  └──────────────────┘         └──────────────────┘            │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                    MONITORING & OBSERVABILITY                    │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌──────────────────┐  ┌──────────────────┐  ┌──────────────┐ │
│  │   CloudWatch     │  │   X-Ray          │  │  CloudTrail  │ │
│  │   - Logs         │  │   - Tracing      │  │  - Audit     │ │
│  │   - Metrics      │  │   - Performance  │  │  - Compliance│ │
│  │   - Alarms       │  │   - Debugging    │  │              │ │
│  └──────────────────┘  └──────────────────┘  └──────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

---

## Phase 1: Foundation (Week 1-2)

### 1.1 CloudFront + S3 for Static Assets

**Purpose:** Global CDN for fast asset delivery

**Implementation:**
```typescript
// vite.config.ts - Update for S3 deployment
export default defineConfig({
  build: {
    outDir: 'dist',
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          ui: ['lucide-react', 'react-hot-toast'],
          supabase: ['@supabase/supabase-js']
        }
      }
    }
  }
});
```

**AWS Setup:**
```bash
# Create S3 bucket
aws s3 mb s3://lexohub-frontend --region us-east-1

# Enable static website hosting
aws s3 website s3://lexohub-frontend \
  --index-document index.html \
  --error-document index.html

# Create CloudFront distribution
aws cloudfront create-distribution \
  --origin-domain-name lexohub-frontend.s3.amazonaws.com \
  --default-root-object index.html
```

**Benefits:**
- ✅ Global edge caching (reduce latency by 70%)
- ✅ DDoS protection
- ✅ SSL/TLS at edge
- ✅ Automatic failover

**Cost:** ~$50-100/month

---

### 1.2 ElastiCache (Redis) for Caching

**Purpose:** Cache workflow counts, user sessions, query results

**Implementation:**
```typescript
// src/lib/cache.ts
import Redis from 'ioredis';

const redis = new Redis({
  host: process.env.REDIS_ENDPOINT,
  port: 6379,
  password: process.env.REDIS_PASSWORD,
  tls: { rejectUnauthorized: false }
});

export class CacheService {
  // Cache workflow counts
  static async getWorkflowCounts(userId: string) {
    const cacheKey = `workflow:counts:${userId}`;
    const cached = await redis.get(cacheKey);
    
    if (cached) {
      return JSON.parse(cached);
    }
    
    // Fetch from database
    const counts = await fetchFromDatabase(userId);
    
    // Cache for 30 seconds
    await redis.setex(cacheKey, 30, JSON.stringify(counts));
    
    return counts;
  }
  
  // Cache matter details
  static async getMatter(matterId: string) {
    const cacheKey = `matter:${matterId}`;
    const cached = await redis.get(cacheKey);
    
    if (cached) {
      return JSON.parse(cached);
    }
    
    const matter = await fetchMatterFromDB(matterId);
    
    // Cache for 5 minutes
    await redis.setex(cacheKey, 300, JSON.stringify(matter));
    
    return matter;
  }
  
  // Invalidate cache on updates
  static async invalidateMatter(matterId: string) {
    await redis.del(`matter:${matterId}`);
  }
}
```

**Benefits:**
- ✅ Reduce database load by 80%
- ✅ Sub-millisecond response times
- ✅ Session management
- ✅ Rate limiting

**Cost:** ~$50-150/month (cache.t3.micro)

---

### 1.3 SQS for Async Operations

**Purpose:** Queue for PDF generation, email sending, bulk operations

**Implementation:**
```typescript
// src/services/queue/sqs.service.ts
import { SQSClient, SendMessageCommand } from '@aws-sdk/client-sqs';

const sqsClient = new SQSClient({ region: 'us-east-1' });

export class QueueService {
  // Queue PDF generation
  static async queuePDFGeneration(invoiceId: string, userId: string) {
    const command = new SendMessageCommand({
      QueueUrl: process.env.PDF_QUEUE_URL,
      MessageBody: JSON.stringify({
        type: 'GENERATE_PDF',
        invoiceId,
        userId,
        timestamp: new Date().toISOString()
      }),
      MessageAttributes: {
        priority: {
          DataType: 'String',
          StringValue: 'high'
        }
      }
    });
    
    await sqsClient.send(command);
  }
  
  // Queue email notification
  static async queueEmail(to: string, template: string, data: any) {
    const command = new SendMessageCommand({
      QueueUrl: process.env.EMAIL_QUEUE_URL,
      MessageBody: JSON.stringify({
        type: 'SEND_EMAIL',
        to,
        template,
        data,
        timestamp: new Date().toISOString()
      })
    });
    
    await sqsClient.send(command);
  }
  
  // Queue batch invoice generation
  static async queueBatchInvoices(requestIds: string[], userId: string) {
    const command = new SendMessageCommand({
      QueueUrl: process.env.BATCH_QUEUE_URL,
      MessageBody: JSON.stringify({
        type: 'BATCH_INVOICES',
        requestIds,
        userId,
        timestamp: new Date().toISOString()
      })
    });
    
    await sqsClient.send(command);
  }
}
```

**Lambda Worker:**
```typescript
// lambda/pdf-worker/index.ts
import { SQSEvent } from 'aws-lambda';
import { generatePDF } from './pdf-generator';
import { uploadToS3 } from './s3-uploader';

export const handler = async (event: SQSEvent) => {
  for (const record of event.Records) {
    const message = JSON.parse(record.body);
    
    try {
      // Generate PDF
      const pdfBuffer = await generatePDF(message.invoiceId);
      
      // Upload to S3
      const s3Key = await uploadToS3(pdfBuffer, message.invoiceId);
      
      // Update database
      await updateInvoiceWithPDFUrl(message.invoiceId, s3Key);
      
      // Send notification
      await notifyUser(message.userId, s3Key);
      
    } catch (error) {
      console.error('PDF generation failed:', error);
      // Message will be retried automatically
      throw error;
    }
  }
};
```

**Benefits:**
- ✅ Async processing (don't block UI)
- ✅ Automatic retries
- ✅ Dead letter queue for failures
- ✅ Scale to millions of messages

**Cost:** ~$10-30/month (pay per message)

---

## Phase 2: Advanced Features (Week 3-4)

### 2.1 OpenSearch for Advanced Search

**Purpose:** Full-text search across matters, invoices, clients

**Implementation:**
```typescript
// src/services/search/opensearch.service.ts
import { Client } from '@opensearch-project/opensearch';

const client = new Client({
  node: process.env.OPENSEARCH_ENDPOINT,
  auth: {
    username: process.env.OPENSEARCH_USER,
    password: process.env.OPENSEARCH_PASSWORD
  }
});

export class SearchService {
  // Index a matter
  static async indexMatter(matter: Matter) {
    await client.index({
      index: 'matters',
      id: matter.id,
      body: {
        title: matter.title,
        description: matter.description,
        client_name: matter.client_name,
        reference_number: matter.reference_number,
        status: matter.status,
        created_at: matter.created_at,
        advocate_id: matter.advocate_id
      }
    });
  }
  
  // Search across all documents
  static async search(query: string, userId: string) {
    const response = await client.search({
      index: ['matters', 'invoices', 'proformas'],
      body: {
        query: {
          bool: {
            must: [
              {
                multi_match: {
                  query,
                  fields: ['title^2', 'description', 'client_name', 'reference_number'],
                  fuzziness: 'AUTO'
                }
              }
            ],
            filter: [
              { term: { advocate_id: userId } }
            ]
          }
        },
        highlight: {
          fields: {
            title: {},
            description: {},
            client_name: {}
          }
        }
      }
    });
    
    return response.body.hits.hits;
  }
  
  // Faceted search
  static async facetedSearch(filters: any, userId: string) {
    const response = await client.search({
      index: 'matters',
      body: {
        query: {
          bool: {
            filter: [
              { term: { advocate_id: userId } },
              ...buildFilters(filters)
            ]
          }
        },
        aggs: {
          by_status: {
            terms: { field: 'status' }
          },
          by_matter_type: {
            terms: { field: 'matter_type' }
          },
          by_month: {
            date_histogram: {
              field: 'created_at',
              calendar_interval: 'month'
            }
          }
        }
      }
    });
    
    return response.body;
  }
}
```

**Benefits:**
- ✅ Sub-second search across millions of documents
- ✅ Fuzzy matching, typo tolerance
- ✅ Faceted search (filter by status, type, date)
- ✅ Analytics and aggregations

**Cost:** ~$100-300/month (t3.small.search)

---

### 2.2 Step Functions for Complex Workflows

**Purpose:** Orchestrate multi-step processes (pro forma → invoice → payment)

**Implementation:**
```json
{
  "Comment": "Pro Forma to Invoice Workflow",
  "StartAt": "ValidateProForma",
  "States": {
    "ValidateProForma": {
      "Type": "Task",
      "Resource": "arn:aws:lambda:us-east-1:123456789:function:validate-proforma",
      "Next": "GenerateInvoice"
    },
    "GenerateInvoice": {
      "Type": "Task",
      "Resource": "arn:aws:lambda:us-east-1:123456789:function:generate-invoice",
      "Next": "GeneratePDF"
    },
    "GeneratePDF": {
      "Type": "Task",
      "Resource": "arn:aws:lambda:us-east-1:123456789:function:generate-pdf",
      "Next": "SendNotification"
    },
    "SendNotification": {
      "Type": "Task",
      "Resource": "arn:aws:lambda:us-east-1:123456789:function:send-email",
      "Next": "UpdateStatus"
    },
    "UpdateStatus": {
      "Type": "Task",
      "Resource": "arn:aws:lambda:us-east-1:123456789:function:update-status",
      "End": true
    }
  }
}
```

**Benefits:**
- ✅ Visual workflow designer
- ✅ Automatic error handling and retries
- ✅ Audit trail of all steps
- ✅ Parallel execution support

**Cost:** ~$25-50/month (pay per state transition)

---

### 2.3 EventBridge for Event-Driven Architecture

**Purpose:** Decouple services with events

**Implementation:**
```typescript
// src/services/events/eventbridge.service.ts
import { EventBridgeClient, PutEventsCommand } from '@aws-sdk/client-eventbridge';

const client = new EventBridgeClient({ region: 'us-east-1' });

export class EventService {
  // Emit invoice generated event
  static async emitInvoiceGenerated(invoice: Invoice) {
    const command = new PutEventsCommand({
      Entries: [
        {
          Source: 'lexohub.invoices',
          DetailType: 'InvoiceGenerated',
          Detail: JSON.stringify({
            invoiceId: invoice.id,
            matterId: invoice.matter_id,
            amount: invoice.total_amount,
            userId: invoice.advocate_id,
            timestamp: new Date().toISOString()
          }),
          EventBusName: 'lexohub-events'
        }
      ]
    });
    
    await client.send(command);
  }
  
  // Emit pro forma accepted event
  static async emitProFormaAccepted(proformaId: string, userId: string) {
    const command = new PutEventsCommand({
      Entries: [
        {
          Source: 'lexohub.proforma',
          DetailType: 'ProFormaAccepted',
          Detail: JSON.stringify({
            proformaId,
            userId,
            timestamp: new Date().toISOString()
          }),
          EventBusName: 'lexohub-events'
        }
      ]
    });
    
    await client.send(command);
  }
}
```

**Event Consumers:**
```typescript
// Lambda triggered by InvoiceGenerated event
export const handleInvoiceGenerated = async (event: any) => {
  const { invoiceId, userId } = event.detail;
  
  // Queue PDF generation
  await QueueService.queuePDFGeneration(invoiceId, userId);
  
  // Send email notification
  await QueueService.queueEmail(userId, 'invoice-generated', { invoiceId });
  
  // Update analytics
  await AnalyticsService.trackInvoiceGenerated(invoiceId);
};
```

**Benefits:**
- ✅ Loose coupling between services
- ✅ Easy to add new features without changing existing code
- ✅ Event replay for debugging
- ✅ Multiple consumers per event

**Cost:** ~$10-20/month (pay per event)

---

## Phase 3: Resilience & High Availability (Week 5-6)

### 3.1 RDS Aurora with Multi-AZ

**Purpose:** Replace Supabase with managed PostgreSQL

**Features:**
- Multi-AZ deployment (automatic failover)
- Read replicas for scaling reads
- Automatic backups and point-in-time recovery
- Auto-scaling storage

**Migration Strategy:**
```bash
# 1. Create Aurora cluster
aws rds create-db-cluster \
  --db-cluster-identifier lexohub-cluster \
  --engine aurora-postgresql \
  --master-username admin \
  --master-user-password <password> \
  --database-name lexohub

# 2. Export from Supabase
pg_dump -h <supabase-host> -U postgres lexohub > backup.sql

# 3. Import to Aurora
psql -h <aurora-endpoint> -U admin lexohub < backup.sql

# 4. Update connection strings
```

**Benefits:**
- ✅ 99.99% uptime SLA
- ✅ Automatic failover (< 30 seconds)
- ✅ Up to 15 read replicas
- ✅ Backtrack (rewind database)

**Cost:** ~$200-500/month (db.t3.medium)

---

### 3.2 CloudWatch Monitoring & Alarms

**Implementation:**
```typescript
// src/services/monitoring/cloudwatch.service.ts
import { CloudWatchClient, PutMetricDataCommand } from '@aws-sdk/client-cloudwatch';

const client = new CloudWatchClient({ region: 'us-east-1' });

export class MonitoringService {
  // Track invoice generation time
  static async trackInvoiceGeneration(duration: number, success: boolean) {
    const command = new PutMetricDataCommand({
      Namespace: 'LexoHub/Invoices',
      MetricData: [
        {
          MetricName: 'GenerationDuration',
          Value: duration,
          Unit: 'Milliseconds',
          Timestamp: new Date()
        },
        {
          MetricName: 'GenerationSuccess',
          Value: success ? 1 : 0,
          Unit: 'Count',
          Timestamp: new Date()
        }
      ]
    });
    
    await client.send(command);
  }
  
  // Track API errors
  static async trackError(errorType: string, endpoint: string) {
    const command = new PutMetricDataCommand({
      Namespace: 'LexoHub/API',
      MetricData: [
        {
          MetricName: 'Errors',
          Value: 1,
          Unit: 'Count',
          Dimensions: [
            { Name: 'ErrorType', Value: errorType },
            { Name: 'Endpoint', Value: endpoint }
          ],
          Timestamp: new Date()
        }
      ]
    });
    
    await client.send(command);
  }
}
```

**Alarms:**
```typescript
// Create alarms via CDK/CloudFormation
const errorAlarm = new cloudwatch.Alarm(this, 'HighErrorRate', {
  metric: new cloudwatch.Metric({
    namespace: 'LexoHub/API',
    metricName: 'Errors',
    statistic: 'Sum',
    period: Duration.minutes(5)
  }),
  threshold: 10,
  evaluationPeriods: 2,
  alarmDescription: 'Alert when error rate is high',
  actionsEnabled: true
});

// Send to SNS for notifications
errorAlarm.addAlarmAction(new cloudwatch_actions.SnsAction(alertTopic));
```

**Benefits:**
- ✅ Real-time metrics and dashboards
- ✅ Automatic alerting
- ✅ Log aggregation
- ✅ Performance insights

**Cost:** ~$30-50/month

---

## Cost Summary

### Monthly AWS Costs (Estimated)

| Service | Purpose | Cost |
|---------|---------|------|
| CloudFront | CDN for static assets | $50-100 |
| S3 | Static hosting + documents | $20-50 |
| ElastiCache (Redis) | Caching layer | $50-150 |
| SQS | Message queuing | $10-30 |
| Lambda | Serverless compute | $50-100 |
| RDS Aurora | Database (Multi-AZ) | $200-500 |
| OpenSearch | Search engine | $100-300 |
| EventBridge | Event bus | $10-20 |
| Step Functions | Workflow orchestration | $25-50 |
| CloudWatch | Monitoring | $30-50 |
| **Total** | | **$545-1,350/month** |

### Cost Optimization Tips
- Use Reserved Instances for RDS (save 40%)
- Use Savings Plans for Lambda (save 17%)
- Enable S3 Intelligent-Tiering
- Use CloudFront compression
- Set up budget alerts

---

## Implementation Roadmap

### Phase 1: Foundation (2 weeks)
- [ ] Set up CloudFront + S3
- [ ] Deploy ElastiCache (Redis)
- [ ] Implement SQS queues
- [ ] Create Lambda workers
- [ ] Set up CloudWatch monitoring

### Phase 2: Advanced Features (2 weeks)
- [ ] Deploy OpenSearch cluster
- [ ] Implement Step Functions workflows
- [ ] Set up EventBridge event bus
- [ ] Create event consumers

### Phase 3: Migration (2 weeks)
- [ ] Migrate to RDS Aurora
- [ ] Set up read replicas
- [ ] Configure automatic backups
- [ ] Test failover scenarios

### Phase 4: Optimization (1 week)
- [ ] Fine-tune caching strategies
- [ ] Optimize Lambda functions
- [ ] Set up auto-scaling policies
- [ ] Load testing

**Total Time:** 7 weeks  
**Team Size:** 2-3 engineers

---

## Success Metrics

### Performance
- **Latency:** < 100ms (p50), < 500ms (p99)
- **Throughput:** 1000+ requests/second
- **Cache Hit Rate:** > 80%
- **Database Connections:** < 50% of max

### Reliability
- **Uptime:** 99.9% SLA
- **Error Rate:** < 0.1%
- **MTTR:** < 15 minutes
- **Backup Recovery:** < 1 hour

### Scale
- **Concurrent Users:** 10,000+
- **Documents:** 10M+
- **Search Queries:** 100/second
- **PDF Generation:** 1000/hour

---

## Next Steps

1. **Review & Approve** this architecture
2. **Set up AWS account** with proper IAM roles
3. **Start with Phase 1** (CloudFront + S3 + ElastiCache)
4. **Implement incrementally** (don't migrate everything at once)
5. **Monitor costs** closely with AWS Cost Explorer

**Ready to proceed?** Let me know and I can start implementing Phase 1! 🚀
