import { Html, Head, Body, Preview, Text } from "@react-email/components";
import React from "react";
import { EmailLayout, bodyTextStyle } from "./shared";

export function getSubject(clientName: string, action: string) {
  return `Audit: ${clientName} ${action} a credential`;
}

export interface CredentialRevealedProps {
  clientName: string;
  fieldLabel: string;
  action: "revealed" | "copied";
  occurredAt: string;
}

export default function CredentialRevealed({ clientName, fieldLabel, action, occurredAt }: CredentialRevealedProps) {
  return (
    <Html>
      <Head />
      <Preview>Security audit: {clientName} {action} credential "{fieldLabel}"</Preview>
      <Body style={{ backgroundColor: "#F1F5F9", margin: 0, padding: "32px 0" }}>
        <EmailLayout heading="Security Audit Event" preview="">
          <Text style={bodyTextStyle}>A portal credential was {action} by a client.</Text>
          <div style={{ backgroundColor: "#FFFBEB", border: "1px solid #FDE68A", borderRadius: "8px", padding: "16px 20px", marginBottom: "24px" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <tbody>
                {[
                  ["Client", clientName],
                  ["Field", fieldLabel],
                  ["Action", action.charAt(0).toUpperCase() + action.slice(1)],
                  ["Time", occurredAt],
                ].map(([label, value]) => (
                  <tr key={label}>
                    <td style={{ padding: "5px 0", color: "#64748B", fontSize: "13px" }}>{label}</td>
                    <td style={{ padding: "5px 0", fontWeight: "600", fontSize: "13px" }}>{value}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Text style={{ ...bodyTextStyle, fontSize: "13px", color: "#64748B" }}>
            This is an automated security notification. No action is required unless the access appears unauthorized.
          </Text>
        </EmailLayout>
      </Body>
    </Html>
  );
}
