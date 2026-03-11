# Product Specification: Session Handling & Auto-Save Draft
**Branch:** `fix/session-handling-user`

## 1. Overview
The `fix/session-handling-user` branch introduces two primary features to improve user retention and stability on the frontend application:
1. **Proactive Session Management**: Enhances the user experience by automatically refreshing authentication tokens before they expire, ensuring users aren't abruptly logged out during long-running tasks (like filling out forms or uploading files).
2. **Auto-Save Drafts for Reports**: Introduces a persistent drafting mechanism for the scam report form, allowing users to safely return to an incomplete form without losing their input data and file uploads.

## 2. Key Features

### 2.1 Proactive Token Management
- **Background Auto-Refresh**: The application's `AuthContext` now natively polls every 30 seconds to check if the current authentication token will expire within the next 5 minutes. If it will, an automatic background network request is made to refresh the token using the refresh token.
- **Expiry Notification & Manual Intervention**: If a token is detected to be expiring soon while a user is actively on Step 3 of the report form, a warning banner is displayed alerting them of the session status, offering a manual "Refresh Session" button.
- **Pre-upload Validation Checks**: To prevent network failures midway through heavy request tasks, the upload file component performs a token lifespan validation immediately prior to executing an upload. If the token is near expiration, it is refreshed instantaneously.

### 2.2 Report Draft Auto-Save
- **Continuous On-Change Saving**: Input modifications within the report form (Step 3) are constantly saved locally to the browser's `localStorage` under the key `cekreput_report_draft`.
- **Evidence Persistence**: File states from the uploaded evidence are integrated into the autosaved draft.
- **Time-to-Live (TTL - 24 Hours)**: Upon loading the report page (`ReportScam.tsx`), the system attempts to restore the `cekreput_report_draft`. Drafts that are more than 24 hours old are flagged as stale and subsequently deleted.
- **Consent Resubmission Rule**: For compliance reasons, the `agreedTerms` checkbox state is explicitly stripped from the restored draft format. Users must consciously re-consent to the Terms and Conditions before continuing their restored draft.
- **Post-Submission Cleanup**: Following a validated server-side report submission, the lingering artifact draft is cleared from `localStorage`.

### 2.3 Upload Interface Enhancements
- **Granular Progress Tracking**: Detailed upload indications were added, giving users visual insights into exactly how many files are currently uploading, current task progress, and a dynamic loading bar representation.
- **Network Resilience**: Incorporates a built-in retry polling strategy for temporary network disruptions during individual evidence file HTTP uploads.

## 3. Impacted Core Components
- `apps/web/src/context/AuthContext.tsx`: Implementation of token expiry tracking, auto-refresh intervals, and exposing `isTokenExpiring()` / `refreshToken()`.
- `apps/web/src/pages/ReportScam.tsx`: Base level view; controls draft lifecycle methods (restoring on mount / clearing on success).
- `apps/web/src/components/report/StepThreeForm.tsx`: Central component orchestrator that manages constant form state saves, displays token expiration dialogues, and bridges validation logic constraints.
- `apps/web/src/components/report/FileUploader.tsx`: File drafting logic injections, visual layout adaptations for detailed upload statuses.
- `apps/web/src/lib/api.ts`: API wrapper definition tweaked to accommodate an optional `user` variable payload returning via the auth refresh route.
