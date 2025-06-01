'use client';

import React, { useState, useCallback } from 'react';
import { Upload, FileText, AlertCircle, CheckCircle } from 'lucide-react';
import * as yaml from 'js-yaml';

interface ParsedJob {
  id: string;
  name: string;
  needs?: string[];
  runsOn: string;
  steps: Array<{
    name?: string;
    uses?: string;
    run?: string;
    with?: Record<string, unknown>;
  }>;
  if?: string;
  environment?: string;
}

interface ParsedWorkflow {
  name: string;
  on: Record<string, unknown>;
  jobs: Record<string, ParsedJob>;
  env?: Record<string, string>;
}

interface CIConfigParserProps {
  onWorkflowParsed: (workflow: ParsedWorkflow) => void;
}

const CIConfigParser: React.FC<CIConfigParserProps> = ({ onWorkflowParsed }) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const [parseStatus, setParseStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [parseError, setParseError] = useState<string>('');
  const [parsedWorkflow, setParsedWorkflow] = useState<ParsedWorkflow | null>(null);

  const parseWorkflow = useCallback((content: string, filename: string) => {
    try {
      let parsed: unknown;
      
      if (filename.endsWith('.yml') || filename.endsWith('.yaml')) {
        parsed = yaml.load(content);
      } else if (filename.endsWith('.json')) {
        parsed = JSON.parse(content);
      } else {
        throw new Error('Unsupported file type. Please upload a .yml, .yaml, or .json file.');
      }

      // Validate and normalize the workflow structure
      if (!parsed || typeof parsed !== 'object') {
        throw new Error('Invalid workflow format');
      }

      const workflowData = parsed as Record<string, unknown>;
      const workflow: ParsedWorkflow = {
        name: (workflowData.name as string) || 'Unnamed Workflow',
        on: (workflowData.on || workflowData['on']) as Record<string, unknown> || {},
        jobs: {},
        env: (workflowData.env as Record<string, string>) || {}
      };

      // Parse jobs
      if (workflowData.jobs && typeof workflowData.jobs === 'object') {
        const jobsData = workflowData.jobs as Record<string, unknown>;
        for (const [jobId, jobData] of Object.entries(jobsData)) {
          const job = jobData as Record<string, unknown>;
          workflow.jobs[jobId] = {
            id: jobId,
            name: (job.name as string) || jobId,
            needs: Array.isArray(job.needs) ? job.needs as string[] : job.needs ? [job.needs as string] : undefined,
            runsOn: (job['runs-on'] as string) || 'ubuntu-latest',
            steps: (job.steps as Array<Record<string, unknown>>) || [],
            if: job.if as string,
            environment: job.environment as string
          };
        }
      }

      setParsedWorkflow(workflow);
      onWorkflowParsed(workflow);
      setParseStatus('success');
      setParseError('');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown parsing error';
      setParseError(errorMessage);
      setParseStatus('error');
      setParsedWorkflow(null);
    }
  }, [onWorkflowParsed]);

  const handleFileUpload = useCallback((file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      parseWorkflow(content, file.name);
    };
    reader.readAsText(file);
  }, [parseWorkflow]);

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const files = Array.from(e.dataTransfer.files);
    const validFile = files.find(file => 
      file.name.endsWith('.yml') || 
      file.name.endsWith('.yaml') || 
      file.name.endsWith('.json')
    );
    
    if (validFile) {
      handleFileUpload(validFile);
    } else {
      setParseError('Please upload a valid CI configuration file (.yml, .yaml, or .json)');
      setParseStatus('error');
    }
  }, [handleFileUpload]);

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileUpload(file);
    }
  }, [handleFileUpload]);

  return (
    <div className="space-y-4">
      {/* File Upload Area */}
      <div
        className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
          isDragOver
            ? 'border-blue-400 bg-blue-50 dark:bg-blue-900/20'
            : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
        }`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
      >
        <Upload className="w-12 h-12 mx-auto mb-4 text-gray-400" />
        <div className="space-y-2">
          <p className="text-lg font-medium text-gray-700 dark:text-gray-300">
            Upload CI Configuration File
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Drag and drop your .yml, .yaml, or .json file here, or click to browse
          </p>
        </div>
        
        <label className="inline-block mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 cursor-pointer transition-colors">
          <FileText className="w-4 h-4 inline mr-2" />
          Choose File
          <input
            type="file"
            accept=".yml,.yaml,.json"
            onChange={handleFileInput}
            className="hidden"
          />
        </label>
      </div>

      {/* Parse Status */}
      {parseStatus === 'success' && parsedWorkflow && (
        <div className="flex items-center space-x-2 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
          <CheckCircle className="w-5 h-5 text-green-600" />
          <div>
            <p className="text-sm font-medium text-green-800 dark:text-green-200">
              Workflow parsed successfully!
            </p>
            <p className="text-xs text-green-600 dark:text-green-300">
              Found {Object.keys(parsedWorkflow.jobs).length} jobs in &quot;{parsedWorkflow.name}&quot;
            </p>
          </div>
        </div>
      )}

      {parseStatus === 'error' && (
        <div className="flex items-center space-x-2 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <AlertCircle className="w-5 h-5 text-red-600" />
          <div>
            <p className="text-sm font-medium text-red-800 dark:text-red-200">
              Parse Error
            </p>
            <p className="text-xs text-red-600 dark:text-red-300">
              {parseError}
            </p>
          </div>
        </div>
      )}

      {/* Workflow Summary */}
      {parsedWorkflow && (
        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
          <h4 className="font-medium text-gray-800 dark:text-gray-200 mb-2">
            Workflow Summary
          </h4>
          <div className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
            <div><strong>Name:</strong> {parsedWorkflow.name}</div>
            <div><strong>Jobs:</strong> {Object.keys(parsedWorkflow.jobs).length}</div>
            <div><strong>Triggers:</strong> {Object.keys(parsedWorkflow.on).join(', ')}</div>
            {Object.keys(parsedWorkflow.env || {}).length > 0 && (
              <div><strong>Environment Variables:</strong> {Object.keys(parsedWorkflow.env!).length}</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default CIConfigParser; 