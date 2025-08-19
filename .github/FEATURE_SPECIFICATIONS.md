# 📋 Feature Specifications - UPID Suchana Portal

## 🎯 Core Feature Overview

This document provides detailed specifications for all implemented features in the UPID Suchana Portal.

## 🔐 Authentication System

### Normal User Authentication
**Location**: `src/app/pages/landing/landing.component.ts`

**Requirements**:
- Name validation (minimum 2 characters)
- Email validation (valid email format)
- No password required
- Session persistence via LocalStorage

**Validation Rules**:
```typescript
// Name validation
if (!name.trim() || name.trim().length < 2) {
  throw new ValidationError('Name must be at least 2 characters');
}

// Email validation
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
if (!emailRegex.test(email)) {
  throw new ValidationError('Please enter a valid email address');
}
```

**User Flow**:
1. User visits landing page
2. Enters name and email
3. System validates input
4. Redirects to announcement portal
5. Session stored in LocalStorage

### Admin Authentication
**Location**: `src/app/services/hierarchical-admin.service.ts`

**Hierarchy Levels** (1 = highest authority):
1. **Hon'ble Minister** - `minister@irrigation.up.gov.in` / `minister123`
2. **Principal Secretary** - `ps@irrigation.up.gov.in` / `ps123`
3. **Chief Engineer-I** - `ce1@irrigation.up.gov.in` / `ce1123`
4. **Chief Engineer-II** - `ce2@irrigation.up.gov.in` / `ce2123`
5. **Senior Staff Officer** - `sso@irrigation.up.gov.in` / `sso123`
6. **Superintending Engineer** - `se@irrigation.up.gov.in` / `se123`
7. **Executive Engineer** - `ee@irrigation.up.gov.in` / `ee123`

**Admin Flow**:
1. Admin visits `/admin` route
2. Enters email/username and password
3. System validates against hierarchical credentials
4. Redirects to admin dashboard
5. Admin session stored with role information

**Permission Matrix**:
```typescript
// Higher rank officers can view/edit/delete announcements from lower ranks
canEdit = currentAdmin.seniorityLevel <= announcementCreator.seniorityLevel;
canDelete = currentAdmin.seniorityLevel <= announcementCreator.seniorityLevel;
canView = currentAdmin.seniorityLevel <= announcementCreator.seniorityLevel;
```

## 📢 Announcement Management

### Announcement Structure
**Location**: `src/app/interfaces/announcement.ts`

```typescript
interface Announcement {
  id: string;                    // Unique identifier
  title: string;                 // Announcement title
  content: string;               // Main content body
  createdAt: Date;              // Creation timestamp
  updatedAt: Date;              // Last modification timestamp
  likes: number;                // Total like count
  likedBy: string[];            // Array of user IDs who liked
  attachments: FileAttachment[]; // File attachments
  createdBy: Admin;             // Admin who created announcement
  isPublic: boolean;            // Visibility flag
  priority: 'low' | 'medium' | 'high' | 'urgent'; // Priority level
}
```

### CRUD Operations
**Location**: `src/app/services/announcement.service.ts`

**Create Announcement**:
- Only authenticated admins can create
- Requires title and content (minimum validation)
- Optional file attachments (up to 10MB each)
- Creator information automatically attached
- Default priority: 'medium'

**Read Announcements**:
- Normal users: View latest public announcement
- Admins: View all announcements based on hierarchy
- Real-time like counts and file download statistics

**Update Announcement**:
- Only announcement creator or higher-ranked admin can edit
- All fields except ID and createdAt can be modified
- File attachments can be added/removed
- updatedAt timestamp automatically updated

**Delete Announcement**:
- Only announcement creator or higher-ranked admin can delete
- Confirmation dialog required
- Associated files are removed from storage
- Action is irreversible

### Hierarchical Access Control
```typescript
// Example: Chief Engineer-I can view/edit announcements from:
// - Chief Engineer-II (level 4)
// - Superintending Engineer (level 6) 
// - Executive Engineer (level 7)
// But cannot access Minister (level 1) or Principal Secretary (level 2) announcements
```

## 📁 File Management System

### File Upload Specifications
**Location**: `src/app/services/file.service.ts`

**Supported File Types**:
- **Documents**: PDF, DOC, DOCX, XLS, XLSX, PPT, PPTX
- **Images**: JPG, JPEG, PNG, GIF
- **Archives**: ZIP, RAR
- **Text**: TXT

**File Constraints**:
- Maximum file size: 10MB per file
- Multiple files allowed per announcement
- Base64 encoding for client-side storage
- Automatic file type detection

**Upload Process**:
1. User selects files via file input
2. File validation (type and size)
3. Base64 encoding via FileReader API
4. Storage in FileService with unique ID
5. Reference stored in announcement attachments

### Download Tracking
**Location**: `src/app/services/file.service.ts`

**Analytics Tracked**:
- Total download count per file
- User information for each download
- Download timestamp
- Unique vs repeat downloads

**Download Process**:
1. User clicks download button
2. FileService.downloadFile() called with user context
3. Download count incremented
4. User information logged in analytics
5. File data converted to downloadable blob
6. Browser initiates file download

