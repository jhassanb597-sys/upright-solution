import type {ComponentProps} from 'react';
import type {Ionicons} from '@expo/vector-icons';

export type Service = {
  slug: string;
  title: string;
  shortDesc: string;
  fullDesc: string;
  features: string[];
  whatsappMessage: string;
  icon: ComponentProps<typeof Ionicons>['name'];
  image: string;
};

export const SERVICES: Service[] = [
  {
    slug: 'construction',
    title: 'Construction',
    shortDesc: 'Build with a trusted team, from planning through handover.',
    fullDesc: 'Upright Smart Solutions and Estate helps clients plan and deliver construction projects with clarity at every stage. We bring practical guidance to site selection, project scope and the decisions that shape a successful build.\n\nOur team coordinates key construction milestones and keeps clients informed about progress, quality and next steps. Whether you are planning a home or a larger development, we focus on a thoughtful process that respects your goals and budget.\n\nFrom the first conversation to project handover, we aim to make construction easier to understand and manage. Speak with us to discuss your requirements and the right way to move your project forward.',
    features: ['Project planning and consultation', 'Residential and development guidance', 'Milestone and progress coordination', 'Clear communication from start to handover'],
    whatsappMessage: 'Hello, I would like to discuss construction services with Upright Smart Solutions and Estate.',
    icon: 'business-outline',
    image: 'https://images.unsplash.com/photo-1541976590-713941681591?w=1400&auto=format&fit=crop&q=85',
  },
  {
    slug: 'investment-plans',
    title: 'Investment Plans',
    shortDesc: 'Explore property opportunities with a plan shaped around you.',
    fullDesc: 'A strong investment starts with understanding your objectives, timeframe and comfort with risk. We help you explore property opportunities and make sense of the important details before deciding on a direction.\n\nOur advisors discuss location, project fundamentals, payment options and expected holding periods in straightforward terms. We help compare suitable opportunities so your next step is based on your priorities rather than guesswork.\n\nWhether you are investing for long-term value or planning your first property purchase, Upright Smart Solutions and Estate offers guidance tailored to your needs. Contact us to talk through an investment plan that works for you.',
    features: ['One-to-one investment consultation', 'Property and project opportunity review', 'Payment-plan guidance', 'Support aligned with your goals and timeframe'],
    whatsappMessage: 'Hello, I would like to discuss property investment plans with Upright Smart Solutions and Estate.',
    icon: 'trending-up-outline',
    image: 'https://images.unsplash.com/photo-1460472178825-e5240623afd5?w=1400&auto=format&fit=crop&q=85',
  },
  {
    slug: 'tax-filing',
    title: 'Tax Filing',
    shortDesc: 'Get organized, practical help with your tax filing requirements.',
    fullDesc: 'Tax paperwork can feel complicated, especially when you are unsure which documents or details are needed. Our team helps you understand the filing process and organize the information relevant to your situation.\n\nWe offer guidance for individuals and property owners, helping you prepare for the required steps and identify questions that may need professional attention. Our approach is focused on clear communication and careful handling of the information you provide.\n\nEvery client’s circumstances are different, so we begin by learning about your needs before outlining the next steps. Get in touch with Upright Smart Solutions and Estate for assistance with your tax filing enquiry.',
    features: ['Tax filing consultation', 'Document and information checklist', 'Property-related tax guidance', 'Personalized support for your filing enquiry'],
    whatsappMessage: 'Hello, I would like to enquire about tax filing services with Upright Smart Solutions and Estate.',
    icon: 'document-text-outline',
    image: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=1400&auto=format&fit=crop&q=85',
  },
  {
    slug: 'software-services',
    title: 'Software Services',
    shortDesc: 'Technology solutions to help your business work smarter.',
    fullDesc: 'Good software should make everyday work simpler. We help businesses explore digital solutions that fit their workflows, customers and long-term plans, starting with a clear understanding of the problem to solve.\n\nFrom initial requirements and product planning to implementation discussions, we keep the process collaborative and easy to follow. We focus on practical tools and thoughtful experiences that support real business needs.\n\nWhether you are starting a new digital project or improving an existing process, Upright Smart Solutions and Estate can help you define a sensible next step. Share your idea with us and let’s discuss how technology can support your goals.',
    features: ['Software and digital product consultation', 'Business workflow discovery', 'Web and mobile solution planning', 'Ongoing improvement and support discussions'],
    whatsappMessage: 'Hello, I would like to discuss software services with Upright Smart Solutions and Estate.',
    icon: 'code-slash-outline',
    image: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=1400&auto=format&fit=crop&q=85',
  },
  {
    slug: 'builder-projects',
    title: 'Builder Projects',
    shortDesc: 'Find project details, payment options and available units.',
    fullDesc: 'Choosing a builder project means looking beyond the brochure. We help you explore project location, development progress, available unit types and the details that matter for your intended use or investment.\n\nOur team can walk you through the information available for each project, including payment schedules, amenities and current availability. We encourage clear questions and provide practical context so you can compare options with confidence.\n\nFrom an initial project enquiry to a conversation about the next steps, Upright Smart Solutions and Estate is here to help. Tell us what you are looking for and we will connect you with the relevant project information.',
    features: ['Project and location information', 'Unit availability and layout guidance', 'Payment-plan explanations', 'Support arranging a project discussion'],
    whatsappMessage: 'Hello, I would like to know more about builder projects with Upright Smart Solutions and Estate.',
    icon: 'business-outline',
    image: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1400&auto=format&fit=crop&q=85',
  },
  {
    slug: 'finance',
    title: 'Finance',
    shortDesc: 'Understand financing options for your property plans.',
    fullDesc: 'Planning a property purchase or development often involves important financial decisions. We help you explore the available options and understand how different payment approaches may fit your circumstances.\n\nOur team can explain project payment schedules, discuss financing considerations and help you prepare questions for the next stage. We focus on making the information easier to compare so you can make a decision with a clearer picture.\n\nEvery financial situation is unique, and our guidance begins with your priorities. Contact Upright Smart Solutions and Estate to discuss your finance enquiry and the support that may be available.',
    features: ['Property finance consultation', 'Payment-plan and installment guidance', 'Budget and affordability discussion', 'Help comparing available options'],
    whatsappMessage: 'Hello, I would like to discuss property finance with Upright Smart Solutions and Estate.',
    icon: 'wallet-outline',
    image: 'https://images.unsplash.com/photo-1554224154-26032ffc0d07?w=1400&auto=format&fit=crop&q=85',
  },
];

export function getServiceBySlug(slug: string): Service | undefined {
  return SERVICES.find(service => service.slug === slug);
}
