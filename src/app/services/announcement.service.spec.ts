import { TestBed } from '@angular/core/testing';
import { AnnouncementService } from './announcement.service';
import { HierarchicalAdminService } from './hierarchical-admin.service';

describe('AnnouncementService', () => {
  let service: AnnouncementService;
  let hierarchicalService: HierarchicalAdminService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AnnouncementService);
    hierarchicalService = TestBed.inject(HierarchicalAdminService);
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
    expect(hierarchicalService).toBeTruthy();
  });

  it('should create announcement when admin is logged in', () => {
    const admin = hierarchicalService.login('minister@irrigation.up.gov.in', 'minister123');
    expect(admin).toBeTruthy();

    const announcement = service.createNewAnnouncement('Test', 'Content');
    expect(announcement).toBeTruthy();
    expect(announcement.title).toBe('Test');
  });

  it('should get announcement by id', () => {
    hierarchicalService.login('minister@irrigation.up.gov.in', 'minister123');
    const announcement = service.createNewAnnouncement('Test', 'Content');
    
    const retrieved = service.getAnnouncementById(announcement.id);
    expect(retrieved).toBeTruthy();
    expect(retrieved?.title).toBe('Test');
  });

  it('should delete announcement', () => {
    hierarchicalService.login('minister@irrigation.up.gov.in', 'minister123');
    const announcement = service.createNewAnnouncement('Test', 'Content');
    
    const success = service.deleteAnnouncement(announcement.id);
    expect(success).toBe(true);
    
    const deleted = service.getAnnouncementById(announcement.id);
    expect(deleted).toBeNull();
  });
});
