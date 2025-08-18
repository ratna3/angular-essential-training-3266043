export interface Role {
  id: number;
  name: string;
  displayName: string;
  seniorityLevel: number; // 1 = highest rank (Hon'ble Minister), 10 = lowest
  department: string;
  description?: string;
}

export interface HierarchicalAdmin extends Role {
  email: string;
  password: string;
  isActive: boolean;
  createdAt: Date;
  lastLogin?: Date;
}

// Predefined roles for UP Irrigation Department
export const IRRIGATION_ROLES: Role[] = [
  {
    id: 1,
    name: 'MINISTER',
    displayName: "Hon'ble Minister",
    seniorityLevel: 1,
    department: 'Irrigation Department',
    description: 'Highest authority in the department'
  },
  {
    id: 2,
    name: 'PRINCIPAL_SECRETARY',
    displayName: 'Principal Secretary',
    seniorityLevel: 2,
    department: 'Irrigation Department',
    description: 'Administrative head of the department'
  },
  {
    id: 3,
    name: 'CHIEF_ENGINEER_I',
    displayName: 'Chief Engineer-I',
    seniorityLevel: 3,
    department: 'Technical Division',
    description: 'Senior technical authority'
  },
  {
    id: 4,
    name: 'CHIEF_ENGINEER_II',
    displayName: 'Chief Engineer-II',
    seniorityLevel: 4,
    department: 'Technical Division',
    description: 'Technical division head'
  },
  {
    id: 5,
    name: 'SENIOR_STAFF_OFFICER',
    displayName: 'Senior Staff Officer',
    seniorityLevel: 5,
    department: 'Administrative Division',
    description: 'Senior administrative officer'
  },
  {
    id: 6,
    name: 'SUPERINTENDING_ENGINEER',
    displayName: 'Superintending Engineer',
    seniorityLevel: 6,
    department: 'Technical Division',
    description: 'Regional technical head'
  },
  {
    id: 7,
    name: 'EXECUTIVE_ENGINEER',
    displayName: 'Executive Engineer',
    seniorityLevel: 7,
    department: 'Technical Division',
    description: 'Field technical officer'
  },
  {
    id: 8,
    name: 'ASSISTANT_ENGINEER',
    displayName: 'Assistant Engineer',
    seniorityLevel: 8,
    department: 'Technical Division',
    description: 'Junior technical officer'
  },
  {
    id: 9,
    name: 'JUNIOR_ENGINEER',
    displayName: 'Junior Engineer',
    seniorityLevel: 9,
    department: 'Technical Division',
    description: 'Entry-level technical position'
  },
  {
    id: 10,
    name: 'CLERICAL_STAFF',
    displayName: 'Clerical Staff',
    seniorityLevel: 10,
    department: 'Administrative Division',
    description: 'Administrative support staff'
  }
];
