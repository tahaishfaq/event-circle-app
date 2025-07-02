"use client";

import { useState } from "react";
import { Mail, MapPin, Clock, Send, MessageCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useFormik } from "formik";
import * as Yup from "yup";
import axios from "axios";

export default function ContactPage() {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validationSchema = Yup.object({
    name: Yup.string().required("Name is required"),
    email: Yup.string().email("Invalid email address").required("Email is required"),
    subject: Yup.string().required("Subject is required"),
    message: Yup.string().required("Message is required"),
  });

  const formik = useFormik({
    initialValues: {
      name: "",
      email: "",
      subject: "",
      message: "",
    },
    validationSchema,
    onSubmit: async (values, { resetForm }) => {
      setIsSubmitting(true);
      try {
        await axios.post("/api/contact", values);
        toast({
          title: "Message Sent!",
          description: "Thank you for contacting us. We'll get back to you soon.",
        });
        resetForm();
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to send message. Please try again later.",
          variant: "destructive",
        });
      } finally {
        setIsSubmitting(false);
      }
    },
  });

  const contactInfo = [
    {
      icon: Mail,
      title: "Email Us",
      content: "Truecirclevents@gmail.com",
      description: "Send us an email anytime",
    },
    {
      icon: MapPin,
      title: "Visit Us",
      content: "Johannesburg, South Africa",
      description: "Our headquarters",
    },
    {
      icon: Clock,
      title: "Business Hours",
      content: "Mon-Fri: 8am-5pm",
      description: "Saturday: 9am-2pm",
    },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Hero Section */}
      <section className="pt-24 pb-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-primary/5 to-background">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/60 mb-6">
            Contact Us
          </h1>
          <p className="text-lg sm:text-xl text-muted-foreground leading-relaxed max-w-2xl mx-auto">
            We'd love to hear from you. Send us a message, and our team will respond promptly.
          </p>
        </div>
      </section>

      {/* Contact Info Cards */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
            {contactInfo.map((info, index) => (
              <Card
                key={index}
                className="group relative overflow-hidden border bg-card hover:shadow-lg transition-all duration-300"
              >
                <CardContent className="p-6 text-center">
                  <div className="w-14 h-14 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-primary/20 transition-colors">
                    <info.icon className="w-7 h-7 text-primary" />
                  </div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">{info.title}</h3>
                  <p className="text-primary font-medium mb-1">{info.content}</p>
                  <p className="text-sm text-muted-foreground">{info.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Contact Form */}
          <div className="grid lg:grid-cols-2 gap-8 items-start">
            <Card className="border bg-card shadow-xl">
              <CardHeader>
                <CardTitle className="text-2xl font-bold flex items-center gap-2 text-foreground">
                  <MessageCircle className="w-6 h-6 text-primary" />
                  Send us a Message
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <form onSubmit={formik.handleSubmit} className="space-y-5">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="name" className="block text-sm font-medium text-muted-foreground mb-1.5">
                        Full Name
                      </label>
                      <Input
                        id="name"
                        name="name"
                        type="text"
                        value={formik.values.name}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        placeholder="Your full name"
                        className={`w-full transition-colors focus:ring-2 focus:ring-primary ${
                          formik.touched.name && formik.errors.name ? "border-red-500" : ""
                        }`}
                      />
                      {formik.touched.name && formik.errors.name && (
                        <p className="text-red-500 text-xs mt-1">{formik.errors.name}</p>
                      )}
                    </div>
                    <div>
                      <label htmlFor="email" className="block text-sm font-medium text-muted-foreground mb-1.5">
                        Email Address
                      </label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        value={formik.values.email}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        placeholder="your@email.com"
                        className={`w-full transition-colors focus:ring-2 focus:ring-primary ${
                          formik.touched.email && formik.errors.email ? "border-red-500" : ""
                        }`}
                      />
                      {formik.touched.email && formik.errors.email && (
                        <p className="text-red-500 text-xs mt-1">{formik.errors.email}</p>
                      )}
                    </div>
                  </div>

                  <div>
                    <label htmlFor="subject" className="block text-sm font-medium text-muted-foreground mb-1.5">
                      Subject
                    </label>
                    <Input
                      id="subject"
                      name="subject"
                      type="text"
                      value={formik.values.subject}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      placeholder="What's this about?"
                      className={`w-full transition-colors focus:ring-2 focus:ring-primary ${
                        formik.touched.subject && formik.errors.subject ? "border-red-500" : ""
                      }`}
                    />
                    {formik.touched.subject && formik.errors.subject && (
                      <p className="text-red-500 text-xs mt-1">{formik.errors.subject}</p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="message" className="block text-sm font-medium text-muted-foreground mb-1.5">
                      Message
                    </label>
                    <Textarea
                      id="message"
                      name="message"
                      value={formik.values.message}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      placeholder="Tell us more about your inquiry..."
                      rows={6}
                      className={`w-full transition-colors focus:ring-2 focus:ring-primary ${
                        formik.touched.message && formik.errors.message ? "border-red-500" : ""
                      }`}
                    />
                    {formik.touched.message && formik.errors.message && (
                      <p className="text-red-500 text-xs mt-1">{formik.errors.message}</p>
                    )}
                  </div>

                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-primary text-primary-foreground hover:bg-primary/90 transition-colors flex items-center justify-center gap-2"
                  >
                    {isSubmitting ? (
                      "Sending..."
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        Send Message
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>

            <div className="space-y-8">
              <div>
                <h3 className="text-2xl font-bold text-foreground mb-4">Get in Touch</h3>
                <p className="text-muted-foreground leading-relaxed mb-6 max-w-lg">
                  Have questions about our platform? Need help with your events? Want to partner with us? We're here to assist you.
                </p>
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                      <Mail className="w-5 h-5 text-primary" />
                    </div>
                    <span className="text-muted-foreground text-sm">General inquiries: Truecirclevents@gmail.com</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                      <MessageCircle className="w-5 h-5 text-primary" />
                    </div>
                    <span className="text-muted-foreground text-sm">We typically respond within 24 hours</span>
                  </div>
                </div>
              </div>

              <div className="rounded-2xl p-6 text-primary-foreground bg-primary/95 shadow-lg">
                <h4 className="text-xl font-bold mb-3">Need Immediate Help?</h4>
                <p className="mb-4 opacity-90 text-sm">
                  Check out our FAQ section or browse our help documentation for quick answers to common questions.
                </p>
                <Button
                  variant="secondary"
                  className="bg-background text-primary hover:bg-muted transition-colors"
                >
                  Visit Help Center
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}