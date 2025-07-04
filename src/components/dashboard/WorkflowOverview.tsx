import { useTheme } from '../../hooks/useTheme';
import { 
  Mail, 
  Users, 
  FileText, 
  DollarSign, 
  CheckCircle,
  Clock,
  ArrowRight
} from 'lucide-react';

const WorkflowOverview = () => {
  const theme = useTheme();

  const workflowStages = [
    {
      id: 'lead-intake',
      title: 'Lead Intake',
      description: 'Email detection & form collection',
      icon: Mail,
      color: theme.broker.workflow.leadIntake,
      stats: { active: 15, completed: 142 },
      status: 'active'
    },
    {
      id: 'client-onboarding',
      title: 'Client Onboarding',
      description: 'Broker agreements & documentation',
      icon: Users,
      color: theme.broker.workflow.clientOnboarding,
      stats: { active: 8, completed: 89 },
      status: 'active'
    },
    {
      id: 'budget-processing',
      title: 'Budget Processing',
      description: 'Start-up, Initial & CNBA budgets',
      icon: FileText,
      color: theme.broker.workflow.budgetProcessing,
      stats: { active: 12, completed: 67 },
      status: 'warning'
    },
    {
      id: 'document-management',
      title: 'Document Management',
      description: 'Life plans, LOC forms & evaluations',
      icon: CheckCircle,
      color: theme.broker.workflow.documentManagement,
      stats: { active: 5, completed: 134 },
      status: 'active'
    },
    {
      id: 'billing-automation',
      title: 'Billing Automation',
      description: 'Invoice generation & submission',
      icon: DollarSign,
      color: theme.broker.workflow.billingAutomation,
      stats: { active: 3, completed: 201 },
      status: 'success'
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success':
        return theme.colors.success[500];
      case 'warning':
        return theme.colors.warning[500];
      case 'active':
        return theme.colors.primary[500];
      default:
        return theme.colors.secondary[500];
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Workflow Overview</h3>
        <div className="flex items-center text-sm text-gray-500">
          <Clock className="w-4 h-4 mr-1" />
          Real-time
        </div>
      </div>

      <div className="space-y-4">
        {workflowStages.map((stage, index) => (
          <div key={stage.id} className="relative">
            <div className="flex items-center p-4 rounded-lg border border-gray-100 hover:bg-gray-50 transition-colors duration-200">
              <div 
                className="p-3 rounded-lg mr-4"
                style={{ backgroundColor: `${stage.color}20` }}
              >
                <stage.icon 
                  className="w-6 h-6"
                  style={{ color: stage.color }}
                />
              </div>
              
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <h4 className="font-medium text-gray-900">{stage.title}</h4>
                  <div className="flex items-center space-x-4">
                    <div className="text-sm text-gray-500">
                      Active: <span className="font-medium text-gray-900">{stage.stats.active}</span>
                    </div>
                    <div className="text-sm text-gray-500">
                      Completed: <span className="font-medium text-gray-900">{stage.stats.completed}</span>
                    </div>
                  </div>
                </div>
                <p className="text-sm text-gray-500 mb-2">{stage.description}</p>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div 
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: getStatusColor(stage.status) }}
                    />
                    <span className="text-xs font-medium text-gray-600 capitalize">
                      {stage.status}
                    </span>
                  </div>
                  
                  <div className="w-32 bg-gray-200 rounded-full h-2">
                    <div 
                      className="h-2 rounded-full transition-all duration-300"
                      style={{ 
                        backgroundColor: stage.color,
                        width: `${(stage.stats.completed / (stage.stats.active + stage.stats.completed)) * 100}%`
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>
            
            {index < workflowStages.length - 1 && (
              <div className="flex justify-center py-2">
                <ArrowRight className="w-4 h-4 text-gray-300" />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default WorkflowOverview; 