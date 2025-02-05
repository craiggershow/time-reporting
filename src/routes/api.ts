// Authentication
POST   /api/auth/login
POST   /api/auth/logout
POST   /api/auth/reset-password

// Timesheets
GET    /api/timesheets/current          // Get current pay period timesheet
GET    /api/timesheets/previous         // Get previous pay period timesheet
GET    /api/timesheets/:id              // Get specific timesheet
POST   /api/timesheets                  // Create/update timesheet
POST   /api/timesheets/:id/submit       // Submit timesheet

// Admin Routes
GET    /api/admin/users                 // List all users
POST   /api/admin/users                 // Create user
PUT    /api/admin/users/:id             // Update user
DELETE /api/admin/users/:id             // Delete user
GET    /api/admin/timesheets            // List all timesheets
PUT    /api/admin/timesheets/:id        // Update timesheet status
GET    /api/admin/reports               // Generate reports
PUT    /api/admin/settings              // Update company settings 