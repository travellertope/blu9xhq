import { Html, Head, Body, Preview, Text } from "@react-email/components";
import React from "react";
import { EmailLayout, bodyTextStyle } from "./shared";

export function getSubject() {
  return "Your cancellation has been confirmed";
}

export interface CancellationConfirmedProps {
  clientName: string;
  serviceName: string;
  confirmedAt: string;
}

export default function CancellationConfirmed({ clientName, serviceName, confirmedAt }: CancellationConfirmedProps) {
  return (
    <Html>
      <Head />
      <Preview>Your cancellation of {serviceName} has been confirmed</Preview>
      <Body style={{ backgroundColor: "#F1F5F9", margin: 0, padding: "32px 0" }}>
        <EmailLayout heading="Cancellation Confirmed" preview="">
          <Text style={bodyTextStyle}>Hi {clientName},</Text>
          <Text style={bodyTextStyle}>
            Your cancellation of <strong>{serviceName}</strong> has been confirmed as of {confirmedAt}.
          </Text>
          <Text style={bodyTextStyle}>
            Your access and data will remain available until the end of your current billing period. After that, your account will be closed.
          </Text>
          <Text style={{ ...bodyTextStyle, marginTop: "24px" }}>
            We&apos;re sorry to see you go, and we hope to work with you again in the future.
          </Text>
          <Text style={bodyTextStyle}>— The BluuHQ Team</Text>
        </EmailLayout>
      </Body>
    </Html>
  );
}
