# el2arb3a-project
# Sverdle — Wordle Clone on AWS ECS Fargate

A production-ready infrastructure-as-code project for deploying Sverdle (a Wordle-inspired word puzzle game) on AWS using Terraform, Docker, ECS Fargate, and GitHub Actions CI/CD.

## 📋 Table of Contents

- [Project Overview](#project-overview)
- [Architecture](#architecture)
- [Prerequisites](#prerequisites)
- [Quick Start](#quick-start)
- [Infrastructure Components](#infrastructure-components)
- [Deployment](#deployment)
- [Accessing the Application](#accessing-the-application)
- [Monitoring](#monitoring)
- [Troubleshooting](#troubleshooting)

## 📦 Project Overview

Sverdle is a daily word puzzle game deployed on a highly available, scalable AWS infrastructure. This project demonstrates DevOps best practices:

- **Infrastructure as Code**: Terraform for VPC, ECS Fargate, Load Balancer, ECR, and RDS
- **Container Orchestration**: AWS ECS Fargate for serverless container management
- **CI/CD Pipeline**: GitHub Actions for automated build, push, and deployment
- **High Availability**: Multi-AZ load balancer, auto-scaling ECS tasks, RDS Multi-AZ
- **Security**: Security groups with least privilege, IAM roles, encrypted data
- **Monitoring**: CloudWatch logs, metrics, and alarms

### Application Features

- Daily word puzzle game (Wordle-inspired)
- Word list validation against database
- User progress tracking
- Statistics and streaks
- Responsive web interface

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Internet (0.0.0.0/0)                      │
└──────────────────────┬──────────────────────────────────────┘
                       │
            ┌──────────▼──────────┐
            │  Application Load   │
            │  Balancer (ALB)     │
            │  Port 80/443        │
            └──────────┬──────────┘
                       │
        ┌──────────────┼──────────────┐
        │              │              │
   ┌────▼────┐   ┌────▼────┐   ┌────▼────┐
   │ ECS Task│   │ ECS Task│   │ ECS Task│
   │ Fargate │   │ Fargate │   │ Fargate │
   │  Pod 1  │   │  Pod 2  │   │  Pod 3  │
   └────┬────┘   └────┬────┘   └────┬────┘
        │              │              │
        └──────────────┼──────────────┘
                       │
        ┌──────────────▼──────────────┐
        │   Amazon RDS MySQL          │
        │   (Multi-AZ enabled)        │
        │   word_list, user_scores    │
        └─────────────────────────────┘
```

### Network Design

- **VPC**: 10.0.0.0/16
  - **Public Subnets**: 10.0.1.0/24, 10.0.3.0/24 (ALB, NAT Gateway)
  - **Private Subnets**: 10.0.2.0/24, 10.0.4.0/24 (ECS tasks, RDS)
  - **NAT Gateway**: Enables outbound internet for private tasks

### Security Layers

| Layer | Component | Rules |
|-------|-----------|-------|
| **ALB** | Security Group | Ingress: 80, 443 from 0.0.0.0/0 |
| **ECS** | Security Group | Ingress: 3000 from ALB SG only |
| **RDS** | Security Group | Ingress: 3306 from ECS SG only |
| **IAM** | ECS Task Role | ECR pull, CloudWatch logs, RDS access |

## 🔧 Prerequisites

### Required Tools

1. **Terraform** >= 1.0
   ```bash
   terraform version
   ```

2. **AWS CLI v2**
   ```bash
   aws --version
   aws configure
   ```

3. **Docker**
   ```bash
   docker --version
   ```

4. **Git**
   ```bash
   git --version
   ```

### AWS Account Requirements

- Active AWS account with sufficient permissions
- ECR repository for Docker images
- RDS MySQL database (or aurora-mysql)
- ECS Fargate capacity
- Application Load Balancer

## 🚀 Quick Start

### 1. Clone the Repository

```bash
git clone https://github.com/your-org/sverdle.git
cd sverdle
```

### 2. Configure AWS Credentials

```bash
aws configure
aws sts get-caller-identity
```

### 3. Initialize Terraform

```bash
cd Terraform
terraform init
terraform validate
```

### 4. Review and Deploy

```bash
terraform plan -out=tfplan
terraform apply tfplan
```

### 5. Capture Outputs

```bash
terraform output
```

This will display the ALB DNS name and other infrastructure details.

## 🏢 Infrastructure Components

### VPC Module (`vpc.tf`)

- Creates VPC with public/private subnets across 2 availability zones
- Internet Gateway for public subnet traffic
- NAT Gateway for private subnet outbound access
- Route tables for routing decisions

### ECS Cluster (`fargate.tf`)

- **ECS Cluster**: "main-cluster" for orchestrating containers
- **Load Balancer**: Application Load Balancer for distributing traffic
- **Target Group**: Routes traffic to ECS tasks on port 3000
- **Auto Scaling**: Scales ECS tasks based on CPU/memory metrics
- **Task Definition**: Specifies Docker image, CPU, memory, environment variables

### ECR Repository (`ecr.tf`)

- **Amazon ECR**: Private Docker registry for Sverdle images
- Image scanning enabled on push
- Lifecycle policy to retain last 10 images
- Automatic cleanup of old versions

### RDS Database (`variables.tf` references)

- **MySQL 8.0** for word lists and user statistics
- **Multi-AZ** for high availability
- **Automated backups** with 7-day retention
- **Private subnet** placement (no public access)

### IAM Roles (`iam.tf`)

- **ECS Task Role**: Permissions for ECR pull, CloudWatch logs, RDS access
- **ECS Task Execution Role**: Permissions for task execution and secrets retrieval
- Least-privilege policy attachments

## 📦 Application Container

### Dockerfile

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 3000
CMD ["npm", "start"]
```

### index.html

Simple web interface for Sverdle game with:
- Daily word puzzle display
- Guess input and validation
- Statistics tracking
- Responsive design

## 🔄 Deployment Pipeline

### GitHub Actions Workflow (`.github/workflows/`)

**Trigger**: Push to main branch

**Pipeline Stages**:

1. **Build**: Lint code, run tests
2. **Build Docker Image**: Create container image
3. **Push to ECR**: Upload image to Amazon ECR
4. **Deploy to ECS**: Update ECS task definition and service
5. **Health Check**: Verify application is responding
6. **Smoke Test**: Confirm game functionality

**Required GitHub Secrets**:
- `AWS_ACCESS_KEY_ID`
- `AWS_SECRET_ACCESS_KEY`
- `AWS_REGION`
- `ECR_REPOSITORY_URL`
- `ECS_CLUSTER_NAME`
- `ECS_SERVICE_NAME`

## 🌐 Accessing the Application

### Get ALB Endpoint

```bash
cd Terraform
aws elbv2 describe-load-balancers \
  --query 'LoadBalancers[0].DNSName' \
  --output text
```

### Access Sverdle

```bash
# Open in browser
https://<ALB-DNS-NAME>

# Or test with curl
curl http://<ALB-DNS-NAME>
```

### Access ECS Tasks

```bash
aws ecs describe-tasks \
  --cluster main-cluster \
  --tasks $(aws ecs list-tasks --cluster main-cluster --query taskArns[0] --output text) \
  --query 'tasks[0].{TaskArn:taskArn,IP:containerInstanceArn}'
```

### View Container Logs

```bash
aws logs tail /ecs/sverdle-task --follow
```

## 📊 Monitoring

### CloudWatch Logs

Application logs are automatically sent to CloudWatch:

```bash
aws logs tail /ecs/sverdle-task --follow
```

Log group name: `/ecs/sverdle-task`

### CloudWatch Metrics

Monitor key metrics:

```bash
aws cloudwatch get-metric-statistics \
  --namespace AWS/ECS \
  --metric-name CPUUtilization \
  --dimensions Name=ServiceName,Value=sverdle-service \
  --start-time 2026-06-01T00:00:00Z \
  --end-time 2026-06-08T00:00:00Z \
  --period 300 \
  --statistics Average
```

### Alarms

Set up CloudWatch alarms for:
- High CPU utilization (> 70%)
- High memory utilization (> 80%)
- ALB target unhealthy (> 0)
- RDS CPU utilization (> 75%)

### Dashboard

Create a CloudWatch dashboard to visualize:
- ECS task count (desired vs. running)
- ALB request count and latency
- ECS CPU and memory utilization
- RDS connections and replication lag

## 🔧 Customization

### Change Container Port

Edit `fargate.tf`:

```hcl
container_port = 3000  # Change to your desired port
```

### Scale ECS Tasks

Edit `fargate.tf`:

```hcl
desired_count   = 2    # Change desired task count
```

Or use auto-scaling:

```bash
aws application-autoscaling register-scalable-target \
  --service-namespace ecs \
  --resource-id service/main-cluster/sverdle-service \
  --scalable-dimension ecs:service:DesiredCount \
  --min-capacity 1 \
  --max-capacity 10
```

### Enable HTTPS

1. Create or import ACM certificate
2. Update ALB listener:

```hcl
listener {
  port            = 443
  protocol        = "HTTPS"
  certificate_arn = "arn:aws:acm:..."
}
```

### Connect to RDS

```bash
# Get RDS endpoint
aws rds describe-db-instances \
  --query 'DBInstances[0].Endpoint.Address' \
  --output text

# Connect via port forwarding through bastion
ssh -L 3306:RDS_ENDPOINT:3306 bastion-host
mysql -h 127.0.0.1 -u admin -p
```

## 🚨 Troubleshooting

### Issue: ECS Tasks Failing to Start

**Symptoms**: Tasks stuck in PROVISIONING or repeatedly restarting

**Diagnosis**:

```bash
aws ecs describe-tasks \
  --cluster main-cluster \
  --tasks $(aws ecs list-tasks --cluster main-cluster --query taskArns --output text) \
  --query 'tasks[*].[lastStatus,stopCode,stoppedReason]'
```

**Solutions**:
- Check CloudWatch logs for container errors
- Verify Docker image is present in ECR
- Confirm IAM task role has required permissions
- Check security group rules allow traffic

### Issue: ALB Targets Unhealthy

**Symptoms**: HTTP 503 Service Unavailable

**Diagnosis**:

```bash
aws elbv2 describe-target-health \
  --target-group-arn $(aws elbv2 describe-target-groups \
    --load-balancer-arn <ALB-ARN> \
    --query 'TargetGroups[0].TargetGroupArn' \
    --output text)
```

**Solutions**:
- Verify health check path is correct: `/`
- Confirm ECS task is listening on correct port: `3000`
- Review ECS task logs for errors
- Check security group ingress rules

### Issue: Database Connection Failures

**Symptoms**: Application cannot connect to RDS

**Diagnosis**:

```bash
aws rds describe-db-instances \
  --query 'DBInstances[0].[DBInstanceStatus,AvailabilityZone]'
```

**Solutions**:
- Verify RDS is in AVAILABLE state
- Check security group allows port 3306 from ECS SG
- Confirm RDS endpoint and credentials in environment variables
- Test connectivity: `mysql -h <RDS-ENDPOINT> -u admin -p`

### Issue: High Latency or Slow Performance

**Symptoms**: Game responses slow, page loads take > 2 seconds

**Diagnosis**:

```bash
aws cloudwatch get-metric-statistics \
  --namespace AWS/ApplicationELB \
  --metric-name TargetResponseTime \
  --dimensions Name=LoadBalancer,Value=<ALB-NAME> \
  --start-time 2026-06-01T00:00:00Z \
  --end-time 2026-06-08T00:00:00Z \
  --period 300 \
  --statistics Average,Maximum
```

**Solutions**:
- Increase ECS task count for load distribution
- Upgrade ECS task CPU/memory allocation
- Enable RDS read replicas for database queries
- Add CloudFront CDN for static assets
- Review application code for N+1 queries

### Issue: Out of Memory (OOMKilled)

**Symptoms**: ECS tasks terminate frequently

**Solutions**:
- Increase ECS task memory allocation in `fargate.tf`
- Add memory limits to Docker containers
- Profile application for memory leaks
- Enable CloudWatch Container Insights

## 📈 Scaling Considerations

### Vertical Scaling (Task Size)

```hcl
cpu    = "512"      # 256, 512, 1024, 2048, 4096
memory = "1024"     # Must match CPU allocation
```

### Horizontal Scaling (Task Count)

```bash
aws ecs update-service \
  --cluster main-cluster \
  --service sverdle-service \
  --desired-count 5
```

### Auto Scaling

Set up target tracking:

```bash
aws application-autoscaling put-scaling-policy \
  --policy-name scale-on-cpu \
  --service-namespace ecs \
  --resource-id service/main-cluster/sverdle-service \
  --scalable-dimension ecs:service:DesiredCount \
  --policy-type TargetTrackingScaling \
  --target-tracking-scaling-policy-configuration TargetValue=70.0,PredefinedMetricSpecification={PredefinedMetricType=ECSServiceAverageCPUUtilization}
```

## 💾 Backup and Recovery

### RDS Automated Backups

Backups are automatically retained for 7 days:

```bash
aws rds describe-db-snapshots \
  --db-instance-identifier sverdle-mysql
```

### Manual Snapshot

```bash
aws rds create-db-snapshot \
  --db-instance-identifier sverdle-mysql \
  --db-snapshot-identifier sverdle-backup-$(date +%s)
```

### Restore from Snapshot

```bash
aws rds restore-db-instance-from-db-snapshot \
  --db-instance-identifier sverdle-mysql-restored \
  --db-snapshot-identifier <SNAPSHOT-ID>
```

## 🔐 Security Best Practices

✅ **Implemented**:
- Private subnets for ECS tasks and RDS
- Security groups with least-privilege rules
- IAM roles for task authentication
- Encrypted RDS storage
- Encrypted ALB to task communication

⚠️ **Recommended Enhancements**:
- Enable WAF on ALB for additional protection
- Implement VPC Flow Logs for network monitoring
- Set up AWS Secrets Manager for sensitive data
- Enable RDS encryption with customer-managed KMS keys
- Implement rate limiting on API endpoints
- Add CORS headers for cross-origin requests
- Use SSL/TLS certificates for HTTPS

## 🛠️ Maintenance

### Update Application Code

```bash
# Update application
git add .
git commit -m "Update game logic"
git push origin main

# GitHub Actions will automatically:
# 1. Build new Docker image
# 2. Push to ECR
# 3. Deploy to ECS
```

### Update Infrastructure

```bash
cd Terraform
terraform plan -out=tfplan
terraform apply tfplan
```

### Monitor Deployments

```bash
aws ecs describe-services \
  --cluster main-cluster \
  --services sverdle-service \
  --query 'services[0].[status,runningCount,desiredCount]'
```

## 📞 Support

For issues or questions:

1. Check CloudWatch logs: `aws logs tail /ecs/sverdle-task --follow`
2. Review ECS task details: `aws ecs describe-tasks --cluster main-cluster`
3. Check ALB target health: `aws elbv2 describe-target-health`
4. Review Terraform state: `terraform show`

## 📄 License

This project is provided as-is for educational and deployment purposes.

---

**Deployment Time**: ~15-20 minutes
**Estimated AWS Costs**: $50-100/month (dev), $200-400/month (production)
**Maintenance Effort**: ~1 hour/week for monitoring and updates
