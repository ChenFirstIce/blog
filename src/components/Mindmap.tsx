import React, { useEffect, useRef } from 'react';
import { Transformer } from 'markmap-lib';
import { Markmap } from 'markmap-view';
import { Toolbar } from 'markmap-toolbar';
import 'markmap-toolbar/dist/style.css';

interface MindmapProps {
  markdown: string;
  className?: string;
}

const transformer = new Transformer();

export const Mindmap: React.FC<MindmapProps> = ({ markdown, className }) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const mmRef = useRef<Markmap | null>(null);
  const toolbarRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (svgRef.current) {
      const { root } = transformer.transform(markdown);
      if (!mmRef.current) {
        mmRef.current = Markmap.create(svgRef.current, {
          autoFit: true,
        }, root);
        
        if (toolbarRef.current) {
          const toolbar = new Toolbar();
          toolbar.attach(mmRef.current);
          toolbarRef.current.append(toolbar.render());
        }
      } else {
        mmRef.current.setData(root);
        mmRef.current.fit();
      }
    }
  }, [markdown]);

  return (
    <div className={`relative w-full h-[400px] border border-gray-200 rounded-lg overflow-hidden bg-white ${className}`}>
      <svg ref={svgRef} className="w-full h-full" />
      <div ref={toolbarRef} className="absolute bottom-4 right-4" />
    </div>
  );
};
