import { initializeApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import { 
  getFirestore, 
  Firestore,
  collection as rawCollection,
  doc as rawDoc,
  getDoc as rawGetDoc,
  getDocs as rawGetDocs,
  setDoc as rawSetDoc,
  addDoc as rawAddDoc,
  updateDoc as rawUpdateDoc,
  deleteDoc as rawDeleteDoc,
  onSnapshot as rawOnSnapshot,
  increment as rawIncrement,
  serverTimestamp as rawServerTimestamp,
  where as rawWhere,
  query as rawQuery
} from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';

// Initialize Firebase app once
let firebaseApp: any = null;
let firebaseAuth: Auth | null = null;
let firebaseDb: Firestore | null = null;

// Singleton initialization function
function initializeFirebase() {
  if (!firebaseApp) {
    try {
      firebaseApp = initializeApp(firebaseConfig);
      firebaseAuth = getAuth(firebaseApp);
      firebaseDb = getFirestore(firebaseApp);
    } catch (error) {
      console.error("Firebase initialization failed:", error);
      // Fallback to null but log error
    }
  }
  return { firebaseApp, firebaseAuth, firebaseDb };
}

// Lazy initialize on first access
export function getFirebaseApp() {
  return initializeFirebase().firebaseApp;
}

export function getFirebaseAuth() {
  const { firebaseAuth } = initializeFirebase();
  return firebaseAuth;
}

export function getFirebaseDb() {
  const { firebaseDb } = initializeFirebase();
  return firebaseDb;
}

// For backward compatibility, export as direct references
// but they will be lazy-initialized
export const app = getFirebaseApp();
export const auth = getFirebaseAuth();
export const db = getFirebaseDb();

// Active industry namespace configuration helper
export function getIndustryId(): string {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('preview_industry_id') || 'fashion';
  }
  return 'fashion';
}

// Security: Validate that other industries' data collections can NEVER be accessed
export function validateIndustryAccess(collectionName: string) {
  const activeIndustry = getIndustryId();
  
  // List of all industry keys in the application
  const knownIndustries = ['fashion', 'catering', 'retail', 'beauty', 'fitness', 'jewelry', 'home', 'hotel', 'influencer'];
  
  let pathIndustry: string | null = null;
  for (const ind of knownIndustries) {
    if (collectionName.toLowerCase().startsWith(`${ind}_`)) {
      pathIndustry = ind;
      break;
    }
  }

  // Strict check: if collection path belongs to an industry but is NOT matches with the active, throw strict error
  if (pathIndustry && pathIndustry !== activeIndustry) {
    const errorMsg = `[ValidateIndustryAccess Block] Security Violation: Current user/session industry is "${activeIndustry}", but is attempting to access isolated collection "${collectionName}" which belongs to "${pathIndustry}". Cross-industry data access is strictly prohibited!`;
    console.error(errorMsg);
    throw new Error(errorMsg);
  }
}

// Validate general document or collection reference's primary key
function validateRef(ref: any) {
  if (!ref) return;
  const path = ref.path || (ref.ref && ref.ref.path) || '';
  if (path) {
    const firstSegment = path.split('/')[0];
    validateIndustryAccess(firstSegment);
  }
}

export function mapPathSegments(segments: string[]): string[] {
  if (segments.length === 0) return segments;

  // Pattern A: ['tenants', tenantId, 'industries', industryId, subCol, ...rest]
  if (segments[0] === 'tenants' && segments[2] === 'industries') {
    const industryId = segments[3];
    const subCol = segments[4];
    const rest = segments.slice(5);
    if (subCol) {
      return [`${industryId}_${subCol}`, ...rest];
    }
  }
  
  // Pattern B: ['tenants', tenantId, 'billing_logs', ...rest]
  if (segments[0] === 'tenants' && segments[2] === 'billing_logs') {
    const industryId = getIndustryId();
    const rest = segments.slice(3);
    return [`${industryId}_billing_logs`, ...rest];
  }

  // Pattern C: ['tenants', tenantId, 'kb_chunks', ...rest]
  if (segments[0] === 'tenants' && segments[2] === 'kb_chunks') {
    const industryId = getIndustryId();
    const rest = segments.slice(3);
    return [`${industryId}_kb_chunks`, ...rest];
  }

  // Pattern D: ['tenants', tenantId]
  if (segments[0] === 'tenants' && segments.length === 2 && segments[1]) {
    const industryId = getIndustryId();
    return [`${industryId}_tenants`, segments[1]];
  }

  return segments;
}

export function normalizeAndMapSegments(segments: string[]): string[] {
  let flat: string[] = [];
  for (const s of segments) {
    if (typeof s === 'string' && s.includes('/')) {
      flat.push(...s.split('/').filter(Boolean));
    } else {
      flat.push(s);
    }
  }
  return mapPathSegments(flat);
}

