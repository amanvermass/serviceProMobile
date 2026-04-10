export interface PMS_Task {
  id: string;
  code: string;
  employeeName: string;
  taskDate: string;
  dueDate: string;
  project: string;
  taskDescription: string;
  hoursSpent: number;
  estimatedTime: string;
  status: 'completed' | 'in-progress' | 'review' | 'todo';
  priority: 'low' | 'medium' | 'high' | 'critical';
  category: string;
  assignedTo: {
    name: string;
    avatar: string;
  };
}

export const mockTasks: PMS_Task[] = [
  {
    id: "TASK-001",
    code: "APP_STP-12",
    employeeName: "Alice Smith",
    taskDate: "2026-04-06",
    dueDate: "2026-04-10",
    project: "Service Track Pro",
    taskDescription: "Ported Vendor Management UI to mobile.",
    hoursSpent: 4.5,
    estimatedTime: "8h",
    status: "completed",
    priority: "high",
    category: "Development",
    assignedTo: { name: "Alice Smith", avatar: "AS" },
  },
  {
    id: "TASK-002",
    code: "APP_CP-05",
    employeeName: "Bob Jones",
    taskDate: "2026-04-06",
    dueDate: "2026-04-08",
    project: "Client Portal",
    taskDescription: "Fixing SMTP email settings configuration.",
    hoursSpent: 3.0,
    estimatedTime: "12h",
    status: "in-progress",
    priority: "medium",
    category: "Backend",
    assignedTo: { name: "Bob Jones", avatar: "BJ" },
  },
  {
    id: "TASK-003",
    code: "APP_STP-10",
    employeeName: "Alice Smith",
    taskDate: "2026-04-05",
    dueDate: "2026-04-05",
    project: "Service Track Pro",
    taskDescription: "Setup PMS navigation menu and dashboard.",
    hoursSpent: 5.0,
    estimatedTime: "6h",
    status: "completed",
    priority: "high",
    category: "Development",
    assignedTo: { name: "Alice Smith", avatar: "AS" },
  },
  {
    id: "TASK-004",
    code: "APP_INT-02",
    employeeName: "Charlie Brown",
    taskDate: "2026-04-06",
    dueDate: "2026-04-12",
    project: "Internal Tools",
    taskDescription: "Updating AI Overview Tab styles.",
    hoursSpent: 6.5,
    estimatedTime: "10h",
    status: "review",
    priority: "low",
    category: "UI Design",
    assignedTo: { name: "Charlie Brown", avatar: "CB" },
  },
];

export const mockPMSProjects = [
  "Service Track Pro",
  "Client Portal",
  "Internal Tools",
  "E-Commerce App",
  "Health Dashboard"
];

export const mockPMSEmployees = [
  { name: "Alice Smith", avatar: "AS", role: "Frontend Developer" },
  { name: "Bob Jones", avatar: "BJ", role: "Backend Developer" },
  { name: "Charlie Brown", avatar: "CB", role: "UI Designer" },
  { name: "David Wilson", avatar: "DW", role: "System Architect" },
];
