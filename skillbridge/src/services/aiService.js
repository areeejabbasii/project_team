// AI Service with conversation memory and real API integration
class AIService {
  constructor() {
    this.conversations = new Map(); // Store conversation history by session ID
    this.apiKey = process.env.REACT_APP_MUSE_API_KEY;
    this.apiUrl = process.env.REACT_APP_MUSE_API_URL || 'https://openrouter.ai/api/v1/chat/completions';
    
    // Free models available on OpenRouter (as of 2024)
    this.availableModels = {
      'llama-3.1-8b': {
        id: 'meta-llama/llama-3.1-8b-instruct:free',
        name: 'Llama 3.1 8B',
        description: 'Fast and capable, good for general conversations',
        maxTokens: 2000,
        free: true
      },
      'llama-3.2-3b': {
        id: 'meta-llama/llama-3.2-3b-instruct:free',
        name: 'Llama 3.2 3B',
        description: 'Smaller but efficient, good for quick responses',
        maxTokens: 1500,
        free: true
      },
      'qwen-2.5-7b': {
        id: 'qwen/qwen-2.5-7b-instruct:free',
        name: 'Qwen 2.5 7B',
        description: 'Excellent for coding and technical discussions',
        maxTokens: 2000,
        free: true
      },
      'mistral-7b': {
        id: 'mistralai/mistral-7b-instruct:free',
        name: 'Mistral 7B',
        description: 'Great balance of performance and speed',
        maxTokens: 1800,
        free: true
      }
    };
    
    // Default model - Qwen is excellent for technical content
    this.currentModel = this.availableModels['qwen-2.5-7b'];
    
    this.assistantProfiles = {
      'learning-assistant': {
        name: 'AWS Learning Assistant',
        personality: 'helpful and encouraging',
        expertise: ['aws-services', 'cloud-architecture', 'certification-prep', 'best-practices'],
        systemPrompt: `You are a friendly and knowledgeable AWS learning assistant. You help users learn AWS services, prepare for certifications, and understand cloud architecture concepts.
        
        Your approach:
        - Be encouraging and supportive in your responses
        - Break down complex concepts into digestible parts
        - Provide practical examples and use cases
        - Suggest next steps for learning progression
        - Ask clarifying questions to better understand their needs
        - Use emojis and formatting to make learning engaging
        
        Focus areas:
        - AWS service explanations and comparisons
        - Architecture best practices and patterns
        - Certification study guidance
        - Hands-on project suggestions
        - Troubleshooting common issues
        - Career advice for cloud professionals
        
        Always be patient, clear, and focused on helping them succeed in their AWS learning journey.`
      },
      'scenario-master': {
        name: 'Scenario Master',
        personality: 'challenging and direct',
        expertise: ['debugging', 'system-design', 'problem-solving'],
        systemPrompt: `You are a challenging technical mentor who throws users into real-world scenarios. 
        You don't give easy answers - you create crisis situations that test problem-solving skills.
        Always respond with specific, realistic scenarios that require critical thinking.
        Be direct, sometimes brutally honest, but always constructive.
        Create escalating scenarios based on user responses.
        Use emojis and formatting to make scenarios engaging.`
      },
      'comeback-coach': {
        name: 'Comeback Coach',
        personality: 'empathetic but brutally honest',
        expertise: ['career-strategy', 'networking', 'interview-prep'],
        systemPrompt: `You are a career coach who specializes in helping people recover from job rejections.
        You're empathetic but don't sugarcoat reality. You provide specific, actionable strategies.
        Always ask for details about their situation to give personalized advice.
        Focus on turning setbacks into comebacks with concrete plans.
        Be supportive but direct about what needs to change.`
      },
      'chaos-engineer': {
        name: 'Chaos Engineer',
        personality: 'intense and motivational',
        expertise: ['project-design', 'skill-development', 'leadership'],
        systemPrompt: `You are a growth mentor who believes in learning through controlled failure.
        You design challenging projects that push people beyond their comfort zone.
        You're intense and motivational, always pushing for the next level.
        Create specific project ideas that force rapid skill development.
        Challenge users to embrace difficulty and grow through struggle.`
      },
      'mind-reader': {
        name: 'Mind Reader',
        personality: 'analytical and probing',
        expertise: ['aptitude-testing', 'skill-assessment', 'career-guidance'],
        systemPrompt: `You are an analytical coach who discovers hidden aptitudes through conversation.
        You ask probing questions and analyze thinking patterns rather than testing memorized knowledge.
        You're like a detective uncovering someone's natural strengths and ideal career path.
        Always dig deeper into their reasoning process.
        Provide insights about their cognitive patterns and natural abilities.`
      }
    };
  }

  // Get or create conversation session
  getConversation(sessionId) {
    if (!this.conversations.has(sessionId)) {
      this.conversations.set(sessionId, {
        messages: [],
        context: {},
        startTime: new Date()
      });
    }
    return this.conversations.get(sessionId);
  }

  // Add message to conversation history
  addMessage(sessionId, role, content, assistantId = null) {
    const conversation = this.getConversation(sessionId);
    conversation.messages.push({
      role,
      content,
      assistantId,
      timestamp: new Date()
    });
  }

  // Generate AI response with real API call
  async generateResponse(sessionId, userMessage, assistantId) {
    console.log('AIService.generateResponse called with:', { sessionId, userMessage, assistantId });
    
    const conversation = this.getConversation(sessionId);
    const assistant = this.assistantProfiles[assistantId];
    
    console.log('Assistant profile found:', assistant ? assistant.name : 'NOT FOUND');
    
    if (!assistant) {
      console.error('Assistant not found for ID:', assistantId);
      return "I'm not sure how to help with that.";
    }

    // Add user message to history
    this.addMessage(sessionId, 'user', userMessage);

    console.log('Generating response for assistant:', assistantId);
    console.log('User message:', userMessage);

    try {
      // Try API call first if configured
      if (this.isApiConfigured()) {
        console.log('Attempting API call...');
        const messages = this.buildApiMessages(conversation, assistant, userMessage);
        const response = await this.callMuseAPI(messages);
        
        // Add AI response to history
        this.addMessage(sessionId, 'assistant', response, assistantId);
        return response;
      } else {
        console.log('API not configured, using fallback...');
      }
    } catch (error) {
      console.error('API call failed, using fallback:', error);
    }

    // Fallback to contextual response
    console.log('Using fallback response generation...');
    const fallbackResponse = await this.generateContextualResponse(
      assistant,
      userMessage,
      this.getConversationContext(conversation),
      conversation.context
    );
    
    this.addMessage(sessionId, 'assistant', fallbackResponse, assistantId);
    console.log('Fallback response generated:', fallbackResponse);
    return fallbackResponse;
  }

