import { Html, Head, Body, Preview, Text, Button } from "@react-email/components";
import React from "react";
import { EmailLayout, bodyTextStyle, buttonStyle } from "./shared";

export const subject = "You've been invited to your BluuHQ client portal";

export interface PortalInviteProps {
  clientName: string;
  loginUrl: string;
  role?: string;
}

export default function PortalInvite({ clientName, loginUrl }: PortalInviteProps) {
  return (
    <Html>
      <Head />
      <Preview>Access your BluuHQ client portal — invoices, files, and more</Preview>
      <Body style={{ backgroundColor: "#F1F5F9", margin: 0, padding: "32px 0" }}>
        <EmailLayout heading={`Welcome, ${clientName}!`} preview="">
          <Text style={bodyTextStyle}>
            You&apos;ve been invited to your BluuHQ client portal — a secure space where you can view your invoices, shared files, and service updates.
          </Text>
          <Text style={{ ...bodyTextStyle, marginBottom: "24px" }}>
            Click the button below to access your portal:
          </Text>
          <Button href={loginUrl} style={buttonStyle}>
            Access Your Portal
          </Button>
          <Text style={{ ...bodyTextStyle, marginTop: "24px", fontSize: "13px", color: "#64748B" }}>
            This link expires in 24 hours. If you didn&apos;t expect this email, you can safely ignore it.
          </Text>
        </EmailLayout>
      </Body>
    </Html>
  );
}
