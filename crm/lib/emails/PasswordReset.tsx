import { Html, Head, Body, Preview, Text, Button } from "@react-email/components";
import React from "react";
import { EmailLayout, bodyTextStyle, buttonStyle } from "./shared";

export const subject = "Reset your BluuHQ portal password";

export interface PasswordResetProps {
  name: string;
  resetUrl: string;
}

export default function PasswordReset({ name, resetUrl }: PasswordResetProps) {
  return (
    <Html>
      <Head />
      <Preview>Reset your BluuHQ portal password — link valid for 1 hour</Preview>
      <Body style={{ backgroundColor: "#F1F5F9", margin: 0, padding: "32px 0" }}>
        <EmailLayout heading="Reset Your Password" preview="">
          <Text style={bodyTextStyle}>Hi {name},</Text>
          <Text style={{ ...bodyTextStyle, marginBottom: "24px" }}>
            We received a request to reset your BluuHQ portal password. Click the button below to create a new one.
          </Text>
          <Button href={resetUrl} style={buttonStyle}>
            Reset Password
          </Button>
          <Text style={{ ...bodyTextStyle, marginTop: "24px", fontSize: "13px", color: "#64748B" }}>
            This link expires in 1 hour. If you didn&apos;t request a password reset, you can safely ignore this email — your password won&apos;t change.
          </Text>
        </EmailLayout>
      </Body>
    </Html>
  );
}