  // Generate streaming response with callback for real-time updates
  async generateStreamingResponse(sessionId, userMessage, assistantId, onChunk) {
    console.log('AIService.generateStreamingResponse called with:', { sessionId, userMessage, assistantId });
    
    const conversation = this.getConversation(sessionId);
    const assistant = this.assistantProfiles[assistantId];
    
    if (!assistant) {
      console.error('Assistant not found for ID:', assistantId);
      onChunk("I'm not sure how to help with that.");
      return "I'm not sure how to help with that.";
    }

    // Add user message to history
    this.addMessage(sessionId, 'user', userMessage);

    try {
      // Try API call first if configured
      if (this.isApiConfigured()) {
        console.log('Attempting streaming API call...');
        const messages = this.buildApiMessages(conversation, assistant, userMessage);
        const response = await this.callStreamingMuseAPI(messages, onChunk);
        
        // Add AI response to history
        this.addMessage(sessionId, 'assistant', response, assistantId);
        return response;
      } else {
        console.log('API not configured, using streaming fallback...');
      }
    } catch (error) {
      console.error('API call failed, using streaming fallback:', error);
    }

    // Fallback to contextual response with streaming
    console.log('Using streaming fallback response generation...');
    const fallbackResponse = await this.generateStreamingContextualResponse(
      assistant,
      userMessage,
      this.getConversationContext(conversation),
      conversation.context,
      onChunk
    );
    
    this.addMessage(sessionId, 'assistant', fallbackResponse, assistantId);
    console.log('Streaming fallback response generated:', fallbackResponse);
    return fallbackResponse;
  }

  // Build messages array for API call
  buildApiMessages(conversation, assistant, userMessage) {
    const messages = [
      {
        role: 'system',
        content: assistant.systemPrompt
      }
    ];

    // Add recent conversation history (last 10 messages for context)
    const recentMessages = conversation.messages.slice(-10);
    
    recentMessages.forEach(msg => {
      if (msg.role === 'user' || msg.role === 'assistant') {
        messages.push({
          role: msg.role,
          content: msg.content
        });
      }
    });

    return messages;
  }

  // Call Muse API
  async callMuseAPI(messages) {
    if (!this.apiKey) {
      throw new Error('API key not configured');
    }

    console.log('Making API call to:', this.apiUrl);
    console.log('Messages:', messages);

    try {
      const response = await fetch(this.apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
          'HTTP-Referer': window.location.origin,
          'X-Title': 'SkillBridge AI Assistant',
          // OpenRouter specific headers
          'Or-App-Name': 'SkillBridge',
          'Or-Site-Url': window.location.origin
        },
        body: JSON.stringify({
          model: this.currentModel.id,
          messages: messages,
          max_tokens: this.currentModel.maxTokens,
          temperature: 0.8,
          top_p: 0.9,
          frequency_penalty: 0.1,
          presence_penalty: 0.1,
          // OpenRouter specific headers
          stream: false
        })
      });

