'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Search, HelpCircle, MessageSquare, FileText, Clock, Users } from 'lucide-react'
import NavbarComponent from '@/components/ui/navbar'
import Footer from '@/components/footer'

interface FAQ {
    id: string
    question: string
    answer: string
    category: string
    tags: string[]
}

const faqs: FAQ[] = [
    {
        id: '1',
        question: 'What is No Stress Visa Jobs?',
        answer: 'No Stress Visa Jobs is a specialized platform connecting international job seekers with visa-sponsored opportunities. We focus on providing stress-free visa job search experience with comprehensive support throughout the application process.',
        category: 'General',
        tags: ['platform', 'introduction']
    },
    {
        id: '2',
        question: 'How do visa-sponsored jobs work?',
        answer: 'Visa-sponsored jobs involve employers who are willing to sponsor your work visa. This typically includes H-1B, TN, O-1, or other work visas depending on your qualifications and the job requirements. The employer handles the visa application process.',
        category: 'Visa Process',
        tags: ['visa', 'sponsorship', 'process']
    },
    {
        id: '3',
        question: 'What types of visas do you support?',
        answer: 'We support various work visas including H-1B (specialty occupation), TN (NAFTA professionals), O-1 (extraordinary ability), L-1 (intracompany transfer), and E-3 (Australian professionals). Each visa has specific requirements and eligibility criteria.',
        category: 'Visa Process',
        tags: ['visa types', 'eligibility']
    },
    {
        id: '4',
        question: 'How much does it cost to use No Stress Visa Jobs?',
        answer: 'Basic job searching and application submission is completely free. We offer premium services including resume reviews, interview preparation, and visa consultation for a reasonable fee. All pricing is transparent with no hidden costs.',
        category: 'Pricing',
        tags: ['cost', 'pricing', 'services']
    },
    {
        id: '5',
        question: 'What qualifications do I need for visa-sponsored jobs?',
        answer: 'Requirements vary by position and visa type. Generally, you need relevant education, work experience, and sometimes professional certifications. For H-1B visas, a bachelor\'s degree in a related field is typically required.',
        category: 'Eligibility',
        tags: ['qualifications', 'requirements', 'education']
    },
    {
        id: '6',
        question: 'How long does the visa sponsorship process take?',
        answer: 'The timeline varies by visa type and individual circumstances. H-1B processing can take 2-6 months, while TN visas are typically faster (1-2 months). Factors include USCIS processing times, employer procedures, and your specific situation.',
        category: 'Timeline',
        tags: ['processing time', 'timeline', 'duration']
    },
    {
        id: '7',
        question: 'Can I bring my family with me?',
        answer: 'Yes, most work visas allow you to bring your spouse and unmarried children under 21. Your spouse may be eligible for work authorization, and children can attend school. Family members will need their own visas (H-4, TD, etc.).',
        category: 'Family',
        tags: ['family', 'dependents', 'spouse']
    },
    {
        id: '8',
        question: 'What if my visa application is denied?',
        answer: 'If your visa is denied, you can reapply or appeal the decision. We provide guidance on next steps and help you understand the denial reasons. Many candidates successfully reapply after addressing the issues identified in the denial.',
        category: 'Support',
        tags: ['denial', 'appeal', 'reapply']
    },
    {
        id: '9',
        question: 'Do you provide interview preparation?',
        answer: 'Yes, our premium service includes personalized interview preparation, mock interviews, and feedback on your performance. We also provide tips specific to visa-sponsored positions and common questions employers ask.',
        category: 'Services',
        tags: ['interview', 'preparation', 'coaching']
    },
    {
        id: '10',
        question: 'How do I know if a job is legitimate?',
        answer: 'We verify all employers and job postings. Look for clear job descriptions, salary ranges, and company information. Legitimate employers will have a proper visa sponsorship process and will not ask for payment from candidates.',
        category: 'Safety',
        tags: ['legitimate', 'scams', 'verification']
    }
]

const categories = ['All', 'General', 'Visa Process', 'Eligibility', 'Timeline', 'Family', 'Support', 'Services', 'Safety', 'Pricing']

