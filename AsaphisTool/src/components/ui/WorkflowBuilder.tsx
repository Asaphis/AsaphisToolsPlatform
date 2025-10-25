'use client';

import { useState, useCallback, useRef } from 'react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { compressImageFile, resizeImageFile, mergePdfFiles } from '@/lib/processors';

interface WorkflowStep {
  id: string;
  toolId: string;
  toolName: string;
  icon: string;
  settings: Record<string, any>;
  conditions?: {
    fileSize?: { operator: 'gt' | 'lt', value: number, unit: 'MB' | 'KB' };
    fileType?: string[];
  };
}

interface Workflow {
  id: string;
  name: string;
  description: string;
  steps: WorkflowStep[];
  isPublic: boolean;
  createdAt: Date;
  usageCount: number;
}

const availableTools = [
  { id: 'image-compressor', name: 'Image Compressor', icon: '🗜️', category: 'image' },
  { id: 'image-resizer', name: 'Image Resizer', icon: '📏', category: 'image' },
  { id: 'image-format-converter', name: 'Format Converter', icon: '🔄', category: 'image' },
  { id: 'background-remover', name: 'Background Remover', icon: '✂️', category: 'image' },
  { id: 'pdf-merger', name: 'PDF Merger', icon: '📄', category: 'pdf' },
  { id: 'pdf-compressor', name: 'PDF Compressor', icon: '🗜️', category: 'pdf' },
];