      console.log('API Response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('API Error Response:', errorText);
        throw new Error(`API Error: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      console.log('API Response data:', data);
      
      const content = data.choices?.[0]?.message?.content;
      if (!content) {
        console.error('No content in API response:', data);
        throw new Error('No content received from API');
      }

      return content;
    } catch (error) {
      console.error('API Call Error:', error);
      throw error;
    }
  }

  // Get conversation context as string
  getConversationContext(conversation) {
    const recentMessages = conversation.messages.slice(-6);
    return recentMessages
      .map(msg => `${msg.role}: ${msg.content}`)
      .join('\n');
  }

  // Generate contextual response based on assistant type (fallback when API fails)
  async generateContextualResponse(assistant, userMessage, conversationContext, sessionContext) {
    const lowerMessage = userMessage.toLowerCase();
    
    // Add a small delay to simulate processing
    await new Promise(resolve => setTimeout(resolve, 500 + Math.random() * 1000));
    
    // Simulate different response patterns based on assistant personality
    switch (assistant.name) {
      case 'AWS Learning Assistant':
        return this.generateLearningResponse(userMessage, conversationContext, sessionContext);
        
      case 'Scenario Master':
        return this.generateScenarioResponse(userMessage, conversationContext, sessionContext);
      
      case 'Comeback Coach':
        return this.generateCareerResponse(userMessage, conversationContext, sessionContext);
      
      case 'Chaos Engineer':
        return this.generateChaosResponse(userMessage, conversationContext, sessionContext);
      
      case 'Mind Reader':
        return this.generateAnalyticalResponse(userMessage, conversationContext, sessionContext);
      
      default:
        return "I'm here to help! What would you like to work on?";
    }
  }

  generateLearningResponse(message, context, sessionContext) {
    const lowerMessage = message.toLowerCase();
    
    // AWS service specific responses - more comprehensive coverage
    if (lowerMessage.includes('ec2')) {
      return `**Amazon EC2 (Elastic Compute Cloud)** 🖥️

EC2 provides resizable virtual servers in the AWS cloud. You rent computing capacity instead of buying physical hardware.

**Instance Types by Use Case:**
• **t3.micro** - Free tier, 1 vCPU, 1GB RAM - Perfect for learning, small websites
• **m5.large** - 2 vCPUs, 8GB RAM - Balanced for web applications, small databases
• **c5.xlarge** - 4 vCPUs, 8GB RAM - CPU-intensive tasks, high-performance web servers
• **r5.large** - 2 vCPUs, 16GB RAM - Memory-intensive applications, in-memory databases

**Real Implementation Example:**
\`\`\`bash
# Launch an EC2 instance
aws ec2 run-instances --image-id ami-0abcdef1234567890 --count 1 --instance-type t3.micro --key-name MyKeyPair --security-groups MySecurityGroup
\`\`\`

**Cost Optimization:**
• Use Reserved Instances for 1-3 year commitments (up to 72% savings)
• Spot Instances for fault-tolerant workloads (up to 90% savings)
• Auto Scaling to match capacity with demand

**Next Steps:** Want to learn about specific instance types, Auto Scaling, or Load Balancers?`;
    }

    if (lowerMessage.includes('s3')) {
      return `**Amazon S3 (Simple Storage Service)** 🗄️

S3 stores objects (files) in buckets with 99.999999999% (11 9's) durability and virtually unlimited capacity.

**Storage Classes & Pricing:**
• **Standard** - $0.023/GB/month - Frequent access, millisecond retrieval
• **Standard-IA** - $0.0125/GB/month - Infrequent access, 30-day minimum
• **Glacier Instant** - $0.004/GB/month - Archive with instant retrieval
• **Glacier Deep Archive** - $0.00099/GB/month - Long-term archive, 12-hour retrieval

**Practical Examples:**
\`\`\`bash
# Create bucket and upload file
aws s3 mb s3://my-unique-bucket-name-12345
aws s3 cp myfile.jpg s3://my-unique-bucket-name-12345/
\`\`\`

**Advanced Features:**
• **Versioning** - Keep multiple versions of objects
• **Lifecycle Policies** - Automatically move data to cheaper storage
• **Cross-Region Replication** - Disaster recovery and compliance
• **Static Website Hosting** - Host React/Angular apps directly

**Security Best Practices:**
• Use bucket policies and IAM roles (never make buckets public unless needed)
• Enable server-side encryption (SSE-S3 or SSE-KMS)
• Use pre-signed URLs for temporary access

What specific S3 feature do you want to implement?`;
    }

    if (lowerMessage.includes('lambda')) {
      return `**AWS Lambda - Serverless Computing** ⚡

Lambda runs your code without provisioning servers. You pay only for compute time consumed (billed in 1ms increments).

**Supported Languages & Runtimes:**
• **Python 3.9/3.10** - Most popular for data processing, APIs
• **Node.js 18.x** - Great for web APIs, real-time applications
• **Java 11/17** - Enterprise applications, Spring Boot
• **Go 1.x** - High performance, low memory usage
• **C# .NET 6** - Windows ecosystem integration

**Real-World Implementation:**
\`\`\`python
import json
import boto3

def lambda_handler(event, context):
    # Process S3 event
    bucket = event['Records'][0]['s3']['bucket']['name']
    key = event['Records'][0]['s3']['object']['key']
    
    # Your business logic here
    print(f"Processing file {key} from bucket {bucket}")
    
    return {
        'statusCode': 200,
        'body': json.dumps('File processed successfully')
    }
\`\`\`

**Common Triggers:**
• **API Gateway** - HTTP requests → Lambda (REST APIs)
• **S3 Events** - File upload → Lambda (image processing)
• **CloudWatch Events** - Schedule → Lambda (cron jobs)
• **DynamoDB Streams** - Data changes → Lambda (real-time processing)

**Performance Optimization:**
• Keep functions warm with provisioned concurrency
• Optimize memory allocation (128MB to 10GB)
• Use connection pooling for databases
• Minimize cold start time with smaller deployment packages

**Pricing Example:**
1M requests + 1GB memory + 1 second execution = ~$18.34/month

Ready to build a specific Lambda function? What's your use case?`;
    }

    if (lowerMessage.includes('rds') || lowerMessage.includes('database')) {
      return `**Amazon RDS (Relational Database Service)** �️

RDS manages database infrastructure so you focus on your application. Automated backups, patching, and scaling included.

**Engine Comparison:**
• **MySQL 8.0** - Most popular, great for web apps, WordPress, e-commerce
• **PostgreSQL 14** - Advanced features, JSON support, complex queries, analytics
• **Amazon Aurora** - MySQL/PostgreSQL compatible, 5x faster, auto-scaling storage
• **SQL Server** - Microsoft ecosystem, .NET applications, enterprise features
• **Oracle** - Enterprise applications, complex transactions, legacy systems

**Instance Classes:**
• **db.t3.micro** - Free tier, 1 vCPU, 1GB RAM - Development/testing
• **db.t3.small** - 2 vCPUs, 2GB RAM - Small production workloads
• **db.m5.large** - 2 vCPUs, 8GB RAM - Medium production workloads
• **db.r5.xlarge** - 4 vCPUs, 32GB RAM - Memory-intensive applications

**High Availability Setup:**
\`\`\`
Primary DB (us-east-1a) ←→ Standby DB (us-east-1b)
        ↓
Read Replica (us-east-1c) - Read traffic
Read Replica (us-west-2a) - Cross-region
\`\`\`

**Backup & Recovery:**
• Automated backups (1-35 days retention)
• Point-in-time recovery to any second
• Manual snapshots for major changes
• Cross-region snapshot copying

**Performance Tuning:**
• Use Read Replicas for read-heavy workloads
• Enable Performance Insights for query analysis
• Configure appropriate instance class for your workload
• Use connection pooling (RDS Proxy)

**Cost Optimization:**
• Reserved Instances (up to 69% savings)
• Aurora Serverless for variable workloads
• Right-size instances based on CloudWatch metrics

Which database engine fits your application requirements?`;
    }

    if (lowerMessage.includes('vpc') || lowerMessage.includes('network')) {
      return `**Amazon VPC (Virtual Private Cloud)** 🌐

VPC creates an isolated network environment in AWS where you have complete control over IP addressing, routing, and security.

**Core Architecture:**
\`\`\`
Internet Gateway (0.0.0.0/0)
       ↓
Public Subnet (10.0.1.0/24)
   - NAT Gateway
   - Load Balancers
   - Bastion Hosts
       ↓
Private Subnet (10.0.2.0/24)
   - Application Servers
   - Auto Scaling Groups
       ↓
Private Subnet (10.0.3.0/24)
   - RDS Databases
   - ElastiCache
\`\`\`

**CIDR Block Planning:**
• **10.0.0.0/16** - Gives you 65,536 IP addresses
• **Public Subnet: 10.0.1.0/24** - 256 IPs for internet-facing resources
• **Private Subnet: 10.0.2.0/24** - 256 IPs for application tier
• **Database Subnet: 10.0.3.0/24** - 256 IPs for data tier

**Security Layers:**
1. **Network ACLs** (Subnet level) - Stateless, allow/deny rules
2. **Security Groups** (Instance level) - Stateful, allow rules only
3. **Route Tables** - Control traffic between subnets
4. **VPC Flow Logs** - Monitor all network traffic

**Real Implementation:**
\`\`\`bash
# Create VPC
aws ec2 create-vpc --cidr-block 10.0.0.0/16

# Create public subnet
aws ec2 create-subnet --vpc-id vpc-12345678 --cidr-block 10.0.1.0/24 --availability-zone us-east-1a

# Create private subnet
aws ec2 create-subnet --vpc-id vpc-12345678 --cidr-block 10.0.2.0/24 --availability-zone us-east-1b
\`\`\`

**Best Practices:**
• Use multiple Availability Zones for high availability
• Keep databases in private subnets (no direct internet access)
• Use NAT Gateway for outbound internet from private subnets
• Implement least privilege with security groups
• Enable VPC Flow Logs for security monitoring

**Common Patterns:**
• **3-Tier Architecture** - Web, App, Database layers
• **Microservices** - Each service in separate subnets
• **Hybrid Cloud** - VPN/Direct Connect to on-premises

Need help designing a specific network architecture for your application?`;
    }

    if (lowerMessage.includes('certification') || lowerMessage.includes('exam') || lowerMessage.includes('study')) {
      return `**AWS Certification Strategy** 🎯

**Certification Paths by Experience:**

**🌟 Foundational (0-6 months AWS experience):**
**AWS Cloud Practitioner (CLF-C02)**
• **Focus:** Cloud concepts, AWS services overview, billing, support
• **Study Time:** 4-6 weeks (1-2 hours daily)
• **Cost:** $100 | **Validity:** 3 years
• **Best For:** Business roles, sales, project managers, AWS newcomers

**🏗️ Associate Level (6+ months experience):**

**Solutions Architect Associate (SAA-C03)** - Most Popular
• **Focus:** Design resilient, scalable, cost-effective architectures
• **Key Services:** EC2, S3, VPC, RDS, Lambda, CloudFormation, IAM
• **Study Time:** 8-12 weeks with hands-on practice
• **Salary Impact:** $10,000-$20,000 increase

**Developer Associate (DVA-C02)**
• **Focus:** Application development, deployment, debugging
• **Key Services:** Lambda, API Gateway, DynamoDB, CodeCommit, CodeBuild, CodeDeploy
• **Best For:** Software developers, DevOps engineers

**SysOps Administrator Associate (SOA-C02)**
• **Focus:** Operations, monitoring, troubleshooting, automation
• **Key Services:** CloudWatch, Systems Manager, Auto Scaling, CloudFormation
• **Best For:** System administrators, operations teams

**📚 Proven Study Strategy (12-Week Plan):**

**Weeks 1-2: Foundation**
• AWS Cloud Practitioner Essentials (free)
• Create AWS account, explore free tier
• Hands-on: Launch EC2, create S3 bucket, set up VPC

**Weeks 3-4: Compute & Storage**
• EC2 instance types, Auto Scaling, Load Balancers
• S3 storage classes, lifecycle policies, CloudFront
• Hands-on: Build 3-tier web application

**Weeks 5-6: Databases & Networking**
• RDS Multi-AZ, Read Replicas, Aurora
• VPC design, subnets, security groups, NACLs
• Hands-on: Deploy database with high availability

**Weeks 7-8: Security & Identity**
• IAM users, roles, policies, MFA
• KMS encryption, CloudTrail, Config
• Hands-on: Implement least privilege access

**Weeks 9-10: Monitoring & Automation**
• CloudWatch metrics, alarms, logs
• CloudFormation templates, Systems Manager
• Hands-on: Automate infrastructure deployment

**Weeks 11-12: Practice & Review**
• Take 5+ practice exams (aim for 80%+ consistently)
• Review AWS Well-Architected Framework
• Focus on weak areas identified in practice tests

**📖 Recommended Resources:**
• **Official:** AWS Skill Builder (free courses)
• **Books:** AWS Certified Solutions Architect Study Guide
• **Video:** Stephane Maarek or Adrian Cantrill courses
• **Practice:** Tutorials Dojo or Whizlabs practice exams
• **Hands-on:** AWS Free Tier + personal projects

**💡 Exam Tips:**
• Focus on understanding WHY, not just WHAT
• Practice with AWS CLI and CloudFormation
• Join AWS certification study groups
• Schedule exam 2 weeks in advance for motivation

Which certification aligns with your career goals? I can create a detailed study schedule!`;
    }

    if (lowerMessage.includes('architecture') || lowerMessage.includes('design') || lowerMessage.includes('pattern')) {
      return `**AWS Architecture Design Patterns** 🏗️

**Well-Architected Framework - 6 Pillars:**

**🔒 Security Pillar**
• **Identity:** IAM roles with least privilege, MFA enabled
• **Data Protection:** Encryption at rest (KMS) and in transit (TLS)
• **Infrastructure:** VPC with private subnets, security groups, NACLs
• **Detective Controls:** CloudTrail, GuardDuty, Config, VPC Flow Logs

**⚡ Performance Efficiency**
• **Compute:** Right-size EC2 instances, use Auto Scaling
• **Storage:** Choose appropriate storage type (EBS gp3, S3 storage classes)
• **Database:** Use Read Replicas, connection pooling, caching
• **Network:** CloudFront CDN, Route 53 latency-based routing

**🛡️ Reliability**
• **Multi-AZ:** Deploy across multiple Availability Zones
• **Auto Recovery:** Auto Scaling Groups with health checks
• **Load Distribution:** Application Load Balancer, Network Load Balancer
• **Backup:** Automated backups, cross-region replication

**💰 Cost Optimization**
• **Right Sizing:** Use CloudWatch metrics to optimize instance sizes
• **Purchasing Options:** Reserved Instances (1-3 years), Spot Instances
• **Storage:** S3 lifecycle policies, EBS snapshot lifecycle
• **Monitoring:** Cost Explorer, Budgets, Trusted Advisor

**🔧 Operational Excellence**
• **IaC:** CloudFormation or CDK for infrastructure
• **CI/CD:** CodePipeline, CodeBuild, CodeDeploy
• **Monitoring:** CloudWatch dashboards, X-Ray tracing
• **Automation:** Systems Manager, Lambda for operational tasks

**♻️ Sustainability**
• **Efficiency:** Use managed services, serverless architectures
• **Optimization:** Auto Scaling, spot instances, efficient instance types
• **Monitoring:** Track and optimize resource utilization

**🏗️ Common Architecture Patterns:**

**1. Three-Tier Web Application**
\`\`\`
Internet → CloudFront → ALB → EC2 (Auto Scaling) → RDS (Multi-AZ)
                              ↓
                         ElastiCache (Redis)
\`\`\`

**2. Serverless Microservices**
\`\`\`
API Gateway → Lambda → DynamoDB
     ↓
CloudWatch Logs & X-Ray
\`\`\`

**3. Event-Driven Architecture**
\`\`\`
S3 Upload → Lambda → SQS → Lambda → Database
              ↓
         SNS → Email/SMS
\`\`\`

**4. Data Analytics Pipeline**
\`\`\`
Kinesis Data Streams → Kinesis Analytics → S3 → Athena → QuickSight
\`\`\`

**5. Hybrid Cloud Architecture**
\`\`\`
On-Premises ←→ Direct Connect/VPN ←→ AWS VPC
                                        ↓
                                   Workloads in AWS
\`\`\`

**🎯 Architecture Decision Framework:**
1. **Requirements Analysis:** Performance, availability, compliance needs
2. **Service Selection:** Managed vs. self-managed trade-offs
3. **Failure Planning:** What happens when components fail?
4. **Scaling Strategy:** How will this grow over time?
5. **Cost Modeling:** TCO analysis and optimization opportunities

What type of application architecture are you designing? I can provide specific service recommendations and detailed diagrams!`;
    }

    // More specific AWS services
    if (lowerMessage.includes('cloudformation') || lowerMessage.includes('iac')) {
      return `**AWS CloudFormation - Infrastructure as Code** 📋

CloudFormation lets you define AWS infrastructure using JSON or YAML templates. Version control your infrastructure like code.

**Template Structure:**
\`\`\`yaml
AWSTemplateFormatVersion: '2010-09-09'
Description: 'Web application infrastructure'

Parameters:
  InstanceType:
    Type: String
    Default: t3.micro
    AllowedValues: [t3.micro, t3.small, t3.medium]

Resources:
  WebServerInstance:
    Type: AWS::EC2::Instance
    Properties:
      ImageId: ami-0abcdef1234567890
      InstanceType: !Ref InstanceType
      SecurityGroupIds:
        - !Ref WebServerSecurityGroup
      
  WebServerSecurityGroup:
    Type: AWS::EC2::SecurityGroup
    Properties:
      GroupDescription: Security group for web server
      SecurityGroupIngress:
        - IpProtocol: tcp
          FromPort: 80
          ToPort: 80
          CidrIp: 0.0.0.0/0

Outputs:
  InstanceId:
    Description: Instance ID of the web server
    Value: !Ref WebServerInstance
\`\`\`

**Key Benefits:**
• **Consistency:** Same infrastructure every time
• **Version Control:** Track changes with Git
• **Rollback:** Easy rollback to previous versions
• **Cross-Region:** Deploy same stack in multiple regions

**Best Practices:**
• Use nested stacks for complex architectures
• Implement proper IAM roles for CloudFormation
• Use stack policies to prevent accidental deletions
• Validate templates before deployment

Want to see a specific CloudFormation template for your use case?`;
    }

    if (lowerMessage.includes('iam') || lowerMessage.includes('security') || lowerMessage.includes('permissions')) {
      return `**AWS IAM (Identity and Access Management)** 🔐

IAM controls who can access what in your AWS account. Follow the principle of least privilege.

**Core Components:**
• **Users:** Individual people or applications
• **Groups:** Collections of users with similar permissions
• **Roles:** Temporary credentials for AWS services or external users
• **Policies:** JSON documents defining permissions

**Policy Example:**
\`\`\`json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "s3:GetObject",
        "s3:PutObject"
      ],
      "Resource": "arn:aws:s3:::my-bucket/*"
    }
  ]
}
\`\`\`

**Security Best Practices:**
• Enable MFA for all users
• Use roles instead of users for applications
• Regularly rotate access keys
• Use AWS Organizations for multi-account management
• Enable CloudTrail for audit logging

**Common IAM Patterns:**
• **Cross-account access:** Roles for accessing resources in other accounts
• **Service roles:** EC2 instances accessing S3 without hardcoded keys
• **Federated access:** SAML/OIDC integration with corporate identity providers

Need help designing IAM policies for your specific use case?`;
    }

    // Handle questions about getting started or learning paths
    if (lowerMessage.includes('start') || lowerMessage.includes('begin') || lowerMessage.includes('learn') || lowerMessage.includes('new')) {
      return `**AWS Learning Path - From Zero to Cloud Professional** 🚀

**Phase 1: Cloud Fundamentals (Weeks 1-2)**
• Understand cloud computing concepts (IaaS, PaaS, SaaS)
• Learn AWS global infrastructure (Regions, AZs, Edge Locations)
• Create AWS account and explore the console
• **Hands-on:** Launch first EC2 instance, create S3 bucket

**Phase 2: Core Services (Weeks 3-6)**
• **Compute:** EC2, Lambda, Auto Scaling, Load Balancers
• **Storage:** S3, EBS, EFS storage options
• **Database:** RDS, DynamoDB basics
• **Networking:** VPC, subnets, security groups
• **Hands-on:** Build a 3-tier web application

**Phase 3: Advanced Services (Weeks 7-10)**
• **Security:** IAM, KMS, CloudTrail, GuardDuty
• **Monitoring:** CloudWatch, X-Ray, Systems Manager
• **DevOps:** CodeCommit, CodeBuild, CodeDeploy, CodePipeline
• **Hands-on:** Implement CI/CD pipeline with monitoring

**Phase 4: Specialization (Weeks 11-12)**
Choose your focus area:
• **Solutions Architecture:** Design scalable, resilient systems
• **Development:** Serverless applications, APIs, microservices
• **Operations:** Automation, monitoring, troubleshooting
• **Security:** Compliance, encryption, access management

**Free Learning Resources:**
• **AWS Skill Builder:** Free digital courses
• **AWS Well-Architected Labs:** Hands-on exercises
• **AWS Architecture Center:** Reference architectures
• **AWS Free Tier:** 12 months of free services

**Recommended Learning Projects:**
1. **Static Website:** S3 + CloudFront + Route 53
2. **Serverless API:** API Gateway + Lambda + DynamoDB
3. **Container Application:** ECS + ALB + RDS
4. **Data Pipeline:** S3 + Lambda + Athena + QuickSight

What's your current experience level? I can customize this learning path for you!`;
    }

    // Handle cost and pricing questions
    if (lowerMessage.includes('cost') || lowerMessage.includes('price') || lowerMessage.includes('billing')) {
      return `**AWS Pricing and Cost Optimization** 💰

**AWS Pricing Models:**

**1. Pay-as-you-go**
• No upfront costs or long-term commitments
• Pay only for what you use
• Scale up or down based on demand

**2. Reserved Instances (1-3 years)**
• Up to 72% savings compared to On-Demand
• **Standard RI:** Highest discount, less flexibility
• **Convertible RI:** Change instance family, lower discount

**3. Spot Instances**
• Up to 90% savings for fault-tolerant workloads
• AWS can terminate with 2-minute notice
• Perfect for batch processing, CI/CD, testing

**Cost Optimization Strategies:**

**Right-Sizing:**
\`\`\`bash
# Use AWS CLI to analyze instance utilization
aws cloudwatch get-metric-statistics --namespace AWS/EC2 --metric-name CPUUtilization --dimensions Name=InstanceId,Value=i-1234567890abcdef0 --start-time 2023-01-01T00:00:00Z --end-time 2023-01-31T23:59:59Z --period 3600 --statistics Average
\`\`\`

**Storage Optimization:**
• Use S3 Intelligent-Tiering for automatic cost optimization
• Implement lifecycle policies to move data to cheaper storage
• Delete unused EBS snapshots and volumes

**Monitoring Tools:**
• **Cost Explorer:** Analyze spending patterns
• **AWS Budgets:** Set spending alerts
• **Trusted Advisor:** Cost optimization recommendations
• **Cost and Usage Reports:** Detailed billing analysis

**Example Monthly Costs (us-east-1):**
• **t3.micro EC2:** $8.50/month (24/7)
• **S3 Standard:** $0.023/GB/month
• **RDS db.t3.micro:** $12.41/month (24/7)
• **Lambda:** First 1M requests free, then $0.20/1M requests

**Cost Optimization Checklist:**
✅ Use Reserved Instances for predictable workloads
✅ Implement Auto Scaling to match demand
✅ Use S3 lifecycle policies
✅ Delete unused resources (EBS volumes, snapshots)
✅ Use CloudWatch to monitor and optimize
✅ Consider Spot Instances for non-critical workloads

Need help calculating costs for your specific architecture?`;
    }

    // Direct, specific responses for common questions
    if (lowerMessage.includes('difference') || lowerMessage.includes('vs') || lowerMessage.includes('compare')) {
      if (lowerMessage.includes('ec2') && lowerMessage.includes('lambda')) {
        return `**EC2 vs Lambda - When to Use Each** ⚖️

**Amazon EC2:**
• **Best For:** Long-running applications, custom environments, full OS control
• **Pricing:** Pay for instance time (even when idle)
• **Scaling:** Manual or Auto Scaling Groups
• **Runtime:** No time limits
• **Use Cases:** Web servers, databases, legacy applications, Windows apps

**AWS Lambda:**
• **Best For:** Event-driven, short-running functions, serverless architectures
• **Pricing:** Pay only for execution time (billed per 100ms)
• **Scaling:** Automatic, up to 1000 concurrent executions
• **Runtime:** 15-minute maximum execution time
• **Use Cases:** API backends, file processing, scheduled tasks, real-time data processing

**Decision Framework:**
Choose **EC2** when you need:
- Long-running processes (>15 minutes)
- Custom operating system or runtime
- Persistent local storage
- Full control over the environment

Choose **Lambda** when you have:
- Event-driven workloads
- Unpredictable or sporadic traffic
- Short-running tasks (<15 minutes)
- Want zero server management

**Cost Comparison Example:**
- **EC2 t3.micro:** $8.50/month (always running)
- **Lambda:** $0.20 per 1M requests + compute time
- **Break-even:** ~42,500 requests/month (1-second execution)`;
      }
      
      if (lowerMessage.includes('s3') && (lowerMessage.includes('ebs') || lowerMessage.includes('efs'))) {
        return `**AWS Storage Comparison: S3 vs EBS vs EFS** 💾

**Amazon S3 (Object Storage):**
• **Use Case:** Static websites, backups, data archiving, content distribution
• **Access:** REST API, web interface, unlimited from anywhere
• **Durability:** 99.999999999% (11 9's)
• **Pricing:** $0.023/GB/month (Standard)

**Amazon EBS (Block Storage):**
• **Use Case:** Database storage, file systems, boot volumes
• **Access:** Attached to single EC2 instance at a time
• **Performance:** High IOPS, low latency
• **Pricing:** $0.10/GB/month (gp3)

**Amazon EFS (File Storage):**
• **Use Case:** Shared file storage across multiple EC2 instances
• **Access:** NFS protocol, concurrent access from multiple instances
• **Scaling:** Automatically scales to petabytes
• **Pricing:** $0.30/GB/month (Standard)

**When to Use Each:**
- **S3:** Static assets, backups, data lakes, websites
- **EBS:** Database storage, application data, OS boot volumes
- **EFS:** Shared application data, content repositories, web serving`;
      }
    }

    // If the message contains specific AWS service names not covered above
    const awsServices = ['cloudfront', 'route53', 'dynamodb', 'sqs', 'sns', 'kinesis', 'redshift', 'elasticache', 'api gateway', 'cognito', 'cloudwatch'];
    for (const service of awsServices) {
      if (lowerMessage.includes(service.replace(' ', ''))) {
        return `I can help you with ${service.toUpperCase()}! This is a powerful AWS service with many use cases. 

To give you the most helpful information, could you tell me:
• What specific aspect of ${service} interests you?
• Are you looking to implement it for a particular use case?
• Do you need help with setup, configuration, or best practices?

For example, you could ask:
• "How do I set up ${service} for my application?"
• "What are the pricing options for ${service}?"
• "Show me a ${service} implementation example"

What would you like to know about ${service}?`;
      }
    }

    // For any other AWS-related questions, provide a helpful response
    if (lowerMessage.includes('aws') || lowerMessage.includes('amazon') || lowerMessage.includes('cloud')) {
      return `I'm here to help with your AWS question! 

To provide you with the most accurate and useful information, could you be more specific about what you'd like to learn?

**Popular topics I can help with:**
• **Specific Services:** EC2, S3, Lambda, RDS, VPC, etc.
• **Architecture Design:** How to build scalable, secure applications
• **Cost Optimization:** Ways to reduce your AWS bill
• **Security Best Practices:** IAM, encryption, compliance
• **Certification Prep:** Study guides and exam strategies
• **Getting Started:** Step-by-step tutorials for beginners

**Try asking something like:**
• "How do I deploy a web application on AWS?"
• "What's the best database option for my use case?"
• "How can I reduce my AWS costs?"
• "Show me how to set up a VPC"

What specific AWS topic would you like to explore?`;
    }

    // For non-AWS questions, redirect to AWS topics
    return `I'm your AWS Learning Assistant, specialized in helping you master Amazon Web Services! 

I notice your question might not be AWS-related. I'm designed to help you with:

**🔧 AWS Services:** EC2, S3, Lambda, RDS, VPC, and 200+ other services
**🏗️ Cloud Architecture:** Designing scalable, secure, cost-effective solutions  
**🎯 Certification Prep:** Study plans for AWS exams
**💰 Cost Optimization:** Strategies to reduce your AWS bill
**🛡️ Security Best Practices:** IAM, encryption, compliance
**🚀 Getting Started:** Beginner-friendly AWS tutorials

**Try asking me:**
• "What AWS services do I need for a web application?"
• "How do I get started with AWS?"
• "Explain S3 storage classes"
• "Help me prepare for AWS certification"

What AWS topic would you like to learn about?`;
  }

