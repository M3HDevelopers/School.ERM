/**
 * SCHOOL MANAGEMENT ERP - SOFTWARE OWNER / DEVELOPER PANEL TYPES
 * 
 * Core Principle: Tenant Isolation & Privacy
 * The owner panel manages licenses, subscriptions, and metadata.
 * It does NOT expose student/teacher operational data by default.
 * 
 * IMPORTANT DATA BOUNDARY:
 * - Student, parent, teacher records remain inside tenant environment
 * - Developer panel manages: customer account, license, subscription, configuration, enabled modules, usage metrics
 * - Support access must be explicit, permissioned, time-limited and fully audited
 */

// ==========================================
// 1. STATUS ENUMS & CONSTANTS (Complete Status Model)
// ==========================================

export type TenantStatus = 
  | 'pending'           // Tenant created but activation not completed
  | 'trial'             // Free trial is active
  | 'trial_expiring'    // Trial is near expiry (7 days threshold)
  | 'active_paid'       // Paid license/subscription is active
  | 'grace'             // Payment/license ended but temporary access remains
  | 'suspended'         // Access blocked by owner action or policy
  | 'expired'           // License or trial ended, access blocked
  | 'cancelled'         // Commercial relationship cancelled
  | 'revoked'           // License explicitly revoked, requires authorized reissue
  | 'archived'          // Retained for historical records, not operational
  | 'deleted';          // Completed approved data-deletion workflow

export type LicenseType = 'trial' | 'monthly' | 'annual' | 'permanent' | 'custom';

export type InstitutionType = 'school' | 'college' | 'academy' | 'training_institute' | 'university';

export type PaymentStatus = 'pending' | 'paid' | 'partial' | 'overdue' | 'refunded' | 'failed';

export type SupportTicketPriority = 'low' | 'medium' | 'high' | 'critical';

export type SupportTicketStatus = 'open' | 'in_progress' | 'waiting_customer' | 'resolved' | 'closed';

export type InternalRoleType = 
  | 'super_owner'        // All controls
  | 'license_manager'    // Trials, subscriptions, licenses
  | 'sales_manager'      // Customer records, trials, onboarding
  | 'support_operator'   // Support, diagnostics, impersonation
  | 'finance_operator'   // Invoices, payments, refunds
  | 'technical_operator' // Integrations, system health, API
  | 'auditor'            // Read-only reports and audit logs
  | 'custom';            // Selected permissions

// ==========================================
// 2. MODULES & ENTITLEMENTS (Feature Control Layer)
// ==========================================

export type ModuleId = 
  | 'students' | 'parents' | 'teachers' | 'staff'
  | 'admissions' | 'attendance' | 'timetable' | 'homework' | 'assignments'
  | 'exams' | 'results' | 'report_cards' | 'fees' | 'online_payments'
  | 'payroll' | 'hr' | 'library' | 'transport' | 'inventory' | 'assets'
  | 'hostel' | 'health' | 'discipline' | 'certificates' | 'documents'
  | 'notifications' | 'sms' | 'email' | 'push' | 'whatsapp'
  | 'reports' | 'custom_reports' | 'analytics' | 'public_website' | 'cms'
  | 'student_portal' | 'parent_portal' | 'teacher_portal' | 'admin_portal'
  | 'api_access' | 'custom_domain' | 'mobile_pwa' | 'multi_campus'
  | 'advanced_analytics' | 'automation' | 'workflows' | 'support_helpdesk';

export interface ModuleEntitlement {
  moduleId: ModuleId;
  moduleName: string;
  enabled: boolean;
  permissions: {
    read: boolean;
    create: boolean;
    edit: boolean;
    delete: boolean;
    export: boolean;
    print: boolean;
    import: boolean;
    bulkAction: boolean;
    approval: boolean;
    financialApproval: boolean;
  };
  campusRestrictions?: string[]; // Campus IDs where allowed
  roleRestrictions?: string[];   // Roles that can access
  entitlementSource: 'plan' | 'custom_package' | 'trial' | 'manual_override';
  overrideStart?: string; // ISO date for temporary overrides
  overrideEnd?: string;
  overrideReason?: string;
}