export function WorkflowBuilder() {
  const [workflows, setWorkflows] = useState<Workflow[]>([]);
  const [currentWorkflow, setCurrentWorkflow] = useState<Workflow>({
    id: '',
    name: '',
    description: '',
    steps: [],
    isPublic: false,
    createdAt: new Date(),
    usageCount: 0
  });
  const [isEditing, setIsEditing] = useState(false);
  const [showTemplates, setShowTemplates] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Predefined workflow templates
  const workflowTemplates = [
    {
      name: 'Image Optimization Pipeline',
      description: 'Compress → Resize → Convert to WebP',
      steps: [
        { toolId: 'image-compressor', settings: { quality: 80 } },
        { toolId: 'image-resizer', settings: { maxWidth: 1920, maxHeight: 1080 } },
        { toolId: 'image-format-converter', settings: { format: 'webp' } }
      ]
    },
    {
      name: 'Social Media Ready',
      description: 'Remove background → Resize for platforms → Compress',
      steps: [
        { toolId: 'background-remover', settings: {} },
        { toolId: 'image-resizer', settings: { width: 1080, height: 1080 } },
        { toolId: 'image-compressor', settings: { quality: 90 } }
      ]
    },
    {
      name: 'Document Processing',
      description: 'Merge PDFs → Compress for email',
      steps: [
        { toolId: 'pdf-merger', settings: {} },
        { 
          toolId: 'pdf-compressor', 
          settings: { quality: 'medium' },
          conditions: { fileSize: { operator: 'gt', value: 5, unit: 'MB' } }
        }
      ]
    }
  ];

  const addToolToWorkflow = (tool: typeof availableTools[0]) => {
    const newStep: WorkflowStep = {
      id: Date.now().toString(),
      toolId: tool.id,
      toolName: tool.name,
      icon: tool.icon,
      settings: {}
    };

    setCurrentWorkflow(prev => ({
      ...prev,
      steps: [...prev.steps, newStep]
    }));
  };

  const removeStepFromWorkflow = (stepId: string) => {
    setCurrentWorkflow(prev => ({
      ...prev,
      steps: prev.steps.filter(step => step.id !== stepId)
    }));
  };

  const onDragEnd = (result: any) => {
    if (!result.destination) return;

    const newSteps = Array.from(currentWorkflow.steps);
    const [reorderedItem] = newSteps.splice(result.source.index, 1);
    newSteps.splice(result.destination.index, 0, reorderedItem);

    setCurrentWorkflow(prev => ({
      ...prev,
      steps: newSteps
    }));
  };

  const saveWorkflow = () => {
    if (!currentWorkflow.name.trim()) return;

    const workflowToSave = {
      ...currentWorkflow,
      id: currentWorkflow.id || Date.now().toString(),
      createdAt: currentWorkflow.createdAt || new Date()
    };

    if (isEditing) {
      setWorkflows(prev => prev.map(w => w.id === workflowToSave.id ? workflowToSave : w));
    } else {
      setWorkflows(prev => [...prev, workflowToSave]);
    }

    setCurrentWorkflow({
      id: '',
      name: '',
      description: '',
      steps: [],
      isPublic: false,
      createdAt: new Date(),
      usageCount: 0
    });
    setIsEditing(false);
  };

  const loadTemplate = (template: any) => {
    const templateSteps = template.steps.map((step: any) => ({
      id: Date.now().toString() + Math.random(),
      toolId: step.toolId,
      toolName: availableTools.find(t => t.id === step.toolId)?.name || step.toolId,
      icon: availableTools.find(t => t.id === step.toolId)?.icon || '🔧',
      settings: step.settings,
      conditions: step.conditions
    }));

    setCurrentWorkflow({
      id: '',
      name: template.name,
      description: template.description,
      steps: templateSteps,
      isPublic: false,
      createdAt: new Date(),
      usageCount: 0
    });
    setShowTemplates(false);
  };

  const executeWorkflow = async (files: File[]) => {
    if (currentWorkflow.steps.length === 0 || files.length === 0) return;

    let workingSet: File[] = [...files];
    for (const step of currentWorkflow.steps) {
      if (step.toolId === 'image-compressor') {
        const outputs: File[] = [];
        for (const f of workingSet.filter(f => f.type.startsWith('image/'))) {
          const { blob, name } = await compressImageFile(f, step.settings || {});
          outputs.push(new File([blob], name, { type: blob.type }));
        }
        // keep non-images untouched
        workingSet = [...outputs, ...workingSet.filter(f => !f.type.startsWith('image/'))];
      } else if (step.toolId === 'image-resizer') {
        const { width = 1920, height = 1080, maintainAspectRatio = true, resizeMode = 'fit' } = step.settings || {};
        const outputs: File[] = [];
        for (const f of workingSet.filter(f => f.type.startsWith('image/'))) {
          const { blob, name } = await resizeImageFile(f, { width, height, maintainAspectRatio, mode: resizeMode });
          outputs.push(new File([blob], name, { type: blob.type }));
        }
        workingSet = [...outputs, ...workingSet.filter(f => !f.type.startsWith('image/'))];
      } else if (step.toolId === 'pdf-merger') {
        const pdfs = workingSet.filter(f => f.type === 'application/pdf');
        if (pdfs.length > 0) {
          const { blob, name } = await mergePdfFiles(pdfs, (step.settings?.fileName as string) || 'merged-document.pdf');
          // replace pdfs with single merged pdf
          const mergedFile = new File([blob], name, { type: 'application/pdf' });
          workingSet = [mergedFile, ...workingSet.filter(f => f.type !== 'application/pdf')];
        }
      }
    }

    // Download results
    for (const f of workingSet) {
      const url = URL.createObjectURL(f);
      const a = document.createElement('a');
      a.href = url; a.download = f.name; document.body.appendChild(a); a.click(); document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Workflow Builder
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Create custom tool chains to automate your file processing
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <input ref={fileInputRef} type="file" multiple onChange={(e) => setSelectedFiles(Array.from(e.target.files || []))} className="hidden" />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
          >
            📁 Select Files
          </button>
          <button
            onClick={() => setShowTemplates(!showTemplates)}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
          >
            📋 Templates
          </button>
          <button
            onClick={() => setCurrentWorkflow({
              id: '',
              name: '',
              description: '',
              steps: [],
              isPublic: false,
              createdAt: new Date(),
              usageCount: 0
            })}
            className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
          >
            ➕ New Workflow
          </button>
        </div>
      </div>

      {/* Templates Modal */}
      {showTemplates && (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Workflow Templates
            </h3>
            <button
              onClick={() => setShowTemplates(false)}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              ✕
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {workflowTemplates.map((template, index) => (
              <div
                key={index}
                className="p-4 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer"
                onClick={() => loadTemplate(template)}
              >
                <h4 className="font-medium text-gray-900 dark:text-white mb-2">
                  {template.name}
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                  {template.description}
                </p>
                <div className="flex items-center space-x-2">
                  {template.steps.map((step, stepIndex) => (
                    <div key={stepIndex} className="flex items-center">
                      <span className="text-xs bg-gray-100 dark:bg-gray-600 px-2 py-1 rounded">
                        {availableTools.find(t => t.id === step.toolId)?.icon}
                      </span>
                      {stepIndex < template.steps.length - 1 && (
                        <span className="mx-1 text-gray-400">→</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Tool Library */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Available Tools
          </h3>
          <div className="space-y-2">
            {availableTools.map((tool) => (
              <div
                key={tool.id}
                className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 cursor-pointer"
                onClick={() => addToolToWorkflow(tool)}
              >
                <div className="flex items-center space-x-3">
                  <span className="text-2xl">{tool.icon}</span>
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {tool.name}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 capitalize">
                      {tool.category}
                    </p>
                  </div>
                </div>
                <button className="text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300">
                  ➕
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Workflow Builder */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Current Workflow
          </h3>

          {/* Workflow Info */}
          <div className="space-y-4 mb-6">
            <input
              type="text"
              placeholder="Workflow name"
              value={currentWorkflow.name}
              onChange={(e) => setCurrentWorkflow(prev => ({ ...prev, name: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
            <textarea
              placeholder="Description (optional)"
              value={currentWorkflow.description}
              onChange={(e) => setCurrentWorkflow(prev => ({ ...prev, description: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              rows={2}
            />
          </div>

          {/* Workflow Steps */}
          <DragDropContext onDragEnd={onDragEnd}>
            <Droppable droppableId="workflow-steps">
              {(provided) => (
                <div
                  {...provided.droppableProps}
                  ref={provided.innerRef}
                  className="space-y-3 min-h-32"
                >
                  {currentWorkflow.steps.length === 0 ? (
                    <div className="text-center text-gray-500 dark:text-gray-400 py-8 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg">
                      Add tools from the left to build your workflow
                    </div>
                  ) : (
                    currentWorkflow.steps.map((step, index) => (
                      <Draggable key={step.id} draggableId={step.id} index={index}>
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            className={`flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg ${
                              snapshot.isDragging ? 'shadow-lg' : ''
                            }`}
                          >
                            <div className="flex items-center space-x-3">
                              <span className="text-sm text-gray-500 dark:text-gray-400">
                                {index + 1}
                              </span>
                              <span className="text-xl">{step.icon}</span>
                              <div>
                                <p className="text-sm font-medium text-gray-900 dark:text-white">
                                  {step.toolName}
                                </p>
                                {step.conditions && (
                                  <p className="text-xs text-blue-600 dark:text-blue-400">
                                    Conditional
                                  </p>
                                )}
                              </div>
                            </div>
                            <button
                              onClick={() => removeStepFromWorkflow(step.id)}
                              className="text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300"
                            >
                              🗑️
                            </button>
                          </div>
                        )}
                      </Draggable>
                    ))
                  )}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </DragDropContext>

          {/* Actions */}
          <div className="flex items-center justify-between mt-6 pt-6 border-t border-gray-200 dark:border-gray-600">
            <div className="flex items-center space-x-2">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={currentWorkflow.isPublic}
                  onChange={(e) => setCurrentWorkflow(prev => ({ ...prev, isPublic: e.target.checked }))}
                  className="rounded border-gray-300 dark:border-gray-600"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">
                  Make public
                </span>
              </label>
              <span className="text-xs text-gray-500 dark:text-gray-400">Selected files: {selectedFiles.length}</span>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => executeWorkflow(selectedFiles)}
                disabled={currentWorkflow.steps.length === 0 || selectedFiles.length === 0}
                className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                ▶️ Run Workflow
              </button>
              <button
                onClick={saveWorkflow}
                disabled={!currentWorkflow.name.trim() || currentWorkflow.steps.length === 0}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                💾 Save Workflow
              </button>
            </div>
          </div>
        </div>

        {/* Saved Workflows */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Saved Workflows ({workflows.length})
          </h3>
          <div className="space-y-3">
            {workflows.length === 0 ? (
              <p className="text-gray-500 dark:text-gray-400 text-center py-4">
                No saved workflows yet
              </p>
            ) : (
              workflows.map((workflow) => (
                <div
                  key={workflow.id}
                  className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600"
                >
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="font-medium text-gray-900 dark:text-white">
                      {workflow.name}
                    </h4>
                    <div className="flex items-center space-x-2">
                      {workflow.isPublic && (
                        <span className="text-xs bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 px-2 py-1 rounded">
                          Public
                        </span>
                      )}
                      <button
                        onClick={() => {
                          setCurrentWorkflow(workflow);
                          setIsEditing(true);
                        }}
                        className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300"
                      >
                        ✏️
                      </button>
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                    {workflow.steps.length} steps • Used {workflow.usageCount} times
                  </p>
                  <div className="flex items-center space-x-1">
                    {workflow.steps.slice(0, 5).map((step, index) => (
                      <div key={step.id} className="flex items-center">
                        <span className="text-sm">{step.icon}</span>
                        {index < Math.min(workflow.steps.length - 1, 4) && (
                          <span className="mx-1 text-xs text-gray-400">→</span>
                        )}
                      </div>
                    ))}
                    {workflow.steps.length > 5 && (
                      <span className="text-xs text-gray-400">+{workflow.steps.length - 5}</span>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