  // Clear conversation history
  clearConversation(sessionId) {
    this.conversations.delete(sessionId);
  }

  // Check if API is properly configured
  isApiConfigured() {
    return !!this.apiKey && this.apiKey.startsWith('sk-');
  }

  // Get API status
  getApiStatus() {
    return {
      configured: this.isApiConfigured(),
      apiKey: this.apiKey ? `${this.apiKey.substring(0, 10)}...` : 'Not set',
      apiUrl: this.apiUrl
    };
  }

  // Test API connection
  async testApiConnection() {
    if (!this.isApiConfigured()) {
      return { success: false, error: 'API key not configured' };
    }

    try {
      const testMessages = [
        { role: 'system', content: 'You are a helpful assistant.' },
        { role: 'user', content: 'Hello, can you respond with just "API connection successful"?' }
      ];

      const response = await this.callMuseAPI(testMessages);
      return { 
        success: true, 
        response: response,
        message: 'API connection successful'
      };
    } catch (error) {
      return { 
        success: false, 
        error: error.message,
        message: 'API connection failed'
      };
    }
  }

  // Get conversation summary
  getConversationSummary(sessionId) {
    const conversation = this.getConversation(sessionId);
    return {
      messageCount: conversation.messages.length,
      duration: new Date() - conversation.startTime,
      lastActivity: conversation.messages[conversation.messages.length - 1]?.timestamp
    };
  }

