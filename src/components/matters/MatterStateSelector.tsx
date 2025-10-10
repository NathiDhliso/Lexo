import React from 'react';
import { Activity, Pause, Clock, Gavel, CheckCircle, Archive } from 'lucide-react';

export type MatterState = 'active' | 'paused' | 'on_hold' | 'awaiting_court' | 'completed' | 'archived';

interface MatterStateSelectorProps {
  value: MatterState;
  onChange: (state: MatterState) => void;
  disabled?: boolean;
}

const MATTER_STATES = [
  {
    value: 'active' as MatterState,
    label: 'Active',
    description: 'Work in progress',
    icon: Activity,
    color: 'green',
    bgColor: 'bg-green-100',
    textColor: 'text-green-800',
    iconColor: 'text-green-600'
  },
  {
    value: 'paused' as MatterState,
    label: 'Paused',
    description: 'Temporarily suspended',
    icon: Pause,
    color: 'yellow',
    bgColor: 'bg-yellow-100',
    textColor: 'text-yellow-800',
    iconColor: 'text-yellow-600'
  },
  {
    value: 'on_hold' as MatterState,
    label: 'On Hold',
    description: 'Awaiting external event',
    icon: Clock,
    color: 'orange',
    bgColor: 'bg-orange-100',
    textColor: 'text-orange-800',
    iconColor: 'text-orange-600'
  },
  {
    value: 'awaiting_court' as MatterState,
    label: 'Awaiting Court Date',
    description: 'Scheduled hearing',
    icon: Gavel,
    color: 'blue',
    bgColor: 'bg-blue-100',
    textColor: 'text-blue-800',
    iconColor: 'text-blue-600'
  },
  {
    value: 'completed' as MatterState,
    label: 'Completed',
    description: 'Work finished',
    icon: CheckCircle,
    color: 'purple',
    bgColor: 'bg-purple-100',
    textColor: 'text-purple-800',
    iconColor: 'text-purple-600'
  },
  {
    value: 'archived' as MatterState,
    label: 'Archived',
    description: 'Closed and archived',
    icon: Archive,
    color: 'gray',
    bgColor: 'bg-gray-100',
    textColor: 'text-gray-800',
    iconColor: 'text-gray-600'
  }
];

export const MatterStateSelector: React.FC<MatterStateSelectorProps> = ({
  value,
  onChange,
  disabled = false
}) => {
  const currentState = MATTER_STATES.find(s => s.value === value);

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">
        Matter State
      </label>
      <div className="relative">
        <select
          value={value}
          onChange={(e) => onChange(e.target.value as MatterState)}
          disabled={disabled}
          className={`block w-full px-4 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
            disabled ? 'bg-gray-100 cursor-not-allowed' : 'bg-white cursor-pointer'
          }`}
        >
          {MATTER_STATES.map((state) => (
            <option key={state.value} value={state.value}>
              {state.label} - {state.description}
            </option>
          ))}
        </select>
      </div>

      {currentState && (
        <div className={`flex items-center gap-2 px-3 py-2 rounded-lg ${currentState.bgColor}`}>
          <currentState.icon className={`h-5 w-5 ${currentState.iconColor}`} />
          <div>
            <p className={`text-sm font-medium ${currentState.textColor}`}>
              {currentState.label}
            </p>
            <p className={`text-xs ${currentState.textColor} opacity-75`}>
              {currentState.description}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export const MatterStateBadge: React.FC<{ state: MatterState }> = ({ state }) => {
  const stateConfig = MATTER_STATES.find(s => s.value === state);
  
  if (!stateConfig) return null;

  const Icon = stateConfig.icon;

  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium ${stateConfig.bgColor} ${stateConfig.textColor}`}>
      <Icon className="h-4 w-4" />
      {stateConfig.label}
    </span>
  );
};
