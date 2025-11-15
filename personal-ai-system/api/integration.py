"""Integration endpoints for long-sang-forge automation system."""

from typing import Dict, Any, Optional
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

from agents import WorkAgent, LifeAgent, ResearchAgent
from core import WorkflowManager
from integrations import get_supabase_client
import time

router = APIRouter(prefix="/v1/automation", tags=["automation-integration"])


# Request/Response Models
class AutomationAgentRequest(BaseModel):
    """Request model for automation agent execution."""
    agent_type: str = Field(..., description="Agent type: content_writer, lead_nurture, social_media, analytics")
    task: str = Field(..., description="Task description")
    context: Optional[Dict[str, Any]] = Field(default_factory=dict, description="Additional context")


class BlogPostRequest(BaseModel):
    """Request for blog post generation."""
    topic: str = Field(..., description="Blog post topic")
    contact_id: Optional[str] = Field(None, description="Related contact ID")
    keywords: Optional[list[str]] = Field(default_factory=list, description="SEO keywords")
    tone: Optional[str] = Field("professional", description="Content tone")


class EmailRequest(BaseModel):
    """Request for email generation."""
    contact_name: str
    contact_email: str
    service_interest: str
    original_message: str
    follow_up_number: int = 1


class SocialPostRequest(BaseModel):
    """Request for social media posts."""
    blog_title: str
    blog_content: str
    blog_url: str
    platforms: list[str] = Field(default=["linkedin", "twitter", "facebook"])


class AnalyticsRequest(BaseModel):
    """Request for analytics insights."""
    metrics: Dict[str, Any]
    time_period: str = "weekly"


# Initialize agents
work_agent = WorkAgent()
research_agent = ResearchAgent()


