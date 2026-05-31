import { Html, Head, Body, Preview, Text, Button } from "@react-email/components";
import React from "react";
import { EmailLayout, bodyTextStyle, buttonStyle } from "./shared";

export function getSubject(clientName: string, serviceName: string) {
  return `Cancellation requested — ${clientName} · ${serviceName}`;
}

export interface CancellationRequestedProps {
  clientName: string;
  serviceName: string;
  reason: string;
  note?: string;
  reviewUrl: string;
}

export default function CancellationRequested({ clientName, serviceName, reason, note, reviewUrl }: CancellationRequestedProps) {
  return (
    <Html>
      <Head />
      <Preview>Cancellation request from {clientName} for {serviceName}</Preview>
      <Body style={{ backgroundColor: "#F1F5F9", margin: 0, padding: "32px 0" }}>
        <EmailLayout heading="Cancellation Request Received" preview="">
          <Text style={bodyTextStyle}>
            <strong>{clientName}</strong> has requested to cancel <strong>{serviceName}</strong>.
          </Text>
          <div style={{ backgroundColor: "#FEF2F2", border: "1px solid #FECACA", borderRadius: "8px", padding: "16px 20px", marginBottom: "24px" }}>
            <Text style={{ margin: "0 0 8px", fontSize: "13px", color: "#64748B", fontWeight: "600" }}>Reason</Text>
            <Text style={{ margin: 0, fontSize: "14px", color: "#1E293B" }}>{reason}</Text>
            {note && (
              <>
                <Text style={{ margin: "12px 0 4px", fontSize: "13px", color: "#64748B", fontWeight: "600" }}>Additional note</Text>
                <Text style={{ margin: 0, fontSize: "14px", color: "#1E293B" }}>{note}</Text>
              </>
            )}
          </div>
          <Button href={reviewUrl} style={buttonStyle}>Review Request</Button>
        </EmailLayout>
      </Body>
    </Html>
  );
}
