import { Html, Head, Body, Preview, Text, Button, Section } from "@react-email/components";
import React from "react";
import { EmailLayout, bodyTextStyle, buttonStyle, footerTextStyle } from "./shared";

export interface TicketCreatedProps {
  clientName: string;
  ticketNumber: string;
  subject: string;
  category: string;
  priority: string;
  ticketUrl: string;
}

export function getSubject(ticketNumber: string) {
  return `Your support ticket ${ticketNumber} has been received`;
}

export default function TicketCreated({
  clientName,
  ticketNumber,
  subject,
  category,
  priority,
  ticketUrl,
}: TicketCreatedProps) {
  return (
    <Html>
      <Head />
      <Preview>We&apos;ve received your support ticket {ticketNumber}</Preview>
      <Body style={{ backgroundColor: "#F1F5F9", margin: 0, padding: "32px 0" }}>
        <EmailLayout heading={`Hi ${clientName},`} preview="">
          <Text style={bodyTextStyle}>
            We&apos;ve received your support ticket and our team is on it. Here&apos;s a summary:
          </Text>
          <Section style={{ backgroundColor: "#F8FAFC", borderRadius: 8, padding: "16px 20px", marginBottom: 20 }}>
            <Text style={{ ...bodyTextStyle, margin: "4px 0" }}>
              <strong>Ticket:</strong> {ticketNumber}
            </Text>
            <Text style={{ ...bodyTextStyle, margin: "4px 0" }}>
              <strong>Subject:</strong> {subject}
            </Text>
            <Text style={{ ...bodyTextStyle, margin: "4px 0" }}>
              <strong>Category:</strong> {category.replace(/_/g, " ")}
            </Text>
            <Text style={{ ...bodyTextStyle, margin: "4px 0" }}>
              <strong>Priority:</strong> {priority}
            </Text>
          </Section>
          <Text style={bodyTextStyle}>
            You can view updates and replies to your ticket at any time in the portal.
          </Text>
          <Button href={ticketUrl} style={buttonStyle}>View Ticket</Button>
          <Text style={{ ...footerTextStyle, marginTop: 24 }}>
            We aim to respond within our SLA window based on priority. You&apos;ll receive an email when we reply.
          </Text>
        </EmailLayout>
      </Body>
    </Html>
  );
}
