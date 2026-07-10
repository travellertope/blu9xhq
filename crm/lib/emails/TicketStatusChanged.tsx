import { Html, Head, Body, Preview, Text, Button } from "@react-email/components";
import React from "react";
import { EmailLayout, bodyTextStyle, buttonStyle } from "./shared";

export interface TicketStatusChangedProps {
  clientName: string;
  ticketNumber: string;
  subject: string;
  fromStatus: string;
  toStatus: string;
  ticketUrl: string;
  note?: string;
}

export function getSubject(ticketNumber: string, toStatus: string) {
  const label = toStatus.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
  return `Ticket ${ticketNumber} is now ${label}`;
}

export default function TicketStatusChanged({
  clientName,
  ticketNumber,
  subject,
  fromStatus,
  toStatus,
  ticketUrl,
  note,
}: TicketStatusChangedProps) {
  const fmt = (s: string) => s.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
  return (
    <Html>
      <Head />
      <Preview>Your ticket {ticketNumber} status has been updated</Preview>
      <Body style={{ backgroundColor: "#F1F5F9", margin: 0, padding: "32px 0" }}>
        <EmailLayout heading={`Hi ${clientName},`} preview="">
          <Text style={bodyTextStyle}>
            The status of your ticket <strong>{ticketNumber}</strong> ({subject}) has been updated.
          </Text>
          <Text style={bodyTextStyle}>
            <strong>{fmt(fromStatus)}</strong> → <strong>{fmt(toStatus)}</strong>
          </Text>
          {note && (
            <Text style={{ ...bodyTextStyle, color: "#475569", fontStyle: "italic" }}>
              Note: {note}
            </Text>
          )}
          <Button href={ticketUrl} style={buttonStyle}>View Ticket</Button>
        </EmailLayout>
      </Body>
    </Html>
  );
}
