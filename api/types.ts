export type Severity = "Critical" | "High" | "Medium" | "Low" | "Info";

export type VulnerabilityTitle =
  // Injection
  | "SQL Injection"
  | "NoSQL Injection"
  | "LDAP Injection"
  | "Command Injection"
  | "XML Injection"
  | "Server-Side Template Injection (SSTI)"
  // XSS
  | "Reflected XSS"
  | "Stored XSS"
  | "DOM-based XSS"
  // Access Control
  | "Broken Access Control"
  | "Insecure Direct Object Reference (IDOR)"
  | "Privilege Escalation"
  | "Missing Function Level Access Control"
  // Authentication & Session
  | "Broken Authentication"
  | "Weak Password Policy"
  | "Session Fixation"
  | "JWT Vulnerability"
  | "OAuth Misconfiguration"
  | "Missing Rate Limiting"
  // Cryptography
  | "Sensitive Data Exposure"
  | "Weak Cryptographic Algorithm"
  | "Hardcoded Credentials"
  | "Insecure TLS Configuration"
  // Configuration
  | "Security Misconfiguration"
  | "CORS Misconfiguration"
  | "Verbose Error Messages"
  | "Directory Listing Enabled"
  | "Default Credentials"
  // SSRF / RFI / LFI
  | "Server-Side Request Forgery (SSRF)"
  | "Local File Inclusion (LFI)"
  | "Remote File Inclusion (RFI)"
  | "Path Traversal"
  // Client-side
  | "Cross-Site Request Forgery (CSRF)"
  | "Clickjacking"
  | "Open Redirect"
  | "Host Header Injection"
  // Infrastructure
  | "Subdomain Takeover"
  | "DNS Misconfiguration"
  | "HTTP Request Smuggling"
  | "HTTP Response Splitting"
  // Components
  | "Vulnerable and Outdated Component"
  | "Insecure Deserialization"
  | "XML External Entity (XXE)"
  // Other
  | "Business Logic Flaw"
  | "Insufficient Logging and Monitoring"
  | "Remote Code Execution (RCE)"
  | (string & {}); // escape hatch for unlisted vulnerabilities

export interface Scope {
  id: string;
  domain?: string;
  ipAddress?: string;
}

export interface Vulnerability {
  id: string;
  title: VulnerabilityTitle;
  severity: Severity;
  scopeId: string;
  description: string;
  recommendation: string;
}

export interface VulnerabilityCount {
  critical: number;
  high: number;
  medium: number;
  low: number;
  info: number;
}

export interface ExecutiveSummary {
  globalSecurityScore: number; // 0–100
  vulnerabilityCount: VulnerabilityCount;
  scanDate: string; // ISO 8601
}

export interface PentestReport {
  scopes: Scope[];
  summary: ExecutiveSummary;
  vulnerabilities: Vulnerability[];
}

// Lightweight — returned by GET /vulnerabilities
export type VulnerabilityListItem = Pick<Vulnerability, "id" | "title" | "severity" | "scopeId">;

// Full detail — returned by GET /vulnerabilities/:id
export type VulnerabilityDetail = Vulnerability;

// Summary endpoint response
export interface ReportSummaryResponse {
  summary: ExecutiveSummary;
  scopes: Scope[];
  vulnerabilities: VulnerabilityListItem[];
}
