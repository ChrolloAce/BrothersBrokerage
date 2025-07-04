import { Client } from '../../types/client';
import { Calendar, Mail, Phone, User, Clock, CheckCircle, Star, ArrowRight } from 'lucide-react';
import { format } from 'date-fns';

interface ClientCardProps {
  client: Client;
  onClick?: () => void;
  isDragging?: boolean;
}

const ClientCard = ({ client, onClick, isDragging = false }: ClientCardProps) => {
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return 'bg-red-500 text-white';
      case 'high':
        return 'bg-orange-500 text-white';
      case 'medium':
        return 'bg-yellow-500 text-white';
      case 'low':
        return 'bg-green-500 text-white';
      default:
        return 'bg-gray-500 text-white';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'inactive':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'completed':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const completedMilestones = client.case.milestones.filter(m => m.status === 'completed').length;
  const totalMilestones = client.case.milestones.length;
  const progressPercentage = totalMilestones > 0 ? (completedMilestones / totalMilestones) * 100 : 0;

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  const getAvatarColor = (name: string) => {
    const colors = [
      'bg-blue-500', 'bg-purple-500', 'bg-green-500', 'bg-yellow-500', 
      'bg-red-500', 'bg-indigo-500', 'bg-pink-500', 'bg-teal-500'
    ];
    const index = name.length % colors.length;
    return colors[index];
  };

  return (
    <div
      className={`bg-white border-2 rounded-2xl p-5 cursor-pointer transition-all duration-300 ${
        isDragging 
          ? 'border-blue-400 shadow-2xl bg-gradient-to-br from-white to-blue-50' 
          : 'border-gray-200 hover:border-blue-300 hover:shadow-xl'
      } group`}
      onClick={onClick}
    >
      {/* Header with Avatar and Priority */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold text-sm shadow-md ${
            getAvatarColor(client.personalInfo.fullName)
          }`}>
            {getInitials(client.personalInfo.firstName, client.personalInfo.lastName)}
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="font-bold text-gray-900 text-base truncate group-hover:text-blue-600 transition-colors">
              {client.personalInfo.fullName}
            </h4>
            <p className="text-xs text-gray-500 truncate">
              {client.case.title}
            </p>
          </div>
        </div>
        <div className="flex flex-col items-end space-y-2">
          <span className={`px-3 py-1 rounded-full text-xs font-bold ${getPriorityColor(client.case.priority)} shadow-sm`}>
            {client.case.priority}
          </span>
          {client.case.priority === 'urgent' && (
            <Star className="w-4 h-4 text-yellow-500 animate-pulse" />
          )}
        </div>
      </div>

      {/* Contact Info */}
      <div className="space-y-2 mb-4">
        <div className="flex items-center text-xs text-gray-600 group-hover:text-gray-800 transition-colors">
          <Mail className="w-3 h-3 mr-2 text-blue-500" />
          <span className="truncate font-medium">{client.personalInfo.email}</span>
        </div>
        <div className="flex items-center text-xs text-gray-600 group-hover:text-gray-800 transition-colors">
          <Phone className="w-3 h-3 mr-2 text-green-500" />
          <span className="font-medium">{client.personalInfo.phone}</span>
        </div>
        <div className="flex items-center text-xs text-gray-600 group-hover:text-gray-800 transition-colors">
          <User className="w-3 h-3 mr-2 text-purple-500" />
          <span className="truncate font-medium">{client.careManager.name}</span>
        </div>
      </div>

      {/* Services */}
      <div className="mb-4">
        <div className="flex flex-wrap gap-2">
          {client.services.slice(0, 2).map((service, index) => (
            <span
              key={index}
              className="px-2 py-1 bg-gradient-to-r from-blue-50 to-purple-50 text-blue-700 text-xs rounded-lg font-medium border border-blue-200"
            >
              {service.replace('-', ' ')}
            </span>
          ))}
          {client.services.length > 2 && (
            <span className="px-2 py-1 bg-gray-50 text-gray-600 text-xs rounded-lg font-medium border border-gray-200">
              +{client.services.length - 2} more
            </span>
          )}
        </div>
      </div>

      {/* Progress */}
      <div className="mb-4">
        <div className="flex items-center justify-between text-xs text-gray-600 mb-2">
          <span className="font-medium">Progress</span>
          <span className="font-bold">{completedMilestones}/{totalMilestones} milestones</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
          <div 
            className="bg-gradient-to-r from-blue-500 to-purple-600 h-3 rounded-full transition-all duration-500 ease-out shadow-sm"
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
        <div className="text-xs text-gray-500 mt-1 text-right">
          {Math.round(progressPercentage)}% complete
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between text-xs">
        <div className="flex items-center text-gray-500">
          <Calendar className="w-3 h-3 mr-1" />
          <span>Created {format(client.createdAt, 'MMM dd')}</span>
        </div>
        <span className={`px-2 py-1 rounded-full border text-xs font-medium ${getStatusColor(client.status)}`}>
          {client.status}
        </span>
      </div>

      {/* Recent Activity */}
      {client.timeline.length > 0 && (
        <div className="mt-3 pt-3 border-t border-gray-100">
          <div className="flex items-center text-xs text-gray-500">
            <Clock className="w-3 h-3 mr-1 text-orange-500" />
            <span className="truncate flex-1">
              {client.timeline[0].title}
            </span>
            <span className="text-gray-400 ml-2">
              {format(client.timeline[0].date, 'MMM dd')}
            </span>
          </div>
        </div>
      )}

      {/* Hover Effect Arrow */}
      <div className="flex justify-center mt-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
        <ArrowRight className="w-4 h-4 text-blue-500" />
      </div>
    </div>
  );
};

export default ClientCard; 