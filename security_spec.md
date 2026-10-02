# Security Specification — SPMB SIT ARAFAH

## 1. Data Invariants

1. **Identity & Ownership Integrity**:
   - Every document in `/registrations/{registrationId}` and `/referrals_staff/{staffId}` must contain an `ownerId` matching `request.auth.uid` upon creation, and `ownerId` is strictly immutable during updates.
   - Only verified users (`request.auth.token.email_verified == true`) can create or modify records.
2. **Parent Biodata Flexibility Invariant**:
   - A `Registration` document is valid if and only if at least one parent's core biodata is provided (`fatherName.size() >= 1` OR `motherName.size() >= 1`), matching the requirement that parents do not have to fill both Father and Mother if only one is available.
3. **PII Isolation & Query Enforcement**:
   - `/registrations/{registrationId}` contains PII (NIK, WhatsApp, Address, Email). Blanket reads (`allow read: if isSignedIn()`) are strictly forbidden.
   - `get` and `list` operations on `/registrations/{registrationId}` are restricted to the document owner (`resource.data.ownerId == request.auth.uid`) or the verified bootstrapped admin (`isBootstrappedAdmin()`).
4. **Strict Key & Volumetric Boundaries**:
   - Every string field enforces exact `.size()` bounds matching `firebase-blueprint.json`.
   - Document IDs (`registrationId`, `staffId`) are validated with `isValidId()` (`^[a-zA-Z0-9_\-]+$`, max 128 chars).
   - Timestamps `createdAt` and `updatedAt` must equal `request.time`.

## 2. The "Dirty Dozen" Payloads

1. **Payload 1 (Identity Spoofing on Registration Create)**: Setting `ownerId: "victim-uid-123"` when `request.auth.uid == "attacker-uid"`. -> `PERMISSION_DENIED`
2. **Payload 2 (Unverified Email Write)**: Submitting a valid registration payload with `request.auth.token.email_verified == false`. -> `PERMISSION_DENIED`
3. **Payload 3 (Shadow Field Injection on Create)**: Adding `"isAdmin": true` or `"verifiedBy": "system"` to `/registrations/{id}`. -> `PERMISSION_DENIED`
4. **Payload 4 (Parent Biodata Omission)**: Submitting a registration where both `fatherName == ""` and `motherName == ""`. -> `PERMISSION_DENIED`
5. **Payload 5 (Invalid Unit Enum)**: Setting `unit: "SMA"` (not in `['AIS', 'TK', 'SD', 'SMP']`). -> `PERMISSION_DENIED`
6. **Payload 6 (Status Escalation by Non-Admin Owner on Create)**: Creating a registration with `status: "DITERIMA"` instead of `"MENUNGGU_VERIFIKASI"` as a regular user. -> `PERMISSION_DENIED`
7. **Payload 7 (Immutable Field Mutation on Update)**: Changing `ownerId`, `registrationNumber`, or `createdAt` during an update. -> `PERMISSION_DENIED`
8. **Payload 8 (Client Timestamp Forgery)**: Passing a past or future timestamp instead of `request.time` for `createdAt` or `updatedAt`. -> `PERMISSION_DENIED`
9. **Payload 9 (Resource Exhaustion / 1MB String)**: Passing a 5,000-character string into `fullName` or `additionalNotes`. -> `PERMISSION_DENIED`
10. **Payload 10 (Cross-User PII Read)**: User B attempting `get` or `list` on User A's `/registrations/{registrationId}` document. -> `PERMISSION_DENIED`
11. **Payload 11 (Unauthorized Staff Reference Mutation)**: Non-admin user attempting to `delete` or `create` a document in `/referrals_staff/{staffId}` with forged ownerId. -> `PERMISSION_DENIED`
12. **Payload 12 (Agreement Bypass)**: Submitting a registration with `agreedToTerms: false`. -> `PERMISSION_DENIED`

## 3. Test Runner Specification (`firestore.rules.test.ts`)

```ts
// Verifies that all 12 Dirty Dozen payloads return PERMISSION_DENIED against firestore.rules
export interface DirtyDozenAssertion {
  id: number;
  name: string;
  collection: string;
  operation: 'create' | 'update' | 'get' | 'list' | 'delete';
  expectedResult: 'PERMISSION_DENIED';
}
```
