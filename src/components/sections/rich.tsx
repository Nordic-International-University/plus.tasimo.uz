import { Fragment, type CSSProperties, type ReactNode } from 'react';
import { isSafeColor, isSafeGradient, parseRich } from '@/lib/doc/rich';

/**
 * Formatli matn → React elementlari (saytda, serverda; innerHTML yo'q). Har qator — alohida <span>
 * (`.hero-title > span:last-child` kabi qoidalar shunga tayanadi), qator orasida <br>.
 * Muharrirdagi `richToHtml` bilan bir xil tuzilma.
 */
export function renderRich(markup: string): ReactNode[] {
  const lines: ReactNode[][] = [[]];
  let key = 0;
  for (const run of parseRich(markup)) {
    run.text.split('\n').forEach((part, index) => {
      if (index > 0) lines.push([]);
      if (!part) return;
      let node: ReactNode = part;
      if (run.u) node = <u>{node}</u>;
      if (run.i) node = <em>{node}</em>;
      if (run.b) node = <strong>{node}</strong>;
      if (run.g && isSafeGradient(run.g)) {
        const [g1, g2] = run.g.split(',');
        node = (
          <span className="rt-grad" style={{ '--g1': g1, '--g2': g2 } as CSSProperties}>
            {node}
          </span>
        );
      } else if (run.c && isSafeColor(run.c)) {
        node = <span style={{ color: run.c }}>{node}</span>;
      }
      lines[lines.length - 1].push(<Fragment key={key++}>{node}</Fragment>);
    });
  }
  return lines.map((parts, index) => (
    <span key={index}>
      {parts}
      {index < lines.length - 1 && <br />}
    </span>
  ));
}