  // Model management methods
  setModel(modelKey) {
    if (this.availableModels[modelKey]) {
      this.currentModel = this.availableModels[modelKey];
      console.log(`Switched to model: ${this.currentModel.name}`);
      return true;
    }
    console.error(`Model ${modelKey} not found`);
    return false;
  }

  getCurrentModel() {
    return {
      key: Object.keys(this.availableModels).find(key => 
        this.availableModels[key].id === this.currentModel.id
      ),
      ...this.currentModel
    };
  }

  getAvailableModels() {
    return Object.entries(this.availableModels).map(([key, model]) => ({
      key,
      ...model,
      isCurrent: model.id === this.currentModel.id
    }));
  }

  // Enhanced API status with model info
  getApiStatus() {
    return {
      configured: this.isApiConfigured(),
      apiKey: this.apiKey ? `${this.apiKey.substring(0, 10)}...` : 'Not set',
      apiUrl: this.apiUrl,
      currentModel: this.getCurrentModel(),
      availableModels: this.getAvailableModels()
    };
  }

  generateScenarioResponse(message, context, sessionContext) {
    const lowerMessage = message.toLowerCase();
    
    // Check if this is a follow-up to a previous scenario
    if (context.includes('scenario') || context.includes('crisis')) {
      if (lowerMessage.includes('database') || lowerMessage.includes('query')) {
        return `Good thinking! You're focusing on the database bottleneck. 

**Follow-up Crisis:** Now I'm seeing the slow query is on the \`user_sessions\` table. It normally takes 50ms but now takes 8+ seconds. The query hasn't changed, but something in the environment has.

**New evidence:**
- Query plan shows it's doing a full table scan instead of using the index
- The index exists and shows as "valid" in the database
- This started exactly 3 hours ago
- No deployments or schema changes

**Your next move:** What's your hypothesis for why a working index suddenly stopped being used? You have 10 minutes before the CEO calls.`;
      }
      
      return `I see you're working through the scenario. Let me escalate the pressure:

**PLOT TWIST:** While you were investigating, the error rate just jumped from 15% to 45%. Customer support is getting flooded with complaints, and social media mentions are spiking.

**New constraint:** You now have 5 minutes to implement a quick fix that stops the bleeding, even if it's not the perfect solution.

What's your emergency response strategy?`;
    }

    // Generate new scenario based on user interest
    if (lowerMessage.includes('debug') || lowerMessage.includes('error') || lowerMessage.includes('problem')) {
      return `🚨 **CRISIS SCENARIO: The Midnight Meltdown**

It's 11:47 PM on a Friday. Your company's main API just started throwing 500 errors at a 25% rate. The on-call engineer before you couldn't figure it out and escalated to you.

**The situation:**
- Revenue is dropping $2K per minute
- No recent deployments (last one was 3 days ago)
- Database CPU is at 45% (normal)
- Application servers show normal memory usage
- Load balancer health checks are passing
- Error logs show: "Connection timeout after 30 seconds"

**The pressure:**
- CEO is awake and asking for updates every 10 minutes
- Customer support is overwhelmed
- Your team lead is unreachable (vacation in a different timezone)

**Your resources:**
- Full access to all systems
- Monitoring dashboards
- Log aggregation system
- Database query analyzer

You have 15 minutes to identify the root cause and implement a fix. What's your first move and why?`;
    }

    return `Ready for some real-world chaos? I don't do easy problems - only scenarios that will make you sweat and think fast.

**Choose your disaster:**
🚨 **System Failures** - Production is down, customers are angry
🔒 **Security Breaches** - Someone's in your system who shouldn't be  
🤖 **AI Gone Wrong** - Your ML model is making terrible decisions
⚡ **Performance Nightmares** - Everything is slow and getting slower

Or tell me about a real problem you're facing, and I'll throw you into a similar scenario that'll test your problem-solving skills under pressure.`;
  }

