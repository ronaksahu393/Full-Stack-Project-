import React from "react";
import HeroSection from "../components/home/HeroSection";
import FeaturedStays from "../components/home/FeaturedStays";
import FeaturedDestinations from "../components/home/FeaturedDestinations";
import GuestTrust from "../components/home/GuestTrust";
import BookingCTA from "../components/home/BookingCTA";

export default function HomePage() {
  return (
    <div className="space-y-0">
      <HeroSection />
      <FeaturedStays />
      <FeaturedDestinations />
      <GuestTrust />
      <BookingCTA />
    </div>
  );
}
