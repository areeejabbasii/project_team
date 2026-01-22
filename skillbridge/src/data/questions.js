// Advanced question database for AI assistants
export const scenarioDatabase = {
  'scenario-master': {
    debugging: [
      {
        id: 'debug_001',
        title: 'The 3AM Production Nightmare',
        scenario: `🚨 **CRISIS SCENARIO: Black Friday Meltdown**

Your e-commerce platform just crashed during Black Friday peak hours. Revenue is dropping $10K per minute.

**Current situation:**
- API response times went from 200ms to 15+ seconds
- Database CPU at 98%
- Memory usage spiked 400% in 10 minutes
- No recent deployments
- Error logs showing connection timeouts
- Customer complaints flooding social media

**Available resources:**
- Database performance dashboard
- Application logs (last 2 hours)
- Server monitoring metrics
- Stressed product manager breathing down your neck
- 15 minutes before the CEO calls an emergency meeting

**Your move:** What's your first action and why? Walk me through your debugging logic.`,
        followUp: (response) => {
          if (response.toLowerCase().includes('database') || response.toLowerCase().includes('query')) {
            return "Smart thinking! You're focusing on the database bottleneck. Now I'm seeing slow queries on the `user_sessions` table. The query that normally takes 50ms is now taking 8+ seconds. What's your hypothesis for why this specific query degraded so suddenly?";
          } else if (response.toLowerCase().includes('logs') || response.toLowerCase().includes('error')) {
            return "Good instinct to check logs first. You find thousands of these errors: `Connection pool exhausted - max 100 connections reached`. But here's the weird part - traffic is only 2x normal, not 10x. What does this tell you?";
          } else {
            return "Interesting approach. Let me push back - while that might help long-term, you have 15 minutes before revenue loss becomes catastrophic. What's the fastest way to stop the bleeding right now?";
          }
        }
      },
      {
        id: 'debug_002',
        title: 'The Invisible Memory Leak',
        scenario: `🔍 **MYSTERY SCENARIO: The Vanishing RAM**

Your Node.js microservice has been running fine for months. Suddenly, memory usage climbs steadily until the container gets killed by the OOM killer.

**The puzzle:**
- Memory increases by ~50MB every hour
- No obvious memory leaks in heap dumps
- Garbage collection is running normally
- Code hasn't changed in 2 weeks
- Only happens in production, not staging
- Restarting the service fixes it temporarily

**Plot twist:** The memory leak only happens when processing requests from a specific client. All other clients work fine.

**Your investigation:** How do you hunt down this invisible memory leak?`,
        followUp: (response) => {
          if (response.toLowerCase().includes('heap') || response.toLowerCase().includes('dump')) {
            return "You take a heap dump and find something strange - there are thousands of Buffer objects that should have been garbage collected. They're all exactly 1024 bytes. What does this pattern suggest to you?";
          } else {
            return "That's one approach. But let me give you a clue - the leak is related to how this specific client sends data differently than others. What would you check about their request patterns?";
          }
        }
      }
    ],
    ai_disasters: [
      {
        id: 'ai_001',
        title: 'The Biased Hiring Algorithm',
        scenario: `🤖 **AI ETHICS CRISIS: The Discriminatory Model**

Your company's AI hiring tool has been live for 6 months, screening thousands of resumes. It's been praised for efficiency - until today.

**The bombshell:** A data scientist discovers the model is systematically rejecting qualified candidates from certain universities and demographic backgrounds.

**The evidence:**
- 78% of rejected candidates from historically black colleges
- Women in tech roles rejected at 3x the rate of men
- Model shows 94% accuracy on training data
- Business stakeholders love the "efficiency gains"
- Legal team is panicking about discrimination lawsuits

**Your dilemma:** You built this model. The training data came from "successful hires" over the past 5 years. The model learned to replicate historical biases.

**The pressure:** Fix it in 2 weeks or the company faces regulatory investigation.

**Your approach:** How do you debug and fix algorithmic bias while maintaining model performance?`,
        followUp: (response) => {
          if (response.toLowerCase().includes('data') || response.toLowerCase().includes('bias')) {
            return "Exactly! The training data encoded historical hiring biases. But here's the challenge - simply removing demographic features doesn't work because the model finds proxy variables (zip codes, school names, etc.). How do you ensure fairness without destroying predictive power?";
          } else {
            return "That's thinking about the technical fix, but there's a deeper issue. The model is working exactly as designed - it's optimizing for historical 'success.' How do you redefine what success means in hiring?";
          }
        }
      }
    ],
    security_breaches: [
      {
        id: 'sec_001',
        title: 'The Insider Threat',
        scenario: `🔒 **SECURITY INCIDENT: The Trusted Employee**

Friday, 11:47 PM. Your SIEM alerts are going crazy. Someone is accessing customer PII data they shouldn't have access to.

**The investigation reveals:**
- Access is coming from Sarah's account (Senior Developer, 4 years with company)
- She has legitimate access to the customer database for her job
- But she's accessing records for customers outside her region
- 2,847 customer records accessed in the last 3 hours
- Sarah's laptop shows no signs of malware
- She swears she's been at home watching Netflix all evening

**The evidence:**
- Login timestamps match her normal work hours
- Access patterns look human (not automated)
- VPN connection from her home IP address
- No failed login attempts (password wasn't brute-forced)
- Her manager confirms she's been acting normally

**The pressure:** You have 30 minutes to decide whether to:
1. Lock down Sarah's account (potentially wrongly accusing a trusted employee)
2. Continue monitoring (risking more data exposure)
3. Something else entirely

**Your call:** What's your incident response strategy?`,
        followUp: (response) => {
          if (response.toLowerCase().includes('password') || response.toLowerCase().includes('credential')) {
            return "Good thinking! You discover Sarah's password was compromised 3 months ago in a LinkedIn data breach. She reused the same password. But here's the twist - the attacker has been dormant for months. Why activate now? What changed?";
          } else if (response.toLowerCase().includes('monitor') || response.toLowerCase().includes('watch')) {
            return "Risky but smart. You set up enhanced monitoring and discover the attacker is specifically targeting customers who recently filed insurance claims. This isn't random - it's targeted. What does this pattern tell you about the attacker's motivation?";
          } else {
            return "That's a decisive move. But before you act, consider this - what if Sarah is telling the truth? How would you verify her alibi while still protecting customer data?";
          }
        }
      }
    ]
  },

  'comeback-coach': {
    rejection_analysis: [
      {
        company_type: 'big_tech',
        scenarios: [
          {
            feedback: 'not quite ready for this level',
            response: `That's Big Tech speak for "you can code, but you can't architect at scale."

**The brutal translation:** They don't think you can design systems that handle millions of users, or lead technical decisions that affect the entire engineering org.

**Your comeback strategy - The Scale Demonstrator:**

🏗️ **Build something that screams "I understand scale":**
- Distributed system handling 10K+ concurrent users
- Proper load balancing, caching, and database sharding
- Monitoring and alerting that would make a senior engineer proud
- Document your architectural decisions like you're writing for their engineering blog

🎯 **The 6-month plan:**
- Month 1-2: Architecture and core system
- Month 3-4: Scale testing and optimization  
- Month 5: Add monitoring, alerting, incident response
- Month 6: Write case studies of your architectural decisions

**The psychological game:** When you reapply, you're not the same person they rejected. You're someone who builds systems they wish they had.

What specific role were you rejected for? Senior Engineer? Staff? Principal? The comeback strategy changes based on the level.`
          },
          {
            feedback: 'cultural fit concerns',
            response: `"Cultural fit" is often code for "we're not sure you'll thrive in our specific brand of chaos."

**What they're really saying:** You might be technically solid, but they're worried about:
- How you handle ambiguous requirements
- Whether you can navigate office politics
- If you'll mesh with their specific team dynamics
- Your communication style with non-technical stakeholders

**The insider strategy - Become a known quantity:**

🕵️ **Intelligence gathering:**
- Find their employees on LinkedIn who share your background
- Join their open source projects as a contributor
- Attend meetups where their engineers speak
- Read their engineering blog religiously and engage thoughtfully

🤝 **The relationship building:**
- Don't ask for jobs - ask for coffee chats about industry trends
- Contribute meaningfully to their open source projects
- Share insights about problems they're publicly discussing
- Build relationships with 3-4 people before you ever reapply

**Timeline:** 8-12 months of relationship building before reapplying.

**The payoff:** When you reapply, you're not a stranger. You're someone multiple people can vouch for.

Which specific company was this? The strategy varies dramatically between Google, Meta, Amazon, etc.`
          }
        ]
      },
      {
        company_type: 'startup',
        scenarios: [
          {
            feedback: 'looking for someone more scrappy',
            response: `Startup rejection for not being "scrappy" enough? That's them saying you seem too comfortable with structure and process.

**Translation:** They want someone who can:
- Wear 5 different hats without complaining
- Build features with zero requirements documentation
- Debug production issues at 2 AM without calling it overtime
- Make technical decisions with incomplete information

**The scrappy demonstration strategy:**

🛠️ **Build their actual pain point:**
- Identify their biggest operational headache (usually customer support, deployment, or data management)
- Build them a working solution - not a proposal, an actual tool
- Make it so useful they can't ignore it
- Open source it and tag them on social media

📱 **The product contribution approach:**
- Use their product obsessively for 30 days
- Find the feature that's 80% there but missing crucial 20%
- Build it as a browser extension or mobile app
- Show them what you'd add to their team

**Example:** If they're a fintech startup struggling with customer onboarding, build them an automated KYC verification tool. If they're a SaaS with support ticket chaos, build them a smart ticket routing system.

**Timeline:** 60-90 days to build and demonstrate value.

What industry was this startup in? The pain points vary dramatically between fintech, healthtech, edtech, etc.`
          }
        ]
      }
    ]
  },

  'chaos-engineer': {
    skill_levels: {
      junior: [
        {
          title: 'The Failure Factory',
          description: `🌪️ **CHAOS PROJECT: Build a System Designed to Fail**

Most junior developers build things that work. Senior developers build things that work even when everything else is broken.

**Your mission:** Create a distributed e-commerce system where EVERYTHING is designed to fail:

**The chaos constraints:**
- Payment service randomly crashes every 100 transactions
- Database connections drop every 30 minutes
- Image CDN returns 404s for 10% of requests
- User service has memory leaks that kill it daily
- Network partitions happen every few hours

**Your job:** Make it resilient anyway.

**What you'll learn the hard way:**
- Circuit breakers and fallback mechanisms
- Graceful degradation strategies
- Monitoring and alerting systems
- Database replication and backup strategies
- Load balancing and auto-scaling
- Incident response procedures

**The 90-day suffering schedule:**
- Days 1-30: Build the broken system
- Days 31-60: Add resilience patterns
- Days 61-90: Document everything like a senior engineer

**Success metric:** Your system should handle Black Friday traffic even when 3 services are down.

Ready to embrace controlled chaos, or do you want to stay comfortable building todo apps?`,
          milestones: [
            'Week 1: Basic microservices architecture',
            'Week 2: Implement failure injection',
            'Week 4: Add circuit breakers',
            'Week 6: Implement monitoring',
            'Week 8: Load testing under failure conditions',
            'Week 12: Full chaos engineering documentation'
          ]
        }
      ],
      mid: [
        {
          title: 'The Legacy Resurrection',
          description: `⚡ **CHAOS PROJECT: Bring the Dead Back to Life**

Mid-level developers can build new things. Senior developers can fix things that are already broken and make them better than they ever were.

**Your mission:** Find a dead open-source project that people actually used and resurrect it.

**The selection criteria:**
- 1000+ GitHub stars but no commits in 2+ years
- Active issues from frustrated users
- Outdated dependencies and broken CI/CD
- No maintainer response to community contributions

**The resurrection challenges:**
- Reverse-engineer undocumented architecture decisions
- Modernize the entire tech stack without breaking existing functionality
- Fix security vulnerabilities in dependencies
- Rebuild CI/CD pipeline from scratch
- Manage community expectations and contributions
- Handle real user feedback and feature requests

**What makes this chaos:**
- You inherit someone else's technical debt
- You have real users depending on your decisions
- You must balance new features with stability
- You're essentially becoming a tech lead for a community

**The 4-month resurrection timeline:**
- Month 1: Archaeology - understand the existing system
- Month 2: Modernization - update dependencies and infrastructure
- Month 3: Community building - engage users and contributors
- Month 4: Feature development - add value while maintaining stability

**Success metric:** 100+ new users and 5+ community contributors.

Which type of project interests you most? Developer tools, web frameworks, data processing libraries?`,
          milestones: [
            'Week 2: Complete system analysis and documentation',
            'Week 4: Updated dependencies and fixed security issues',
            'Week 6: Rebuilt CI/CD pipeline',
            'Week 8: First community contribution merged',
            'Week 12: Major feature release',
            'Week 16: Sustainable community maintenance process'
          ]
        }
      ],
      senior: [
        {
          title: 'The Startup Simulator',
          description: `🚀 **CHAOS PROJECT: Lead Without a Team**

Senior developers don't just build systems - they build the processes that let teams build systems.

**Your mission:** Create a complete SaaS platform that can handle 50K+ users, but build it like you're leading a team of 8 developers across 3 time zones.

**The leadership simulation constraints:**
- Document every decision like you're onboarding new team members
- Build with microservices (because that's what teams use)
- Implement proper CI/CD, monitoring, incident response
- Create coding standards and review processes
- Handle "customer" feedback and feature requests
- Manage technical debt while shipping features
- Make architectural decisions with incomplete information

**The chaos elements:**
- Simulate team conflicts by building in different programming languages
- Handle "urgent" feature requests that conflict with your roadmap
- Deal with "legacy" code (intentionally write some bad code early, then refactor it later)
- Manage "stakeholder" pressure (set artificial deadlines for yourself)

**What you'll learn:**
- Technical project management
- Architecture documentation and communication
- Code review processes and standards
- Incident response and post-mortem procedures
- Technical debt management strategies
- Cross-functional communication skills

**The 6-month leadership gauntlet:**
- Month 1-2: Architecture and team process design
- Month 3-4: Scale testing and optimization
- Month 5: Community building and "team" simulation
- Month 6: Present it as a case study for technical leadership

**Success metric:** Your documentation is so good that a real team could take over the project in 2 weeks.

What type of SaaS platform would challenge you most? B2B productivity tools, consumer social apps, developer platforms?`,
          milestones: [
            'Week 4: Complete architecture documentation',
            'Week 8: Multi-service deployment pipeline',
            'Week 12: Monitoring and alerting system',
            'Week 16: Load testing at 10K+ concurrent users',
            'Week 20: Technical debt management process',
            'Week 24: Leadership case study presentation'
          ]
        }
      ]
    }
  },

  'mind-reader': {
    cognitive_probes: [
      {
        id: 'probe_001',
        title: 'The Impossible Deadline',
        scenario: `🧠 **COGNITIVE PROBE: Crisis Decision Making**

You have 2 hours to figure out why a critical system is failing. The CEO is in a client meeting promising it'll be fixed "soon."

**Available investigation paths (you can only choose ONE first):**
A) Server logs (10GB of data, might contain the smoking gun)
B) Database performance metrics (clean data, easy to analyze)
C) User complaint tickets (messy but shows real impact patterns)
D) Interview the last developer who touched the system

**Your choice reveals your natural problem-solving style:**
- **Systems thinkers** go for server logs (big picture first)
- **Data analysts** choose database metrics (clean, quantifiable data)
- **User-focused** pick complaint tickets (human impact first)
- **Collaborative** want to interview the developer (leverage team knowledge)

**What's your instinctive choice and why?**`,
        analysis: (choice) => {
          const patterns = {
            'A': 'Systems Thinker - You naturally gravitate toward comprehensive data even when it\\'s messy. You prefer to understand the full context before making decisions.',
            'B': 'Data Analyst - You like clean, structured information that you can quickly process and draw conclusions from. You trust metrics over anecdotes.',
            'C': 'User Advocate - You instinctively think about human impact first. You understand that technical problems are ultimately people problems.',
            'D': 'Collaborative Problem Solver - You leverage team knowledge and understand that the fastest path to a solution often goes through other people.'
          };
          return patterns[choice.toUpperCase()] || 'Interesting approach - tell me more about your reasoning.';
        }
      },
      {
        id: 'probe_002',
        title: 'The Architecture Decision',
        scenario: `🏗️ **COGNITIVE PROBE: Design Under Pressure**

You're designing a new feature that needs to handle 1M+ daily users. Your team is split on the approach:

**Option A:** Microservices architecture (scalable but complex)
**Option B:** Monolithic with caching (simple but might not scale)
**Option C:** Serverless functions (modern but vendor lock-in)
**Option D:** Hybrid approach (flexible but potentially confusing)

**The twist:** You have to decide NOW. The team meeting is in 10 minutes, and everyone's looking to you for direction.

**Your gut reaction reveals your decision-making style:**
- **Risk-averse** choose the proven monolithic approach
- **Innovation-driven** go for serverless
- **Complexity-comfortable** pick microservices
- **Diplomatic** try to find a hybrid solution

**What's your immediate instinct?**`,
        analysis: (choice) => {
          const patterns = {
            'A': 'Complexity Navigator - You\\'re comfortable with sophisticated solutions and understand that some problems require complex architectures.',
            'B': 'Pragmatic Optimizer - You prefer proven solutions and understand that simple often beats complex in real-world scenarios.',
            'C': 'Innovation Adopter - You\\'re willing to embrace new technologies and trade some control for modern capabilities.',
            'D': 'Strategic Balancer - You naturally look for solutions that satisfy multiple constraints and stakeholder needs.'
          };
          return patterns[choice.toUpperCase()] || 'That\\'s a unique perspective - what drives that choice for you?';
        }
      }
    ]
  }
};

