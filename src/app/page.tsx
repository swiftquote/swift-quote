import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Icons } from "@/components/ui/icons"

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Icons.fileText className="h-8 w-8 text-blue-600" />
            <h1 className="text-2xl font-bold text-gray-900">Swift Quote</h1>
          </div>
          <div className="flex items-center space-x-4">
            <Link href="/auth/signin">
              <Button variant="ghost">Sign In</Button>
            </Link>
            <Link href="/auth/signup">
              <Button>Get Started</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-16 md:py-24">
        <div className="text-center max-w-4xl mx-auto">
          <h2 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
            Create Professional Quotes in Minutes
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            The perfect quoting solution for service-based businesses. 
            Clean, professional, and designed to help you win more clients.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/auth/signup">
              <Button size="lg" className="text-lg px-8 py-3">
                Start Free Trial
              </Button>
            </Link>
            <Link href="/auth/signin">
              <Button variant="outline" size="lg" className="text-lg px-8 py-3">
                Sign In
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-white py-16">
        <div className="container mx-auto px-4">
          <h3 className="text-3xl font-bold text-center text-gray-900 mb-12">
            Everything You Need to Create Winning Quotes
          </h3>
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="text-center">
              <CardHeader>
                <Icons.fileText className="h-12 w-12 text-blue-600 mx-auto mb-4" />
                <CardTitle>Professional Templates</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Clean, modern quote templates that make your business look professional and trustworthy.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <Icons.calculator className="h-12 w-12 text-blue-600 mx-auto mb-4" />
                <CardTitle>Smart Calculations</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Automatic calculations for totals, VAT, and discounts. No more manual math errors.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <Icons.share className="h-12 w-12 text-blue-600 mx-auto mb-4" />
                <CardTitle>Easy Sharing</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Share quotes via unique links or export to PDF. Get approvals faster than ever.
                </CardDescription>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <h3 className="text-3xl font-bold text-center text-gray-900 mb-12">
            Simple, Transparent Pricing
          </h3>
          <div className="max-w-4xl mx-auto grid md:grid-cols-2 gap-8">
            <Card className="relative">
              <CardHeader className="text-center">
                <CardTitle className="text-2xl">Free Plan</CardTitle>
                <div className="text-4xl font-bold">£0</div>
                <CardDescription>Perfect for trying out Swift Quote</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Icons.checkCircle className="h-5 w-5 text-green-600" />
                  <span>3 free quotes</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Icons.checkCircle className="h-5 w-5 text-green-600" />
                  <span>Basic quote templates</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Icons.checkCircle className="h-5 w-5 text-green-600" />
                  <span>PDF export</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Icons.checkCircle className="h-5 w-5 text-green-600" />
                  <span>Shareable links</span>
                </div>
                <Link href="/auth/signup">
                  <Button className="w-full" variant="outline">
                    Get Started
                  </Button>
                </Link>
              </CardContent>
            </Card>

            <Card className="relative border-blue-500 border-2">
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                <span className="bg-blue-500 text-white px-4 py-1 rounded-full text-sm font-medium">
                  Most Popular
                </span>
              </div>
              <CardHeader className="text-center">
                <CardTitle className="text-2xl">Pro Plan</CardTitle>
                <div className="text-4xl font-bold">£9.99<span className="text-lg font-normal">/month</span></div>
                <CardDescription>Or £59.99/year (save 50%)</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Icons.checkCircle className="h-5 w-5 text-green-600" />
                  <span>Unlimited quotes</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Icons.checkCircle className="h-5 w-5 text-green-600" />
                  <span>Advanced templates</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Icons.checkCircle className="h-5 w-5 text-green-600" />
                  <span>Custom branding</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Icons.checkCircle className="h-5 w-5 text-green-600" />
                  <span>Priority support</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Icons.checkCircle className="h-5 w-5 text-green-600" />
                  <span>Analytics dashboard</span>
                </div>
                <Link href="/auth/signup">
                  <Button className="w-full">
                    Start Free Trial
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-2 mb-4 md:mb-0">
              <Icons.fileText className="h-8 w-8 text-blue-400" />
              <span className="text-xl font-bold">Swift Quote</span>
            </div>
            <div className="text-center md:text-right">
              <p className="text-gray-400">
                © 2024 Swift Quote. All rights reserved.
              </p>
              <p className="text-gray-400 text-sm mt-2">
                Built for service-based businesses worldwide.
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}