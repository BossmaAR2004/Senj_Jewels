'use client';

import { useEffect, useState } from 'react';
import { Instagram } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';

const instagramPosts = [
  "https://www.instagram.com/p/C0eTkSMs-Fq/embed",
  "https://www.instagram.com/p/CzQt31sMXUB/embed",
  "https://www.instagram.com/p/CytfqSgMoIh/embed",
  // Add more post URLs here
];

export default function InstagramPage() {
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    setPosts([...instagramPosts].reverse());
  }, []);

  return (
    <div className="py-12 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold text-primary mb-4">Follow Us on Instagram</h1>
          <p className="max-w-3xl mx-auto text-gray-700 mb-6">
            Stay updated with our latest designs, special offers, and behind-the-scenes content by following us on Instagram.
          </p>
          <a
            href="https://www.instagram.com/senjjewels"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center"
          >
            <Button className="bg-primary hover:bg-primary/90 text-white inline-flex items-center">
              <Instagram className="mr-2 h-5 w-5" />
              @senjjewels
            </Button>
          </a>
        </div>

        <div className="bg-white/70 backdrop-blur-sm rounded-lg shadow-md p-8 mb-12">
          <h2 className="text-xl font-semibold text-primary mb-4">Connect With Us</h2>
          <p className="text-gray-700 mb-4">
            Our Instagram page is the best place to see our latest creations and get inspired. Follow us to be the first
            to know about new designs, special offers, and events.
          </p>
          <p className="text-gray-700">
            We love seeing our jewelry being worn! Tag us in your photos using <strong>#SenJewels</strong> for a chance to be featured on our page.
          </p>
        </div>

        <h2 className="text-2xl font-semibold text-primary mb-6 text-center">Our Instagram Feed</h2>

        <Swiper
          spaceBetween={20}
          slidesPerView={1}
          loop={true}
          className="max-w-xl mx-auto"
        >
          {posts.map((postUrl, idx) => (
            <SwiperSlide key={idx}>
              <iframe
                src={postUrl}
                height="500"
                frameBorder="0"
                scrolling="no"
                allowTransparency={true}
                className="rounded-lg shadow-lg w-full mx-auto hover:shadow-2xl transition-shadow duration-300"
              ></iframe>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </div>
  );
}
