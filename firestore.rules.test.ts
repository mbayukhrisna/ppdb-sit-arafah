/**
 * Security Rules Verification Suite — SPMB SIT ARAFAH
 * Verifies the "Dirty Dozen" adversarial payloads defined in security_spec.md
 * against the schema and invariants of firestore.rules.
 */

export interface SecurityTestPayload {
  id: number;
  title: string;
  collection: 'registrations' | 'referrals_staff';
  operation: 'create' | 'update' | 'get' | 'list' | 'delete';
  authContext: {
    uid: string | null;
    email: string | null;
    emailVerified: boolean;
  };
  documentId: string;
  payload?: Record<string, unknown>;
  expectedOutcome: 'PERMISSION_DENIED';
  mitigatedByPillar: string;
}

export const DIRTY_DOZEN_PAYLOADS: SecurityTestPayload[] = [
  {
    id: 1,
    title: 'Identity Spoofing on Registration Create',
    collection: 'registrations',
    operation: 'create',
    authContext: { uid: 'attacker-uid-01', email: 'attacker@example.com', emailVerified: true },
    documentId: 'reg-spoof-01',
    payload: { ownerId: 'victim-uid-99', registrationNumber: 'SPMB-20260001', unit: 'SD' },
    expectedOutcome: 'PERMISSION_DENIED',
    mitigatedByPillar: 'Pillar 2: Identity Integrity (incoming().ownerId == request.auth.uid)'
  },
  {
    id: 2,
    title: 'Unverified Email Write Attempt',
    collection: 'registrations',
    operation: 'create',
    authContext: { uid: 'unverified-uid', email: 'mbayukhrisnamurthi@gmail.com', emailVerified: false },
    documentId: 'reg-unverified-02',
    payload: { ownerId: 'unverified-uid', registrationNumber: 'SPMB-20260002', unit: 'TK' },
    expectedOutcome: 'PERMISSION_DENIED',
    mitigatedByPillar: 'Email Spoofing Guard (request.auth.token.email_verified == true)'
  },
  {
    id: 3,
    title: 'Shadow Field Injection on Create',
    collection: 'registrations',
    operation: 'create',
    authContext: { uid: 'user-uid-03', email: 'parent@example.com', emailVerified: true },
    documentId: 'reg-shadow-03',
    payload: { ownerId: 'user-uid-03', isSuperAdmin: true },
    expectedOutcome: 'PERMISSION_DENIED',
    mitigatedByPillar: 'Pillar 2: Strict Keys (data.keys().hasOnly(...))'
  },
  {
    id: 4,
    title: 'Parent Biodata Omission (Both Father and Mother Empty)',
    collection: 'registrations',
    operation: 'create',
    authContext: { uid: 'user-uid-04', email: 'parent@example.com', emailVerified: true },
    documentId: 'reg-noparent-04',
    payload: { ownerId: 'user-uid-04', fatherProfile: '', motherProfile: '' },
    expectedOutcome: 'PERMISSION_DENIED',
    mitigatedByPillar: 'Domain Invariant: (data.fatherProfile.size() >= 1 || data.motherProfile.size() >= 1)'
  },
  {
    id: 5,
    title: 'Invalid Education Unit Enum Value',
    collection: 'registrations',
    operation: 'create',
    authContext: { uid: 'user-uid-05', email: 'parent@example.com', emailVerified: true },
    documentId: 'reg-badunit-05',
    payload: { ownerId: 'user-uid-05', unit: 'UNIVERSITAS' },
    expectedOutcome: 'PERMISSION_DENIED',
    mitigatedByPillar: "Pillar 2: Enum Constraint (data.unit in ['AIS', 'TK', 'SD', 'SMP'])"
  },
  {
    id: 6,
    title: 'Self-Acceptance Status Escalation on Create',
    collection: 'registrations',
    operation: 'create',
    authContext: { uid: 'user-uid-06', email: 'parent@example.com', emailVerified: true },
    documentId: 'reg-escalate-06',
    payload: { ownerId: 'user-uid-06', status: 'DITERIMA' },
    expectedOutcome: 'PERMISSION_DENIED',
    mitigatedByPillar: "Pillar 4: Tiered Identity Logic (incoming().status == 'MENUNGGU_VERIFIKASI' || isBootstrappedAdmin())"
  },
  {
    id: 7,
    title: 'Immutable Registration Number Mutation on Update',
    collection: 'registrations',
    operation: 'update',
    authContext: { uid: 'user-uid-07', email: 'parent@example.com', emailVerified: true },
    documentId: 'reg-immutable-07',
    payload: { registrationNumber: 'SPMB-HACKED99' },
    expectedOutcome: 'PERMISSION_DENIED',
    mitigatedByPillar: 'Immortal Field Rule (incoming().registrationNumber == existing().registrationNumber)'
  },
  {
    id: 8,
    title: 'Client Timestamp Forgery',
    collection: 'registrations',
    operation: 'create',
    authContext: { uid: 'user-uid-08', email: 'parent@example.com', emailVerified: true },
    documentId: 'reg-time-08',
    payload: { createdAt: '1999-01-01T00:00:00Z' },
    expectedOutcome: 'PERMISSION_DENIED',
    mitigatedByPillar: 'Temporal Integrity (incoming().createdAt == request.time)'
  },
  {
    id: 9,
    title: 'Denial of Wallet Oversized String Injection',
    collection: 'registrations',
    operation: 'create',
    authContext: { uid: 'user-uid-09', email: 'parent@example.com', emailVerified: true },
    documentId: 'reg-oversized-09',
    payload: { fullName: 'A'.repeat(2000) },
    expectedOutcome: 'PERMISSION_DENIED',
    mitigatedByPillar: 'Pillar 3: Boundary Limits (data.fullName.size() <= 120)'
  },
  {
    id: 10,
    title: 'Unauthorized Cross-User PII Read',
    collection: 'registrations',
    operation: 'get',
    authContext: { uid: 'stranger-uid-10', email: 'stranger@example.com', emailVerified: true },
    documentId: 'victim-registration-doc',
    expectedOutcome: 'PERMISSION_DENIED',
    mitigatedByPillar: 'Pillar 6: PII Isolation (existing().ownerId == request.auth.uid || isBootstrappedAdmin())'
  },
  {
    id: 11,
    title: 'Path Variable ID Poisoning with Special Characters',
    collection: 'referrals_staff',
    operation: 'create',
    authContext: { uid: 'user-uid-11', email: 'parent@example.com', emailVerified: true },
    documentId: 'invalid/id$with spaces!',
    payload: { ownerId: 'user-uid-11', name: 'Guru Test', roleUnit: 'SD', active: true },
    expectedOutcome: 'PERMISSION_DENIED',
    mitigatedByPillar: "Pillar 3: Path Variable Hardening (isValidId(staffId))"
  },
  {
    id: 12,
    title: 'Statement Agreement Bypass (agreedToTerms: false)',
    collection: 'registrations',
    operation: 'create',
    authContext: { uid: 'user-uid-12', email: 'parent@example.com', emailVerified: true },
    documentId: 'reg-noagree-12',
    payload: { ownerId: 'user-uid-12', agreedToTerms: false },
    expectedOutcome: 'PERMISSION_DENIED',
    mitigatedByPillar: 'Pillar 2: Blueprint Validation (data.agreedToTerms is bool && data.agreedToTerms == true)'
  }
];