export default function FAQsPage() {
    const [searchTerm, setSearchTerm] = useState('')
    const [selectedCategory, setSelectedCategory] = useState('All')

    const filteredFaqs = faqs.filter(faq => {
        const matchesSearch = faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
            faq.answer.toLowerCase().includes(searchTerm.toLowerCase()) ||
            faq.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))

        const matchesCategory = selectedCategory === 'All' || faq.category === selectedCategory

        return matchesSearch && matchesCategory
    })

    return (
        <div className="min-h-screen">
            <NavbarComponent />

            {/* Hero Section */}
            <section className="bg-gradient-to-br from-accent to-indigo-100 py-16">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <div className="flex items-center justify-center mb-6">
                        <HelpCircle className="w-12 h-12 text-accent mr-4" />
                        <h1 className="text-4xl font-bold text-gray-900">Frequently Asked Questions</h1>
                    </div>
                    <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                        Find answers to common questions about visa-sponsored jobs, our platform, and the application process.
                    </p>
                </div>
            </section>

            {/* Search and Filter Section */}
            {/* <section className="py-8 bg-white border-b">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                type="text"
                placeholder="Search FAQs..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex flex-wrap gap-2">
              {categories.map(category => (
                <Badge
                  key={category}
                  variant={selectedCategory === category ? "default" : "outline"}
                  className="cursor-pointer"
                  onClick={() => setSelectedCategory(category)}
                >
                  {category}
                </Badge>
              ))}
            </div>
          </div>
        </div>
      </section> */}

            {/* FAQs Section */}
            <section className="py-16">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    {filteredFaqs.length > 0 ? (
                        <Accordion type="single" collapsible className="grid grid-cols-1 lg:grid-cols-2 space-y-4 gap-4">
                            {filteredFaqs.map(faq => (
                                <AccordionItem key={faq.id} value={faq.id} className="border border-input rounded-lg">
                                    <AccordionTrigger className="px-6 py-4 hover:no-underline">
                                        <div className="flex items-start text-left">
                                            <MessageSquare className="w-5 h-5 text-accent-600 mr-3 mt-0.5 flex-shrink-0" />
                                            <div>
                                                <h3 className="font-semibold text-gray-900">{faq.question}</h3>
                                                <div className="flex items-center gap-2 mt-1">
                                                    <Badge variant="outline" className="text-xs border-input">
                                                        {faq.category}
                                                    </Badge>
                                                    {faq.tags.slice(0, 2).map(tag => (
                                                        <Badge key={tag} variant="outline" className="text-xs border-input">
                                                            {tag}
                                                        </Badge>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    </AccordionTrigger>
                                    <AccordionContent className="px-6 pb-4">
                                        <div className="pl-8 text-gray-700 leading-relaxed">
                                            {faq.answer}
                                        </div>
                                    </AccordionContent>
                                </AccordionItem>
                            ))}
                        </Accordion>
                    ) : (
                        <div className="text-center py-12">
                            <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                            <h3 className="text-xl font-semibold text-gray-600 mb-2">No FAQs found</h3>
                            <p className="text-gray-500">
                                Try adjusting your search terms or category filter.
                            </p>
                        </div>
                    )}
                </div>
            </section>

            {/* Contact Section */}
            <section className="py-16 bg-gray-50">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <h2 className="text-3xl font-bold text-gray-900 mb-4">Still have questions?</h2>
                    <p className="text-xl text-gray-600 mb-8">
                        Our support team is here to help you with any questions about visa-sponsored jobs.
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center justify-center">
                                    <MessageSquare className="w-6 h-6 text-accent-600 mr-2" />
                                    Live Chat
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-gray-600">
                                    Get instant answers from our support team during business hours.
                                </p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center justify-center">
                                    <Clock className="w-6 h-6 text-green-600 mr-2" />
                                    Email Support
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-gray-600">
                                    Send us an email and we&apos;ll respond within 24 hours.
                                </p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center justify-center">
                                    <Users className="w-6 h-6 text-purple-600 mr-2" />
                                    Community
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-gray-600">
                                    Join our community forum to connect with other applicants.
                                </p>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </section>

            <Footer />
        </div>
    )
}