export const personalityProfiles = {
  'systems-thinker': {
    strengths: ['Architecture design', 'Big picture thinking', 'Complex problem solving'],
    ideal_roles: ['Solutions Architect', 'Principal Engineer', 'CTO'],
    growth_areas: ['User empathy', 'Rapid prototyping', 'Business communication']
  },
  'data-analyst': {
    strengths: ['Performance optimization', 'Metrics-driven decisions', 'Quality assurance'],
    ideal_roles: ['Staff Engineer', 'Data Engineer', 'DevOps Lead'],
    growth_areas: ['Creative problem solving', 'Ambiguity tolerance', 'Team leadership']
  },
  'user-advocate': {
    strengths: ['Product thinking', 'User experience', 'Cross-functional collaboration'],
    ideal_roles: ['Product Engineer', 'Frontend Lead', 'Engineering Manager'],
    growth_areas: ['Technical depth', 'System design', 'Performance optimization']
  },
  'collaborative-solver': {
    strengths: ['Team leadership', 'Knowledge sharing', 'Mentoring'],
    ideal_roles: ['Tech Lead', 'Engineering Manager', 'Developer Relations'],
    growth_areas: ['Independent decision making', 'Technical specialization', 'Strategic thinking']
  }
};

export const getRandomScenario = (assistantType, category = null) => {
  const scenarios = scenarioDatabase[assistantType];
  if (!scenarios) return null;

  if (category && scenarios[category]) {
    const categoryScenarios = scenarios[category];
    return categoryScenarios[Math.floor(Math.random() * categoryScenarios.length)];
  }

  // Get random scenario from any category
  const allScenarios = Object.values(scenarios).flat();
  return allScenarios[Math.floor(Math.random() * allScenarios.length)];
};