'use client';

import { Node, mergeAttributes } from '@tiptap/core';

declare module '@tiptap/core' {
    interface Commands<ReturnType> {
        imageFigure: {
            setImageFigure: (options: { src: string; alt?: string; title?: string; caption?: string; align?: 'left' | 'center' | 'right'; width?: number }) => ReturnType;
            updateImageFigure: (options: { caption?: string; align?: 'left' | 'center' | 'right'; width?: number }) => ReturnType;
        };
    }
}

export const ImageFigure = Node.create({
    name: 'imageFigure',
    group: 'block',
    content: 'inline*',
    draggable: true,
    isolating: true,

    addAttributes() {
        return {
            src: {
                default: null,
            },
            alt: {
                default: null,
            },
            title: {
                default: null,
            },
            caption: {
                default: '',
            },
            align: {
                default: 'left',
            },
            width: {
                default: null,
            },
        };
    },

    parseHTML() {
        return [
            {
                tag: 'figure[data-type="image-figure"]',
                getAttrs: (element) => {
                    const img = element.querySelector('img');
                    const figcaption = element.querySelector('figcaption');
                    return {
                        src: img?.getAttribute('src'),
                        alt: img?.getAttribute('alt'),
                        title: img?.getAttribute('title'),
                        caption: figcaption?.textContent || '',
                        align: element.getAttribute('data-align') || 'left',
                        width: img?.getAttribute('width') ? parseInt(img.getAttribute('width') as string) : null,
                    };
                },
            },
        ];
    },

    renderHTML({ HTMLAttributes }) {
        const alignStyles: Record<string, string> = {
            left: 'text-align: left;',
            center: 'text-align: center;',
            right: 'text-align: right;',
        };

        const imgAttrs: Record<string, any> = {
            src: HTMLAttributes.src,
            alt: HTMLAttributes.alt || '',
            title: HTMLAttributes.title || '',
            style: 'max-width: 100%; height: auto; display: inline-block;',
        };

        if (HTMLAttributes.width) {
            imgAttrs.width = HTMLAttributes.width;
            imgAttrs.style = `width: ${HTMLAttributes.width}px; max-width: 100%; height: auto; display: inline-block;`;
        }

        return [
            'figure',
            mergeAttributes(this.options.HTMLAttributes, {
                'data-type': 'image-figure',
                'data-align': HTMLAttributes.align || 'left',
                style: `${alignStyles[HTMLAttributes.align || 'left']} margin: 1em 0;`,
            }),
            ['img', imgAttrs],
            HTMLAttributes.caption ? ['figcaption', { class: 'text-sm text-gray-500 mt-2 italic' }, HTMLAttributes.caption] : '',
        ];
    },

    addCommands() {
        return {
            setImageFigure:
                (options) =>
                    ({ commands }) => {
                        return commands.insertContent({
                            type: this.name,
                            attrs: options,
                        });
                    },

            updateImageFigure:
                (options) =>
                    ({ commands, state }) => {
                        const { selection } = state;
                        const node = state.doc.nodeAt(selection.from);
                        if (node?.type.name === this.name) {
                            return commands.updateAttributes(this.name, options);
                        }
                        return false;
                    },
        };
    },
});

export default ImageFigure;
