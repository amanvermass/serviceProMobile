export interface Asset {
  id: string;
  assetName: string;
  status: 'Available' | 'Lent' | 'Non Functional' | 'Repairing';
  type: string;
  lentTo?: {
    name: string;
    avatar: string;
  };
  date?: string;
  serialNumber?: string;
  value?: string;
  location?: string;
  description?: string;
  history?: {
    id: string;
    personnel: { name: string; avatar: string; role?: string };
    dateGiven: string;
    estimatedReturn: string;
    dateReturned?: string;
    returnedBy?: { name: string; avatar: string; role?: string };
    notes?: string;
    status: 'Returned' | 'Currently Lent';
  }[];
}

export const mockAssets: Asset[] = [
  {
    id: "AST-001",
    assetName: "MacBook Pro 16\"",
    status: "Lent",
    type: "Hardware",
    lentTo: { name: "Aubree Zemlak", avatar: "AZ" },
    date: "2024-03-15",
    serialNumber: "SN-MBP-001",
    value: "$2400",
    location: "Bangalore HQ",
    description: "M2 Max, 32GB RAM, 1TB SSD",
    history: [
      {
        id: "REC-001",
        personnel: { name: "Cordelia Goyette", avatar: "CG", role: "UI Designer" },
        dateGiven: "2024-03-15",
        estimatedReturn: "2024-05-15",
        status: "Currently Lent",
        notes: "Project high-load design work"
      },
      {
        id: "REC-002",
        personnel: { name: "Burdette Weimann", avatar: "BW", role: "Senior Developer" },
        dateGiven: "2023-10-01",
        estimatedReturn: "2023-12-01",
        dateReturned: "2023-11-28",
        returnedBy: { name: "Dr. Delmer Kassulke", avatar: "DK", role: "IT Admin" },
        status: "Returned",
        notes: "Temporary replacement during repair"
      }
    ]
  },
  {
    id: "AST-002",
    assetName: "iPhone 15 Pro",
    status: "Available",
    type: "Hardware",
    date: "2024-03-20",
    serialNumber: "SN-IPH-002",
    value: "$999",
    location: "Mumbai Branch",
    description: "Titanium Blue, 256GB"
  },
  {
    id: "AST-003",
    assetName: "Dell UltraSharp 27\"",
    status: "Repairing",
    type: "Hardware",
    date: "2023-11-10",
    serialNumber: "SN-DEL-003",
    value: "$600",
    location: "Bangalore HQ",
    description: "4K Monitor with USB-C Hub"
  },
  {
    id: "AST-004",
    assetName: "Adobe Creative Cloud",
    status: "Lent",
    type: "Software",
    lentTo: { name: "John Doe", avatar: "JD" },
    date: "2024-01-05",
    serialNumber: "LIC-ADV-004",
    value: "$600/yr",
    location: "Remote",
    description: "Full suite license"
  },
  {
    id: "AST-005",
    assetName: "Logitech MX Master 3S",
    status: "Non Functional",
    type: "Accessory",
    date: "2023-08-22",
    serialNumber: "SN-LOG-005",
    value: "$99",
    location: "Storage",
    description: "Left click sensor issue"
  }
];

export const mockPersonnel = [
  { id: '1', name: 'Aubree Zemlak', avatar: 'AZ', department: 'Engineering' },
  { id: '2', name: 'John Doe', avatar: 'JD', department: 'Design' },
  { id: '3', name: 'Jane Smith', avatar: 'JS', department: 'Marketing' },
  { id: '4', name: 'Robert Fox', avatar: 'RF', department: 'Sales' },
  { id: '5', name: 'Cameron Williamson', avatar: 'CW', department: 'Operations' },
];