export interface FeatureFlags {
  customDomain: boolean;
  whiteLabel: boolean;
  apiAccess: boolean;
  mobilePWA: boolean;
  multiCampus: boolean;
  advancedAnalytics: boolean;
  automationWorkflows: boolean;
  smsIntegration: boolean;
  whatsappIntegration: boolean;
  emailIntegration: boolean;
  pushNotifications: boolean;
  onlinePayments: boolean;
  biometricIntegration: boolean;
  gpsTransport: boolean;
  studentPortal: boolean;
  parentPortal: boolean;
  teacherPortal: boolean;
  publicWebsiteCMS: boolean;
}

// ==========================================
// 3. LIMITS & QUOTAS
// ==========================================

export interface TenantLimits {
  maxCampuses: number;
  maxUsers: number;
  maxStudents: number;
  maxStaff: number;
  maxParents: number;
  storageGB: number;
  apiCallsPerMonth: number;
  smsQuota: number;
  emailQuota: number;
  whatsappQuota: number;
  customIntegrations: number;
  maxClasses?: number;
  maxSections?: number;
  documentCount?: number;
  reportGenerations?: number;
  paymentTransactions?: number;
}

export interface UsageMetrics {
  currentCampuses: number;
  activeUsers: number;
  totalStudents: number;
  totalStaff: number;
  totalParents: number;
  storageUsedGB: number;
  apiCallsThisMonth: number;
  smsUsed: number;
  emailUsed: number;
  whatsappUsed: number;
  documentCount: number;
  lastActiveDate: string;
  peakUsageDate?: string;
  peakUsageValue?: number;
  limitReachedWarnings: string[];
  usagePercentage: {
    students: number;
    users: number;
    storage: number;
    api: number;
    sms: number;
  };
}

// ==========================================
// 4. CUSTOMER / TENANT ACCOUNT
// ==========================================

export interface CustomerOwner {
  id: string;
  tenantId: string;
  fullName: string;
  businessEmail: string;
  businessPhone: string;
  institutionContactDetails: string;
  cnicOrIdentity?: string; // Masked by default, only when legally required
  identityVerified: boolean;
  designation: string;
  ownershipAuthorizationNotes?: string;
  secondaryContact?: {
    name: string;
    phone: string;
    email?: string;
    authorizationLevel: 'full' | 'limited';
  };
  emergencyContact?: {
    name: string;
    phone: string;
    relation: string;
  };
  authorizationDocuments?: string[]; // URLs to uploaded docs
  username: string;
  forcePasswordChange: boolean;
  lastLoginAt?: string;
  lastPasswordChangeAt?: string;
  twoFactorEnabled: boolean;
  backupAuthMethod?: string;
  accountDisabled: boolean;
  loginLocked: boolean;
  failedLoginAttempts: number;
  lockedUntil?: string;
  createdAt: string;
  updatedAt: string;
  verificationStatus: 'pending' | 'verified' | 'rejected';
  accountHistory: {
    action: string;
    timestamp: string;
    actor: string;
    details?: string;
  }[];
}

export interface Tenant {
  id: string;
  tenantCode: string; // Unique short code
  accountNumber: string;
  institutionName: string;
  institutionType: InstitutionType;
  status: TenantStatus;
  
  // Configuration
  country: string;
  timezone: string;
  currency: string;
  allowedCampuses: number;
  
  // Commercial Metadata
  customerManagerId?: string;
  supportContactId?: string;
  sourceChannel: 'website' | 'referral' | 'direct_sales' | 'partner' | 'facebook' | 'whatsapp' | 'walk_in';
  commercialTags: string[];
  segmentation: 'SMB' | 'Enterprise' | 'Institution' | 'Individual';
  
  // Onboarding & Contract
  onboardingStatus: 'not_started' | 'in_progress' | 'completed' | 'blocked';
  deploymentStatus: 'pending' | 'deployed' | 'migrated' | 'archived';
  contractStatus: 'draft' | 'signed' | 'expired' | 'terminated';
  
