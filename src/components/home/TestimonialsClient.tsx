'use client';

import { useState } from 'react';
import { Quote, ChevronLeft, ChevronRight, Star } from 'lucide-react';
import type { Testimonial } from '@/lib/testimonial-actions';
import LocalizedText from "@/components/LocalizedText";

interface TestimonialsClientProps {
    testimonials: Testimonial[];
}

export default function TestimonialsClient({ testimonials }: TestimonialsClientProps) {
    const [current, setCurrent] = useState(0);

    if (testimonials.length === 0) {
        return null;
    }

    const next = () => setCurrent((current + 1) % testimonials.length);
    const prev = () => setCurrent((current - 1 + testimonials.length) % testimonials.length);

    return (
        <section className="py-16 bg-slate-100 dark:bg-slate-950">
            <div className="container mx-auto px-4">
                <h2 className="font-heading text-3xl font-bold text-center mb-12 text-slate-900 dark:text-white">
                    <LocalizedText vi="Khách hàng" en="Client" /> <span className="text-golden-gradient"><LocalizedText vi="nói gì" en="Testimonials" /></span>
                </h2>

                {/* Desktop: Show all (max 3) */}
                <div className="hidden md:grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
                    {testimonials.slice(0, 3).map((t) => (
                        <div
                            key={t.id}
                            className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow"
                        >
                            <Quote className="w-8 h-8 text-golden/30 mb-4" />
                            <p className="text-slate-600 dark:text-slate-300 mb-4 line-clamp-4">
                                "{t.content}"
                            </p>
                            <div className="flex items-center gap-1 mb-3">
                                {[...Array(t.rating)].map((_, i) => (
                                    <Star key={i} className="w-4 h-4 fill-golden text-golden" />
                                ))}
                            </div>
                            <div className="border-t border-slate-200 dark:border-slate-700 pt-4">
                                <p className="font-semibold text-slate-900 dark:text-white">{t.author_name}</p>
                                {t.author_title && (
                                    <p className="text-sm text-slate-500">{t.author_title}</p>
                                )}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Mobile: Slider */}
                <div className="md:hidden">
                    <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm max-w-sm mx-auto">
                        <Quote className="w-8 h-8 text-golden/30 mb-4" />
                        <p className="text-slate-600 dark:text-slate-300 mb-4">
                            "{testimonials[current].content}"
                        </p>
                        <div className="flex items-center gap-1 mb-3">
                            {[...Array(testimonials[current].rating)].map((_, i) => (
                                <Star key={i} className="w-4 h-4 fill-golden text-golden" />
                            ))}
                        </div>
                        <div className="border-t border-slate-200 dark:border-slate-700 pt-4">
                            <p className="font-semibold text-slate-900 dark:text-white">{testimonials[current].author_name}</p>
                            {testimonials[current].author_title && (
                                <p className="text-sm text-slate-500">{testimonials[current].author_title}</p>
                            )}
                        </div>
                    </div>

                    {/* Navigation */}
                    {testimonials.length > 1 && (
                        <div className="flex justify-center items-center gap-4 mt-6">
                            <button
                                onClick={prev}
                                className="p-2 rounded-full bg-white dark:bg-slate-800 hover:bg-golden/10 transition-colors"
                            >
                                <ChevronLeft className="w-5 h-5" />
                            </button>
                            <div className="flex gap-2">
                                {testimonials.map((_, i) => (
                                    <div
                                        key={i}
                                        className={`w-2 h-2 rounded-full transition-colors ${i === current ? 'bg-golden' : 'bg-slate-300 dark:bg-slate-600'
                                            }`}
                                    />
                                ))}
                            </div>
                            <button
                                onClick={next}
                                className="p-2 rounded-full bg-white dark:bg-slate-800 hover:bg-golden/10 transition-colors"
                            >
                                <ChevronRight className="w-5 h-5" />
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </section>
    );
}
