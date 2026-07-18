export type CheckStatus = "ok" | "warn" | "fail" | "error" | "skipped";

export interface CoreWebVital {
  label: string;
  value: string;
  numericValue: number | null;
  status: CheckStatus;
}

export interface PerformanceResult {
  status: CheckStatus;
  mobileScore: number | null;
  desktopScore: number | null;
  mobileVitals: CoreWebVital[];
  desktopVitals: CoreWebVital[];
  error?: string;
}

export interface HeaderFinding {
  header: string;
  present: boolean;
  value: string | null;
  description: string;
}

export interface HeadersResult {
  status: CheckStatus;
  score: number | null;
  findings: HeaderFinding[];
  error?: string;
}

export interface SslResult {
  status: CheckStatus;
  score: number | null;
  valid: boolean;
  issuer: string | null;
  subject: string | null;
  validFrom: string | null;
  validTo: string | null;
  daysUntilExpiry: number | null;
  protocol: string | null;
  error?: string;
}

export interface DnsRecordSet {
  type: string;
  records: string[];
}

export interface WhoisInfo {
  registrar: string | null;
  createdDate: string | null;
  expiryDate: string | null;
  daysUntilExpiry: number | null;
}

export interface DnsResult {
  status: CheckStatus;
  score: number | null;
  records: DnsRecordSet[];
  whois: WhoisInfo | null;
  whoisSkipped: boolean;
  error?: string;
}

export interface MobileFriendlinessResult {
  status: CheckStatus;
  score: number | null;
  error?: string;
}

export interface CategoryGrade {
  key: string;
  label: string;
  weight: number;
  score: number | null;
  grade: string | null;
}

export interface ScanReport {
  url: string;
  hostname: string;
  scannedAt: string;
  overallScore: number;
  overallGrade: string;
  categories: CategoryGrade[];
  performance: PerformanceResult;
  headers: HeadersResult;
  ssl: SslResult;
  dns: DnsResult;
  mobile: MobileFriendlinessResult;
}
