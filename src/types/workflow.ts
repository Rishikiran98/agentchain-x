export interface WorkflowNode {
  id: string;
  role: string;
  systemPrompt: string;
  model: string;
  temperature: number;
  maxTokens: number;
  x: number;
  y: number;
}

export interface WorkflowEdge {
  id: string;
  from: string;
  to: string;
}

export interface WorkflowTemplate {
  id: string;
  title: string;
  description: string;
  nodes: WorkflowNode[];
  edges: WorkflowEdge[];
}