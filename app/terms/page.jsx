"use client";

import { Shield, FileText, AlertTriangle, Mail } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function TermsPage() {
  const sections = [
    {
      id: "information-collection",
      title: "1. Information We Collect",
      content: [
        {
          subtitle: "1.1 Personal Information",
          items: [
            "Registration Information: When you register for an account or event, we collect personal information such as your name, email address, phone number, and payment details.",
            "Profile Information: Information you provide to set up your profile, including profile picture and preferences.",
          ],
        },
        {
          subtitle: "1.2 Usage Data",
          items: [
            "Interaction Data: Information about your interactions with our website, such as IP address, browser type, pages visited, and the time of your visit.",
            "Cookies and Tracking Technologies: We use cookies and similar technologies to enhance your experience and analyze usage. You can adjust your browser settings to refuse cookies, but this may affect functionality.",
          ],
        },
        {
          subtitle: "1.3 Communication Data",
          items: ["Customer Support: Records of communications with our support team, including queries and feedback."],
        },
      ],
    },
    {
      id: "information-usage",
      title: "2. How We Use Your Information",
      content: [
        {
          subtitle: "",
          items: [
            "To Provide Services: To process registrations, manage events, and communicate important updates.",
            "To Improve Our Platform: To analyze usage and improve our services.",
            "To Personalize Experience: To tailor content and recommendations based on your preferences.",
            "To Send Communications: To send newsletters, promotional materials, and other updates. You can opt-out at any time.",
          ],
        },
      ],
    },
    {
      id: "information-sharing",
      title: "3. How We Share Your Information",
      content: [
        {
          subtitle: "",
          items: [
            "We do not sell or rent your personal information. We may share your information in the following circumstances:",
            "Service Providers: With third-party service providers who assist us in operating our platform and providing services, subject to confidentiality agreements.",
            "Legal Requirements: If required by law or to protect our rights, property, or safety, or the rights, property, or safety of others.",
            "Business Transfers: In connection with a merger, acquisition, or other business transaction, where your information may be transferred as part of the transaction.",
          ],
        },
      ],
    },
    {
      id: "data-security",
      title: "4. Data Security",
      content: [
        {
          subtitle: "",
          items: [
            "We implement reasonable security measures to protect your personal information from unauthorized access, use, or disclosure. However, no method of transmission over the internet or electronic storage is 100% secure, and we cannot guarantee absolute security.",
          ],
        },
      ],
    },
    {
      id: "disclaimer",
      title: "5. Disclaimer of Liability",
      content: [
        {
          subtitle: "",
          items: [
            "Event Circle serves as a platform that facilitates connections between hosts and clients for events. We are not responsible for any issues, disputes, or incidents that arise during or as a result of events organized through our platform. This includes, but is not limited to, any damage, injury, or loss related to the event, actions of hosts or clients, and any third-party interactions.",
            "Additionally, all payments made to hosts are conducted at your own risk. We do not assume any responsibility for the accuracy, legality, or quality of the services provided by hosts or for any disputes that may arise between users.",
          ],
        },
      ],
    },
    {
      id: "user-choices",
      title: "6. Your Choices",
      content: [
        {
          subtitle: "",
          items: [
            "Access and Update: You can access and update your personal information through your account settings.",
          ],
        },
      ],
    },
    {
      id: "policy-changes",
      title: "7. Changes to This Policy",
      content: [
        {
          subtitle: "",
          items: [
            "We may update this Privacy Policy from time to time. Any changes will be posted on this page with an updated effective date. We encourage you to review this policy periodically.",
          ],
        },
      ],
    },
    {
      id: "contact",
      title: "8. Contact Us",
      content: [
        {
          subtitle: "",
          items: [
            "If you have any questions or concerns about this Privacy Policy or our data practices, please contact us at: Truecirclevents@gmail.com",
            "By using our website and services, you agree to the terms of agreement and privacy policy.",
          ],
        },
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Hero Section */}
      <section className="pt-20 pb-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl md:text-6xl font-bold gradient-text mb-6">Terms & Conditions</h1>
          <p className="text-xl text-muted-foreground leading-relaxed mb-4">
            Privacy Policy & Terms of Service
          </p>
          <div className="flex items-center justify-center gap-2 text-muted-foreground">
            <FileText className="w-5 h-5" />
            <span>Effective Date: August 30, 2024</span>
          </div>
        </div>
      </section>

      {/* Introduction */}
      <section className="py-8 px-4">
        <div className="max-w-4xl mx-auto">
          <Card className="border bg-primary text-primary-foreground">
            <CardContent className="p-8">
              <div className="flex items-start gap-4">
                <Shield className="w-8 h-8 mt-1 flex-shrink-0" />
                <div>
                  <h2 className="text-2xl font-bold mb-4">Welcome to EventCircle.site</h2>
                  <p className="leading-relaxed opacity-90">
                    A product of TrueCircleEvents Pty (Ltd). We are committed to protecting your privacy and ensuring
                    a secure experience on our platform. This Privacy Policy outlines how we collect, use, and protect
                    your personal information when you use our website and services.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Terms Sections */}
      <section className="py-8 px-4">
        <div className="max-w-4xl mx-auto space-y-8">
          {sections.map((section) => (
            <Card key={section.id} className="border bg-card shadow">
              <CardHeader>
                <CardTitle className="text-2xl font-bold">{section.title}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {section.content.map((subsection, subIndex) => (
                  <div key={subIndex}>
                    {subsection.subtitle && (
                      <h4 className="text-lg font-semibold text-foreground mb-3">{subsection.subtitle}</h4>
                    )}
                    <ul className="space-y-3">
                      {subsection.items.map((item, itemIndex) => (
                        <li key={itemIndex} className="text-muted-foreground leading-relaxed flex gap-2">
                          <span className="w-2 h-2 mt-2 bg-primary rounded-full shrink-0" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      
    </div>
  );
}