  generateCareerResponse(message, context, sessionContext) {
    const lowerMessage = message.toLowerCase();
    
    // Check for follow-up to previous career discussion
    if (context.includes('rejection') || context.includes('interview')) {
      return `I can see this is really affecting you. Let's dig deeper into your specific situation so I can give you a targeted comeback strategy.

**I need the brutal details:**
- What was the exact role title and company size?
- How many rounds did you complete?
- What specific feedback did they give you (even the generic HR speak)?
- What's your gut feeling about what went wrong?

**Here's why details matter:** A rejection from a 50-person startup for "cultural fit" requires a completely different comeback strategy than a rejection from Google for "technical depth."

The more specific you are, the more surgical I can be with your recovery plan. Generic problems get generic solutions, and I don't do generic.`;
    }

    if (lowerMessage.includes('reject') || lowerMessage.includes('didn') || lowerMessage.includes('turned down') || lowerMessage.includes('give up')) {
      return `I hear you, and I get it. Job rejection hits hard, especially when you've put yourself out there. But here's the thing - **giving up is not an option when you have potential.**

**Let's be real about what happened:**
- Rejection stings, and that's completely normal
- It doesn't define your worth or capabilities
- Every "no" gets you closer to the right "yes"
- This is data, not a verdict on your future

**Here's what we're going to do:**

**🎯 Immediate Action Plan:**
1. **Take 24-48 hours** to feel disappointed (it's healthy)
2. **Get specific details** about what happened
3. **Identify the real gaps** vs. perceived gaps
4. **Create a targeted improvement plan**
5. **Come back stronger** with a better strategy

**💪 Comeback Strategy:**
- **Skills Gap?** We'll create a focused learning plan
- **Interview Performance?** We'll practice until it's second nature
- **Wrong Companies?** We'll target better-fit organizations
- **Confidence Issues?** We'll build evidence of your capabilities

**The truth:** Most successful people have a trail of rejections behind them. The difference is they used each "no" as fuel for improvement.

**Tell me exactly what happened** - company, role, process, feedback. Let's turn this setback into your comeback story. What are the details?`;
    }

    if (lowerMessage.includes('career') || lowerMessage.includes('job') || lowerMessage.includes('work')) {
      return `Career challenges are my specialty. I've helped hundreds of people navigate everything from job rejections to career pivots to salary negotiations.

**What's eating at you right now?**
- Recent job rejection that's crushing your confidence?
- Stuck in a role with zero growth opportunities?
- Trying to break into a new field but getting nowhere?
- Dealing with imposter syndrome that's holding you back?
- Want to negotiate better but don't know how?
- Considering a career change but scared to make the leap?

**My approach:** I don't give generic career advice. I analyze your specific situation and create a personalized strategy that addresses your exact challenges.

**Recent success stories:**
- Helped a rejected developer land a senior role at a FAANG company
- Guided a career changer from marketing to tech in 6 months
- Coached someone through a 40% salary increase negotiation

What's your current career frustration? Be specific - the more details you give me, the more targeted and effective my advice will be.`;
    }

    return `I specialize in turning career disasters into career breakthroughs. Whether you've been rejected, passed over, or just feel stuck, I've got strategies that most people never consider.

**What's your situation?**
- Job search not going well?
- Career feels stagnant?
- Want to level up but don't know how?
- Dealing with workplace challenges?

Tell me what's going on, and I'll help you create a plan to overcome it.`;
  }

