/**
 * Custom TipTap extension to preserve inline styles
 * This allows elements like <span style="background-color: ..."> to be preserved
 */

import { Mark, mergeAttributes } from '@tiptap/core';

export interface InlineStyleOptions {
    HTMLAttributes: Record<string, unknown>;
}

declare module '@tiptap/core' {
    interface Commands<ReturnType> {
        inlineStyle: {
            /**
             * Set an inline style
             */
            setInlineStyle: (style: string) => ReturnType;
            /**
             * Unset inline style
             */
            unsetInlineStyle: () => ReturnType;
        };
    }
}

export const InlineStyle = Mark.create<InlineStyleOptions>({
    name: 'inlineStyle',

    addOptions() {
        return {
            HTMLAttributes: {},
        };
    },

    parseHTML() {
        return [
            {
                tag: 'span[style]',
                getAttrs: (node) => {
                    const element = node as HTMLElement;
                    const style = element.getAttribute('style');
                    if (style) {
                        return { style };
                    }
                    return false;
                },
            },
        ];
    },

    addAttributes() {
        return {
            style: {
                default: null,
                parseHTML: element => element.getAttribute('style'),
                renderHTML: attributes => {
                    if (!attributes.style) {
                        return {};
                    }
                    return { style: attributes.style };
                },
            },
        };
    },

    renderHTML({ HTMLAttributes }) {
        return ['span', mergeAttributes(this.options.HTMLAttributes, HTMLAttributes), 0];
    },

    addCommands() {
        return {
            setInlineStyle:
                (style: string) =>
                    ({ commands }) => {
                        return commands.setMark(this.name, { style });
                    },
            unsetInlineStyle:
                () =>
                    ({ commands }) => {
                        return commands.unsetMark(this.name);
                    },
        };
    },
});

export default InlineStyle;
