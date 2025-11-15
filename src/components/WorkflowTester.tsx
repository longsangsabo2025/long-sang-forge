import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface WorkflowTestResult {
  status: string;
  data?: any;
  error?: string;
}

const WorkflowTester = () => {
  const [loading, setLoading] = useState<string | null>(null);
  const [results, setResults] = useState<{ [key: string]: WorkflowTestResult }>({});

  const workflows = [
    {
      id: 'content-factory',
      name: '🏭 AI Content Factory',
      endpoint: 'http://localhost:5678/webhook/ai-content-factory',
      description: 'Multi-stage content creation with AI quality assurance',
      complexity: 'Expert',
      nodes: 10,
      sampleRequest: {
        contentType: 'blog_post',
        topic: 'The Future of AI in Business Automation',
        targetAudience: 'business_professionals',
        tone: 'professional',
        length: 'medium',
        seoOptimization: true,
        includeImages: true,
        language: 'en'
      }
    },
    {
      id: 'social-media',
      name: '📱 Social Media Manager',
      endpoint: 'http://localhost:5678/webhook/social-media-manager',
      description: 'Intelligent social media automation with analytics',
      complexity: 'Advanced',
      nodes: 8,
      sampleRequest: {
        platform: 'linkedin',
        contentType: 'post',
        topic: 'AI automation trends',
        includeHashtags: true,
        scheduleOptimal: true,
        targetAudience: 'professionals',
        businessGoal: 'engagement'
      }
    },
    {
      id: 'email-marketing',
      name: '📧 Email Marketing Automation',
      endpoint: 'http://localhost:5678/webhook/email-marketing',
      description: 'Professional email campaigns with A/B testing',
      complexity: 'Advanced',
      nodes: 10,
      sampleRequest: {
        campaignType: 'newsletter',
        audience: 'high_engagement',
        subject: 'Weekly AI Updates!',
        personalization: true,
        abTesting: true,
        scheduling: 'optimal'
      }
    },
    {
      id: 'lead-management',
      name: '🎯 Lead Management System',
      endpoint: 'http://localhost:5678/webhook/lead-management',
      description: 'AI-powered lead scoring and nurturing',
      complexity: 'Advanced',
      nodes: 7,
      sampleRequest: {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@techcorp.com',
        phone: '+1234567890',
        company: 'Tech Corp',
        jobTitle: 'CEO',
        source: 'website_form',
        interests: ['AI', 'Automation']
      }
    },
    {
      id: 'customer-support',
      name: '🤖 Customer Support System',
      endpoint: 'http://localhost:5678/webhook/customer-support',
      description: 'Intelligent support with sentiment analysis',
      complexity: 'Advanced',
      nodes: 6,
      sampleRequest: {
        customerName: 'Jane Smith',
        customerEmail: 'jane@example.com',
        subject: 'Urgent: Login Issues',
        message: 'I cannot access my account and this is blocking my work. Please help ASAP!',
        priority: 'high',
        category: 'technical',
        channel: 'email'
      }
    },
    {
      id: 'business-analytics',
      name: '📈 Business Intelligence',
      endpoint: 'http://localhost:5678/webhook/business-analytics',
      description: 'Comprehensive analytics with predictive insights',
      complexity: 'Expert',
      nodes: 4,
      sampleRequest: {
        dataType: 'comprehensive',
        timeRange: 'last_30_days',
        metrics: ['revenue', 'users', 'engagement', 'conversion'],
        segments: ['new_users', 'premium_users', 'enterprise']
      }
    }
  ];

  const testWorkflow = async (workflow: any) => {
    setLoading(workflow.id);
    setResults(prev => ({ ...prev, [workflow.id]: { status: 'loading' } }));

    try {
      const response = await fetch(workflow.endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(workflow.sampleRequest)
      });

      const data = await response.json();
      
      setResults(prev => ({
        ...prev,
        [workflow.id]: {
          status: response.ok ? 'success' : 'error',
          data: response.ok ? data : undefined,
          error: response.ok ? undefined : data.message || 'Request failed'
        }
      }));
    } catch (error) {
      setResults(prev => ({
        ...prev,
        [workflow.id]: {
          status: 'error',
          error: error instanceof Error ? error.message : 'Network error'
        }
      }));
    } finally {
      setLoading(null);
    }
  };

  const getComplexityColor = (complexity: string) => {
    switch (complexity) {
      case 'Expert': return 'bg-red-100 text-red-800';
      case 'Advanced': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success': return 'bg-green-100 text-green-800';
      case 'error': return 'bg-red-100 text-red-800';
      case 'loading': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">🚀 Advanced AI Workflows Tester</h1>
        <p className="text-gray-600">Test your enterprise-grade AI automation workflows</p>
        
        <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-blue-600">6</div>
              <div className="text-sm text-gray-600">Total Workflows</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-green-600">45</div>
              <div className="text-sm text-gray-600">Total Nodes</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-purple-600">Enterprise</div>
              <div className="text-sm text-gray-600">Grade Quality</div>
            </CardContent>
          </Card>
        </div>
      </div>

      <Alert className="mb-6">
        <AlertDescription>
          🎯 <strong>Quick Test Guide:</strong> Click "Test Workflow" on any card below to send a sample request. 
          Each workflow uses pre-configured sample data to demonstrate its capabilities.
          Check the responses to see the AI processing results!
        </AlertDescription>
      </Alert>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {workflows.map((workflow) => (
          <Card key={workflow.id} className="relative">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">{workflow.name}</CardTitle>
                <div className="flex gap-2">
                  <Badge className={getComplexityColor(workflow.complexity)}>
                    {workflow.complexity}
                  </Badge>
                  <Badge variant="outline">
                    {workflow.nodes} nodes
                  </Badge>
                </div>
              </div>
              <CardDescription>{workflow.description}</CardDescription>
            </CardHeader>
            
            <CardContent>
              <Tabs defaultValue="test" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="test">Test</TabsTrigger>
                  <TabsTrigger value="sample">Sample Request</TabsTrigger>
                </TabsList>
                
                <TabsContent value="test" className="space-y-4">
                  <Button 
                    onClick={() => testWorkflow(workflow)}
                    disabled={loading === workflow.id}
                    className="w-full"
                  >
                    {loading === workflow.id ? 'Testing...' : 'Test Workflow'}
                  </Button>
                  
                  {results[workflow.id] && (
                    <div className="space-y-2">
                      <Badge className={getStatusColor(results[workflow.id].status)}>
                        {results[workflow.id].status.toUpperCase()}
                      </Badge>
                      
                      {results[workflow.id].status === 'success' && results[workflow.id].data && (
                        <div className="bg-green-50 p-3 rounded-lg">
                          <p className="text-sm font-medium text-green-800 mb-2">✅ Success Response:</p>
                          <pre className="text-xs bg-muted p-2 rounded overflow-auto max-h-32 dark:bg-slate-950">
                            {JSON.stringify(results[workflow.id].data, null, 2)}
                          </pre>
                        </div>
                      )}
                      
                      {results[workflow.id].status === 'error' && (
                        <div className="bg-red-50 p-3 rounded-lg">
                          <p className="text-sm font-medium text-red-800">❌ Error:</p>
                          <p className="text-sm text-red-600">{results[workflow.id].error}</p>
                        </div>
                      )}
                    </div>
                  )}
                </TabsContent>
                
                <TabsContent value="sample">
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <p className="text-sm font-medium mb-2">Sample Request Data:</p>
                    <pre className="text-xs overflow-auto max-h-32">
                      {JSON.stringify(workflow.sampleRequest, null, 2)}
                    </pre>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="mt-8">
        <Card>
          <CardHeader>
            <CardTitle>🔗 Direct Access Links</CardTitle>
            <CardDescription>Access your automation tools directly</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
              <div>
                <p className="font-medium">N8N Workflow Editor</p>
                <p className="text-sm text-gray-600">Manage and monitor your workflows</p>
              </div>
              <Button 
                variant="outline" 
                onClick={() => window.open('http://localhost:5678', '_blank')}
              >
                Open N8N →
              </Button>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
              <div>
                <p className="font-medium">Automation Dashboard</p>
                <p className="text-sm text-gray-600">View automation statistics and logs</p>
              </div>
              <Button 
                variant="outline"
                onClick={() => globalThis.location.href = '/automation'}
              >
                View Dashboard →
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default WorkflowTester;