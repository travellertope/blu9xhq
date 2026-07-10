import { Html, Head, Body, Preview, Text, Button, Section } from "@react-email/components";
import React from "react";
import { EmailLayout, bodyTextStyle, buttonStyle } from "./shared";

export interface TicketReplyProps {
  recipientName: string;
  ticketNumber: string;
  subject: string;
  authorName: string;
  replyPreview: string; // first 300 chars of reply body
  ticketUrl: string;
}

export function getSubject(ticketNumber: string) {
  return `New reply on ticket ${ticketNumber}`;
}

export default function TicketReply({
  recipientName,
  ticketNumber,
  subject,
  authorName,
  replyPreview,
  ticketUrl,
}: TicketReplyProps) {
  return (
    <Html>
      <Head />
      <Preview>New reply on ticket {ticketNumber}: {subject}</Preview>
      <Body style={{ backgroundColor: "#F1F5F9", margin: 0, padding: "32px 0" }}>
        <EmailLayout heading={`Hi ${recipientName},`} preview="">
          <Text style={bodyTextStyle}>
            <strong>{authorName}</strong> has replied to ticket <strong>{ticketNumber}</strong>: {subject}
          </Text>
          <Section style={{
            backgroundColor: "#F8FAFC",
            borderLeft: "3px solid #1875F2",
            padding: "12px 16px",
            borderRadius: "0 6px 6px 0",
            marginBottom: 20,
          }}>
            <Text style={{ ...bodyTextStyle, margin: 0, fontStyle: "italic", color: "#475569" }}>
              {replyPreview}{replyPreview.length >= 300 ? "…" : ""}
            </Text>
          </Section>
          <Button href={ticketUrl} style={buttonStyle}>View Full Reply</Button>
        </EmailLayout>
      </Body>
    </Html>
  );
}
