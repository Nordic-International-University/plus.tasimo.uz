'use client';

import { useEffect, useLayoutEffect, useMemo, useRef } from 'react';
import { cn } from '@/lib/cn';
import { normalizeRich, plainText, richToHtml } from '@/lib/doc/rich';
import type { Path } from '@/lib/doc/types';
import type { TextTag } from '../sections/ctx';
import { useEditor } from './EditorContext';
import { applyRichToElement, domToRich, getSelectionOffsets, hasForeignMarkup, normalizeElement, redoFormat, replaceSelection, undoFormat } from './rich-dom';

const COMMIT_DELAY = 180;
const NBSP = new RegExp(String.fromCharCode(160), 'g');
const DELETE_TYPES = new Set([
  'deleteContentBackward',
  'deleteContentForward',
  'deleteWordBackward',
  'deleteWordForward',
  'deleteSoftLineBackward',
  'deleteSoftLineForward',
  'deleteHardLineBackward',
  'deleteHardLineForward',
]);
const MARK_KEYS: Record<string, 'b' | 'i' | 'u'> = { KeyB: 'b', KeyI: 'i', KeyU: 'u' };

/**
 * Sahifaning o'zida matnni tahrirlash (contentEditable). Brauzer kursor va matnni boshqaradi, React esa
 * fokus yo'qligida tashqi o'zgarishni (orqaga, til almashtirish) yozadi — kursor sakramaydi.
 * Enter — tugatish (ko'p qatorlida yangi qator, Ctrl+Enter — tugatish). Paste — faqat oddiy matn.
 *
 * Formatli matn (plain bo'lmagan hammasi): <b> <i> <u> rang/gradient — `lib/doc/rich.ts`. Matnni belgilasangiz
 * TextFormatBar chiqadi; Ctrl+B / Ctrl+I / Ctrl+U ham ishlaydi. Belgilangan joy ustidan yozish va o'chirishni biz
 * bajaramiz (format saqlanadi), qolgan yozish — brauzerniki.
 */
export function InlineText({
  path,
  value,
  as = 'span',
  className,
  multiline,
  placeholder,
  plain,
}: {
  path: Path;
  value: string;
  as?: TextTag;
  className?: string;
  multiline?: boolean;
  placeholder?: string;
  /** Tilga bog'liq bo'lmagan qiymat (raqam) — butun qiymat yoziladi, formatlash yo'q */
  plain?: boolean;
}) {
  const editor = useEditor();
  const ref = useRef<HTMLElement>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const focused = useRef(false);
  const rich = !plain;
  const canonical = useMemo(() => (rich ? normalizeRich(value) : value), [rich, value]);

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el || focused.current) return;
    if (rich) {
      if (domToRich(el) !== canonical) el.innerHTML = richToHtml(canonical);
    } else if (el.innerText !== value) el.innerText = value;
    el.dataset.empty = String(!(rich ? plainText(value) : value).trim());
  }, [value, canonical, rich]);

  useEffect(() => () => {
    if (timer.current) clearTimeout(timer.current);
  }, []);

  // Belgilangan matn ustidan yozish / o'chirish — formatni o'zimiz saqlaymiz (React onBeforeInput inputType bermaydi)
  useEffect(() => {
    const el = ref.current;
    if (!el || !rich) return;
    const onBeforeInput = (event: InputEvent) => {
      if (event.isComposing) return;
      const selection = getSelectionOffsets(el);
      if (!selection || selection.start === selection.end) return;
      if (event.inputType === 'insertText' && event.data) {
        event.preventDefault();
        replaceSelection(el, event.data);
      } else if (DELETE_TYPES.has(event.inputType)) {
        event.preventDefault();
        replaceSelection(el, '');
      }
    };
    el.addEventListener('beforeinput', onBeforeInput);
    return () => el.removeEventListener('beforeinput', onBeforeInput);
  }, [rich]);

  const read = () => {
    const el = ref.current;
    if (!el) return '';
    if (rich) return domToRich(el);
    return el.innerText.replace(/\r/g, '').replace(NBSP, ' ').replace(/\n$/, '');
  };

  const commit = () => {
    if (timer.current) clearTimeout(timer.current);
    timer.current = null;
    const next = read();
    if (next === value || next === canonical) return;
    if (plain) editor.setValue(path, next, `plain:${path.join('.')}`);
    else editor.setText(path, next);
  };

  const Tag = as as 'span';
  return (
    <Tag
      ref={ref as React.RefObject<HTMLSpanElement>}
      className={cn('ed-text', multiline && 'whitespace-pre-wrap', className)}
      contentEditable
      suppressContentEditableWarning
      spellCheck
      data-rich={rich ? '' : undefined}
      data-placeholder={placeholder ?? ''}
      data-empty={String(!(rich ? plainText(value) : value).trim())}
      role="textbox"
      aria-multiline={multiline || undefined}
      aria-label={placeholder}
      onFocus={() => {
        focused.current = true;
      }}
      onBlur={() => {
        focused.current = false;
        commit();
      }}
      onInput={(event) => {
        const el = ref.current;
        if (!el) return;
        if (rich && !(event.nativeEvent as InputEvent).isComposing && hasForeignMarkup(el)) normalizeElement(el);
        el.dataset.empty = String(!(rich ? plainText(read()) : read()).trim());
        if (timer.current) clearTimeout(timer.current);
        timer.current = setTimeout(commit, COMMIT_DELAY);
      }}
      onKeyDown={(event) => {
        const el = ref.current;
        if (!el) return;
        if (event.key === 'Escape') {
          if (rich) el.innerHTML = richToHtml(canonical);
          else el.innerText = value;
          el.blur();
          return;
        }
        if (rich && (event.ctrlKey || event.metaKey) && !event.altKey) {
          const mark = MARK_KEYS[event.code];
          if (mark && !event.shiftKey) {
            // Brauzerning o'z Ctrl+B si <b>/<span style> aralashtirib yuboradi — o'zimiz bajaramiz
            event.preventDefault();
            const selection = getSelectionOffsets(el);
            if (selection && selection.end > selection.start) applyRichToElement(el, selection.start, selection.end, { type: 'toggle', mark });
            return;
          }
          if (event.code === 'KeyZ') {
            if (event.shiftKey ? redoFormat(el) : undoFormat(el)) event.preventDefault();
            return;
          }
          if (event.code === 'KeyY') {
            if (redoFormat(el)) event.preventDefault();
            return;
          }
        }
        if (event.key !== 'Enter') return;
        if (!multiline || event.ctrlKey || event.metaKey) {
          event.preventDefault();
          el.blur();
        } else {
          event.preventDefault();
          document.execCommand('insertLineBreak');
        }
      }}
      onPaste={(event) => {
        event.preventDefault();
        const raw = event.clipboardData.getData('text/plain').replace(/\r\n?/g, '\n');
        const text = multiline ? raw : raw.replace(/\s*\n\s*/g, ' ');
        const el = ref.current;
        // Formatli matnda o'zimiz qo'yamiz: yangi matn shu joyning formatini oladi
        if (rich && el && replaceSelection(el, text)) return;
        document.execCommand('insertText', false, text);
      }}
    />
  );
}