**Real-time Synchronization**:
```typescript
// When file is downloaded:
// 1. FileService updates download count
// 2. Callback notifies AnnouncementService
// 3. AnnouncementService syncs attachment data
// 4. Admin dashboard reflects new totals immediately
```

## 🎨 User Interface Specifications

### Design System
**Framework**: Bootstrap 5 with custom CSS
**Color Scheme**: 
- Primary: Bootstrap danger (#dc3545) for UPID branding
- Secondary: Bootstrap blue (#0d6efd) for accents
- Success: Bootstrap green (#198754) for positive actions
- Warning: Bootstrap orange (#ffc107) for alerts

### Responsive Breakpoints
- **Mobile**: < 768px (stacked layout)
- **Tablet**: 768px - 1024px (adaptive layout)  
- **Desktop**: > 1024px (full layout)

### Component Specifications

#### Landing Page
**Location**: `src/app/pages/landing/landing.component.html`
- UPID logo prominently displayed (80px height)
- Bilingual welcome message (Hindi/English)
- User registration form with validation
- Clear call-to-action button
- Admin login link in bottom corner

#### Announcement Portal
**Location**: `src/app/pages/announcement/announcement.component.html`
- Navigation bar with UPID branding
- Current announcement display with full content
- File attachment preview and download section
- Like button with real-time count
- Recent viewers list (admin-only section hidden)
- Responsive file grid layout

#### Admin Dashboard
**Location**: `src/app/pages/admin-dashboard/admin-dashboard.component.html`
- Statistics cards (viewers, likes, announcements, downloads)
- Announcement creation/editing form
- File upload with preview
- Current announcement preview
- Recent viewers analytics
- Top downloaded files analytics
- Hierarchical admin tree (if user has subordinates)

### Icon System
**Library**: Bootstrap Icons
**Key Icons**:
- 📢 `bi-megaphone-fill` - Announcements
- 👤 `bi-person-circle` - Users
- 📁 `bi-file-earmark-*` - File types
- ❤️ `bi-heart-fill` - Likes
- 📊 `bi-bar-chart` - Analytics
- 🔐 `bi-shield-check` - Admin features

## 📊 Analytics & Reporting

### User Analytics
**Location**: `src/app/services/user.service.ts`

**Tracked Metrics**:
- Total portal visitors
- User registration timestamps
- Announcement view timestamps
- Like interactions
- File download behavior

**Data Structure**:
```typescript
interface User {
  id: string;
  name: string;
  email: string;
  registeredAt: Date;
  viewedAt: Date;
  hasLiked: boolean;
  downloadHistory: FileInteraction[];
}
```

### File Analytics  
**Location**: `src/app/services/file.service.ts`

**Tracked Metrics**:
- Total downloads per file
- Download history with user context
- File popularity rankings
- Download trends over time

**Admin Dashboard Displays**:
- Total Downloads counter
- Top Downloaded Files list
- File engagement metrics
- User download patterns

### Performance Analytics
- Bundle size monitoring
- Page load time tracking
- User interaction response times
- Error rate monitoring

## 🔄 Data Persistence

### LocalStorage Schema
**Announcement Data**: `announcement-portal-announcements`
```json
[
  {
    "id": "1",
    "title": "Sample Announcement",
    "content": "Announcement content...",
    "createdAt": "2025-08-19T10:00:00.000Z",
    "updatedAt": "2025-08-19T10:00:00.000Z",
    "likes": 5,
    "likedBy": ["user1", "user2"],
    "attachments": [...],
    "createdBy": {...},
    "isPublic": true,
    "priority": "medium"
  }
]
```

**User Data**: `announcement-portal-users`
**Admin Data**: `hierarchical_admins`
**File Data**: `announcement-portal-files`
**Analytics Data**: `announcement-portal-file-analytics`

### Data Synchronization
- Real-time updates between services
- Callback mechanisms for cross-service communication
- Automatic data validation and migration
- Backup and recovery procedures

## 🚀 Performance Specifications

### Loading Performance
- Initial bundle: < 250KB gzipped
- Lazy-loaded routes for optimal loading
- Image optimization with SVG logos
- Minimal external dependencies

### Runtime Performance
- Angular signals for reactive state management
- OnPush change detection strategy
- Efficient file handling with Base64 encoding
- Debounced user interactions

### Scalability Considerations
- Client-side architecture eliminates server bottlenecks
- LocalStorage capacity: ~5-10MB typical browser limit
- File attachment limits prevent storage overflow
- Hierarchical data structure for efficient filtering

## 🔒 Security Specifications

### Data Security
- All data stored client-side (no server vulnerabilities)
- No sensitive data transmission
- File type validation prevents malicious uploads
- Size limits prevent storage attacks

### Access Control Security
- Role-based permission system
- Session timeout and validation
- Admin privilege escalation prevention
- Secure credential storage patterns

### Frontend Security
- Angular's built-in XSS protection
- CSP headers for additional security
- Input sanitization and validation
- Secure file handling procedures

---

*This feature specification document should be updated whenever new features are added or existing features are modified.*
