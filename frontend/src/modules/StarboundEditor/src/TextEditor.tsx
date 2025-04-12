import React, { useCallback, useState } from 'react';
import classNames from 'classnames';
// => Tiptap packages
import { useEditor, EditorContent, Editor, BubbleMenu } from '@tiptap/react';
import Document from '@tiptap/extension-document';
import Paragraph from '@tiptap/extension-paragraph';
import Text from '@tiptap/extension-text';
import Link from '@tiptap/extension-link';
import Bold from '@tiptap/extension-bold';
import Underline from '@tiptap/extension-underline';
import Italic from '@tiptap/extension-italic';
import Strike from '@tiptap/extension-strike';
import Code from '@tiptap/extension-code';
import History from '@tiptap/extension-history';
// Custom
import * as Icons from './Icons';
import { LinkModal } from './LinkModal';

interface TextEditorProps {
  content: string;
  getHtml: (html: string) => void;
}

export const TextEditor: React.FC<TextEditorProps> = ({ content, getHtml }) => {
  const editor = useEditor({
    extensions: [
      Document,
      History,
      Paragraph,
      Text,
      Link.configure({
        openOnClick: false,
      }),
      Bold,
      Underline,
      Italic,
      Strike,
      Code,
    ],
    content: content,
    onUpdate: () => {
      const html = editor.getHTML();
      getHtml(html);
    },
    editorProps: {
      attributes: {
        class: 'editor-content',
      },
    },
  }) as Editor;

  const [modalIsOpen, setIsOpen] = useState(false);
  const [url, setUrl] = useState<string>('');

  const openModal = useCallback(
    (e: { preventDefault: () => void }) => {
      e.preventDefault();
      console.log(editor.chain().focus());
      setUrl(editor.getAttributes('link').href);
      setIsOpen(true);
    },
    [editor]
  );

  const closeModal = useCallback(() => {
    setIsOpen(false);
    setUrl('');
  }, []);

  const saveLink = useCallback(
    (e: { preventDefault: () => void }) => {
      e.preventDefault();
      if (url) {
        editor
          .chain()
          .focus()
          .extendMarkRange('link')
          .setLink({ href: url, target: '_blank' })
          .run();
      } else {
        editor.chain().focus().extendMarkRange('link').unsetLink().run();
      }
      closeModal();
    },
    [editor, url, closeModal]
  );

  const removeLink = useCallback(
    (e: { preventDefault: () => void }) => {
      e.preventDefault();
      editor.chain().focus().extendMarkRange('link').unsetLink().run();
      closeModal();
    },
    [editor, closeModal]
  );

  const toggleBold = useCallback(
    (e: { preventDefault: () => void }) => {
      e.preventDefault();
      editor.chain().focus().toggleBold().run();
    },
    [editor]
  );

  const toggleUnderline = useCallback(
    (e: { preventDefault: () => void }) => {
      e.preventDefault();
      editor.chain().focus().toggleUnderline().run();
    },
    [editor]
  );

  const toggleItalic = useCallback(
    (e: { preventDefault: () => void }) => {
      e.preventDefault();
      editor.chain().focus().toggleItalic().run();
    },
    [editor]
  );

  const toggleStrike = useCallback(
    (e: { preventDefault: () => void }) => {
      e.preventDefault();
      editor.chain().focus().toggleStrike().run();
    },
    [editor]
  );

  const toggleCode = useCallback(
    (e: { preventDefault: () => void }) => {
      e.preventDefault();
      editor.chain().focus().toggleCode().run();
    },
    [editor]
  );

  return (
    <div className="editor">
      <div className="menu">
        <button
          type="button"
          className="menu-button"
          onClick={(e) => {
            e.preventDefault();
            editor.chain().focus().undo().run(); // undo
          }}
          disabled={!editor.can().undo()}
        >
          <Icons.RotateLeft />
        </button>
        <button
          type="button"
          className="menu-button"
          onClick={(e) => {
            e.preventDefault();
            editor.chain().focus().redo().run();
          }}
          disabled={!editor.can().redo()}
        >
          <Icons.RotateRight />
        </button>
        <button
          type="button"
          className={classNames('menu-button', {
            'is-active': editor.isActive('link'),
          })}
          onClick={openModal}
        >
          <Icons.Link />
        </button>
        <button
          type="button"
          className={classNames('menu-button', {
            'is-active': editor.isActive('bold'),
          })}
          onClick={toggleBold}
        >
          <Icons.Bold />
        </button>
        <button
          type="button"
          className={classNames('menu-button', {
            'is-active': editor.isActive('underline'),
          })}
          onClick={toggleUnderline}
        >
          <Icons.Underline />
        </button>
        <button
          type="button"
          className={classNames('menu-button', {
            'is-active': editor.isActive('italic'),
          })}
          onClick={toggleItalic}
        >
          <Icons.Italic />
        </button>
        <button
          type="button"
          className={classNames('menu-button', {
            'is-active': editor.isActive('strike'),
          })}
          onClick={toggleStrike}
        >
          <Icons.Strikethrough />
        </button>
        <button
          type="button"
          className={classNames('menu-button', {
            'is-active': editor.isActive('code'),
          })}
          onClick={toggleCode}
        >
          <Icons.Code />
        </button>
      </div>

      <BubbleMenu
        className="bubble-menu-light"
        tippyOptions={{ duration: 150 }}
        editor={editor}
        shouldShow={({ editor, from, to }) => {
          // only show the bubble menu for links.
          return from === to && editor.isActive('link');
        }}
      >
        <button className="button" onClick={openModal}>
          Edit
        </button>
        <button className="button-remove" onClick={removeLink}>
          Remove
        </button>
      </BubbleMenu>

      <EditorContent editor={editor} />

      <LinkModal
        url={url}
        isOpen={modalIsOpen}
        onRequestClose={closeModal}
        contentLabel="Edit Link Modal"
        closeModal={closeModal}
        onChangeUrl={(e) => setUrl(e.target.value)}
        onSaveLink={saveLink}
        onRemoveLink={removeLink}
      />
    </div>
  );
};
