export interface GoogleCredentialResponse { credential: string; select_by: string }
export interface GooglePromptNotification { isNotDisplayed: () => boolean; isSkippedMoment: () => boolean; getNotDisplayedReason: () => string }
export interface GoogleAccountsId { initialize: (config: { client_id: string; callback: (response: GoogleCredentialResponse) => void; auto_select?: boolean }) => void; renderButton: (element: HTMLElement, config: { type: string; theme: string; size: string; width?: number }) => void; prompt: (callback?: (notification: GooglePromptNotification) => void) => void }
export interface GoogleAccounts { id: GoogleAccountsId }
export interface GoogleIdentityServices { accounts: GoogleAccounts }
declare global { interface Window { google?: GoogleIdentityServices } }
export {}
