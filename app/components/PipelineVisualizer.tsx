'use client';

import React, { useCallback, useEffect, useMemo } from 'react';
import ReactFlow, {
  Node,
  Edge,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  ConnectionMode,
  MiniMap,
  Panel,
  MarkerType,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { Clock, Server, GitBranch, Play, Pause, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';

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

interface PipelineVisualizerProps {
  workflow: ParsedWorkflow | null;
}

// Custom Node Component
const JobNode = ({ data }: { data: ParsedJob & { isParallel?: boolean; estimatedDuration?: number; status?: string } }) => {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'running':
        return <Play className="w-4 h-4 text-blue-500 animate-pulse" />;
      case 'success':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'failed':
        return <XCircle className="w-4 h-4 text-red-500" />;
      case 'warning':
        return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
      default:
        return <Pause className="w-4 h-4 text-gray-400" />;
    }
  };

  const getNodeColor = (runsOn: string) => {
    if (runsOn.includes('ubuntu')) return 'bg-orange-100 border-orange-300';
    if (runsOn.includes('windows')) return 'bg-blue-100 border-blue-300';
    if (runsOn.includes('macos')) return 'bg-gray-100 border-gray-300';
    return 'bg-gray-100 border-gray-300';
  };

  return (
    <div className={`rounded-lg border-2 shadow-lg min-w-[200px] ${getNodeColor(data.runsOn)}`}>
      {/* Header */}
      <div className="bg-gray-800 text-white px-3 py-2 rounded-t-md">
        <div className="flex items-center justify-between">
          <span className="font-semibold text-sm truncate">{data.name}</span>
          {getStatusIcon(data.status || 'idle')}
        </div>
      </div>
      
      {/* Content */}
      <div className="p-3 space-y-2">
        <div className="flex items-center text-xs text-gray-600">
          <Server className="w-3 h-3 mr-1" />
          <span className="truncate">{data.runsOn}</span>
        </div>
        
        {data.environment && (
          <div className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded">
            Env: {data.environment}
          </div>
        )}
        
        {data.if && (
          <div className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">
            Condition: {data.if}
          </div>
        )}
        
        <div className="text-xs text-gray-500">
          {data.steps.length} step{data.steps.length !== 1 ? 's' : ''}
        </div>
        
        {data.estimatedDuration && (
          <div className="flex items-center text-xs text-gray-500">
            <Clock className="w-3 h-3 mr-1" />
            ~{data.estimatedDuration}min
          </div>
        )}
      </div>
      
      {/* Parallel indicator */}
      {data.isParallel && (
        <div className="absolute -top-2 -right-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full">
          Parallel
        </div>
      )}
    </div>
  );
};

const nodeTypes = {
  jobNode: JobNode,
};

