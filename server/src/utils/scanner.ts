import fs from "fs";
import path from "path";
import { logger } from "./logger";

export interface ScanResult {
  isMalicious: boolean;
  confidence: number;
  threats: string[];
  scanTime: number;
  scannedAt: Date;
  status: "clean" | "infected";
}

// Only the specific dangerous keywords from requirements
const DANGEROUS_KEYWORDS = ["rm -rf", "eval", "bitcoin"];

export class MalwareScanner {
  private static instance: MalwareScanner;

  private constructor() {}

  public static getInstance(): MalwareScanner {
    if (!MalwareScanner.instance) {
      MalwareScanner.instance = new MalwareScanner();
    }
    return MalwareScanner.instance;
  }

  public async scanFile(
    filePath: string,
    filename: string,
    mimetype: string
  ): Promise<ScanResult> {
    const startTime = Date.now();
    logger.info(`Starting scan for file: ${filename}`);

    try {
      // Simulate scan processing time (2-5 seconds as per requirements)
      const scanTime = 2000 + Math.random() * 3000; // 2-5 seconds
      await new Promise((resolve) => setTimeout(resolve, scanTime));

      const threats: string[] = [];
      let confidence = 0;

      // Read file content for keyword analysis
      const content = await this.readFileContent(filePath);

      // Check for dangerous keywords (high priority)
      const foundDangerousKeywords = this.detectKeywords(
        content,
        DANGEROUS_KEYWORDS
      );
      
      if (foundDangerousKeywords.length > 0) {
        threats.push(
          `Detected dangerous keywords: ${foundDangerousKeywords.join(", ")}`
        );
        confidence = 100; // Mark as definitely infected if dangerous keywords found
      }

      // Determine if malicious based on dangerous keywords
      const isMalicious = foundDangerousKeywords.length > 0;
      const status = isMalicious ? "infected" : "clean";

      const actualScanTime = Date.now() - startTime;
      const result: ScanResult = {
        isMalicious,
        confidence: Math.round(confidence),
        threats,
        scanTime: actualScanTime,
        scannedAt: new Date(),
        status,
      };

      logger.info(`Scan completed for ${filename}:`, {
        isMalicious: result.isMalicious,
        status: result.status,
        confidence: result.confidence,
        threats: result.threats.length,
        scanTime: result.scanTime,
      });

      return result;
    } catch (error) {
      logger.error(`Error scanning file ${filename}:`, error);
      throw new Error(`Failed to scan file: ${error}`);
    }
  }

  private async readFileContent(filePath: string): Promise<string> {
    try {
      // Read first 1MB of file for analysis
      const buffer = fs.readFileSync(filePath);
      const content = buffer.toString(
        "utf8",
        0,
        Math.min(buffer.length, 1024 * 1024)
      );
      return content.toLowerCase();
    } catch (error) {
      logger.warn(`Could not read file content for analysis: ${error}`);
      return "";
    }
  }

  private detectKeywords(content: string, keywords: string[]): string[] {
    const foundKeywords: string[] = [];

    for (const keyword of keywords) {
      // Convert keyword to lowercase for case-insensitive matching
      const lowerKeyword = keyword.toLowerCase();
      if (content.includes(lowerKeyword)) {
        foundKeywords.push(keyword);
      }
    }

    return foundKeywords;
  }
}
