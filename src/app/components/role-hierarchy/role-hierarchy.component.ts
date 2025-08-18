import { Component, Input, Output, EventEmitter, signal, OnInit, OnChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Admin } from '../../interfaces/admin';
import { HierarchicalAdminService } from '../../services/hierarchical-admin.service';

@Component({
  selector: 'app-role-hierarchy',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './role-hierarchy.component.html',
  styleUrls: ['./role-hierarchy.component.css']
})
export class RoleHierarchyComponent implements OnInit, OnChanges {
  @Input() currentUser!: Admin;
  @Output() selectOfficer = new EventEmitter<Admin>();

  public expandedDepartments = signal<Set<string>>(new Set());
  public hierarchyTree = signal<{ [department: string]: Admin[] }>({});
  public subordinateAdmins = signal<Admin[]>([]);

  constructor(private hierarchicalAdminService: HierarchicalAdminService) {
    this.loadHierarchy();
  }

  ngOnInit(): void {
    this.loadHierarchy();
    this.loadSubordinates();
  }

  ngOnChanges(): void {
    if (this.currentUser) {
      this.loadSubordinates();
    }
  }

  private loadHierarchy(): void {
    const tree = this.hierarchicalAdminService.getHierarchyTree();
    this.hierarchyTree.set(tree);
  }

  private loadSubordinates(): void {
    if (this.currentUser) {
      const subordinates = this.hierarchicalAdminService.getSubordinateAdmins(this.currentUser);
      this.subordinateAdmins.set(subordinates);
    }
  }

  public toggleDepartment(department: string): void {
    const expanded = this.expandedDepartments();
    const newExpanded = new Set(expanded);
    
    if (newExpanded.has(department)) {
      newExpanded.delete(department);
    } else {
      newExpanded.add(department);
    }
    
    this.expandedDepartments.set(newExpanded);
  }

  public isDepartmentExpanded(department: string): boolean {
    return this.expandedDepartments().has(department);
  }

  public onSelectOfficer(admin: Admin): void {
    this.selectOfficer.emit(admin);
  }

  public isSubordinate(admin: Admin): boolean {
    return this.currentUser.role.seniorityLevel < admin.role.seniorityLevel;
  }

  public isDirectSubordinate(admin: Admin): boolean {
    return this.currentUser.role.seniorityLevel + 1 === admin.role.seniorityLevel;
  }

  public getRolePriorityColor(seniorityLevel: number): string {
    if (seniorityLevel <= 2) return 'text-danger'; // Minister, Principal Secretary
    if (seniorityLevel <= 4) return 'text-warning'; // Chief Engineers
    if (seniorityLevel <= 6) return 'text-info'; // Senior Staff, Superintending Engineer
    return 'text-secondary'; // Others
  }

  public getRoleIcon(roleName: string): string {
    const roleIcons: { [key: string]: string } = {
      'MINISTER': 'bi-crown',
      'PRINCIPAL_SECRETARY': 'bi-award',
      'CHIEF_ENGINEER_I': 'bi-gear-fill',
      'CHIEF_ENGINEER_II': 'bi-gear',
      'SENIOR_STAFF_OFFICER': 'bi-person-badge',
      'SUPERINTENDING_ENGINEER': 'bi-tools',
      'EXECUTIVE_ENGINEER': 'bi-hammer',
      'ASSISTANT_ENGINEER': 'bi-wrench',
      'JUNIOR_ENGINEER': 'bi-nut',
      'CLERICAL_STAFF': 'bi-clipboard'
    };
    return roleIcons[roleName] || 'bi-person';
  }

  public getDepartmentIcon(department: string): string {
    const deptIcons: { [key: string]: string } = {
      'Irrigation Department': 'bi-droplet',
      'Technical Division': 'bi-gear-wide-connected',
      'Administrative Division': 'bi-building',
      'IT Division': 'bi-laptop'
    };
    return deptIcons[department] || 'bi-building';
  }

  public trackByAdminId(index: number, admin: Admin): string {
    return admin.id;
  }

  public getRelativeTime(date: Date): string {
    const now = new Date();
    const diff = now.getTime() - new Date(date).getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);
    
    if (days > 0) {
      return `${days}d ago`;
    } else if (hours > 0) {
      return `${hours}h ago`;
    } else {
      return 'Just now';
    }
  }

  public getDepartmentCount(): number {
    return Object.keys(this.hierarchyTree()).length;
  }

  public getActiveOfficersCount(): number {
    const tree = this.hierarchyTree();
    let count = 0;
    Object.values(tree).forEach(admins => {
      count += admins.filter(admin => admin.isActive).length;
    });
    return count;
  }
}