  // Notes (Internal - Not visible to customer)
  internalNotes?: string;
  salesNotes?: string;
  supportNotes?: string;
  
  // Timestamps
  createdAt: string;
  activatedAt?: string;
  trialStartedAt?: string;
  trialEndsAt?: string;
  trialPausedAt?: string;
  trialPauseReason?: string;
  subscriptionStartsAt?: string;
  subscriptionEndsAt?: string;
  gracePeriodStartsAt?: string;
  gracePeriodEndsAt?: string;
  lastBillingDate?: string;
  nextBillingDate?: string;
  suspendedAt?: string;
  suspendedReason?: string;
  cancelledAt?: string;
  cancellationReason?: string;
  archivedAt?: string;
  deletedAt?: string;
  
  // Relations
  owners: CustomerOwner[];
  currentLicenseId: string;
  currentSubscriptionId?: string;
  currentPlanId: string;
  
  // Aggregated Usage (No student details - privacy boundary)
  usage: UsageMetrics;
  limits: TenantLimits;
  
  // Health Status
  healthStatus: {
    lastBackupSuccess?: string;
    lastBackupFailed?: string;
    lastIntegrationSync?: string;
    lastAPIError?: string;
    lastPaymentAttempt?: string;
    lastPaymentStatus?: string;
    hasCriticalErrors: boolean;
    inactiveDays: number;
    onboardingCompletionPercent: number;
    supportTicketHealth: 'good' | 'warning' | 'critical';
  };
  
  // Environment & Deployment
  subdomain?: string;
  customDomain?: string;
  domainVerified: boolean;
  sslStatus: 'pending' | 'active' | 'expired';
  deploymentEnvironment: 'production' | 'staging' | 'development';
  versionBuild?: string;
  maintenanceMode: boolean;
}

// ==========================================
// 5. PLANS, LICENSES & SUBSCRIPTIONS
// ==========================================

export interface Plan {
  id: string;
  code: string;
  name: string;
  type: 'monthly' | 'annual' | 'permanent' | 'custom';
  price: number;
  currency: string;
  billingInterval: 'month' | 'year' | 'once';
  setupFee?: number;
  taxRate?: number;
  
  // Limits
  limits: TenantLimits;
  
  // Features
  includedModules: string[];
  excludedModules: string[];
  featureFlags: FeatureFlags;
  
  // Support & SLA
  supportLevel: 'basic' | 'standard' | 'premium' | 'enterprise';
  backupRetentionDays: number;
  
  // Availability
  isActive: boolean;
  isPublic: boolean; // Can customers self-select
  minContractMonths?: number;
  
  createdAt: string;
  archivedAt?: string;
}

export interface AddOn {
  id: string;
  code: string;
  name: string;
  description: string;
  type: 'recurring' | 'one_time';
  price: number;
  billingInterval?: 'month' | 'year';
  linkedModuleIds?: string[];
  isActive: boolean;
}

export interface License {
  id: string;
  licenseKey?: string; // For permanent/activation
  tenantId: string;
  type: LicenseType;
  status: 'pending' | 'active' | 'grace' | 'expired' | 'suspended' | 'revoked' | 'cancelled';
  
  planId: string;
  planSnapshot: Plan; // Snapshot of plan at time of issue
  
  // Dates
  activationDate: string;
  expiryDate?: string; // Null for permanent
  renewalDate?: string;
  gracePeriodEndsAt?: string;
  
  // Entitlements (Custom overrides possible)
  limits: TenantLimits;
  modules: ModuleEntitlement[];
  featureFlags: FeatureFlags;
  
  // History
  suspendedAt?: string;
  suspendedReason?: string;
  revokedAt?: string;
  revokedReason?: string;
  transferredFromTenantId?: string;
  transferReason?: string;
  
  createdAt: string;
  updatedAt: string;
}

export interface Subscription {
  id: string;
  tenantId: string;
  licenseId: string;
  planId: string;
  status: 'active' | 'trialing' | 'past_due' | 'canceled' | 'unpaid';
  
