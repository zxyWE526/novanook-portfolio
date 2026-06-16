export interface GraphNode {
  id: string;
  name: string;
  subject: string;
  subjectId: string;
  category?: string;
  difficulty: number;
  questionCount: number;
  wrongCount: number;
}

export type EdgeRelation = 'prerequisite' | 'related' | 'part_of';

export interface GraphEdge {
  id?: string;
  source: string;
  target: string;
  relation: EdgeRelation;
  relationship?: EdgeRelation;
  weight: number;
}

export interface KnowledgeGraph {
  nodes: GraphNode[];
  edges: GraphEdge[];
}
