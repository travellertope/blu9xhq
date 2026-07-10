import { Section, Text, Hr, Container, Img } from "@react-email/components";
import React from "react";

const PRIMARY = "#1875F2";
const BODY_TEXT = "#1E293B";
const SLATE_400 = "#94A3B8";

const LOGO_URL =
  "https://mlgepubil2mw.i.optimole.com/w:742/h:157/q:mauto/g:sm/f:best/https://bluuhq.com/wp-content/uploads/2026/05/cropped-bluuhq.png";

export const containerStyle: React.CSSProperties = {
  maxWidth: "560px",
  margin: "0 auto",
  fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
  backgroundColor: "#ffffff",
};

export const headerStyle: React.CSSProperties = {
  backgroundColor: "#ffffff",
  padding: "20px 32px",
  borderBottom: `4px solid ${PRIMARY}`,
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
        <Img
          src={LOGO_URL}
          alt="BluuHQ"
          height={32}
          style={{ display: "block" }}
        />
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
