'use client';

import { useState, useCallback } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import { ResizableImage } from './ResizableImage';
import InlineStyle from './InlineStyle';
import Placeholder from '@tiptap/extension-placeholder';
import TextAlign from '@tiptap/extension-text-align';
import Underline from '@tiptap/extension-underline';
import { Table } from '@tiptap/extension-table';
import { TableRow } from '@tiptap/extension-table-row';
import { TableCell } from '@tiptap/extension-table-cell';
import { TableHeader } from '@tiptap/extension-table-header';
import Youtube from '@tiptap/extension-youtube';
import { Color } from '@tiptap/extension-color';
import { TextStyle } from '@tiptap/extension-text-style';
import Highlight from '@tiptap/extension-highlight';
import CharacterCount from '@tiptap/extension-character-count';
import Subscript from '@tiptap/extension-subscript';
import Superscript from '@tiptap/extension-superscript';
import TaskList from '@tiptap/extension-task-list';
import TaskItem from '@tiptap/extension-task-item';
import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight';
import { common, createLowlight } from 'lowlight';
import NextImage from 'next/image';
import { parseFullHtml } from '@/lib/html-parser';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Bold,
    Italic,
    Underline as UnderlineIcon,
    Strikethrough,
    Code,
    List,
    ListOrdered,
    Quote,
    Undo,
    Redo,
    Link as LinkIcon,
    Image as ImageIcon,
    AlignLeft,
    AlignCenter,
    AlignRight,
    Heading1,
    Heading2,
    Heading3,
    Minus,
    X,
    ExternalLink,
    FolderOpen,
    Table as TableIcon,
    Youtube as YoutubeIcon,
    Palette,
    Highlighter,
    Subscript as SubscriptIcon,
    Superscript as SuperscriptIcon,
    ListTodo,
    CodeSquare,
    Maximize,
    Minimize,
    Plus,
    Trash2,
    RowsIcon,
    ColumnsIcon,
    Code2,
} from 'lucide-react';
import { cn } from '@/lib/utils';

// Create lowlight instance for code highlighting
const lowlight = createLowlight(common);

// Preset colors
const TEXT_COLORS = [
    { name: 'Default', color: null },
    { name: 'Gray', color: '#6b7280' },
    { name: 'Red', color: '#ef4444' },
    { name: 'Orange', color: '#f97316' },
    { name: 'Yellow', color: '#eab308' },
    { name: 'Green', color: '#22c55e' },
    { name: 'Blue', color: '#3b82f6' },
    { name: 'Purple', color: '#a855f7' },
    { name: 'Pink', color: '#ec4899' },
];

const HIGHLIGHT_COLORS = [
    { name: 'None', color: null },
    { name: 'Yellow', color: '#fef08a' },
    { name: 'Green', color: '#bbf7d0' },
    { name: 'Blue', color: '#bfdbfe' },
    { name: 'Purple', color: '#e9d5ff' },
    { name: 'Pink', color: '#fbcfe8' },
    { name: 'Orange', color: '#fed7aa' },
];

interface MediaFile {
    id: string;
    name: string;
    url?: string;
}

interface TipTapEditorProps {
    content?: string;
    onChange?: (html: string, json: object) => void;
    placeholder?: string;
    editable?: boolean;
    mediaFiles?: MediaFile[];
}