  currentPeriodStart: string;
  currentPeriodEnd: string;
  cancelAtPeriodEnd: boolean;
  canceledAt?: string;
  cancellationReason?: string;
  
  trialStart?: string;
  trialEnd?: string;
  trialDaysRemaining?: number;
  
  createdAt: string;
  updatedAt: string;
}

// ==========================================
// 6. BILLING & INVOICES
// ==========================================

export interface Invoice {
  id: string;
  invoiceNumber: string;
  tenantId: string;
  subscriptionId?: string;
  licenseId: string;
  
  billingPeriodStart: string;
  billingPeriodEnd: string;
  
  items: {
    description: string;
    amount: number;
    type: 'subscription' | 'addon' | 'setup_fee' | 'usage_overage' | 'custom_charge';
    addonId?: string;
  }[];
  
  subtotal: number;
  taxAmount: number;
  discountAmount: number;
  totalAmount: number;
  amountPaid: number;
  balanceDue: number;
  
  status: PaymentStatus;
  paymentMethod?: 'card' | 'bank_transfer' | 'cash' | 'check' | 'other';
  transactionReference?: string;
  paidAt?: string;
  
  dueDate: string;
  createdAt: string;
}

export interface Payment {
  id: string;
  invoiceId: string;
  tenantId: string;
  amount: number;
  method: string;
  transactionRef: string;
  status: 'success' | 'failed' | 'pending' | 'refunded';
  paidAt: string;
  notes?: string;
}

// ==========================================
// 7. SUPPORT & IMPERSONATION
// ==========================================

export interface SupportTicket {
  id: string;
  ticketNumber: string;
  tenantId: string;
  submittedBy: string; // Owner ID or System
  assignedTo?: string; // Internal Operator ID
  
  priority: SupportTicketPriority;
  status: SupportTicketStatus;
  category: 'technical' | 'billing' | 'feature_request' | 'bug' | 'onboarding' | 'security';
  
  subject: string;
  description: string;
  
  slaTarget?: string; // ISO date
  firstResponseAt?: string;
  resolvedAt?: string;
  
  messages: {
    id: string;
    senderType: 'customer' | 'operator' | 'system';
    senderId: string;
    message: string;
    isInternalNote: boolean;
    attachments?: string[];
    createdAt: string;
  }[];
  
  linkedLicenseId?: string;
  linkedIncidentId?: string;
  
  satisfactionRating?: 1 | 2 | 3 | 4 | 5;
  feedbackComment?: string;
  
  createdAt: string;
  updatedAt: string;
}

export interface ImpersonationSession {
  id: string;
  operatorId: string;
  operatorName: string;
  targetTenantId: string;
  targetUserId: string;
  
  reason: string;
  startedAt: string;
  expiresAt: string;
  endedAt?: string;
  
  permissions: 'read_only' | 'full_access';
  blockedModules: string[];
  
  actionsLog: {
    timestamp: string;
    action: string;
    module?: string;
    details?: string;
  }[];
  
  status: 'active' | 'ended' | 'expired' | 'terminated';
}

// ==========================================
// 8. AUDIT LOGS & SECURITY
// ==========================================

export interface AuditLog {
  id: string;
  timestamp: string;
  actorType: 'owner' | 'internal_operator' | 'system' | 'api';
  actorId: string;
  actorName?: string;
  
  action: string;
  category: 'tenant_management' | 'license' | 'billing' | 'security' | 'support' | 'system_config';
  
  targetEntityType: 'tenant' | 'license' | 'user' | 'plan' | 'invoice';
  targetEntityId: string;
  targetEntityName?: string;
  
  changes?: {
    field: string;
    oldValue: any;
    newValue: any;
  }[];
  
  reason?: string; // Required for sensitive actions
  ipAddress?: string;
  userAgent?: string;
  outcome: 'success' | 'failure' | 'partial';
  errorMessage?: string;
}

