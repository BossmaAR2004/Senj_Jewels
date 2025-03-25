import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"

export default function Home() {
  return (
    <div className="relative">
      {/* Background image */}
      <div className="absolute inset-0 -z-10 opacity-10">
        <Image src="/Images/53804c89-dc54-42b7-8516-3ee3054cf543.jpg" alt="Background" fill className="object-cover" priority />
      </div>

      <div className="max-w-4xl mx-auto">
        {/* Hero section - reduced top padding */}
        <section className="flex flex-col items-center text-center py-6 md:py-12">
          <Image src="/Images/logo.png" alt="Sen Jewels Logo" width={150} height={150} className="mb-6" priority />
          <h1 className="text-4xl md:text-5xl font-bold text-teal-800 mb-3">Handcrafted Elegance</h1>
          <p className="text-xl text-teal-600 mb-6">Exquisite jewelry pieces crafted with passion</p>
          <div className="flex flex-col sm:flex-row gap-4 mb-8">
            <Button asChild className="bg-teal-600 hover:bg-teal-700">
              <Link href="/shop">
                Shop Collection <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button asChild variant="outline" className="border-teal-600 text-teal-600 hover:bg-teal-50">
              <Link href="/contact">Contact Us</Link>
            </Button>
          </div>
          <div className="bg-white/70 backdrop-blur-sm p-6 rounded-lg shadow-md">
            <p className="text-lg text-gray-700 mb-6 leading-relaxed">
              Welcome to SenJewels, your one-stop destination for exquisite jewellery. We offer a wide range of
              jewellery pieces, including stunning glass beads and precious gemstones. Each piece is carefully
              handcrafted to perfection, ensuring exceptional quality and beauty. Explore our collection and find the
              perfect accessory to enhance your style. Don't miss out on our exclusive offer - handmade bracelets
              available for just £2 each. Shop now and add a touch of elegance to your look.
            </p>
          </div>
        </section>

        {/* Featured categories */}
        <section className="py-12">
          <h2 className="text-2xl md:text-3xl font-bold text-center text-teal-800 mb-8">Our Collections</h2>
          <div className="grid md:grid-cols-2 gap-8">
            <CategoryCard
              title="Gemstone Collection"
              description="Discover our exquisite gemstone jewelry, featuring natural stones that capture light and attention. Each piece is carefully crafted to showcase the unique beauty of precious and semi-precious stones."
              href="/gemstone"
              imageSrc="/Images/GemstoneHomePage.jpg"
            />
            <CategoryCard
              title="Glass Beads Collection"
              description="Explore our colorful glass bead creations, each piece uniquely handcrafted with attention to detail. From vibrant bracelets to elegant necklaces, find your perfect accessory at just £2 each."
              href="/glass-beads"
              imageSrc="/Images/GlassBeadsHomePage.jpg"
            />
          </div>
        </section>

        {/* Special offer */}
        <section className="py-12 bg-white/70 backdrop-blur-sm rounded-lg shadow-md p-6 mt-8">
          <div className="text-center">
            <h2 className="text-2xl md:text-3xl font-bold text-teal-800 mb-4">Special Offer</h2>
            <p className="text-xl text-gray-700 mb-6">
              Handmade bracelets available for just <span className="font-bold text-teal-600">£2 each</span>!
            </p>
            <Button asChild className="bg-teal-600 hover:bg-teal-700">
              <Link href="/shop">Shop Now</Link>
            </Button>
          </div>
        </section>
      </div>
    </div>
  )
}

function CategoryCard({
  title,
  description,
  href,
  imageSrc,
}: {
  title: string
  description: string
  href: string
  imageSrc: string
}) {
  return (
    <div className="bg-white/70 backdrop-blur-sm rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
      <div className="relative h-48 w-full">
        <Image
          src={imageSrc}
          alt={title}
          fill
          className="object-cover"
        />
      </div>
      <div className="p-6">
        <h3 className="text-xl font-semibold text-teal-700 mb-2">{title}</h3>
        <p className="text-gray-600 mb-4">{description}</p>
        <Button asChild className="bg-teal-600 hover:bg-teal-700">
          <Link href={href}>
            Explore Collection <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </div>
    </div>
  )
}

