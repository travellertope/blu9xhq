import { Html, Head, Body, Preview, Text, Button } from "@react-email/components";
import React from "react";
import { EmailLayout, bodyTextStyle, buttonStyle } from "./shared";

export const subject = "You've been invited to the BluuHQ team workspace";

export interface TeamInviteProps {
  memberName: string;
  role: string;
  setupUrl: string;
}

export default function TeamInvite({ memberName, role, setupUrl }: TeamInviteProps) {
  return (
    <Html>
      <Head />
      <Preview>You&apos;ve been invited to join the BluuHQ team</Preview>
      <Body style={{ backgroundColor: "#F1F5F9", margin: 0, padding: "32px 0" }}>
        <EmailLayout heading={`Welcome to BluuHQ, ${memberName}!`} preview="">
          <Text style={bodyTextStyle}>
            You&apos;ve been invited to join the BluuHQ CRM as <strong>{role}</strong>.
          </Text>
          <Text style={{ ...bodyTextStyle, marginBottom: "24px" }}>
            Set up your account to get started:
          </Text>
          <Button href={setupUrl} style={buttonStyle}>
            Set Up Your Account
          </Button>
          <Text style={{ ...bodyTextStyle, marginTop: "24px", fontSize: "13px", color: "#64748B" }}>
            This invitation expires in 48 hours.
          </Text>
        </EmailLayout>
      </Body>
    </Html>
  );
}
