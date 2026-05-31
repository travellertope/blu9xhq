import { Html, Head, Body, Preview, Text, Button } from "@react-email/components";
import React from "react";
import { EmailLayout, bodyTextStyle, buttonStyle } from "./shared";

export function getSubject(fileName: string) {
  return `BluuHQ shared a file with you: ${fileName}`;
}

export interface FileSharedProps {
  clientName: string;
  fileName: string;
  fileCategory: string;
  sharedBy: string;
  portalUrl: string;
}

export default function FileShared({ clientName, fileName, fileCategory, sharedBy, portalUrl }: FileSharedProps) {
  return (
    <Html>
      <Head />
      <Preview>{sharedBy} shared a file with you: {fileName}</Preview>
      <Body style={{ backgroundColor: "#F1F5F9", margin: 0, padding: "32px 0" }}>
        <EmailLayout heading="New File Shared with You" preview="">
          <Text style={bodyTextStyle}>Hi {clientName},</Text>
          <Text style={bodyTextStyle}>
            <strong>{sharedBy}</strong> has shared a file with you:
          </Text>
          <div style={{ backgroundColor: "#F8FAFC", border: "1px solid #E2E8F0", borderRadius: "8px", padding: "16px 20px", marginBottom: "24px" }}>
            <Text style={{ margin: 0, fontWeight: "600", fontSize: "14px", color: "#1E293B" }}>{fileName}</Text>
            <Text style={{ margin: "4px 0 0", fontSize: "13px", color: "#64748B", textTransform: "capitalize" }}>{fileCategory}</Text>
          </div>
          <Button href={portalUrl} style={buttonStyle}>View Files in Portal</Button>
        </EmailLayout>
      </Body>
    </Html>
  );
}
