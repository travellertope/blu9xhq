import { Section, Text, Hr, Container } from "@react-email/components";
import React from "react";

const PRIMARY = "#4F46E5";
const BODY_TEXT = "#1E293B";
const SLATE_400 = "#94A3B8";

export const containerStyle: React.CSSProperties = {
  maxWidth: "560px",
  margin: "0 auto",
  fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
  backgroundColor: "#ffffff",
};

export const headerStyle: React.CSSProperties = {
  backgroundColor: PRIMARY,
  padding: "24px 32px",
};

export const headerTextStyle: React.CSSProperties = {
  color: "#ffffff",
  fontSize: "20px",
  fontWeight: "700",
  margin: 0,
};

export const bodyStyle: React.CSSProperties = {
  padding: "32px",
};

export const bodyTextStyle: React.CSSProperties = {
  color: BODY_TEXT,
  fontSize: "15px",
  lineHeight: "1.6",
  margin: "0 0 16px 0",
};

export const buttonStyle: React.CSSProperties = {
  display: "inline-block",
  backgroundColor: PRIMARY,
  color: "#ffffff",
  padding: "12px 28px",
  borderRadius: "6px",
  textDecoration: "none",
  fontWeight: "600",
  fontSize: "14px",
};

export const footerStyle: React.CSSProperties = {
  padding: "16px 32px",
  backgroundColor: "#F8FAFC",
  borderTop: "1px solid #E2E8F0",
};

export const footerTextStyle: React.CSSProperties = {
  color: SLATE_400,
  fontSize: "12px",
  margin: 0,
  lineHeight: "1.5",
};

export function EmailLayout({
  preview: _preview,
  heading,
  children,
}: {
  preview: string;
  heading: string;
  children: React.ReactNode;
}) {
  return (
    <Container style={containerStyle}>
      {/* Header */}
      <Section style={headerStyle}>
        <Text style={headerTextStyle}>BluuHQ</Text>
      </Section>

      {/* Body */}
      <Section style={bodyStyle}>
        <Text
          style={{
            ...bodyTextStyle,
            fontSize: "18px",
            fontWeight: "600",
            marginBottom: "20px",
          }}
        >
          {heading}
        </Text>
        {children}
      </Section>

      <Hr style={{ borderColor: "#E2E8F0", margin: 0 }} />

      {/* Footer */}
      <Section style={footerStyle}>
        <Text style={footerTextStyle}>
          BluuHQ · hello@bluuhq.com
          {"\n"}
          You received this email because you are a BluuHQ client.
        </Text>
      </Section>
    </Container>
  );
}
