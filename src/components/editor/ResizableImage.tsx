'use client';

import { Node, mergeAttributes } from '@tiptap/core';
import { ReactNodeViewRenderer, NodeViewWrapper } from '@tiptap/react';
import { useState, useCallback, useRef, useEffect } from 'react';
import { AlignLeft, AlignCenter, AlignRight, GripVertical } from 'lucide-react';

// React component for the resizable image
function ResizableImageComponent({ node, updateAttributes, selected }: any) {
    const [isResizing, setIsResizing] = useState(false);
    const imageRef = useRef<HTMLImageElement>(null);
    const startX = useRef(0);
    const startWidth = useRef(0);

    const { src, alt, width, align, caption } = node.attrs;

    const handleMouseDown = useCallback((e: React.MouseEvent) => {
        e.preventDefault();
        setIsResizing(true);
        startX.current = e.clientX;
        startWidth.current = imageRef.current?.offsetWidth || width || 300;
    }, [width]);

    const handleMouseMove = useCallback((e: MouseEvent) => {
        if (!isResizing) return;
        const diff = e.clientX - startX.current;
        const newWidth = Math.max(100, startWidth.current + diff);
        updateAttributes({ width: newWidth });
    }, [isResizing, updateAttributes]);

    const handleMouseUp = useCallback(() => {
        setIsResizing(false);
    }, []);

    useEffect(() => {
        if (isResizing) {
            document.addEventListener('mousemove', handleMouseMove);
            document.addEventListener('mouseup', handleMouseUp);
        }
        return () => {
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
        };
    }, [isResizing, handleMouseMove, handleMouseUp]);

    const alignStyles: Record<string, string> = {
        left: 'mr-auto',
        center: 'mx-auto',
        right: 'ml-auto',
    };

    return (
        <NodeViewWrapper className="relative my-4">
            <figure
                className={`relative inline-block ${alignStyles[align || 'center']}`}
                style={{ display: 'block', textAlign: align || 'center' }}
            >
                {/* Alignment toolbar - shows when selected */}
                {selected && (
                    <div className="absolute -top-10 left-1/2 transform -translate-x-1/2 flex gap-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg shadow-lg p-1 z-10">
                        <button
                            type="button"
                            onClick={() => updateAttributes({ align: 'left' })}
                            className={`p-1.5 rounded ${align === 'left' ? 'bg-golden text-white' : 'hover:bg-gray-100 dark:hover:bg-gray-700'}`}
                            title="Căn trái"
                        >
                            <AlignLeft className="w-4 h-4" />
                        </button>
                        <button
                            type="button"
                            onClick={() => updateAttributes({ align: 'center' })}
                            className={`p-1.5 rounded ${align === 'center' || !align ? 'bg-golden text-white' : 'hover:bg-gray-100 dark:hover:bg-gray-700'}`}
                            title="Căn giữa"
                        >
                            <AlignCenter className="w-4 h-4" />
                        </button>
                        <button
                            type="button"
                            onClick={() => updateAttributes({ align: 'right' })}
                            className={`p-1.5 rounded ${align === 'right' ? 'bg-golden text-white' : 'hover:bg-gray-100 dark:hover:bg-gray-700'}`}
                            title="Căn phải"
                        >
                            <AlignRight className="w-4 h-4" />
                        </button>
                    </div>
                )}

                {/* Image container */}
                <div
                    className={`relative inline-block ${selected ? 'ring-2 ring-golden ring-offset-2' : ''}`}
                    style={{ width: width ? `${width}px` : 'auto' }}
                >
                    <img
                        ref={imageRef}
                        src={src}
                        alt={alt || ''}
                        className="max-w-full h-auto block"
                        style={{ width: width ? `${width}px` : 'auto' }}
                        draggable={false}
                    />

                    {/* Resize handle - right edge */}
                    {selected && (
                        <div
                            className="absolute top-0 right-0 w-3 h-full cursor-ew-resize bg-golden/30 hover:bg-golden/50 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity"
                            onMouseDown={handleMouseDown}
                        >
                            <GripVertical className="w-3 h-3 text-golden" />
                        </div>
                    )}

                    {/* Resize handle - bottom-right corner */}
                    {selected && (
                        <div
                            className="absolute bottom-0 right-0 w-4 h-4 cursor-nwse-resize bg-golden rounded-tl-md"
                            onMouseDown={handleMouseDown}
                        />
                    )}
                </div>

                {/* Caption */}
                {caption && (
                    <figcaption className="text-sm text-gray-500 italic mt-2 text-center">
                        {caption}
                    </figcaption>
                )}
            </figure>
        </NodeViewWrapper>
    );
}

// TipTap extension
export const ResizableImage = Node.create({
    name: 'resizableImage',
    group: 'block',
    draggable: true,
    atom: true,

    addAttributes() {
        return {
            src: { default: null },
            alt: { default: null },
            title: { default: null },
            width: { default: null },
            align: { default: 'center' },
            caption: { default: null },
        };
    },

    parseHTML() {
        return [
            {
                tag: 'figure[data-type="resizable-image"]',
                getAttrs: (element) => {
                    const img = element.querySelector('img');
                    const caption = element.querySelector('figcaption');
                    return {
                        src: img?.getAttribute('src'),
                        alt: img?.getAttribute('alt'),
                        width: img?.getAttribute('width') ? parseInt(img.getAttribute('width') as string) : null,
                        align: element.getAttribute('data-align') || 'center',
                        caption: caption?.textContent || null,
                    };
                },
            },
            {
                tag: 'img[src]',
                getAttrs: (element) => ({
                    src: element.getAttribute('src'),
                    alt: element.getAttribute('alt'),
                    width: element.getAttribute('width') ? parseInt(element.getAttribute('width') as string) : null,
                }),
            },
        ];
    },

    renderHTML({ HTMLAttributes }) {
        const alignStyles: Record<string, string> = {
            left: 'text-align: left;',
            center: 'text-align: center;',
            right: 'text-align: right;',
        };
        const alignStyle = alignStyles[HTMLAttributes.align as string] || alignStyles.center;

        const imgAttrs: Record<string, any> = {
            src: HTMLAttributes.src,
            alt: HTMLAttributes.alt || '',
        };

        if (HTMLAttributes.width) {
            imgAttrs.width = HTMLAttributes.width;
            imgAttrs.style = `width: ${HTMLAttributes.width}px; max-width: 100%; height: auto;`;
        } else {
            imgAttrs.style = 'max-width: 100%; height: auto;';
        }

        const children: any[] = [['img', imgAttrs]];
        if (HTMLAttributes.caption) {
            children.push(['figcaption', { class: 'text-sm text-gray-500 italic mt-2 text-center' }, HTMLAttributes.caption]);
        }

        return [
            'figure',
            mergeAttributes({
                'data-type': 'resizable-image',
                'data-align': HTMLAttributes.align || 'center',
                style: `${alignStyle} margin: 1em 0;`,
            }),
            ...children,
        ];
    },

    addNodeView() {
        return ReactNodeViewRenderer(ResizableImageComponent);
    },

});

export default ResizableImage;