export interface SecurityEvent {
  id: string;
  timestamp: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  type: 
    | 'failed_login_attempt' 
    | 'account_lockout' 
    | 'suspicious_trial_pattern' 
    | 'license_fraud_detected' 
    | 'abnormal_api_usage' 
    | 'unauthorized_impersonation' 
    | 'data_export_request' 
    | 'privilege_escalation_attempt';
  
  tenantId?: string;
  userId?: string;
  description: string;
  metadata: Record<string, any>;
  acknowledged: boolean;
  acknowledgedBy?: string;
  resolved: boolean;
}

// ==========================================
// 9. INTERNAL USERS & ROLES
// ==========================================

export interface InternalPermission {
  resource: string;
  actions: ('create' | 'read' | 'update' | 'delete' | 'export' | 'impersonate' | 'approve')[];
  conditions?: Record<string, any>;
}

export interface InternalRole {
  id: string;
  name: string;
  type: InternalRoleType;
  description: string;
  permissions: InternalPermission[];
  requires2FA: boolean;
  isSystemRole: boolean;
  createdAt: string;
}

export interface InternalUser {
  id: string;
  name: string;
  email: string;
  roleId: string;
  role: InternalRole;
  
  twoFactorEnabled: boolean;
  accountActive: boolean;
  lastLoginAt?: string;
  failedLoginAttempts: number;
  lockedUntil?: string;
  
  activeSessions: {
    sessionId: string;
    device: string;
    ip: string;
    startedAt: string;
  }[];
  
  createdAt: string;
}

// ==========================================
// 10. SYSTEM CONFIG & HEALTH
// ==========================================

export interface SystemConfig {
  defaultTrialDays: number;
  availableTrialDurations: number[];
  defaultGracePeriodDays: number;
  passwordPolicy: {
    minLength: number;
    requireUppercase: boolean;
    requireNumbers: boolean;
    requireSpecial: boolean;
    expiryDays?: number;
  };
  globalThresholds: {
    storageWarningPercent: number;
    apiUsageWarningPercent: number;
    inactiveTenantDays: number;
  };
  maintenanceMode: boolean;
  maintenanceMessage?: string;
  featureFlags: Record<string, boolean>;
}

export interface SystemHealth {
  status: 'operational' | 'degraded' | 'down';
  uptime: number; // percentage
  services: {
    name: string;
    status: 'up' | 'down' | 'degraded';
    latencyMs?: number;
    lastChecked: string;
  }[];
  activeIncidents: {
    id: string;
    title: string;
    severity: string;
    startedAt: string;
    affectedTenants?: number;
    status: 'investigating' | 'identified' | 'monitoring' | 'resolved';
  }[];
  backgroundJobs: {
    queue: string;
    pending: number;
    failed: number;
    processing: number;
  }[];
}

export interface Announcement {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'maintenance' | 'security' | 'feature';
  targetAudience: 'all' | 'trial' | 'paid' | 'expired' | 'specific_plans' | 'specific_tenants';
  planIds?: string[];
  tenantIds?: string[];
  
  scheduledFor?: string;
  publishedAt?: string;
  expiresAt?: string;
  
  createdBy: string;
  readBy?: string[]; // Tenant IDs who read it
}

// ==========================================
// 11. DASHBOARD SUMMARIES (For API Response)
// ==========================================

export interface OwnerDashboardSummary {
  tenants: {
    total: number;
    active: number;
    trial: number;
    trialExpiringSoon: number;
    expired: number;
    suspended: number;
    pendingActivation: number;
    churnedThisMonth: number;
  };
  revenue: {
    mrr: number; // Monthly Recurring Revenue
    arr: number; // Annual Recurring Revenue
    thisMonth: number;
    outstanding: number;
    byPlan: Record<string, number>;
  };
  trials: {
    startedThisMonth: number;
    converted: number;
    conversionRate: number;
    expiringIn7Days: number;
    expiringIn3Days: number;
  };
  system: {
    healthStatus: 'good' | 'warning' | 'critical';
    failedJobsCount: number;
    securityAlertsCount: number;
    openTicketsCount: number;
  };
  recentTenants: Tenant[]; // Limited list
}
