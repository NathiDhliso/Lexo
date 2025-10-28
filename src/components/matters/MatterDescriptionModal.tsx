/**
 * MatterDescriptionModal Component
 * 
 * Progressive disclosure flow for matter description:
 * Step 1: Recording - Microphone with pulsing animation
 * Step 2: Transcription - Word-for-word text display with manual edit
 * Step 3: Summary - Formatted legal description with matter type
 * 
 * Features:
 * - Navigate back to previous steps
 * - Skip recording and enter manually
 * - Matter type templates for accurate formatting
 * - AI summarization with placeholder warnings
 * - Undo/Redo functionality
 */

import React, { useState, useCallback, useEffect } from 'react';
import { Mic, MicOff, ArrowLeft, ArrowRight, FileText, AlertTriangle, RotateCcw, Edit, Sparkles } from 'lucide-react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { AsyncButton } from '../ui/AsyncButton';
import { useVoiceRecording } from '../../hooks/useVoiceRecording';
import { formatMatterDescription, type MatterType } from '../../services/ai-summarization.service';
import { toast } from 'react-hot-toast';
import { cn } from '../../lib/utils';

export interface MatterDescriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (description: string, transcriptText?: string) => void;
  initialValue?: string;
}

export type MatterTypeTemplate = MatterType;

interface MatterTypeOption {
  value: MatterTypeTemplate;
  label: string;
  description: string;
}

const MATTER_TYPES: MatterTypeOption[] = [
  {
    value: 'litigation',
    label: 'Litigation',
    description: 'Court proceedings, motions, applications'
  },
  {
    value: 'conveyancing',
    label: 'Conveyancing',
    description: 'Property transfers, bonds, registrations'
  },
  {
    value: 'commercial',
    label: 'Commercial Law',
    description: 'Contracts, corporate matters, compliance'
  },
  {
    value: 'family_law',
    label: 'Family Law',
    description: 'Divorce, maintenance, custody'
  },
  {
    value: 'criminal',
    label: 'Criminal Law',
    description: 'Criminal defense, bail applications'
  },
  {
    value: 'labour',
    label: 'Labour Law',
    description: 'Employment disputes, CCMA, dismissals'
  },
  {
    value: 'administrative',
    label: 'Administrative Law',
    description: 'Judicial review, PAJA applications'
  },
  {
    value: 'other',
    label: 'Other',
    description: 'General legal matters'
  }
];

type Step = 'recording' | 'transcription' | 'summary';

interface StepHistory {
  transcript: string;
  summary?: string;
  matterType?: MatterTypeTemplate;
}