  generateChaosResponse(message, context, sessionContext) {
    const lowerMessage = message.toLowerCase();
    
    if (context.includes('project') || context.includes('challenge')) {
      return `I can see you're ready to embrace the chaos. Let me design something that'll push you to your absolute limits.

**Based on our conversation, here's your personalized chaos project:**

**🌪️ "The Resilience Engine" - 90 Day Challenge**

**Your mission:** Build a distributed system that's designed to fail spectacularly, then make it bulletproof.

**The chaos constraints:**
- Every service must have at least 3 failure modes built in
- Database connections must randomly drop every 30 minutes
- Network partitions happen every few hours
- Memory leaks are intentionally introduced
- Load balancers randomly stop balancing

**Your job:** Make it handle 10,000+ concurrent users anyway.

**Why this will break you in the right way:**
- Forces you to think about failure from day one
- Teaches you monitoring, alerting, and incident response
- Makes you understand distributed systems at a deep level
- Builds debugging skills under extreme pressure

**The 90-day suffering schedule:**
- Days 1-30: Build the broken system
- Days 31-60: Add resilience patterns (circuit breakers, retries, fallbacks)
- Days 61-90: Load test and document everything like a senior engineer

Ready to commit to 90 days of controlled chaos, or do you want to stay comfortable building todo apps?`;
    }

    if (lowerMessage.includes('junior') || lowerMessage.includes('beginner') || lowerMessage.includes('entry')) {
      return `Junior level? Perfect. You're at the sweet spot where controlled chaos can accelerate your growth by 2-3 years.

**🔥 Your Chaos Project: "The Failure Factory"**

Most junior developers build things that work in perfect conditions. Senior developers build things that work when everything else is broken.

**Your challenge:** Build an e-commerce system where EVERYTHING is designed to fail:
- Payment service crashes every 100 transactions
- Product catalog randomly returns empty results
- User authentication has memory leaks
- Image CDN returns 404s for 10% of requests
- Database connections timeout frequently

**Your mission:** Make customers able to buy products anyway.

**What you'll learn through suffering:**
- Circuit breaker patterns
- Graceful degradation strategies
- Monitoring and alerting systems
- Database replication and failover
- Load balancing and auto-scaling
- Incident response procedures

**Timeline:** 90 days of controlled suffering

**Success metric:** Your system handles Black Friday traffic even when 3 services are down.

This will either make you a mid-level engineer or break you trying. Which outcome scares you more?`;
    }

    return `I don't believe in gentle learning curves. I believe in throwing people into challenges that are just beyond their current abilities - what I call "Chaos Projects."

**Comfortable is the enemy of growth.** I'm going to design a project so challenging it'll either break you or make you 10x better.

**Tell me your current level:**
- **Junior Developer** - Ready to accelerate to mid-level through controlled failure?
- **Mid-Level** - Want to break into senior roles by mastering complexity?
- **Senior** - Time to learn leadership through technical chaos?
- **Already Leading** - Let's design chaos that teaches you to scale teams?

**Also tell me:**
- What technologies do you work with daily?
- What's the most complex thing you've built?
- What scares you most about the next level?

Based on your answers, I'll design a project that'll push you to your breaking point - and then past it.

Ready to embrace the chaos?`;
  }