export default function TipTapEditor({
    content = '',
    onChange,
    placeholder = 'Bắt đầu viết nội dung...',
    editable = true,
    mediaFiles = [],
}: TipTapEditorProps) {
    // Modal states
    const [isLinkModalOpen, setIsLinkModalOpen] = useState(false);
    const [isImageModalOpen, setIsImageModalOpen] = useState(false);
    const [isYoutubeModalOpen, setIsYoutubeModalOpen] = useState(false);
    const [isTableModalOpen, setIsTableModalOpen] = useState(false);
    const [isColorPickerOpen, setIsColorPickerOpen] = useState(false);
    const [isHighlightPickerOpen, setIsHighlightPickerOpen] = useState(false);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [isHtmlModalOpen, setIsHtmlModalOpen] = useState(false);

    // Form states
    const [linkUrl, setLinkUrl] = useState('');
    const [linkText, setLinkText] = useState('');
    const [imageUrl, setImageUrl] = useState('');
    const [imageTab, setImageTab] = useState<'url' | 'library'>('url');
    const [youtubeUrl, setYoutubeUrl] = useState('');
    const [tableRows, setTableRows] = useState(3);
    const [tableCols, setTableCols] = useState(3);
    const [htmlCode, setHtmlCode] = useState('');
    const [imageSize, setImageSize] = useState<'small' | 'medium' | 'large' | 'full'>('full');
    const [imageAlign, setImageAlign] = useState<'left' | 'center' | 'right'>('center');
    const [imageCaption, setImageCaption] = useState('');

    const editor = useEditor({
        extensions: [
            StarterKit.configure({
                heading: { levels: [1, 2, 3] },
                codeBlock: false, // Use CodeBlockLowlight instead
            }),
            Link.configure({
                openOnClick: false,
                HTMLAttributes: { class: 'text-golden underline' },
            }),
            ResizableImage,
            Placeholder.configure({ placeholder }),
            TextAlign.configure({ types: ['heading', 'paragraph'] }),
            Underline,
            // New extensions
            Table.configure({ resizable: true }),
            TableRow,
            TableCell,
            TableHeader,
            Youtube.configure({
                width: 640,
                height: 360,
                HTMLAttributes: { class: 'rounded-lg overflow-hidden' },
            }),
            TextStyle,
            Color,
            Highlight.configure({ multicolor: true }),
            CharacterCount,
            Subscript,
            Superscript,
            TaskList,
            TaskItem.configure({ nested: true }),
            CodeBlockLowlight.configure({ lowlight }),
            InlineStyle, // Custom extension to preserve inline styles
        ],
        content,
        editable,
        immediatelyRender: false,
        onUpdate: ({ editor }) => {
            const html = editor.getHTML();
            const json = editor.getJSON();
            onChange?.(html, json);
        },
        editorProps: {
            attributes: {
                class: 'prose prose-lg dark:prose-invert max-w-none min-h-[300px] focus:outline-none p-4',
            },
        },
    });

    // Close all pickers
    const closeAllPickers = useCallback(() => {
        setIsColorPickerOpen(false);
        setIsHighlightPickerOpen(false);
    }, []);

    if (!editor) {
        return null;
    }

    // Character count
    const charCount = editor.storage.characterCount.characters();
    const wordCount = editor.storage.characterCount.words();

    // Link Modal handlers
    const openLinkModal = () => {
        const { from, to } = editor.state.selection;
        const selectedText = editor.state.doc.textBetween(from, to, '');
        setLinkText(selectedText);
        const previousUrl = editor.getAttributes('link').href || '';
        setLinkUrl(previousUrl);
        setIsLinkModalOpen(true);
    };

    const closeLinkModal = () => {
        setIsLinkModalOpen(false);
        setLinkUrl('');
        setLinkText('');
    };

    const insertLink = () => {
        if (linkUrl) {
            let url = linkUrl;
            if (!url.startsWith('http://') && !url.startsWith('https://') && !url.startsWith('mailto:')) {
                url = 'https://' + url;
            }
            if (linkText && editor.state.selection.empty) {
                editor.chain().focus().insertContent(`<a href="${url}">${linkText}</a>`).run();
            } else {
                editor.chain().focus().setLink({ href: url }).run();
            }
        }
        closeLinkModal();
    };

    const removeLink = () => {
        editor.chain().focus().unsetLink().run();
        closeLinkModal();
    };

    // Image Modal handlers
    const openImageModal = () => {
        setImageUrl('');
        setImageTab('url');
        setIsImageModalOpen(true);
    };

    const closeImageModal = () => {
        setIsImageModalOpen(false);
        setImageUrl('');
        setImageSize('full');
        setImageAlign('center');
        setImageCaption('');
    };

    const insertImage = (url: string) => {
        if (url) {
            // Get width based on selected size
            const widthMap = {
                small: 300,
                medium: 500,
                large: 700,
                full: undefined,
            };
            const width = widthMap[imageSize];

            // Insert resizable image with alignment and caption
            editor.chain().focus().insertContent({
                type: 'resizableImage',
                attrs: {
                    src: url,
                    width: width,
                    align: imageAlign,
                    caption: imageCaption || undefined,
                },
            }).run();
        }
        closeImageModal();
    };

    // YouTube Modal handlers
    const openYoutubeModal = () => {
        setYoutubeUrl('');
        setIsYoutubeModalOpen(true);
    };

    const closeYoutubeModal = () => {
        setIsYoutubeModalOpen(false);
        setYoutubeUrl('');
    };

    const insertYoutube = () => {
        if (youtubeUrl) {
            editor.chain().focus().setYoutubeVideo({ src: youtubeUrl }).run();
        }
        closeYoutubeModal();
    };

    // Table Modal handlers
    const openTableModal = () => {
        setTableRows(3);
        setTableCols(3);
        setIsTableModalOpen(true);
    };

    const closeTableModal = () => {
        setIsTableModalOpen(false);
    };

    const insertTable = () => {
        editor.chain().focus().insertTable({ rows: tableRows, cols: tableCols, withHeaderRow: true }).run();
        closeTableModal();
    };

    // HTML Modal handlers
    const openHtmlModal = () => {
        setHtmlCode('');
        setIsHtmlModalOpen(true);
    };

    const closeHtmlModal = () => {
        setIsHtmlModalOpen(false);
        setHtmlCode('');
    };

    const insertHtml = () => {
        if (htmlCode.trim()) {
            // Parse full HTML document (handles DOCTYPE, style tags, figure/figcaption)
            const cleanedHtml = parseFullHtml(htmlCode);
            editor.chain().focus().insertContent(cleanedHtml).run();
        }
        closeHtmlModal();
    };

    // Filter only image files from media library
    const imageFiles = mediaFiles.filter(file =>
        /\.(jpg|jpeg|png|gif|webp|svg)$/i.test(file.name)
    );

    const ToolbarButton = ({
        onClick,
        isActive = false,
        disabled = false,
        children,
        title,
    }: {
        onClick: () => void;
        isActive?: boolean;
        disabled?: boolean;
        children: React.ReactNode;
        title: string;
    }) => (
        <button
            type="button"
            onClick={onClick}
            disabled={disabled}
            title={title}
            className={cn(
                'p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed',
                isActive && 'bg-golden/20 text-golden'
            )}
        >
            {children}
        </button>
    );

    const Divider = () => <div className="w-px h-6 bg-gray-300 dark:bg-gray-600 mx-1" />;

    return (
        <div className={cn(
            'border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden transition-all',
            isFullscreen && 'fixed inset-4 z-50 bg-white dark:bg-gray-900 shadow-2xl'
        )}>
            {/* Toolbar */}
            <div className="flex flex-wrap items-center gap-1 p-2 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
                {/* Headings */}
                <ToolbarButton
                    onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
                    isActive={editor.isActive('heading', { level: 1 })}
                    title="Heading 1"
                >
                    <Heading1 className="w-4 h-4" />
                </ToolbarButton>
                <ToolbarButton
                    onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
                    isActive={editor.isActive('heading', { level: 2 })}
                    title="Heading 2"
                >
                    <Heading2 className="w-4 h-4" />
                </ToolbarButton>
                <ToolbarButton
                    onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
                    isActive={editor.isActive('heading', { level: 3 })}
                    title="Heading 3"
                >
                    <Heading3 className="w-4 h-4" />
                </ToolbarButton>

                <Divider />

                {/* Text formatting */}
                <ToolbarButton
                    onClick={() => editor.chain().focus().toggleBold().run()}
                    isActive={editor.isActive('bold')}
                    title="Bold (Ctrl+B)"
                >
                    <Bold className="w-4 h-4" />
                </ToolbarButton>
                <ToolbarButton
                    onClick={() => editor.chain().focus().toggleItalic().run()}
                    isActive={editor.isActive('italic')}
                    title="Italic (Ctrl+I)"
                >
                    <Italic className="w-4 h-4" />
                </ToolbarButton>
                <ToolbarButton
                    onClick={() => editor.chain().focus().toggleUnderline().run()}
                    isActive={editor.isActive('underline')}
                    title="Underline (Ctrl+U)"
                >
                    <UnderlineIcon className="w-4 h-4" />
                </ToolbarButton>
                <ToolbarButton
                    onClick={() => editor.chain().focus().toggleStrike().run()}
                    isActive={editor.isActive('strike')}
                    title="Strikethrough"
                >
                    <Strikethrough className="w-4 h-4" />
                </ToolbarButton>
                <ToolbarButton
                    onClick={() => editor.chain().focus().toggleCode().run()}
                    isActive={editor.isActive('code')}
                    title="Inline Code"
                >
                    <Code className="w-4 h-4" />
                </ToolbarButton>
                <ToolbarButton
                    onClick={() => editor.chain().focus().toggleSubscript().run()}
                    isActive={editor.isActive('subscript')}
                    title="Subscript"
                >
                    <SubscriptIcon className="w-4 h-4" />
                </ToolbarButton>
                <ToolbarButton
                    onClick={() => editor.chain().focus().toggleSuperscript().run()}
                    isActive={editor.isActive('superscript')}
                    title="Superscript"
                >
                    <SuperscriptIcon className="w-4 h-4" />
                </ToolbarButton>

                <Divider />

                {/* Color & Highlight */}
                <div className="relative">
                    <ToolbarButton
                        onClick={() => {
                            closeAllPickers();
                            setIsColorPickerOpen(!isColorPickerOpen);
                        }}
                        isActive={isColorPickerOpen}
                        title="Màu chữ"
                    >
                        <Palette className="w-4 h-4" />
                    </ToolbarButton>
                    {isColorPickerOpen && (
                        <div className="absolute top-full left-0 mt-1 p-2 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-10">
                            <div className="grid grid-cols-5 gap-1">
                                {TEXT_COLORS.map((c) => (
                                    <button
                                        key={c.name}
                                        type="button"
                                        onClick={() => {
                                            if (c.color) {
                                                editor.chain().focus().setColor(c.color).run();
                                            } else {
                                                editor.chain().focus().unsetColor().run();
                                            }
                                            setIsColorPickerOpen(false);
                                        }}
                                        className="w-6 h-6 rounded border border-gray-300 dark:border-gray-600 hover:scale-110 transition-transform"
                                        style={{ backgroundColor: c.color || 'transparent' }}
                                        title={c.name}
                                    >
                                        {!c.color && <X className="w-4 h-4 mx-auto text-gray-400" />}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
                <div className="relative">
                    <ToolbarButton
                        onClick={() => {
                            closeAllPickers();
                            setIsHighlightPickerOpen(!isHighlightPickerOpen);
                        }}
                        isActive={isHighlightPickerOpen}
                        title="Tô nền"
                    >
                        <Highlighter className="w-4 h-4" />
                    </ToolbarButton>
                    {isHighlightPickerOpen && (
                        <div className="absolute top-full left-0 mt-1 p-2 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-10">
                            <div className="grid grid-cols-4 gap-1">
                                {HIGHLIGHT_COLORS.map((c) => (
                                    <button
                                        key={c.name}
                                        type="button"
                                        onClick={() => {
                                            if (c.color) {
                                                editor.chain().focus().toggleHighlight({ color: c.color }).run();
                                            } else {
                                                editor.chain().focus().unsetHighlight().run();
                                            }
                                            setIsHighlightPickerOpen(false);
                                        }}
                                        className="w-6 h-6 rounded border border-gray-300 dark:border-gray-600 hover:scale-110 transition-transform"
                                        style={{ backgroundColor: c.color || 'transparent' }}
                                        title={c.name}
                                    >
                                        {!c.color && <X className="w-4 h-4 mx-auto text-gray-400" />}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                <Divider />

                {/* Lists */}
                <ToolbarButton
                    onClick={() => editor.chain().focus().toggleBulletList().run()}
                    isActive={editor.isActive('bulletList')}
                    title="Danh sách"
                >
                    <List className="w-4 h-4" />
                </ToolbarButton>
                <ToolbarButton
                    onClick={() => editor.chain().focus().toggleOrderedList().run()}
                    isActive={editor.isActive('orderedList')}
                    title="Danh sách số"
                >
                    <ListOrdered className="w-4 h-4" />
                </ToolbarButton>
                <ToolbarButton
                    onClick={() => editor.chain().focus().toggleTaskList().run()}
                    isActive={editor.isActive('taskList')}
                    title="Danh sách checkbox"
                >
                    <ListTodo className="w-4 h-4" />
                </ToolbarButton>
                <ToolbarButton
                    onClick={() => editor.chain().focus().toggleBlockquote().run()}
                    isActive={editor.isActive('blockquote')}
                    title="Trích dẫn"
                >
                    <Quote className="w-4 h-4" />
                </ToolbarButton>
                <ToolbarButton
                    onClick={() => editor.chain().focus().toggleCodeBlock().run()}
                    isActive={editor.isActive('codeBlock')}
                    title="Code Block"
                >
                    <CodeSquare className="w-4 h-4" />
                </ToolbarButton>
                <ToolbarButton
                    onClick={() => editor.chain().focus().setHorizontalRule().run()}
                    title="Đường kẻ ngang"
                >
                    <Minus className="w-4 h-4" />
                </ToolbarButton>

                <Divider />

                {/* Alignment */}
                <ToolbarButton
                    onClick={() => editor.chain().focus().setTextAlign('left').run()}
                    isActive={editor.isActive({ textAlign: 'left' })}
                    title="Căn trái"
                >
                    <AlignLeft className="w-4 h-4" />
                </ToolbarButton>
                <ToolbarButton
                    onClick={() => editor.chain().focus().setTextAlign('center').run()}
                    isActive={editor.isActive({ textAlign: 'center' })}
                    title="Căn giữa"
                >
                    <AlignCenter className="w-4 h-4" />
                </ToolbarButton>
                <ToolbarButton
                    onClick={() => editor.chain().focus().setTextAlign('right').run()}
                    isActive={editor.isActive({ textAlign: 'right' })}
                    title="Căn phải"
                >
                    <AlignRight className="w-4 h-4" />
                </ToolbarButton>

                <Divider />

                {/* Media & Table */}
                <ToolbarButton onClick={openLinkModal} isActive={editor.isActive('link')} title="Chèn liên kết">
                    <LinkIcon className="w-4 h-4" />
                </ToolbarButton>
                <ToolbarButton onClick={openImageModal} title="Chèn ảnh">
                    <ImageIcon className="w-4 h-4" />
                </ToolbarButton>
                <ToolbarButton onClick={openYoutubeModal} title="Chèn video YouTube">
                    <YoutubeIcon className="w-4 h-4" />
                </ToolbarButton>
                <ToolbarButton onClick={openTableModal} title="Chèn bảng">
                    <TableIcon className="w-4 h-4" />
                </ToolbarButton>
                <ToolbarButton onClick={openHtmlModal} title="Chèn HTML">
                    <Code2 className="w-4 h-4" />
                </ToolbarButton>

                {/* Table controls (shown when inside table) */}
                {editor.isActive('table') && (
                    <>
                        <Divider />
                        <ToolbarButton
                            onClick={() => editor.chain().focus().addRowAfter().run()}
                            title="Thêm hàng"
                        >
                            <RowsIcon className="w-4 h-4" />
                        </ToolbarButton>
                        <ToolbarButton
                            onClick={() => editor.chain().focus().addColumnAfter().run()}
                            title="Thêm cột"
                        >
                            <ColumnsIcon className="w-4 h-4" />
                        </ToolbarButton>
                        <ToolbarButton
                            onClick={() => editor.chain().focus().deleteRow().run()}
                            title="Xóa hàng"
                        >
                            <Trash2 className="w-4 h-4 text-red-500" />
                        </ToolbarButton>
                        <ToolbarButton
                            onClick={() => editor.chain().focus().deleteTable().run()}
                            title="Xóa bảng"
                        >
                            <X className="w-4 h-4 text-red-500" />
                        </ToolbarButton>
                    </>
                )}

                <Divider />

                {/* Undo/Redo */}
                <ToolbarButton
                    onClick={() => editor.chain().focus().undo().run()}
                    disabled={!editor.can().undo()}
                    title="Hoàn tác (Ctrl+Z)"
                >
                    <Undo className="w-4 h-4" />
                </ToolbarButton>
                <ToolbarButton
                    onClick={() => editor.chain().focus().redo().run()}
                    disabled={!editor.can().redo()}
                    title="Làm lại (Ctrl+Y)"
                >
                    <Redo className="w-4 h-4" />
                </ToolbarButton>

                <Divider />

                {/* Fullscreen */}
                <ToolbarButton
                    onClick={() => setIsFullscreen(!isFullscreen)}
                    isActive={isFullscreen}
                    title={isFullscreen ? 'Thoát toàn màn hình' : 'Toàn màn hình'}
                >
                    {isFullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
                </ToolbarButton>

                {/* Character count */}
                <div className="ml-auto text-xs text-gray-500 dark:text-gray-400 px-2">
                    {wordCount} từ · {charCount} ký tự
                </div>
            </div>

            {/* Editor */}
            <EditorContent
                editor={editor}
                className={cn(
                    'bg-white dark:bg-gray-900',
                    isFullscreen && 'overflow-y-auto max-h-[calc(100vh-8rem)]'
                )}
                onClick={closeAllPickers}
            />

            {/* Link Modal */}
            {isLinkModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
                    <div className="bg-white dark:bg-gray-900 rounded-xl shadow-xl w-full max-w-md overflow-hidden">
                        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
                            <h3 className="font-semibold text-lg flex items-center gap-2">
                                <LinkIcon className="w-5 h-5" />
                                Chèn liên kết
                            </h3>
                            <Button type="button" variant="ghost" size="icon" onClick={closeLinkModal}>
                                <X className="w-5 h-5" />
                            </Button>
                        </div>
                        <div className="p-4 space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-2">URL</label>
                                <Input
                                    type="url"
                                    value={linkUrl}
                                    onChange={(e) => setLinkUrl(e.target.value)}
                                    placeholder="https://example.com"
                                    autoFocus
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-2">
                                    Văn bản hiển thị <span className="text-gray-400 text-xs">(tùy chọn)</span>
                                </label>
                                <Input
                                    type="text"
                                    value={linkText}
                                    onChange={(e) => setLinkText(e.target.value)}
                                    placeholder="Nhập văn bản..."
                                />
                            </div>
                        </div>
                        <div className="flex items-center justify-between p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
                            {editor.isActive('link') && (
                                <Button type="button" variant="destructive" size="sm" onClick={removeLink}>
                                    Xóa liên kết
                                </Button>
                            )}
                            <div className="flex items-center gap-2 ml-auto">
                                <Button type="button" variant="outline" onClick={closeLinkModal}>Hủy</Button>
                                <Button type="button" onClick={insertLink} disabled={!linkUrl}>
                                    <ExternalLink className="w-4 h-4 mr-2" />
                                    Thêm liên kết
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Image Modal */}
            {isImageModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
                    <div className="bg-white dark:bg-gray-900 rounded-xl shadow-xl w-full max-w-3xl max-h-[80vh] overflow-hidden">
                        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
                            <h3 className="font-semibold text-lg flex items-center gap-2">
                                <ImageIcon className="w-5 h-5" />
                                Chèn ảnh
                            </h3>
                            <Button type="button" variant="ghost" size="icon" onClick={closeImageModal}>
                                <X className="w-5 h-5" />
                            </Button>
                        </div>
                        <div className="flex border-b border-gray-200 dark:border-gray-700">
                            <button
                                type="button"
                                onClick={() => setImageTab('url')}
                                className={cn(
                                    'flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors',
                                    imageTab === 'url' ? 'border-golden text-golden' : 'border-transparent text-gray-500 hover:text-gray-700'
                                )}
                            >
                                <ExternalLink className="w-4 h-4" />
                                Nhập URL
                            </button>
                            <button
                                type="button"
                                onClick={() => setImageTab('library')}
                                className={cn(
                                    'flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors',
                                    imageTab === 'library' ? 'border-golden text-golden' : 'border-transparent text-gray-500 hover:text-gray-700'
                                )}
                            >
                                <FolderOpen className="w-4 h-4" />
                                Thư viện Media
                            </button>
                        </div>
                        <div className="p-4 overflow-y-auto max-h-[50vh]">
                            {imageTab === 'url' ? (
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium mb-2">URL ảnh</label>
                                        <Input
                                            type="url"
                                            value={imageUrl}
                                            onChange={(e) => setImageUrl(e.target.value)}
                                            placeholder="https://example.com/image.jpg"
                                            autoFocus
                                        />
                                    </div>
                                    {imageUrl && (
                                        <div className="relative aspect-video rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-800">
                                            <img src={imageUrl} alt="Preview" className="w-full h-full object-contain" />
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {imageFiles.length > 0 ? (
                                        <>
                                            <div className="grid grid-cols-3 md:grid-cols-4 gap-3 max-h-[40vh] overflow-y-auto">
                                                {imageFiles.map((file) => (
                                                    <button
                                                        key={file.id}
                                                        type="button"
                                                        onClick={() => file.url && setImageUrl(file.url)}
                                                        className={`relative aspect-square rounded-lg overflow-hidden border-2 transition-all ${imageUrl === file.url ? 'border-golden ring-2 ring-golden/30' : 'border-gray-200 dark:border-gray-700 hover:border-golden'}`}
                                                    >
                                                        {file.url && <NextImage src={file.url} alt={file.name} fill className="object-cover" />}
                                                    </button>
                                                ))}
                                            </div>
                                            {/* Size and alignment selector with insert button */}
                                            <div className="flex items-center justify-between pt-3 border-t border-gray-200 dark:border-gray-700">
                                                <div className="flex items-center gap-3">
                                                    <div className="flex items-center gap-2">
                                                        <label className="text-sm">Size:</label>
                                                        <select
                                                            value={imageSize}
                                                            onChange={(e) => setImageSize(e.target.value as 'small' | 'medium' | 'large' | 'full')}
                                                            className="px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800"
                                                        >
                                                            <option value="small">Nhỏ</option>
                                                            <option value="medium">Vừa</option>
                                                            <option value="large">Lớn</option>
                                                            <option value="full">Full</option>
                                                        </select>
                                                    </div>
                                                    <div className="flex border border-gray-300 dark:border-gray-600 rounded overflow-hidden">
                                                        <button
                                                            type="button"
                                                            onClick={() => setImageAlign('left')}
                                                            className={`p-1.5 ${imageAlign === 'left' ? 'bg-golden text-white' : 'bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700'}`}
                                                            title="Căn trái"
                                                        >
                                                            <AlignLeft className="w-4 h-4" />
                                                        </button>
                                                        <button
                                                            type="button"
                                                            onClick={() => setImageAlign('center')}
                                                            className={`p-1.5 border-x border-gray-300 dark:border-gray-600 ${imageAlign === 'center' ? 'bg-golden text-white' : 'bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700'}`}
                                                            title="Căn giữa"
                                                        >
                                                            <AlignCenter className="w-4 h-4" />
                                                        </button>
                                                        <button
                                                            type="button"
                                                            onClick={() => setImageAlign('right')}
                                                            className={`p-1.5 ${imageAlign === 'right' ? 'bg-golden text-white' : 'bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700'}`}
                                                            title="Căn phải"
                                                        >
                                                            <AlignRight className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <Input
                                                        type="text"
                                                        value={imageCaption}
                                                        onChange={(e) => setImageCaption(e.target.value)}
                                                        placeholder="Chú thích ảnh (tùy chọn)"
                                                        className="w-40 h-8 text-sm"
                                                    />
                                                    <Button type="button" onClick={() => insertImage(imageUrl)} disabled={!imageUrl}>
                                                        <ImageIcon className="w-4 h-4 mr-2" />
                                                        Chèn
                                                    </Button>
                                                </div>
                                            </div>
                                        </>
                                    ) : (
                                        <div className="text-center py-12 text-gray-500">
                                            <ImageIcon className="w-12 h-12 mx-auto mb-3 opacity-50" />
                                            <p>Chưa có ảnh nào trong thư viện</p>
                                            <p className="text-sm mt-1">
                                                Vui lòng upload ảnh tại <a href="/admin/media" className="text-golden hover:underline">Quản lý media</a>
                                            </p>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                        {imageTab === 'url' && (
                            <div className="flex items-center justify-between gap-2 p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
                                <div className="flex items-center gap-4">
                                    <div className="flex items-center gap-2">
                                        <label className="text-sm">Kích thước:</label>
                                        <select
                                            value={imageSize}
                                            onChange={(e) => setImageSize(e.target.value as 'small' | 'medium' | 'large' | 'full')}
                                            className="px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800"
                                        >
                                            <option value="small">Nhỏ (300px)</option>
                                            <option value="medium">Vừa (500px)</option>
                                            <option value="large">Lớn (700px)</option>
                                            <option value="full">Toàn bộ</option>
                                        </select>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <label className="text-sm">Căn lề:</label>
                                        <div className="flex border border-gray-300 dark:border-gray-600 rounded overflow-hidden">
                                            <button
                                                type="button"
                                                onClick={() => setImageAlign('left')}
                                                className={`p-1.5 ${imageAlign === 'left' ? 'bg-golden text-white' : 'bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700'}`}
                                                title="Căn trái"
                                            >
                                                <AlignLeft className="w-4 h-4" />
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => setImageAlign('center')}
                                                className={`p-1.5 border-x border-gray-300 dark:border-gray-600 ${imageAlign === 'center' ? 'bg-golden text-white' : 'bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700'}`}
                                                title="Căn giữa"
                                            >
                                                <AlignCenter className="w-4 h-4" />
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => setImageAlign('right')}
                                                className={`p-1.5 ${imageAlign === 'right' ? 'bg-golden text-white' : 'bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700'}`}
                                                title="Căn phải"
                                            >
                                                <AlignRight className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Input
                                        type="text"
                                        value={imageCaption}
                                        onChange={(e) => setImageCaption(e.target.value)}
                                        placeholder="Chú thích ảnh (tùy chọn)"
                                        className="w-40 h-8 text-sm"
                                    />
                                    <Button type="button" variant="outline" onClick={closeImageModal}>Hủy</Button>
                                    <Button type="button" onClick={() => insertImage(imageUrl)} disabled={!imageUrl}>
                                        <ImageIcon className="w-4 h-4 mr-2" />
                                        Chèn
                                    </Button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* YouTube Modal */}
            {isYoutubeModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
                    <div className="bg-white dark:bg-gray-900 rounded-xl shadow-xl w-full max-w-md overflow-hidden">
                        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
                            <h3 className="font-semibold text-lg flex items-center gap-2">
                                <YoutubeIcon className="w-5 h-5 text-red-500" />
                                Chèn video YouTube
                            </h3>
                            <Button type="button" variant="ghost" size="icon" onClick={closeYoutubeModal}>
                                <X className="w-5 h-5" />
                            </Button>
                        </div>
                        <div className="p-4 space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-2">URL video YouTube</label>
                                <Input
                                    type="url"
                                    value={youtubeUrl}
                                    onChange={(e) => setYoutubeUrl(e.target.value)}
                                    placeholder="https://www.youtube.com/watch?v=..."
                                    autoFocus
                                />
                                <p className="text-xs text-gray-500 mt-1">
                                    Hỗ trợ: youtube.com/watch?v=..., youtu.be/..., youtube.com/embed/...
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center justify-end gap-2 p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
                            <Button type="button" variant="outline" onClick={closeYoutubeModal}>Hủy</Button>
                            <Button type="button" onClick={insertYoutube} disabled={!youtubeUrl}>
                                <YoutubeIcon className="w-4 h-4 mr-2" />
                                Chèn video
                            </Button>
                        </div>
                    </div>
                </div>
            )}

            {/* Table Modal */}
            {isTableModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
                    <div className="bg-white dark:bg-gray-900 rounded-xl shadow-xl w-full max-w-sm overflow-hidden">
                        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
                            <h3 className="font-semibold text-lg flex items-center gap-2">
                                <TableIcon className="w-5 h-5" />
                                Chèn bảng
                            </h3>
                            <Button type="button" variant="ghost" size="icon" onClick={closeTableModal}>
                                <X className="w-5 h-5" />
                            </Button>
                        </div>
                        <div className="p-4 space-y-4">
                            <div className="flex gap-4">
                                <div className="flex-1">
                                    <label className="block text-sm font-medium mb-2">Số hàng</label>
                                    <Input
                                        type="number"
                                        min={1}
                                        max={20}
                                        value={tableRows}
                                        onChange={(e) => setTableRows(parseInt(e.target.value) || 1)}
                                    />
                                </div>
                                <div className="flex-1">
                                    <label className="block text-sm font-medium mb-2">Số cột</label>
                                    <Input
                                        type="number"
                                        min={1}
                                        max={10}
                                        value={tableCols}
                                        onChange={(e) => setTableCols(parseInt(e.target.value) || 1)}
                                    />
                                </div>
                            </div>
                            <p className="text-xs text-gray-500">
                                Bảng sẽ có hàng đầu tiên là header. Bạn có thể thêm/xóa hàng/cột sau khi chèn.
                            </p>
                        </div>
                        <div className="flex items-center justify-end gap-2 p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
                            <Button type="button" variant="outline" onClick={closeTableModal}>Hủy</Button>
                            <Button type="button" onClick={insertTable}>
                                <Plus className="w-4 h-4 mr-2" />
                                Chèn bảng
                            </Button>
                        </div>
                    </div>
                </div>
            )}

            {/* HTML Modal */}
            {isHtmlModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
                    <div className="bg-white dark:bg-gray-900 rounded-xl shadow-xl w-full max-w-3xl max-h-[80vh] overflow-hidden">
                        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
                            <h3 className="font-semibold text-lg flex items-center gap-2">
                                <Code2 className="w-5 h-5" />
                                Chèn HTML
                            </h3>
                            <Button type="button" variant="ghost" size="icon" onClick={closeHtmlModal}>
                                <X className="w-5 h-5" />
                            </Button>
                        </div>
                        <div className="p-4 space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-2">
                                    Mã HTML <span className="text-gray-400 text-xs">(hỗ trợ headings, lists, tables, images...)</span>
                                </label>
                                <textarea
                                    value={htmlCode}
                                    onChange={(e) => setHtmlCode(e.target.value)}
                                    placeholder="<h2>Tiêu đề</h2>&#10;<p>Nội dung bài viết...</p>&#10;<ul>&#10;  <li>Mục 1</li>&#10;  <li>Mục 2</li>&#10;</ul>"
                                    className="w-full h-64 p-3 font-mono text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-800 focus:ring-2 focus:ring-golden focus:border-golden resize-none"
                                    autoFocus
                                />
                            </div>
                            {htmlCode.trim() && (
                                <div>
                                    <label className="block text-sm font-medium mb-2">Preview</label>
                                    <div
                                        className="prose prose-sm dark:prose-invert max-w-none p-4 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 max-h-40 overflow-y-auto"
                                        dangerouslySetInnerHTML={{ __html: htmlCode }}
                                    />
                                </div>
                            )}
                        </div>
                        <div className="flex items-center justify-end gap-2 p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
                            <Button type="button" variant="outline" onClick={closeHtmlModal}>Hủy</Button>
                            <Button type="button" onClick={insertHtml} disabled={!htmlCode.trim()}>
                                <Code2 className="w-4 h-4 mr-2" />
                                Chèn HTML
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
