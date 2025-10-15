import { WorkflowTemplate } from "@/types/workflow";

export const workflowTemplates: WorkflowTemplate[] = [
  {
    id: "startup-idea",
    title: "Startup Idea Generator",
    description: "Generate and refine startup ideas through multi-agent collaboration",
    nodes: [
      {
        id: "researcher",
        role: "Market Researcher",
        systemPrompt: "You are a market researcher. Analyze current market trends and identify pain points in the industry. Be specific and data-driven.",
        model: "google/gemini-2.5-flash",
        temperature: 0.7,
        maxTokens: 800,
        x: 50,
        y: 50
      },
      {
        id: "strategist",
        role: "Business Strategist",
        systemPrompt: "You are a business strategist. Based on the research, propose 2-3 viable business models and competitive strategies.",
        model: "google/gemini-2.5-flash",
        temperature: 0.8,
        maxTokens: 1000,
        x: 300,
        y: 50
      },
      {
        id: "writer",
        role: "Pitch Writer",
        systemPrompt: "You are a pitch writer. Create a compelling business proposal based on the strategy, including value proposition and go-to-market approach.",
        model: "google/gemini-2.5-flash",
        temperature: 0.7,
        maxTokens: 1200,
        x: 550,
        y: 50
      },
      {
        id: "reviewer",
        role: "Critical Reviewer",
        systemPrompt: "You are a critical reviewer. Evaluate the business proposal for feasibility, risks, and areas of improvement. Be constructive but thorough.",
        model: "google/gemini-2.5-flash",
        temperature: 0.6,
        maxTokens: 800,
        x: 800,
        y: 50
      }
    ],
    edges: [
      { id: "e1", from: "researcher", to: "strategist" },
      { id: "e2", from: "strategist", to: "writer" },
      { id: "e3", from: "writer", to: "reviewer" }
    ]
  },
  {
    id: "code-review",
    title: "Code Review Pipeline",
    description: "Comprehensive code review through architecture, development, and testing phases",
    nodes: [
      {
        id: "architect",
        role: "Software Architect",
        systemPrompt: "You are a software architect. Design the high-level architecture for a system. Focus on scalability, maintainability, and best practices.",
        model: "google/gemini-2.5-flash",
        temperature: 0.7,
        maxTokens: 1000,
        x: 50,
        y: 50
      },
      {
        id: "developer",
        role: "Senior Developer",
        systemPrompt: "You are a senior developer. Write clean, well-documented code based on the architecture. Follow SOLID principles.",
        model: "google/gemini-2.5-flash",
        temperature: 0.6,
        maxTokens: 1500,
        x: 300,
        y: 50
      },
      {
        id: "tester",
        role: "QA Engineer",
        systemPrompt: "You are a QA engineer. Review the code for bugs, edge cases, and testing requirements. Suggest unit and integration tests.",
        model: "google/gemini-2.5-flash",
        temperature: 0.7,
        maxTokens: 1000,
        x: 550,
        y: 50
      },
      {
        id: "reviewer-code",
        role: "Code Reviewer",
        systemPrompt: "You are a code reviewer. Provide final review feedback on code quality, security, and performance optimizations.",
        model: "google/gemini-2.5-flash",
        temperature: 0.6,
        maxTokens: 800,
        x: 800,
        y: 50
      }
    ],
    edges: [
      { id: "e1", from: "architect", to: "developer" },
      { id: "e2", from: "developer", to: "tester" },
      { id: "e3", from: "tester", to: "reviewer-code" }
    ]
  },
  {
    id: "policy-review",
    title: "Policy Review Board",
    description: "Multi-stakeholder policy review and decision-making process",
    nodes: [
      {
        id: "legal",
        role: "Legal Counsel",
        systemPrompt: "You are legal counsel. Review policies for legal compliance, regulatory requirements, and liability concerns.",
        model: "google/gemini-2.5-flash",
        temperature: 0.5,
        maxTokens: 1000,
        x: 150,
        y: 50
      },
      {
        id: "ethics",
        role: "Ethics Officer",
        systemPrompt: "You are an ethics officer. Evaluate policies for ethical implications, fairness, and social responsibility.",
        model: "google/gemini-2.5-flash",
        temperature: 0.6,
        maxTokens: 900,
        x: 400,
        y: 150
      },
      {
        id: "finance",
        role: "Financial Analyst",
        systemPrompt: "You are a financial analyst. Assess the financial impact, cost-benefit analysis, and budget implications of policies.",
        model: "google/gemini-2.5-flash",
        temperature: 0.6,
        maxTokens: 900,
        x: 650,
        y: 150
      },
      {
        id: "chair",
        role: "Board Chairperson",
        systemPrompt: "You are the board chairperson. Synthesize all reviews and make a final recommendation with clear rationale.",
        model: "google/gemini-2.5-flash",
        temperature: 0.7,
        maxTokens: 1000,
        x: 400,
        y: 300
      }
    ],
    edges: [
      { id: "e1", from: "legal", to: "chair" },
      { id: "e2", from: "ethics", to: "chair" },
      { id: "e3", from: "finance", to: "chair" }
    ]
  },
  {
    id: "story-collab",
    title: "Story Collaboration",
    description: "Creative story development through worldbuilding, character design, and editing",
    nodes: [
      {
        id: "worldbuilder",
        role: "World Builder",
        systemPrompt: "You are a world builder. Create a rich, immersive setting with unique rules, cultures, and history for a story.",
        model: "google/gemini-2.5-flash",
        temperature: 0.9,
        maxTokens: 1200,
        x: 50,
        y: 50
      },
      {
        id: "character",
        role: "Character Designer",
        systemPrompt: "You are a character designer. Create compelling characters with distinct personalities, motivations, and arcs that fit the world.",
        model: "google/gemini-2.5-flash",
        temperature: 0.9,
        maxTokens: 1000,
        x: 300,
        y: 50
      },
      {
        id: "editor",
        role: "Story Editor",
        systemPrompt: "You are a story editor. Weave the world and characters into a cohesive narrative with strong plot structure and pacing.",
        model: "google/gemini-2.5-flash",
        temperature: 0.8,
        maxTokens: 1500,
        x: 550,
        y: 50
      },
      {
        id: "critic",
        role: "Literary Critic",
        systemPrompt: "You are a literary critic. Provide constructive feedback on themes, character development, and narrative effectiveness.",
        model: "google/gemini-2.5-flash",
        temperature: 0.7,
        maxTokens: 900,
        x: 800,
        y: 50
      }
    ],
    edges: [
      { id: "e1", from: "worldbuilder", to: "character" },
      { id: "e2", from: "character", to: "editor" },
      { id: "e3", from: "editor", to: "critic" }
    ]
  },
  {
    id: "rag-eval",
    title: "RAG Evaluation Chain",
    description: "Evaluate retrieval-augmented generation systems through retrieval, generation, and evaluation",
    nodes: [
      {
        id: "retriever",
        role: "Document Retriever",
        systemPrompt: "You are a document retriever. Search for and identify the most relevant information from knowledge bases to answer queries.",
        model: "google/gemini-2.5-flash",
        temperature: 0.5,
        maxTokens: 800,
        x: 50,
        y: 50
      },
      {
        id: "generator",
        role: "Response Generator",
        systemPrompt: "You are a response generator. Use retrieved context to generate accurate, well-cited answers. Reference sources explicitly.",
        model: "google/gemini-2.5-flash",
        temperature: 0.6,
        maxTokens: 1200,
        x: 300,
        y: 50
      },
      {
        id: "evaluator",
        role: "Quality Evaluator",
        systemPrompt: "You are a quality evaluator. Assess response accuracy, relevance, citation quality, and potential hallucinations. Provide scores and feedback.",
        model: "google/gemini-2.5-flash",
        temperature: 0.5,
        maxTokens: 800,
        x: 550,
        y: 50
      }
    ],
    edges: [
      { id: "e1", from: "retriever", to: "generator" },
      { id: "e2", from: "generator", to: "evaluator" }
    ]
  },
  {
    id: "api-design",
    title: "API Design & Implementation",
    description: "End-to-end API development from design to implementation and documentation",
    nodes: [
      {
        id: "architect",
        role: "API Architect",
        systemPrompt: "Design RESTful API endpoints, data models, and authentication strategy. Consider scalability and best practices. Output OpenAPI-style specification.",
        model: "google/gemini-2.5-flash",
        temperature: 0.6,
        maxTokens: 1200,
        x: 50,
        y: 50
      },
      {
        id: "developer",
        role: "Backend Developer",
        systemPrompt: "Implement the API based on the design. Write clean, production-ready code with error handling, validation, and proper status codes.",
        model: "google/gemini-2.5-flash",
        temperature: 0.5,
        maxTokens: 1500,
        x: 300,
        y: 50
      },
      {
        id: "doc-writer",
        role: "Technical Writer",
        systemPrompt: "Create comprehensive API documentation including endpoints, parameters, response formats, error codes, and usage examples.",
        model: "google/gemini-2.5-flash",
        temperature: 0.6,
        maxTokens: 1000,
        x: 550,
        y: 50
      }
    ],
    edges: [
      { id: "e1", from: "architect", to: "developer" },
      { id: "e2", from: "developer", to: "doc-writer" }
    ]
  },
  {
    id: "bug-investigation",
    title: "Bug Investigation & Fix",
    description: "Systematic bug analysis, root cause identification, and solution implementation",
    nodes: [
      {
        id: "debugger",
        role: "Debugger",
        systemPrompt: "Analyze the bug report, error messages, and logs. Identify symptoms and potential causes. Create a hypothesis about the root cause.",
        model: "google/gemini-2.5-flash",
        temperature: 0.5,
        maxTokens: 1000,
        x: 50,
        y: 50
      },
      {
        id: "developer",
        role: "Developer",
        systemPrompt: "Implement a fix for the identified issue. Write clean code with proper error handling. Include comments explaining the fix.",
        model: "google/gemini-2.5-flash",
        temperature: 0.5,
        maxTokens: 1200,
        x: 300,
        y: 50
      },
      {
        id: "tester",
        role: "QA Tester",
        systemPrompt: "Create test cases to verify the bug is fixed and no regressions were introduced. Test edge cases and related functionality.",
        model: "google/gemini-2.5-flash",
        temperature: 0.6,
        maxTokens: 900,
        x: 550,
        y: 50
      }
    ],
    edges: [
      { id: "e1", from: "debugger", to: "developer" },
      { id: "e2", from: "developer", to: "tester" }
    ]
  },
  {
    id: "db-schema",
    title: "Database Schema Design",
    description: "Design normalized database schema with relationships and constraints",
    nodes: [
      {
        id: "analyst",
        role: "Data Analyst",
        systemPrompt: "Analyze data requirements, identify entities, attributes, and relationships. Define data types and constraints needed.",
        model: "google/gemini-2.5-flash",
        temperature: 0.6,
        maxTokens: 1000,
        x: 50,
        y: 50
      },
      {
        id: "architect",
        role: "Database Architect",
        systemPrompt: "Design normalized schema (3NF), define primary/foreign keys, indexes, and constraints. Consider query performance and scalability.",
        model: "google/gemini-2.5-flash",
        temperature: 0.5,
        maxTokens: 1200,
        x: 300,
        y: 50
      },
      {
        id: "developer",
        role: "Database Developer",
        systemPrompt: "Write SQL migration scripts to create tables, indexes, and constraints. Include sample data and validation queries.",
        model: "google/gemini-2.5-flash",
        temperature: 0.5,
        maxTokens: 1500,
        x: 550,
        y: 50
      },
      {
        id: "reviewer",
        role: "Schema Reviewer",
        systemPrompt: "Review schema for normalization, performance bottlenecks, missing indexes, and potential issues. Suggest optimizations.",
        model: "google/gemini-2.5-flash",
        temperature: 0.6,
        maxTokens: 800,
        x: 800,
        y: 50
      }
    ],
    edges: [
      { id: "e1", from: "analyst", to: "architect" },
      { id: "e2", from: "architect", to: "developer" },
      { id: "e3", from: "developer", to: "reviewer" }
    ]
  },
  {
    id: "tech-docs",
    title: "Technical Documentation",
    description: "Create comprehensive technical documentation for developers",
    nodes: [
      {
        id: "analyst",
        role: "Code Analyst",
        systemPrompt: "Analyze the codebase, identify key components, APIs, data flows, and architecture patterns. Extract technical details.",
        model: "google/gemini-2.5-flash",
        temperature: 0.5,
        maxTokens: 1200,
        x: 50,
        y: 50
      },
      {
        id: "writer",
        role: "Technical Writer",
        systemPrompt: "Write clear, well-structured technical documentation including setup, architecture, API reference, and usage examples. Use diagrams where helpful.",
        model: "google/gemini-2.5-flash",
        temperature: 0.6,
        maxTokens: 1500,
        x: 300,
        y: 50
      },
      {
        id: "reviewer",
        role: "Documentation Reviewer",
        systemPrompt: "Review documentation for accuracy, completeness, clarity, and proper formatting. Verify code examples work. Suggest improvements.",
        model: "google/gemini-2.5-flash",
        temperature: 0.6,
        maxTokens: 800,
        x: 550,
        y: 50
      }
    ],
    edges: [
      { id: "e1", from: "analyst", to: "writer" },
      { id: "e2", from: "writer", to: "reviewer" }
    ]
  }
];