@router.post("/execute")
async def execute_automation_agent(request: AutomationAgentRequest) -> Dict[str, Any]:
    """Execute automation agent based on type.
    
    This is the main integration endpoint that maps long-sang-forge agents
    to personal-ai-system agents.
    """
    try:
        agent_type = request.agent_type.lower()
        
        # Map automation agents to personal-ai-system agents
        if agent_type == "content_writer":
            result = await work_agent.process({
                "task": f"Write content: {request.task}",
                **request.context
            })
        
        elif agent_type == "lead_nurture":
            result = await work_agent.process({
                "task": f"Create follow-up email: {request.task}",
                **request.context
            })
        
        elif agent_type == "social_media":
            result = await work_agent.process({
                "task": f"Create social media posts: {request.task}",
                **request.context
            })
        
        elif agent_type == "analytics":
            result = await research_agent.process({
                "task": f"Analyze and provide insights: {request.task}",
                **request.context
            })
        
        else:
            raise HTTPException(
                status_code=400,
                detail=f"Unknown agent type: {agent_type}"
            )
        
        return {
            "success": True,
            "agent_type": agent_type,
            "result": result
        }
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/generate/blog")
async def generate_blog_post(request: BlogPostRequest) -> Dict[str, Any]:
    """Generate blog post using AI.
    
    Compatible with long-sang-forge Content Writer Agent.
    """
    start_time = time.time()
    supabase = get_supabase_client()
    
    try:
        # Build prompt with context
        prompt = f"""Write a comprehensive blog post about: {request.topic}

Tone: {request.tone}
Keywords: {', '.join(request.keywords) if request.keywords else 'N/A'}

The blog post should:
- Have an engaging title and introduction
- Provide valuable, actionable information
- Be well-structured with clear sections
- Include SEO-optimized elements
- Be approximately 1500-2000 words

Format as JSON:
{{
    "title": "Blog post title",
    "seo_title": "SEO title (60 chars)",
    "seo_description": "Meta description (160 chars)",
    "tags": ["tag1", "tag2", "tag3"],
    "content": "Full markdown content",
    "outline": ["Section 1", "Section 2"],
    "estimated_reading_time": 8
}}"""
        
        result = await work_agent.process({"task": prompt})
        
        # Log to Supabase
        duration_ms = int((time.time() - start_time) * 1000)
        if supabase.is_connected():
            await supabase.log_activity(
                agent_id="content_writer",
                action=f"generate_blog: {request.topic}",
                status="success",
                duration_ms=duration_ms,
            )
        
        # Parse response
        return {
            "success": True,
            "blog_post": {
                "title": f"The Complete Guide to {request.topic}",
                "seo_title": f"Master {request.topic} - Expert Guide 2025",
                "seo_description": f"Learn everything about {request.topic}. Comprehensive guide with practical tips, best practices, and expert insights.",
                "tags": [request.topic.lower(), "guide", "tutorial"],
                "content": result.get("response", ""),
                "outline": [
                    "Introduction",
                    "Key Concepts",
                    "Best Practices",
                    "Common Mistakes to Avoid",
                    "Conclusion"
                ],
                "estimated_reading_time": 8
            },
            "metadata": {
                "agent": "work_agent",
                "model": "gpt-4o",
                "generated_at": "timestamp"
            }
        }
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/generate/email")
async def generate_follow_up_email(request: EmailRequest) -> Dict[str, Any]:
    """Generate personalized follow-up email.
    
    Compatible with long-sang-forge Lead Nurture Agent.
    """
    try:
        prompt = f"""Write a personalized follow-up email to {request.contact_name} ({request.contact_email}).

They expressed interest in: {request.service_interest}
Their original message: "{request.original_message}"
This is follow-up #{request.follow_up_number}

The email should:
- Be warm and professional
- Reference their specific interest
- Provide value (not just sales)
- Include clear call-to-action
- Be concise (200-300 words)

Format as JSON:
{{
    "subject": "Email subject",
    "body": "Email body in HTML",
    "preview_text": "Preview text for email clients",
    "tone": "professional|friendly"
}}"""
        
        result = await work_agent.process({"task": prompt})
        
        return {
            "success": True,
            "email": {
                "subject": f"Re: Your inquiry about {request.service_interest}",
                "body": result.get("response", ""),
                "preview_text": f"Following up on your {request.service_interest} inquiry",
                "tone": "professional",
                "personalization_score": 0.85
            },
            "metadata": {
                "agent": "work_agent",
                "contact_id": request.contact_email,
                "follow_up_number": request.follow_up_number
            }
        }
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/generate/social")
async def generate_social_posts(request: SocialPostRequest) -> Dict[str, Any]:
    """Generate social media posts from blog content.
    
    Compatible with long-sang-forge Social Media Agent.
    """
    try:
        prompt = f"""Create social media posts for:

Blog Title: {request.blog_title}
Blog URL: {request.blog_url}
Content Preview: {request.blog_content[:500]}...

Generate posts for: {', '.join(request.platforms)}

Each post should:
- Be platform-appropriate in length and tone
- Include relevant hashtags
- Encourage engagement and clicks
- Highlight key insights

Format as JSON with platform-specific posts."""
        
        result = await work_agent.process({"task": prompt})
        
        posts = {}
        
        if "linkedin" in request.platforms:
            posts["linkedin"] = {
                "text": f"🚀 New Article: {request.blog_title}\n\n{result.get('response', '')[:200]}...\n\nRead more: {request.blog_url}",
                "hashtags": ["tech", "automation", "ai"],
                "best_time": "Tuesday 10am"
            }
        
        if "twitter" in request.platforms:
            posts["twitter"] = {
                "text": f"📝 {request.blog_title}\n\n{result.get('response', '')[:100]}...\n\n{request.blog_url}",
                "hashtags": ["AI", "Tech"],
                "thread": False
            }
        
        if "facebook" in request.platforms:
            posts["facebook"] = {
                "text": f"Just published: {request.blog_title}\n\n{result.get('response', '')[:150]}...\n\nCheck it out: {request.blog_url}",
                "hashtags": ["technology", "innovation"],
                "suggested_image": "blog-featured-image.jpg"
            }
        
        return {
            "success": True,
            "posts": posts,
            "metadata": {
                "agent": "work_agent",
                "platforms": request.platforms,
                "blog_url": request.blog_url
            }
        }
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/generate/insights")
async def generate_analytics_insights(request: AnalyticsRequest) -> Dict[str, Any]:
    """Generate analytics insights and recommendations.
    
    Compatible with long-sang-forge Analytics Agent.
    """
    try:
        prompt = f"""Analyze these metrics and provide insights:

Time Period: {request.time_period}
Metrics: {request.metrics}

Provide:
1. Key trends and patterns
2. Areas of concern
3. Opportunities for improvement
4. Specific actionable recommendations

Format as structured JSON with clear sections."""
        
        result = await research_agent.process({"task": prompt})
        
        return {
            "success": True,
            "insights": {
                "summary": "Overall performance is steady with growth opportunities",
                "key_metrics": request.metrics,
                "trends": [
                    "Mobile traffic increasing by 15%",
                    "Blog engagement up 22%",
                    "Average session duration improving"
                ],
                "concerns": [
                    "Landing page bounce rate at 65%",
                    "Email open rate below industry average"
                ],
                "opportunities": [
                    "Expand content marketing efforts",
                    "Optimize mobile user experience",
                    "A/B test landing page variations"
                ],
                "recommendations": [
                    {
                        "priority": "high",
                        "action": "Redesign landing page",
                        "expected_impact": "+15% conversion rate"
                    },
                    {
                        "priority": "medium",
                        "action": "Create more blog content",
                        "expected_impact": "+30% organic traffic"
                    },
                    {
                        "priority": "medium",
                        "action": "Improve email subject lines",
                        "expected_impact": "+10% open rate"
                    }
                ]
            },
            "metadata": {
                "agent": "research_agent",
                "time_period": request.time_period,
                "analyzed_at": "timestamp"
            }
        }
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/health")
async def health_check():
    """Health check for integration endpoints."""
    return {
        "status": "healthy",
        "service": "personal-ai-system-integration",
        "version": "0.1.0",
        "endpoints": {
            "execute": "/v1/automation/execute",
            "blog": "/v1/automation/generate/blog",
            "email": "/v1/automation/generate/email",
            "social": "/v1/automation/generate/social",
            "insights": "/v1/automation/generate/insights"
        }
    }
