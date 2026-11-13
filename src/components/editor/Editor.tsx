'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { cn } from '@/lib/cn';
import { cloneWithNewIds, getIn, insertItem, moveItem, removeItem, setIn, setText } from '@/lib/doc/path';
import { pick } from '@/lib/doc/normalize';
import { plainText } from '@/lib/doc/rich';
import { createSection, newId, SECTION_META } from '@/lib/doc/presets';
import type { Locale, Path, PlusDoc, SectionType } from '@/lib/doc/types';
import { LandingView } from '../site/LandingView';
import { BoxToolbar } from './BoxToolbar';
import { useConfirmDialog } from './ConfirmDialog';
import { createEditCtx } from './edit-ctx';
import { editorApi } from './editor-api';
import { boxKey, EditorContext, type EditorApi, type Selection } from './EditorContext';
import { HistoryDialog } from './HistoryDialog';
import { ImageDialog } from './ImageDialog';
import { Inspector } from './Inspector';
import { PresetPicker } from './PresetPicker';
import type { GlobalGroup } from './GlobalSettings';
import { Sidebar, type SidebarTab } from './Sidebar';
import { TextFormatBar } from './TextFormatBar';
import { Toolbar, type ViewMode } from './Toolbar';
import { useEditorState } from './useEditorState';

const PREVIEW_WIDTH: Record<Exclude<ViewMode, 'edit'>, string> = { desktop: '100%', tablet: '834px', mobile: '390px' };
/** Sichqoncha qutidan chiqqach asboblar paneli shuncha kutadi (panelga o'tib ulgurish uchun) */
const HOVER_LEAVE_MS = 260;

type Notice = { message: string; action?: { label: string; run: () => void } };

/**
 * Landing muharriri: sahifa o'zi tahrirlanadi (matn, rasm, qutilar), chapda bo'limlar va umumiy sozlamalar,
 * o'ngda tanlangan bo'lim/quti sozlamalari. Ko'rish rejimi — qoralamaning haqiqiy sahifasi (iframe) turli ekranlarda.
 */