  generateAnalyticalResponse(message, context, sessionContext) {
    const lowerMessage = message.toLowerCase();
    
    if (context.includes('probe') || context.includes('assessment')) {
      return `Interesting response. Let me dig deeper into how your mind works.

**🧠 COGNITIVE PATTERN ANALYSIS:**

Based on your previous answer, I'm seeing some patterns in how you approach problems. But I need to probe further to map your natural thinking style.

**Follow-up Probe:**

You're leading a team meeting where you need to decide between two technical approaches:

**Option A:** A proven solution that will definitely work but takes 3 months
**Option B:** A cutting-edge approach that could be done in 1 month but has a 30% chance of failure

**The twist:** Your manager is pressuring you for the faster option, but your team is split 50/50 on which to choose.

**What's your immediate gut reaction?** Don't overthink it - just tell me what pops into your head first.

Your answer will reveal whether you're naturally:
- **Risk-averse** (prioritize certainty over speed)
- **Innovation-driven** (willing to bet on new approaches)
- **Team-focused** (seek consensus before deciding)
- **Authority-responsive** (factor in management pressure heavily)

What's your instinctive choice and why?`;
    }

    if (lowerMessage.includes('test') || lowerMessage.includes('assess') || lowerMessage.includes('strength')) {
      return `Forget traditional aptitude tests. I'm going to probe how your mind actually works under pressure and uncertainty.

**🎯 COGNITIVE PROBE #1: The Impossible Deadline**

You have 2 hours to figure out why a critical system is failing. The CEO is in a client meeting promising it'll be fixed "soon."

**You can only investigate ONE of these first:**
A) **Server logs** (10GB of messy data, might contain the smoking gun)
B) **Database metrics** (clean performance data, easy to analyze quickly)  
C) **User complaints** (unstructured but shows real impact patterns)
D) **Interview the last developer** who touched the system (human insight but takes time)

**Your choice reveals your natural problem-solving style:**
- **Systems thinkers** go for server logs (comprehensive data first)
- **Data analysts** choose database metrics (structured information)
- **User advocates** pick complaints (human impact focus)
- **Collaborative types** want to interview the developer (leverage team knowledge)

**What's your instinctive choice and why?**

Don't overthink it - your first reaction tells me more about your cognitive wiring than any multiple-choice test ever could.`;
    }

    return `I analyze thinking patterns, not memorized knowledge. Most people don't know their own cognitive strengths because they've never been properly tested.

**What I can reveal about you:**
- Your natural problem-solving style under pressure
- Which tech domains match your thinking patterns  
- Your learning preferences when facing uncertainty
- Hidden aptitudes you might not know you have
- Career paths that align with how your brain actually works

**My method:** I don't ask what you know - I probe how you think. Through scenarios and decision-making exercises, I map your cognitive patterns.

**Ready for some cognitive archaeology?**

I can either:
🧠 **Start with thinking probes** - Scenarios that reveal your decision-making patterns
🎯 **Analyze a real problem** - Tell me about something you're currently struggling with
🔍 **Career aptitude mapping** - Discover which tech roles match your natural strengths

What sounds most interesting to you? Or just describe a recent technical challenge you faced, and I'll analyze your problem-solving approach from that.`;
  }
}

// Export singleton instance
export const aiService = new AIService();
export default aiService;