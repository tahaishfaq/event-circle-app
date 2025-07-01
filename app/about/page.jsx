"use client";

import { Users, Target, Heart, Award } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export default function AboutPage() {
  const values = [
    {
      icon: Users,
      title: "User-centricity",
      description: "We prioritize the needs and experiences of our users in everything we do.",
    },
    {
      icon: Target,
      title: "Innovation",
      description: "We are constantly seeking new ways to improve our platform and enhance the event experience.",
    },
    {
      icon: Heart,
      title: "Community",
      description: "We believe in the power of events to bring people together and build strong communities.",
    },
    {
      icon: Award,
      title: "Excellence",
      description: "We are committed to providing exceptional service and a high-quality platform.",
    },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Hero Section */}
      <section className="pt-20 pb-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl md:text-6xl font-bold gradient-text mb-6">
            About TrueCircleEvents
          </h1>
          <p className="text-xl text-muted-foreground leading-relaxed">
            Connecting communities through unforgettable experiences since 2024
          </p>
        </div>
      </section>

      {/* Our Story Section */}
      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-4xl font-bold mb-6 text-foreground">Our Story</h2>
            <div className="space-y-4 text-muted-foreground leading-relaxed">
              <p>
                TrueCircleEvents was founded in 2024 with a simple yet powerful vision: to create a platform that seamlessly connects event hosts and attendees, fostering vibrant communities and unforgettable experiences.
              </p>
              <p>
                We recognized the need for a user-friendly platform that empowers hosts to easily manage and promote their events while providing attendees with a streamlined way to discover and participate in exciting happenings.
              </p>
              <p>
                From our humble beginnings, we have grown into a thriving community of event organizers and enthusiasts. We are driven by a passion for innovation and a commitment to providing exceptional service.
              </p>
              <p>
                We believe that events are the lifeblood of communities, and we are dedicated to making them more accessible and enjoyable for everyone.
              </p>
            </div>
          </div>
          <div className="relative">
            <div className="rounded-2xl p-8 text-primary-foreground bg-primary">
              <h3 className="text-2xl font-bold mb-4">Our Mission</h3>
              <p className="leading-relaxed">
                Our mission is to empower event hosts and enrich the lives of attendees by providing a cutting-edge platform that simplifies event management and facilitates meaningful connections. We strive to be the go-to destination for discovering and experiencing the best events worldwide.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-16 px-4 bg-card">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-foreground mb-4">Our Values</h2>
            <p className="text-xl text-muted-foreground">The principles that guide everything we do</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => (
              <Card
                key={index}
                className="h-full hover-lift transition-shadow border bg-gradient-to-br from-muted to-background"
              >
                <CardContent className="p-6 text-center">
                  <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-4">
                    <value.icon className="w-8 h-8 text-primary-foreground" />
                  </div>
                  <h3 className="text-xl font-bold text-foreground mb-3">{value.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">{value.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold text-foreground mb-6">Our Team</h2>
          <p className="text-xl text-muted-foreground leading-relaxed">
            We are a team of passionate individuals with diverse backgrounds and a shared commitment to creating a world-class event platform. Our team combines expertise in technology, design, and community building to deliver exceptional experiences for our users.
          </p>
        </div>
      </section>

      {/* Contact CTA */}
      <section className="py-16 px-4 bg-primary">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold text-primary-foreground mb-6">Ready to Get Started?</h2>
          <p className="text-xl text-primary-foreground/80 mb-8">
            Join thousands of event creators and attendees who trust TrueCircleEvents
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="/auth/register"
              className="bg-background text-primary px-8 py-3 rounded-full font-semibold hover:bg-muted transition-colors"
            >
              Start Creating Events
            </a>
            <a
              href="/contact"
              className="border-2 border-background text-background px-8 py-3 rounded-full font-semibold hover:bg-background hover:text-primary transition-colors"
            >
              Contact Us
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