// Wrapper for collection with validation
export function collection(dbInstance: any, path: string, ...pathSegments: string[]): any {
  const segments = [path, ...pathSegments];
  const mapped = normalizeAndMapSegments(segments);
  const targetCol = mapped[0];

  // Intercept and validate industry access
  validateIndustryAccess(targetCol);

  if (mapped.length > 1) {
    return (rawCollection as any)(dbInstance, targetCol, ...mapped.slice(1));
  }
  return rawCollection(dbInstance, targetCol);
}

// Wrapper for doc with validation
export function doc(dbInstance: any, path: string, ...pathSegments: string[]): any {
  const segments = [path, ...pathSegments];
  const mapped = normalizeAndMapSegments(segments);
  const targetCol = mapped[0];

  // Intercept and validate industry access
  validateIndustryAccess(targetCol);

  if (mapped.length > 1) {
    return (rawDoc as any)(dbInstance, targetCol, ...mapped.slice(1));
  }
  return rawDoc(dbInstance, targetCol);
}

// Advanced CRUD Interceptors for airtight security
export async function getDoc(documentRef: any) {
  validateRef(documentRef);
  return await rawGetDoc(documentRef);
}

export async function getDocs(queryOrCollectionRef: any) {
  validateRef(queryOrCollectionRef);
  return await rawGetDocs(queryOrCollectionRef);
}

export async function setDoc(documentRef: any, data: any, options?: any) {
  validateRef(documentRef);
  return await rawSetDoc(documentRef, data, options);
}

export async function addDoc(collectionRef: any, data: any) {
  validateRef(collectionRef);
  return await rawAddDoc(collectionRef, data);
}

export async function updateDoc(documentRef: any, ...args: any[]) {
  validateRef(documentRef);
  return await (rawUpdateDoc as any)(documentRef, ...args);
}

export async function deleteDoc(documentRef: any) {
  validateRef(documentRef);
  return await rawDeleteDoc(documentRef);
}

export function increment(n: number) {
  return rawIncrement(n);
}

export function serverTimestamp() {
  return rawServerTimestamp();
}

export function where(...args: any[]) {
  return (rawWhere as any)(...args);
}

export function query(reference: any, ...args: any[]) {
  validateRef(reference);
  return (rawQuery as any)(reference, ...args);
}

export function onSnapshot(reference: any, ...args: any[]) {
  validateRef(reference);
  return (rawOnSnapshot as any)(reference, ...args);
}

// ============================================
// Firebase Error Handling
// ============================================

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const currentAuth = getFirebaseAuth();
  const currentUser = currentAuth?.currentUser;

  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: currentUser?.uid || null,
      email: currentUser?.email || null,
      emailVerified: currentUser?.emailVerified || null,
      isAnonymous: currentUser?.isAnonymous || null,
      tenantId: currentUser?.tenantId || null,
      providerInfo: currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  };

  console.error('[Firebase Error]', JSON.stringify(errInfo, null, 2));
  throw new Error(JSON.stringify(errInfo));
}

// ============================================
// Firebase Utility Functions
// ============================================

/**
 * Check if Firebase is properly initialized
 */
export function isFirebaseReady(): boolean {
  try {
    return !!(getFirebaseAuth() && getFirebaseDb());
  } catch {
    return false;
  }
}

/**
 * Gracefully handle Firebase initialization errors
 */
export function tryInitializeFirebase(): { success: boolean; error?: string } {
  try {
    initializeFirebase();
    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown Firebase initialization error',
    };
  }
}

// Required collections used by core business modules (template names)
export const REQUIRED_COLLECTIONS: Record<string, string> = {
  '{industryId}_orders': 'Order documents with full lifecycle',
  '{industryId}_order_items': 'Line items for each order',
  '{industryId}_customers': 'Customer profiles & CRM data',
  '{industryId}_customer_logs': 'Customer activity logs',
  '{industryId}_loyalty_points': 'Loyalty program tracking',
  '{industryId}_inventory': 'Real-time stock levels',
  '{industryId}_inventory_logs': 'Stock movement history',
  '{industryId}_sku_variants': 'Product variants (color/size)',
  '{industryId}_transactions': 'All payment transactions',
  '{industryId}_billing_records': 'Daily billing summaries',
  '{industryId}_cost_allocation': 'Cost breakdown per order',
  '{industryId}_shipments': 'Shipping info & tracking',
  '{industryId}_returns': 'Return/refund requests',
  '{industryId}_agent_configs': 'Agent prompt & behavior config',
  '{industryId}_agent_metrics': 'Agent performance tracking',
  '{industryId}_campaigns': 'Marketing campaigns',
  '{industryId}_coupons': 'Discount codes & coupons',
  '{industryId}_analytics': 'Daily KPI snapshots'
};
