import { Html, Head, Body, Preview, Text, Button } from "@react-email/components";
import React from "react";
import { EmailLayout, bodyTextStyle, buttonStyle } from "./shared";

export function getSubject() {
  return "You have a new service from BluuHQ";
}

export interface NewServiceProps {
  clientName: string;
  serviceName: string;
  portalUrl: string;
}

export default function NewService({ clientName, serviceName, portalUrl }: NewServiceProps) {
  return (
    <Html>
      <Head />
      <Preview>A new service has been set up for you: {serviceName}</Preview>
      <Body style={{ backgroundColor: "#F1F5F9", margin: 0, padding: "32px 0" }}>
        <EmailLayout heading="New Service Added" preview="">
          <Text style={bodyTextStyle}>Hi {clientName},</Text>
          <Text style={bodyTextStyle}>
            We&apos;ve set up a new service for you: <strong>{serviceName}</strong>.
          </Text>
          <Text style={{ ...bodyTextStyle, marginBottom: "24px" }}>
            You can view your service details, track progress, and access any shared files in your client portal.
          </Text>
          <Button href={portalUrl} style={buttonStyle}>View in Portal</Button>
        </EmailLayout>
      </Body>
    </Html>
  );
}