const PipelineVisualizer: React.FC<PipelineVisualizerProps> = ({ workflow }) => {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  // Analyze pipeline structure
  const pipelineAnalysis = useMemo(() => {
    if (!workflow) return null;

    const jobs = workflow.jobs;
    const jobIds = Object.keys(jobs);
    
    // Group jobs by their dependency level
    const dependencyLevels: string[][] = [];
    const getDependencyLevel = (jobId: string, visited = new Set<string>()): number => {
      if (visited.has(jobId)) return 0; // Circular dependency
      visited.add(jobId);
      
      const job = jobs[jobId];
      if (!job.needs || job.needs.length === 0) return 0;
      
      return Math.max(...job.needs.map(dep => getDependencyLevel(dep, visited) + 1));
    };

    jobIds.forEach(jobId => {
      const level = getDependencyLevel(jobId);
      if (!dependencyLevels[level]) dependencyLevels[level] = [];
      dependencyLevels[level].push(jobId);
    });

    return {
      totalJobs: jobIds.length,
      dependencyLevels,
      hasParallelJobs: dependencyLevels.some(level => level.length > 1),
      maxParallelJobs: Math.max(...dependencyLevels.map(level => level.length)),
    };
  }, [workflow]);

  const generateNodesAndEdges = useCallback(() => {
    if (!workflow || !pipelineAnalysis) return { nodes: [], edges: [] };

    const jobs = workflow.jobs;
    const nodes: Node[] = [];
    const edges: Edge[] = [];
    
    const horizontalSpacing = 280;
    const verticalSpacing = 200;

    // Generate nodes based on dependency levels
    pipelineAnalysis.dependencyLevels.forEach((levelJobs, levelIndex) => {
      const levelY = levelIndex * verticalSpacing;
      const isParallelLevel = levelJobs.length > 1;
      
      levelJobs.forEach((jobId, jobIndex) => {
        const job = jobs[jobId];
        
        // Calculate position for parallel jobs
        const totalWidth = levelJobs.length * horizontalSpacing;
        const startX = -totalWidth / 2 + horizontalSpacing / 2;
        const x = startX + jobIndex * horizontalSpacing;
        
        // Estimate duration based on steps
        const estimatedDuration = Math.max(1, Math.ceil(job.steps.length * 1.5));
        
        nodes.push({
          id: jobId,
          type: 'jobNode',
          position: { x, y: levelY },
          data: {
            ...job,
            isParallel: isParallelLevel,
            estimatedDuration,
            status: 'idle', // This could be dynamic in a real implementation
          },
          draggable: true,
        });
      });
    });

    // Generate edges based on job dependencies
    Object.entries(jobs).forEach(([jobId, job]) => {
      if (job.needs) {
        job.needs.forEach((dependency, index) => {
          edges.push({
            id: `${dependency}-${jobId}-${index}`,
            source: dependency,
            target: jobId,
            type: 'smoothstep',
            animated: true,
            style: {
              stroke: '#6366f1',
              strokeWidth: 2,
            },
            markerEnd: {
              type: MarkerType.ArrowClosed,
              color: '#6366f1',
            },
          });
        });
      }
    });

    return { nodes, edges };
  }, [workflow, pipelineAnalysis]);

  useEffect(() => {
    const { nodes, edges } = generateNodesAndEdges();
    setNodes(nodes);
    setEdges(edges);
  }, [generateNodesAndEdges, setNodes, setEdges]);

  if (!workflow) {
    return (
      <div className="h-[600px] w-full bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center">
        <div className="text-center text-gray-500 dark:text-gray-400">
          <GitBranch className="w-16 h-16 mx-auto mb-4 opacity-50" />
          <p className="text-lg font-medium">No workflow loaded</p>
          <p className="text-sm">Upload a CI configuration file to visualize the pipeline</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-[600px] w-full bg-white dark:bg-gray-900 rounded-lg shadow-lg relative">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        nodeTypes={nodeTypes}
        connectionMode={ConnectionMode.Loose}
        fitView
        fitViewOptions={{
          padding: 0.2,
          includeHiddenNodes: false,
        }}
        attributionPosition="bottom-right"
        className="rounded-lg"
      >
        <Background color="#f3f4f6" gap={20} />
        <Controls className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700" />
        <MiniMap
          nodeColor={(node) => {
            const data = node.data;
            if (data.status === 'success') return '#10b981';
            if (data.status === 'failed') return '#ef4444';
            if (data.status === 'running') return '#3b82f6';
            return '#6b7280';
          }}
          className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700"
        />
        
        {/* Pipeline Statistics Panel */}
        <Panel position="top-right" className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 shadow-lg">
          <h3 className="font-semibold text-gray-800 dark:text-gray-200 mb-2">Pipeline Stats</h3>
          <div className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
            <div>Total Jobs: {pipelineAnalysis?.totalJobs}</div>
            <div>Dependency Levels: {pipelineAnalysis?.dependencyLevels.length}</div>
            <div>Max Parallel Jobs: {pipelineAnalysis?.maxParallelJobs}</div>
            <div className="flex items-center">
              <div className={`w-2 h-2 rounded-full mr-2 ${pipelineAnalysis?.hasParallelJobs ? 'bg-green-500' : 'bg-gray-400'}`} />
              {pipelineAnalysis?.hasParallelJobs ? 'Has Parallel Execution' : 'Sequential Only'}
            </div>
          </div>
        </Panel>

        {/* Workflow Info Panel */}
        <Panel position="top-left" className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 shadow-lg">
          <h3 className="font-semibold text-gray-800 dark:text-gray-200 mb-2">{workflow.name}</h3>
          <div className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
            <div>Triggers: {Object.keys(workflow.on).join(', ')}</div>
            {workflow.env && Object.keys(workflow.env).length > 0 && (
              <div>Env Vars: {Object.keys(workflow.env).length}</div>
            )}
          </div>
        </Panel>
      </ReactFlow>
    </div>
  );
};

export default PipelineVisualizer; 