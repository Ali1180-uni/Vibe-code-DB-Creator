import { Document, Packer, Paragraph, TextRun, HeadingLevel, Table, TableRow, TableCell, BorderStyle, WidthType } from "docx";
import saveAs from "file-saver";
import { ArchitectureAnalysis } from "../types";

export const generateAndDownloadReport = async (
  sqlCode: string,
  analysis: ArchitectureAnalysis,
  dialect: string
) => {
  const doc = new Document({
    sections: [
      {
        properties: {},
        children: [
          // Title
          new Paragraph({
            text: "VisionDB Architecture Report",
            heading: HeadingLevel.TITLE,
            spacing: { after: 300 },
          }),
          new Paragraph({
            text: `Generated on ${new Date().toLocaleDateString()}`,
            spacing: { after: 500 },
          }),

          // Section 1: Executive Summary
          new Paragraph({
            text: "1. Executive Summary",
            heading: HeadingLevel.HEADING_1,
            spacing: { after: 200 },
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: analysis.executiveSummary || "No summary provided.",
                size: 24, // 12pt
              }),
            ],
            spacing: { after: 400 },
          }),

          // Section 2: Entity Breakdown
          new Paragraph({
            text: "2. Entity Breakdown",
            heading: HeadingLevel.HEADING_1,
            spacing: { after: 200 },
          }),
          ...(analysis.entities || []).map(entity => [
            new Paragraph({
              text: entity.name || "Unknown Table",
              heading: HeadingLevel.HEADING_3,
              spacing: { before: 200, after: 100 },
            }),
            new Paragraph({
              text: entity.description || "No description available.",
              bullet: { level: 0 },
            }),
          ]).flat(),
          
          new Paragraph({ spacing: { after: 400 } }),

          // Section 3: Technical Implementation
          new Paragraph({
            text: `3. Technical Implementation (${dialect})`,
            heading: HeadingLevel.HEADING_1,
            spacing: { after: 200 },
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: sqlCode || "-- No SQL Generated --",
                font: "Courier New",
                size: 20, // 10pt
              }),
            ],
          }),
        ],
      },
    ],
  });

  const blob = await Packer.toBlob(doc);
  saveAs(blob, "VisionDB_Architecture_Report.docx");
};