export function Editor({
  initialDoc,
  initialVersion,
  hasUnpublished,
  publishedAt,
  accountUrl,
  initialLocale,
}: {
  initialDoc: PlusDoc;
  initialVersion: number;
  hasUnpublished: boolean;
  publishedAt: string | null;
  accountUrl: string;
  initialLocale: Locale;
}) {
  const state = useEditorState({ initialDoc, initialVersion, hasUnpublished, publishedAt, accountUrl });
  const { doc, change, undo } = state;
  const [locale, setLocale] = useState<Locale>(initialLocale);
  const [selection, setSelection] = useState<Selection>(null);
  const [imagePath, setImagePath] = useState<Path | null>(null);
  const [addAfter, setAddAfter] = useState<number | null>(null);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [view, setView] = useState<ViewMode>('edit');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [sidebarTab, setSidebarTab] = useState<SidebarTab>('sections');
  const [globalGroup, setGlobalGroup] = useState<GlobalGroup | null>(null);
  const [publishing, setPublishing] = useState(false);
  const [notice, setNotice] = useState<Notice | null>(null);
  const [hovered, setHovered] = useState<Path | null>(null);
  const [confirm, confirmElement] = useConfirmDialog();

  const wrapRef = useRef<HTMLDivElement>(null);
  const boxEls = useRef(new Map<string, HTMLElement>());
  const leaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const toolbarHovered = useRef(false);
  const noticeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const flash = useCallback((message: string, action?: Notice['action']) => {
    if (noticeTimer.current) clearTimeout(noticeTimer.current);
    setNotice({ message, action });
    noticeTimer.current = setTimeout(() => setNotice(null), action ? 7000 : 3500);
  }, []);

  const registerBox = useCallback((key: string, el: HTMLElement | null) => {
    if (el) boxEls.current.set(key, el);
    else boxEls.current.delete(key);
  }, []);

  const hoverBox = useCallback((path: Path | null) => {
    if (leaveTimer.current) clearTimeout(leaveTimer.current);
    if (path) {
      setHovered(path);
      return;
    }
    leaveTimer.current = setTimeout(() => {
      if (!toolbarHovered.current) setHovered(null);
    }, HOVER_LEAVE_MS);
  }, []);

  const onToolbarPointer = useCallback(
    (inside: boolean) => {
      toolbarHovered.current = inside;
      if (inside && leaveTimer.current) clearTimeout(leaveTimer.current);
      if (!inside) hoverBox(null);
    },
    [hoverBox],
  );

  const selectedBox: Path | null = selection?.kind === 'box' ? ['sections', selection.index, 'items', selection.box] : null;
  const activeBox = hovered ?? selectedBox;

  const api: EditorApi = useMemo(
    () => ({
      doc,
      locale,
      setText: (path, value) => change((d) => setText(d, path, locale, value), `t:${path.join('.')}:${locale}`),
      setValue: (path, value, key) => change((d) => setIn(d, path, value), key),
      move: (arrayPath, from, to) => change((d) => moveItem(d, arrayPath, from, to)),
      insert: (arrayPath, index, item) => change((d) => insertItem(d, arrayPath, index, item)),
      remove: (arrayPath, index) => {
        change((d) => removeItem(d, arrayPath, index));
        setSelection(null);
        setHovered(null);
      },
      removeWithUndo: (arrayPath, index, message) => {
        change((d) => removeItem(d, arrayPath, index));
        setSelection(null);
        setHovered(null);
        flash(message, { label: 'Qaytarish', run: undo });
      },
      duplicate: (arrayPath, index) =>
        change((d) => {
          const item = (getIn(d, arrayPath) as unknown[] | undefined)?.[index];
          if (!item) return d;
          return insertItem(d, arrayPath, index + 1, cloneWithNewIds(item, (old) => newId(old.slice(0, 3))));
        }),
      selection,
      select: setSelection,
      openImage: setImagePath,
      registerBox,
      hoverBox,
    }),
    [doc, locale, change, undo, selection, flash, registerBox, hoverBox],
  );

  const ctx = useMemo(() => createEditCtx(doc, locale, api), [doc, locale, api]);
  // Hover o'zgarganda (asboblar paneli) sahifa qayta chizilmasin — element o'zgarmasa React uni o'tkazib yuboradi
  const canvas = useMemo(() => <LandingView ctx={ctx} />, [ctx]);
  const getElement = useCallback((path: Path) => boxEls.current.get(boxKey(path)) ?? null, []);

  // Klaviatura: Ctrl+Z / Ctrl+Shift+Z (matn ichida — brauzerning o'z orqaga qaytarishi)
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (!(event.ctrlKey || event.metaKey) || event.code !== 'KeyZ') return;
      const target = event.target as HTMLElement | null;
      if (target?.isContentEditable || target?.tagName === 'INPUT' || target?.tagName === 'TEXTAREA') return;
      event.preventDefault();
      if (event.shiftKey) state.redo();
      else state.undo();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [state]);

  const onPublish = useCallback(async () => {
    setPublishing(true);
    try {
      await state.publish();
      flash('Saytga chiqdi ✓');
    } catch (err) {
      flash(err instanceof Error ? err.message : 'E’lon qilib bo‘lmadi.');
    } finally {
      setPublishing(false);
    }
  }, [state, flash]);

  const onRetry = useCallback(() => {
    if (state.status === 'expired') window.location.reload();
    else if (state.status === 'conflict') void state.reload();
    else void state.retry();
  }, [state]);

  const addSection = (type: SectionType, variant: string) => {
    const index = (addAfter ?? doc.sections.length - 1) + 1;
    api.insert(['sections'], index, createSection(type, variant));
    setAddAfter(null);
    setSelection({ kind: 'section', index });
    window.setTimeout(() => document.querySelector(`[data-ed-section="${index}"]`)?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 80);
  };

  const currentImage = imagePath ? ((getIn(doc, imagePath) as string | undefined) ?? '') : '';

  return (
    <EditorContext.Provider value={api}>
      <div className="ed-root">
        <Toolbar
          locale={locale}
          onLocale={setLocale}
          view={view}
          onView={setView}
          status={state.status}
          error={state.error}
          onRetry={onRetry}
          canUndo={state.canUndo}
          canRedo={state.canRedo}
          onUndo={state.undo}
          onRedo={state.redo}
          unpublished={state.unpublished}
          publishing={publishing}
          onPublish={() => void onPublish()}
          onDiscard={async () => {
            const ok = await confirm({
              title: 'Qoralama bekor qilinsinmi?',
              text: 'E’lon qilinmagan barcha o‘zgarishlar o‘chadi va muharrir saytdagi holatga qaytadi.',
              confirmLabel: 'Bekor qilish',
              danger: true,
            });
            if (!ok) return;
            try {
              await editorApi.discard();
              await state.reload();
              flash('Saytdagi holatga qaytarildi');
            } catch (err) {
              flash(err instanceof Error ? err.message : 'Bekor qilib bo‘lmadi.');
            }
          }}
          onHistory={() => setHistoryOpen(true)}
          onLogout={async () => {
            await editorApi.logout().catch(() => undefined);
            window.location.reload();
          }}
          onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
        />

        <div className="ed-body">
          {view === 'edit' && sidebarOpen && (
            <Sidebar onAddSection={(after) => setAddAfter(after)} tab={sidebarTab} onTab={setSidebarTab} group={globalGroup} onGroup={setGlobalGroup} />
          )}

          <div
            ref={wrapRef}
            className={cn('ed-canvas-wrap', view !== 'edit' && 'ed-canvas-preview')}
            onClick={() => view === 'edit' && setSelection(null)}
          >
            {view === 'edit' ? (
              <>
                <div className="ed-canvas" lang={locale}>
                  {canvas}
                </div>
                <BoxToolbar target={activeBox} wrapRef={wrapRef} getElement={getElement} onPointer={onToolbarPointer} />
              </>
            ) : (
              <iframe
                key={`${locale}-${state.version}-${view}`}
                title="Ko‘rish"
                src={`/edit/preview?lang=${locale}&v=${state.version}`}
                className="ed-preview-frame"
                style={{ width: PREVIEW_WIDTH[view] }}
              />
            )}
          </div>

          {view === 'edit' && selection && (
            <Inspector
              onClose={() => setSelection(null)}
              onOpenGlobal={(group) => {
                setSidebarOpen(true);
                setSidebarTab('global');
                setGlobalGroup(group);
              }}
            />
          )}
        </div>

        {state.error && state.status !== 'saved' && <div className="ed-toast ed-toast-error">{state.error}</div>}
        {notice && (
          <div className="ed-toast" role="status">
            <span>{notice.message}</span>
            {notice.action && (
              <button
                type="button"
                className="ed-toast-action"
                onClick={() => {
                  notice.action?.run();
                  setNotice(null);
                }}
              >
                {notice.action.label}
              </button>
            )}
          </div>
        )}

        {imagePath && (
          <ImageDialog
            current={currentImage}
            onClose={() => setImagePath(null)}
            onSelect={(url) => {
              api.setValue(imagePath, url);
              setImagePath(null);
            }}
          />
        )}
        {addAfter !== null && (
          <PresetPicker
            onPick={addSection}
            onClose={() => setAddAfter(null)}
            afterTitle={
              doc.sections[addAfter]
                ? (plainText(pick(doc.sections[addAfter].title, locale)) || SECTION_META[doc.sections[addAfter].type].label).replace(/\s+/g, ' ')
                : undefined
            }
          />
        )}
        {historyOpen && <HistoryDialog confirm={confirm} onRestored={state.reload} onClose={() => setHistoryOpen(false)} />}
        {confirmElement}
        {view === 'edit' && <TextFormatBar />}
      </div>
    </EditorContext.Provider>
  );
}