export const MatterDescriptionModal: React.FC<MatterDescriptionModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialValue
}) => {
  const [currentStep, setCurrentStep] = useState<Step>('recording');
  const [transcript, setTranscript] = useState('');
  const [summary, setSummary] = useState('');
  const [matterType, setMatterType] = useState<MatterTypeTemplate>('litigation');
  const [history, setHistory] = useState<StepHistory[]>([]);

  const voiceRecording = useVoiceRecording({
    language: 'en-ZA',
    maxDuration: 300, // 5 minutes
    onTranscriptComplete: (text) => {
      setTranscript(text);
    },
    onError: (error) => {
      console.error('Recording error:', error);
    }
  });

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      setCurrentStep('recording');
      setTranscript(initialValue || '');
      setSummary('');
      setHistory([]);
      if (voiceRecording.clearTranscript) {
        voiceRecording.clearTranscript();
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  // Save current state to history before changing steps
  const saveToHistory = useCallback(() => {
    setHistory(prev => [...prev, {
      transcript,
      summary,
      matterType
    }]);
  }, [transcript, summary, matterType]);

  const handleStartRecording = () => {
    voiceRecording.startRecording();
  };

  const handleStopRecording = () => {
    voiceRecording.stopRecording();
  };

  const handleFinishRecording = () => {
    const finalTranscript = voiceRecording.transcript || transcript;
    if (!finalTranscript || finalTranscript.trim().length === 0) {
      toast.error('No speech detected. Please try recording again or enter text manually.');
      return;
    }
    
    saveToHistory();
    setTranscript(finalTranscript);
    setCurrentStep('transcription');
  };

  const handleSkipRecording = () => {
    saveToHistory();
    setCurrentStep('transcription');
  };

  const handleEditTranscript = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setTranscript(e.target.value);
  };

  const handleProceedToSummary = () => {
    if (!transcript.trim()) {
      toast.error('Please enter a matter description');
      return;
    }
    
    saveToHistory();
    setCurrentStep('summary');
  };

  const handleSummarize = async () => {
    if (!transcript.trim()) {
      toast.error('No transcript to summarize');
      return;
    }

    try {
      // Call real AI summarization service
      const result = await formatMatterDescription({
        transcript,
        matterType
      });
      
      setSummary(result.formattedDescription);
    } catch (error) {
      console.error('Summarization error:', error);
      throw error;
    }
  };

  const handleSave = () => {
    const descriptionToSave = summary || transcript;
    if (!descriptionToSave.trim()) {
      toast.error('Please provide a matter description');
      return;
    }

    onSave(descriptionToSave, transcript);
    onClose();
  };

  const handleReRecord = () => {
    voiceRecording.clearTranscript();
    setTranscript('');
    setCurrentStep('recording');
  };

  const handleEditTranscriptionStep = () => {
    setCurrentStep('transcription');
  };

  const handleRevertSummary = () => {
    setSummary('');
  };

  const handleStartOver = () => {
    if (history.length > 0 || transcript || summary) {
      if (window.confirm('Are you sure you want to start over? All progress will be lost.')) {
        setTranscript('');
        setSummary('');
        setHistory([]);
        setCurrentStep('recording');
        voiceRecording.clearTranscript();
      }
    } else {
      setCurrentStep('recording');
    }
  };

  const handleBack = () => {
    if (currentStep === 'transcription') {
      setCurrentStep('recording');
    } else if (currentStep === 'summary') {
      setCurrentStep('transcription');
    }
  };

  const getStepNumber = (step: Step): number => {
    switch (step) {
      case 'recording': return 1;
      case 'transcription': return 2;
      case 'summary': return 3;
    }
  };

  const formatDuration = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const countPlaceholders = (text: string): number => {
    const matches = text.match(/\[Placeholder[^\]]*\]/g);
    return matches ? matches.length : 0;
  };

  const calculatePlaceholderPercentage = (text: string): number => {
    const words = text.split(/\s+/).length;
    const placeholders = countPlaceholders(text);
    return Math.round((placeholders / words) * 100);
  };

  const renderStepIndicator = () => (
    <div className="flex items-center justify-between mb-6 px-4">
      {['Recording', 'Transcription', 'Summary'].map((label, index) => {
        const stepNum = index + 1;
        const isActive = getStepNumber(currentStep) === stepNum;
        const isCompleted = getStepNumber(currentStep) > stepNum;

        return (
          <React.Fragment key={label}>
            <div className="flex flex-col items-center">
              <div
                className={cn(
                  'w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-all',
                  isActive && 'bg-judicial-blue-500 text-white ring-4 ring-judicial-blue-100 dark:ring-judicial-blue-900',
                  isCompleted && 'bg-green-500 text-white',
                  !isActive && !isCompleted && 'bg-neutral-200 dark:bg-metallic-gray-700 text-neutral-500 dark:text-neutral-400'
                )}
              >
                {isCompleted ? (
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                ) : (
                  stepNum
                )}
              </div>
              <span className={cn(
                'text-xs mt-2 font-medium',
                isActive && 'text-judicial-blue-600 dark:text-judicial-blue-400',
                !isActive && 'text-neutral-500 dark:text-neutral-400'
              )}>
                {label}
              </span>
            </div>
            {index < 2 && (
              <div className={cn(
                'flex-1 h-1 mx-2 rounded-full transition-all',
                getStepNumber(currentStep) > stepNum ? 'bg-green-500' : 'bg-neutral-200 dark:bg-metallic-gray-700'
              )}></div>
            )}
          </React.Fragment>
        );
      })}
    </div>
  );

  const renderRecordingStep = () => (
    <div className="flex flex-col items-center justify-center py-12">
      <div className="relative mb-8">
        {/* Pulsing animation rings */}
        {voiceRecording.isRecording && (
          <>
            <div className="absolute inset-0 animate-ping rounded-full bg-red-400 opacity-30"></div>
            <div className="absolute inset-0 animate-pulse rounded-full bg-red-400 opacity-20" style={{ animationDelay: '0.5s' }}></div>
          </>
        )}
        
        {/* Microphone button */}
        <button
          onClick={voiceRecording.isRecording ? handleStopRecording : handleStartRecording}
          disabled={!voiceRecording.isSupported}
          className={cn(
            'relative w-32 h-32 rounded-full flex items-center justify-center text-white transition-all shadow-2xl',
            voiceRecording.isRecording 
              ? 'bg-red-500 hover:bg-red-600 scale-110' 
              : 'bg-judicial-blue-500 hover:bg-judicial-blue-600',
            !voiceRecording.isSupported && 'opacity-50 cursor-not-allowed'
          )}
        >
          {voiceRecording.isRecording ? (
            <MicOff className="w-16 h-16" />
          ) : (
            <Mic className="w-16 h-16" />
          )}
        </button>
      </div>

      {/* Recording status */}
      <div className="text-center mb-6">
        {voiceRecording.isRecording ? (
          <>
            <p className="text-lg font-semibold text-red-600 dark:text-red-400 mb-2 animate-pulse">
              Recording...
            </p>
            <p className="text-2xl font-mono text-neutral-700 dark:text-neutral-300">
              {formatDuration(voiceRecording.duration)}
            </p>
          </>
        ) : voiceRecording.transcript ? (
          <p className="text-lg font-semibold text-green-600 dark:text-green-400">
            Recording complete
          </p>
        ) : (
          <p className="text-lg font-medium text-neutral-600 dark:text-neutral-400">
            Tap the microphone to start recording
          </p>
        )}
      </div>

      {/* Live transcript preview */}
      {voiceRecording.transcript && (
        <div className="w-full max-w-2xl p-4 bg-neutral-50 dark:bg-metallic-gray-800 rounded-lg mb-6">
          <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-2">Live Transcript:</p>
          <p className="text-neutral-800 dark:text-neutral-200 line-clamp-4">
            {voiceRecording.transcript}
          </p>
        </div>
      )}

      {/* Action buttons */}
      <div className="flex gap-3">
        {voiceRecording.transcript && !voiceRecording.isRecording && (
          <Button
            variant="primary"
            onClick={handleFinishRecording}
            className="px-8"
          >
            Continue <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        )}
        
        <Button
          variant="ghost"
          onClick={handleSkipRecording}
        >
          Skip & Enter Manually
        </Button>
      </div>

      {/* Browser support warning */}
      {!voiceRecording.isSupported && (
        <div className="mt-6 p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg max-w-md">
          <p className="text-sm text-amber-800 dark:text-amber-200">
            Voice recording is not supported in your browser. Please use Chrome, Edge, or Safari, or enter the description manually.
          </p>
        </div>
      )}
    </div>
  );

  const renderTranscriptionStep = () => (
    <div className="space-y-6">
      <div>
        <div className="flex items-center justify-between mb-3">
          <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300">
            Matter Description
          </label>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleReRecord}
            className="flex items-center gap-2"
          >
            <RotateCcw className="w-4 h-4" />
            Re-record
          </Button>
        </div>
        
        <textarea
          value={transcript}
          onChange={handleEditTranscript}
          placeholder="Enter or edit the matter description here..."
          rows={12}
          className="font-mono text-sm w-full px-3 py-2 border border-neutral-300 dark:border-metallic-gray-600 rounded-lg focus:ring-2 focus:ring-judicial-blue-500 dark:focus:ring-judicial-blue-400 bg-white dark:bg-metallic-gray-800 text-neutral-900 dark:text-neutral-100"
        />
        
        <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-2">
          Edit the transcription as needed. You can add missing details or correct any errors.
        </p>
      </div>

      {/* Word count */}
      <div className="flex items-center justify-between text-sm text-neutral-600 dark:text-neutral-400">
        <span>{transcript.split(/\s+/).filter(w => w).length} words</span>
        <span>{transcript.length} characters</span>
      </div>

      {/* Action buttons */}
      <div className="flex justify-between items-center pt-4 border-t border-neutral-200 dark:border-metallic-gray-700">
        <Button
          variant="ghost"
          onClick={handleBack}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
        
        <Button
          variant="primary"
          onClick={handleProceedToSummary}
          disabled={!transcript.trim()}
        >
          Continue <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </div>
  );

  const renderSummaryStep = () => {
    const placeholderCount = summary ? countPlaceholders(summary) : 0;
    const placeholderPercentage = summary ? calculatePlaceholderPercentage(summary) : 0;
    const hasHighPlaceholders = placeholderPercentage > 30;

    return (
      <div className="space-y-6">
        {/* Matter Type Selection */}
        {!summary && (
          <div>
            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-3">
              Select Matter Type
            </label>
            <div className="grid grid-cols-2 gap-3">
              {MATTER_TYPES.map((type) => (
                <button
                  key={type.value}
                  type="button"
                  onClick={() => setMatterType(type.value)}
                  className={cn(
                    'p-4 text-left rounded-lg border-2 transition-all',
                    matterType === type.value
                      ? 'border-judicial-blue-500 bg-judicial-blue-50 dark:bg-judicial-blue-900/20'
                      : 'border-neutral-200 dark:border-metallic-gray-600 hover:border-judicial-blue-300 dark:hover:border-judicial-blue-700'
                  )}
                >
                  <div className="font-medium text-neutral-900 dark:text-neutral-100 mb-1">
                    {type.label}
                  </div>
                  <div className="text-xs text-neutral-600 dark:text-neutral-400">
                    {type.description}
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Summarize Button */}
        {!summary && (
          <AsyncButton
            onAsyncClick={handleSummarize}
            successMessage="Description formatted successfully"
            errorMessage="Failed to format description"
            variant="primary"
            className="w-full"
          >
            <Sparkles className="w-4 h-4 mr-2" />
            Format Description
          </AsyncButton>
        )}

        {/* Summary Display */}
        {summary && (
          <div className="space-y-4">
            {/* Placeholder Warning */}
            {hasHighPlaceholders && (
              <div className="p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="font-medium text-amber-900 dark:text-amber-100 mb-1">
                    High Number of Placeholders Detected ({placeholderPercentage}%)
                  </p>
                  <p className="text-sm text-amber-800 dark:text-amber-200 mb-2">
                    The recording may have been unclear or missing key information. Consider:
                  </p>
                  <ul className="text-sm text-amber-800 dark:text-amber-200 list-disc list-inside space-y-1">
                    <li>Re-recording with clearer audio</li>
                    <li>Manually entering the missing information</li>
                    <li>Editing the transcription before summarizing</li>
                  </ul>
                </div>
              </div>
            )}

            {/* Formatted Summary */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                  Formatted Description
                </label>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={handleEditTranscriptionStep}
                    className="flex items-center gap-2"
                  >
                    <Edit className="w-4 h-4" />
                    Edit Transcript
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={handleRevertSummary}
                    className="flex items-center gap-2"
                  >
                    <RotateCcw className="w-4 h-4" />
                    Revert
                  </Button>
                </div>
              </div>
              
              <textarea
                value={summary}
                onChange={(e) => setSummary(e.target.value)}
                rows={16}
                className="font-mono text-sm w-full px-3 py-2 border border-neutral-300 dark:border-metallic-gray-600 rounded-lg focus:ring-2 focus:ring-judicial-blue-500 dark:focus:ring-judicial-blue-400 bg-white dark:bg-metallic-gray-800 text-neutral-900 dark:text-neutral-100"
              />
              
              <div className="flex items-center justify-between text-xs text-neutral-500 dark:text-neutral-400 mt-2">
                <span>You can edit the formatted description as needed</span>
                <span>{placeholderCount} placeholder{placeholderCount !== 1 ? 's' : ''}</span>
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex justify-between items-center pt-4 border-t border-neutral-200 dark:border-metallic-gray-700">
          <div className="flex gap-2">
            <Button
              variant="ghost"
              onClick={handleBack}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            
            <Button
              variant="ghost"
              onClick={handleStartOver}
            >
              Start Over
            </Button>
          </div>
          
          <Button
            variant="primary"
            onClick={handleSave}
            disabled={!summary && !transcript}
          >
            <FileText className="w-4 h-4 mr-2" />
            Save Description
          </Button>
        </div>
      </div>
    );
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Matter Description"
      size="xl"
    >
      <div className="space-y-6">
        {/* Step Indicator */}
        {renderStepIndicator()}

        {/* Step Content */}
        <div className="min-h-[500px]">
          {currentStep === 'recording' && renderRecordingStep()}
          {currentStep === 'transcription' && renderTranscriptionStep()}
          {currentStep === 'summary' && renderSummaryStep()}
        </div>
      </div>
    </Modal>
  );
};
