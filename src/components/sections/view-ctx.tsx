import { ArrowRight } from 'lucide-react';
import { cn } from '@/lib/cn';
import { pick } from '@/lib/doc/normalize';
import { resolveLink } from '@/lib/doc/links';
import { plainText } from '@/lib/doc/rich';
import { withPlusRef } from '@/lib/doc/ref';
import type { Locale, PlusDoc, Text } from '@/lib/doc/types';
import type { RenderCtx } from './ctx';
import { Media } from './media';
import { renderRich } from './rich';

export const BUTTON_CLASS = {
  primary: 'btn btn-primary',
  secondary: 'btn btn-secondary',
  ghost: 'btn btn-ghost',
  light: 'btn btn-light',
} as const;

/** Saytdagi (o'qish rejimi) kontekst — serverda, JS'siz */
export function createViewCtx(doc: PlusDoc, locale: Locale): RenderCtx {
  /** Toza matn (alt, aria, sarlavha atributlari) — formatlash belgilarisiz */
  const t = (value: Text | undefined) => plainText(pick(value, locale));
  return {
    locale,
    editing: false,
    doc,
    t,
    text(_path, value, opts = {}) {
      const content = pick(value, locale);
      if (!plainText(content).trim()) return null;
      const Tag = opts.as ?? 'span';
      return <Tag className={opts.className}>{renderRich(content)}</Tag>;
    },
    plain(_path, value, opts = {}) {
      if (!value?.trim()) return null;
      const Tag = opts.as ?? 'span';
      return <Tag className={opts.className}>{value}</Tag>;
    },
    image(_path, src, opts) {
      if (!src) return null;
      return <Media src={src} {...opts} />;
    },
    box(_path, box, children, opts = {}) {
      const Tag = opts.as ?? 'div';
      return (
        <Tag
          className={cn('box', box.shape && `shape-${box.shape}`, box.accent && `accent-${box.accent}`, opts.className)}
          style={opts.style}
          data-reveal=""
        >
          {children}
        </Tag>
      );
    },
    add() {
      return null;
    },
    frame(_index, _section, node) {
      return node;
    },
    link(href, children, opts = {}) {
      if (!href) return <span className={opts.className}>{children}</span>;
      const resolved = resolveLink(doc, href);
      const external = /^https?:/.test(resolved.href) && !resolved.cta;
      return (
        <a
          href={resolved.href}
          className={opts.className}
          {...(resolved.cta ? { 'data-cta': resolved.cta, 'data-section': opts.sectionId ?? 'link' } : {})}
          {...(external ? { rel: 'noopener' } : {})}
        >
          {children}
        </a>
      );
    },
    cta(key, { sectionId, variant, className, arrow }) {
      const link = doc.ctas[key];
      const label = pick(link?.label, locale);
      if (!link?.href || !plainText(label).trim()) return null;
      return (
        <a href={withPlusRef(link.href, key)} data-cta={key} data-section={sectionId} className={cn(BUTTON_CLASS[variant], className)}>
          <span>{renderRich(label)}</span>
          {arrow && <ArrowRight size={18} aria-hidden="true" />}
        </a>
      );
    },
  };
}
