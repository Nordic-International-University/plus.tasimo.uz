import { SECTION_COMPONENTS } from '../sections/registry';
import type { RenderCtx } from '../sections/ctx';
import { Footer } from './Footer';
import { Header } from './Header';

/** Butun sahifa: sarlavha, bo'limlar (yashirilganlari faqat muharrirda), footer. Sayt va muharrir uchun bir xil */
export function LandingView({ ctx }: { ctx: RenderCtx }) {
  return (
    <>
      <Header ctx={ctx} />
      <main id="main">
        {ctx.doc.sections.map((section, index) => {
          if (section.hidden && !ctx.editing) return null;
          const Component = SECTION_COMPONENTS[section.type];
          return <div key={section.id}>{ctx.frame(index, section, <Component section={section} index={index} ctx={ctx} />)}</div>;
        })}
      </main>
      <Footer ctx={ctx} />
    </>
  );
}
