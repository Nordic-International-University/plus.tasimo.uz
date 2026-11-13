import type { ComponentType } from 'react';
import type { SectionType } from '@/lib/doc/types';
import type { SectionProps } from './ctx';
import { About } from './About';
import { Cta } from './Cta';
import { Faq } from './Faq';
import { Features } from './Features';
import { Gallery } from './Gallery';
import { Hero } from './Hero';
import { Logos } from './Logos';
import { RichText } from './RichText';
import { Seasons } from './Seasons';
import { Stats } from './Stats';
import { Steps } from './Steps';
import { Testimonials } from './Testimonials';
import { Video } from './Video';

export const SECTION_COMPONENTS: Record<SectionType, ComponentType<SectionProps>> = {
  hero: Hero,
  about: About,
  features: Features,
  seasons: Seasons,
  steps: Steps,
  stats: Stats,
  gallery: Gallery,
  video: Video,
  testimonials: Testimonials,
  faq: Faq,
  cta: Cta,
  richtext: RichText,
  logos: Logos,
};
