'use client';

import React, { useState } from 'react';
import { Eye, FileText, BarChart3, Clock, Users, Zap } from 'lucide-react';
import CIConfigParser from './CIConfigParser';
import PipelineVisualizer from './PipelineVisualizer';

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

const CIPipelineAnalyzer: React.FC = () => {
  const [workflow, setWorkflow] = useState<ParsedWorkflow | null>(null);
  const [activeTab, setActiveTab] = useState<'upload' | 'visualize' | 'analyze'>('upload');

  const handleWorkflowParsed = (parsedWorkflow: ParsedWorkflow) => {
    setWorkflow(parsedWorkflow);
    setActiveTab('visualize');
  };

  // Advanced analysis functions
  const getWorkflowAnalysis = () => {
    if (!workflow) return null;

    const jobs = Object.values(workflow.jobs);
    const totalSteps = jobs.reduce((sum, job) => sum + job.steps.length, 0);
    const jobsWithDependencies = jobs.filter(job => job.needs && job.needs.length > 0);
    const independentJobs = jobs.filter(job => !job.needs || job.needs.length === 0);
    const environmentJobs = jobs.filter(job => job.environment);
    const conditionalJobs = jobs.filter(job => job.if);

    // Calculate estimated execution time
    const calculateExecutionTime = () => {
      const getDependencyChain = (jobId: string, visited = new Set<string>()): number => {
        if (visited.has(jobId)) return 0;
        visited.add(jobId);
        
        const job = workflow.jobs[jobId];
        if (!job) return 0;
        
        const jobTime = Math.max(1, job.steps.length * 1.5); // Estimate 1.5 min per step
        
        if (!job.needs || job.needs.length === 0) {
          return jobTime;
        }
        
        const maxDependencyTime = Math.max(
          ...job.needs.map(dep => getDependencyChain(dep, visited))
        );
        
        return maxDependencyTime + jobTime;
      };

      return Math.max(...Object.keys(workflow.jobs).map(jobId => getDependencyChain(jobId)));
    };

    // Find bottlenecks (jobs with many dependencies)
    const getBottlenecks = () => {
      return jobs
        .map(job => ({
          ...job,
          dependentCount: jobs.filter(j => j.needs?.includes(job.id)).length
        }))
        .filter(job => job.dependentCount > 0)
        .sort((a, b) => b.dependentCount - a.dependentCount)
        .slice(0, 3);
    };

    // Find optimization opportunities
    const getOptimizationSuggestions = () => {
      const suggestions = [];
      
      if (independentJobs.length > 1) {
        suggestions.push({
          type: 'parallel',
          message: `${independentJobs.length} jobs can run in parallel at the start`,
          impact: 'High performance gain'
        });
      }
      
      const longJobs = jobs.filter(job => job.steps.length > 10);
      if (longJobs.length > 0) {
        suggestions.push({
          type: 'split',
          message: `${longJobs.length} jobs have many steps and could be split`,
          impact: 'Better maintainability'
        });
      }
      
      const duplicateRunners = jobs.reduce((acc, job) => {
        acc[job.runsOn] = (acc[job.runsOn] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);
      
      const underutilizedRunners = Object.entries(duplicateRunners)
        .filter(([, count]) => count === 1)
        .map(([runner]) => runner);
      
      if (underutilizedRunners.length > 1) {
        suggestions.push({
          type: 'consolidate',
          message: `Consider consolidating jobs using similar runners`,
          impact: 'Cost optimization'
        });
      }
      
      return suggestions;
    };

    return {
      totalJobs: jobs.length,
      totalSteps,
      independentJobs: independentJobs.length,
      jobsWithDependencies: jobsWithDependencies.length,
      environmentJobs: environmentJobs.length,
      conditionalJobs: conditionalJobs.length,
      estimatedExecutionTime: calculateExecutionTime(),
      bottlenecks: getBottlenecks(),
      optimizationSuggestions: getOptimizationSuggestions(),
      runnerDistribution: jobs.reduce((acc, job) => {
        acc[job.runsOn] = (acc[job.runsOn] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
    };
  };

  const analysis = getWorkflowAnalysis();

  const tabs = [
    { id: 'upload', label: 'Upload Config', icon: FileText },
    { id: 'visualize', label: 'Visualize Pipeline', icon: Eye },
    { id: 'analyze', label: 'Analysis', icon: BarChart3 },
  ];

  return (
    <div className="space-y-6">
      {/* Tab Navigation */}
      <div className="border-b border-gray-200 dark:border-gray-700">
        <nav className="flex space-x-8">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as 'upload' | 'visualize' | 'analyze')}
                className={`flex items-center py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                }`}
                disabled={tab.id !== 'upload' && !workflow}
              >
                <Icon className="w-4 h-4 mr-2" />
                {tab.label}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'upload' && (
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Upload CI Configuration
          </h2>
          <CIConfigParser onWorkflowParsed={handleWorkflowParsed} />
        </div>
      )}

      {activeTab === 'visualize' && workflow && (
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Pipeline Visualization
          </h2>
          <PipelineVisualizer workflow={workflow} />
        </div>
      )}

      {activeTab === 'analyze' && workflow && analysis && (
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
            Pipeline Analysis
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {/* Metrics Cards */}
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
              <div className="flex items-center">
                <Users className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                <div className="ml-3">
                  <p className="text-sm font-medium text-blue-600 dark:text-blue-400">Total Jobs</p>
                  <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">{analysis.totalJobs}</p>
                </div>
              </div>
            </div>

            <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
              <div className="flex items-center">
                <Zap className="w-8 h-8 text-green-600 dark:text-green-400" />
                <div className="ml-3">
                  <p className="text-sm font-medium text-green-600 dark:text-green-400">Parallel Jobs</p>
                  <p className="text-2xl font-bold text-green-900 dark:text-green-100">{analysis.independentJobs}</p>
                </div>
              </div>
            </div>

            <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg p-4">
              <div className="flex items-center">
                <BarChart3 className="w-8 h-8 text-purple-600 dark:text-purple-400" />
                <div className="ml-3">
                  <p className="text-sm font-medium text-purple-600 dark:text-purple-400">Total Steps</p>
                  <p className="text-2xl font-bold text-purple-900 dark:text-purple-100">{analysis.totalSteps}</p>
                </div>
              </div>
            </div>

            <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg p-4">
              <div className="flex items-center">
                <Clock className="w-8 h-8 text-orange-600 dark:text-orange-400" />
                <div className="ml-3">
                  <p className="text-sm font-medium text-orange-600 dark:text-orange-400">Est. Duration</p>
                  <p className="text-2xl font-bold text-orange-900 dark:text-orange-100">
                    {Math.round(analysis.estimatedExecutionTime)}m
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Runner Distribution */}
            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Runner Distribution
              </h3>
              <div className="space-y-3">
                {Object.entries(analysis.runnerDistribution).map(([runner, count]) => (
                  <div key={runner} className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">{runner}</span>
                    <div className="flex items-center">
                      <div className="w-16 bg-gray-200 dark:bg-gray-700 rounded-full h-2 mr-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full"
                          style={{ width: `${(count / analysis.totalJobs) * 100}%` }}
                        />
                      </div>
                      <span className="text-sm font-medium text-gray-900 dark:text-white">
                        {count} ({Math.round((count / analysis.totalJobs) * 100)}%)
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Optimization Suggestions */}
            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Optimization Suggestions
              </h3>
              <div className="space-y-3">
                {analysis.optimizationSuggestions.length > 0 ? (
                  analysis.optimizationSuggestions.map((suggestion, index) => (
                    <div key={index} className="border-l-4 border-blue-500 pl-4">
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {suggestion.message}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Impact: {suggestion.impact}
                      </p>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    No optimization suggestions at this time.
                  </p>
                )}
              </div>
            </div>

            {/* Bottlenecks */}
            {analysis.bottlenecks.length > 0 && (
              <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Potential Bottlenecks
                </h3>
                <div className="space-y-3">
                  {analysis.bottlenecks.map((job, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-400">{job.name}</span>
                      <span className="text-sm font-medium text-red-600 dark:text-red-400">
                        {job.dependentCount} dependencies
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Additional Metrics */}
            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Additional Insights
              </h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Jobs with dependencies:</span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {analysis.jobsWithDependencies}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Environment-specific jobs:</span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {analysis.environmentJobs}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Conditional jobs:</span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {analysis.conditionalJobs}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CIPipelineAnalyzer; 