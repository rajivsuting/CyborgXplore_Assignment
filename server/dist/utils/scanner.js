"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MalwareScanner = void 0;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const logger_1 = require("./logger");
// Malware keywords and patterns for simulation
const MALWARE_KEYWORDS = [
    "virus",
    "trojan",
    "malware",
    "spyware",
    "ransomware",
    "backdoor",
    "keylogger",
    "rootkit",
    "worm",
    "botnet",
    "phishing",
    "exploit",
    "payload",
    "shellcode",
    "injection",
    "overflow",
    "buffer",
    "privilege",
    "escalation",
    "persistence",
    "exfiltration",
    "cmd.exe",
    "powershell",
    "regsvr32",
    "rundll32",
    "wmic",
    "netcat",
    "nc",
    "telnet",
    "ftp",
    "tftp",
    "wget",
    "curl",
    "download",
    "upload",
    "execute",
    "install",
    "uninstall",
    "registry",
    "service",
    "task",
    "schedule",
    "startup",
    "network",
    "socket",
    "connection",
    "listen",
    "bind",
    "encrypt",
    "decrypt",
    "hash",
    "md5",
    "sha1",
    "sha256",
    "certificate",
    "ssl",
    "tls",
    "https",
    "http",
    "ftp",
    "email",
    "smtp",
    "pop3",
    "imap",
    "outlook",
    "thunderbird",
    "browser",
    "chrome",
    "firefox",
    "safari",
    "edge",
    "ie",
    "office",
    "word",
    "excel",
    "powerpoint",
    "access",
    "outlook",
    "adobe",
    "flash",
    "java",
    "javascript",
    "vbscript",
    "powershell",
    "batch",
    "cmd",
    "bat",
    "ps1",
    "vbs",
    "js",
    "hta",
    "chm",
    "exe",
    "dll",
    "sys",
    "drv",
    "scr",
    "pif",
    "com",
    "bin",
    "autorun",
    "autorun.inf",
    "desktop.ini",
    "thumbs.db",
    "recycler",
    "system volume information",
    "$recycle.bin",
    "temp",
    "tmp",
    "cache",
    "cookies",
    "history",
    "downloads",
    "documents",
    "pictures",
    "music",
    "videos",
    "desktop",
    "start menu",
    "program files",
    "windows",
    "system32",
    "win32",
    "win64",
    "x86",
    "x64",
    "amd64",
    "ia64",
    "kernel",
    "ntoskrnl",
    "ntdll",
    "kernel32",
    "user32",
    "gdi32",
    "ole32",
    "oleaut32",
    "advapi32",
    "shell32",
    "urlmon",
    "wininet",
    "ws2_32",
    "iphlpapi",
    "netapi32",
    "psapi",
    "version",
    "setupapi",
    "imagehlp",
    "dbghelp",
    "msvcrt",
    "ucrtbase",
    "vcruntime",
    "msvcp",
    "msvcr",
    "api-ms-win",
    "ext-ms-win",
    "api-ms-win-core",
    "api-ms-win-security",
    "api-ms-win-service",
    "api-ms-win-eventlog",
    "api-ms-win-perf",
    "api-ms-win-rtcore",
    "api-ms-win-devices",
    "api-ms-win-appmodel",
    "api-ms-win-shcore",
    "api-ms-win-shell",
    "api-ms-win-storage",
    "api-ms-win-networking",
    "api-ms-win-http",
    "api-ms-win-crt",
    "api-ms-win-crt-runtime",
    "api-ms-win-crt-heap",
    "api-ms-win-crt-math",
    "api-ms-win-crt-stdio",
    "api-ms-win-crt-locale",
    "api-ms-win-crt-time",
    "api-ms-win-crt-filesystem",
    "api-ms-win-crt-convert",
    "api-ms-win-crt-utility",
    "api-ms-win-crt-multibyte",
    "api-ms-win-crt-wstring",
    "api-ms-win-crt-environment",
    "api-ms-win-crt-private",
    "api-ms-win-crt-conio",
    "api-ms-win-crt-process",
    "api-ms-win-crt-malloc",
    "api-ms-win-crt-exit",
    "api-ms-win-crt-startup",
    "api-ms-win-crt-system",
    "api-ms-win-crt-math-l1-1-0",
    "api-ms-win-crt-runtime-l1-1-0",
    "api-ms-win-crt-heap-l1-1-0",
    "api-ms-win-crt-math-l1-1-0",
    "api-ms-win-crt-stdio-l1-1-0",
    "api-ms-win-crt-locale-l1-1-0",
    "api-ms-win-crt-time-l1-1-0",
    "api-ms-win-crt-filesystem-l1-1-0",
    "api-ms-win-crt-convert-l1-1-0",
    "api-ms-win-crt-utility-l1-1-0",
    "api-ms-win-crt-multibyte-l1-1-0",
    "api-ms-win-crt-wstring-l1-1-0",
    "api-ms-win-crt-environment-l1-1-0",
    "api-ms-win-crt-private-l1-1-0",
    "api-ms-win-crt-conio-l1-1-0",
    "api-ms-win-crt-process-l1-1-0",
    "api-ms-win-crt-malloc-l1-1-0",
    "api-ms-win-crt-exit-l1-1-0",
    "api-ms-win-crt-startup-l1-1-0",
    "api-ms-win-crt-system-l1-1-0",
];
// Suspicious file extensions
const SUSPICIOUS_EXTENSIONS = [
    ".exe",
    ".dll",
    ".sys",
    ".drv",
    ".scr",
    ".pif",
    ".com",
    ".bat",
    ".cmd",
    ".ps1",
    ".vbs",
    ".js",
    ".hta",
    ".chm",
    ".jar",
    ".msi",
    ".msu",
    ".msp",
    ".mst",
    ".cab",
    ".zip",
    ".rar",
    ".7z",
    ".tar",
    ".gz",
    ".bz2",
    ".xz",
    ".iso",
    ".img",
    ".vhd",
    ".vmdk",
    ".ova",
    ".ovf",
    ".vbox",
    ".vdi",
    ".qcow",
    ".qcow2",
    ".vmdk",
    ".vhd",
    ".vhdx",
    ".vdi",
    ".vbox",
    ".ova",
    ".ovf",
    ".qcow",
    ".qcow2",
];
// Suspicious MIME types
const SUSPICIOUS_MIME_TYPES = [
    "application/x-executable",
    "application/x-msdownload",
    "application/x-msi",
    "application/x-msdos-program",
    "application/x-msdos-windows",
    "application/x-msi",
    "application/x-msi-installer",
    "application/x-msi-package",
    "application/x-msi-patch",
    "application/x-msi-update",
    "application/x-msi-upgrade",
    "application/x-msi-uninstall",
    "application/x-msi-repair",
    "application/x-msi-modify",
    "application/x-msi-advertise",
    "application/x-msi-validate",
    "application/x-msi-rollback",
    "application/x-msi-commit",
    "application/x-msi-commit-rollback",
    "application/x-msi-commit-validate",
    "application/x-msi-commit-validate-rollback",
];
class MalwareScanner {
    constructor() { }
    static getInstance() {
        if (!MalwareScanner.instance) {
            MalwareScanner.instance = new MalwareScanner();
        }
        return MalwareScanner.instance;
    }
    scanFile(filePath, filename, mimetype) {
        return __awaiter(this, void 0, void 0, function* () {
            const startTime = Date.now();
            logger_1.logger.info(`Starting scan for file: ${filename}`);
            try {
                const threats = [];
                let confidence = 0;
                // Check file extension
                const extension = path_1.default.extname(filename).toLowerCase();
                if (SUSPICIOUS_EXTENSIONS.includes(extension)) {
                    threats.push(`Suspicious file extension: ${extension}`);
                    confidence += 20;
                }
                // Check MIME type
                if (SUSPICIOUS_MIME_TYPES.includes(mimetype.toLowerCase())) {
                    threats.push(`Suspicious MIME type: ${mimetype}`);
                    confidence += 25;
                }
                // Read file content for keyword analysis
                const content = yield this.readFileContent(filePath);
                // Check for malware keywords
                const foundKeywords = this.detectKeywords(content);
                if (foundKeywords.length > 0) {
                    threats.push(`Detected suspicious keywords: ${foundKeywords.join(", ")}`);
                    confidence += Math.min(foundKeywords.length * 10, 40);
                }
                // Check for suspicious patterns
                const patterns = this.detectPatterns(content);
                if (patterns.length > 0) {
                    threats.push(`Detected suspicious patterns: ${patterns.join(", ")}`);
                    confidence += Math.min(patterns.length * 15, 30);
                }
                // Check file size (very large files might be suspicious)
                const stats = fs_1.default.statSync(filePath);
                if (stats.size > 50 * 1024 * 1024) {
                    // 50MB
                    threats.push("File size exceeds normal limits");
                    confidence += 10;
                }
                // Simulate random false positives/negatives for realistic testing
                const randomFactor = Math.random() * 20 - 10; // -10 to +10
                confidence = Math.max(0, Math.min(100, confidence + randomFactor));
                const scanTime = Date.now() - startTime;
                const isMalicious = confidence > 50;
                const result = {
                    isMalicious,
                    confidence: Math.round(confidence),
                    threats,
                    scanTime,
                    scannedAt: new Date(),
                };
                logger_1.logger.info(`Scan completed for ${filename}:`, {
                    isMalicious: result.isMalicious,
                    confidence: result.confidence,
                    threats: result.threats.length,
                    scanTime: result.scanTime,
                });
                return result;
            }
            catch (error) {
                logger_1.logger.error(`Error scanning file ${filename}:`, error);
                throw new Error(`Failed to scan file: ${error}`);
            }
        });
    }
    readFileContent(filePath) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                // Read first 1MB of file for analysis
                const buffer = fs_1.default.readFileSync(filePath);
                const content = buffer.toString("utf8", 0, Math.min(buffer.length, 1024 * 1024));
                return content.toLowerCase();
            }
            catch (error) {
                logger_1.logger.warn(`Could not read file content for analysis: ${error}`);
                return "";
            }
        });
    }
    detectKeywords(content) {
        const foundKeywords = [];
        for (const keyword of MALWARE_KEYWORDS) {
            if (content.includes(keyword.toLowerCase())) {
                foundKeywords.push(keyword);
            }
        }
        return foundKeywords;
    }
    detectPatterns(content) {
        const patterns = [];
        // Check for base64 encoded content
        const base64Pattern = /[A-Za-z0-9+/]{50,}={0,2}/g;
        if (base64Pattern.test(content)) {
            patterns.push("Base64 encoded content detected");
        }
        // Check for hex patterns
        const hexPattern = /[0-9A-Fa-f]{32,}/g;
        if (hexPattern.test(content)) {
            patterns.push("Hex patterns detected");
        }
        // Check for URL patterns
        const urlPattern = /https?:\/\/[^\s]+/g;
        if (urlPattern.test(content)) {
            patterns.push("URL patterns detected");
        }
        // Check for IP addresses
        const ipPattern = /\b\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}\b/g;
        if (ipPattern.test(content)) {
            patterns.push("IP addresses detected");
        }
        // Check for suspicious strings
        const suspiciousStrings = [
            "cmd.exe",
            "powershell",
            "rundll32",
            "regsvr32",
            "wmic",
            "netcat",
            "nc",
            "telnet",
            "ftp",
            "tftp",
            "wget",
            "curl",
            "download",
            "upload",
            "execute",
            "install",
            "uninstall",
            "registry",
            "service",
            "task",
            "schedule",
            "startup",
            "network",
            "socket",
            "connection",
            "listen",
            "bind",
            "encrypt",
            "decrypt",
        ];
        for (const str of suspiciousStrings) {
            if (content.includes(str)) {
                patterns.push(`Suspicious string: ${str}`);
            }
        }
        return patterns;
    }
}
exports.MalwareScanner = MalwareScanner;
