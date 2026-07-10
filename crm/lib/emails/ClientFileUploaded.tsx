import { Html, Head, Body, Preview, Text, Button } from "@react-email/components";
import React from "react";
import { EmailLayout, bodyTextStyle, buttonStyle } from "./shared";

export function getSubject(clientName: string) {
  return `${clientName} shared a file with you`;
}

export interface ClientFileUploadedProps {
  clientName: string;
  fileName: string;
  adminCrmUrl: string;
}

export default function ClientFileUploaded({ clientName, fileName, adminCrmUrl }: ClientFileUploadedProps) {
  return (
    <Html>
      <Head />
      <Preview>{clientName} uploaded a file: {fileName}</Preview>
      <Body style={{ backgroundColor: "#F1F5F9", margin: 0, padding: "32px 0" }}>
        <EmailLayout heading="Client File Uploaded" preview="">
          <Text style={bodyTextStyle}>
            <strong>{clientName}</strong> has uploaded a file via the client portal:
          </Text>
          <div style={{ backgroundColor: "#F8FAFC", border: "1px solid #E2E8F0", borderRadius: "8px", padding: "16px 20px", marginBottom: "24px" }}>
            <Text style={{ margin: 0, fontWeight: "600", fontSize: "14px", color: "#1E293B" }}>{fileName}</Text>
          </div>
          <Button href={adminCrmUrl} style={buttonStyle}>View in CRM</Button>
        </EmailLayout>
      </Body>
    </Html>
  );
}
