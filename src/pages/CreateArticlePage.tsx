import {
  createArticle,
  getArticleDetail,
  updateArticle,
} from '@/apis/articleApi';
import { uploadImage } from '@/apis/imageApi';
import type { CreateArticleRequest } from '@/types/article';
// pages/CreateArticlePage.tsx
import { useMutation, useQuery } from '@tanstack/react-query';
import { marked } from 'marked';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import TurndownService from 'turndown';
import { gfm } from 'turndown-plugin-gfm';
import styles from './CreateArticlePage.module.css';

type Tab = 'write' | 'preview';

const CreateArticlePage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from || '';
  const { articleId } = useParams<{ articleId: string }>();
  const isEditMode = !!articleId;

  // Form State
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [content, setContent] = useState(''); // Markdown or HTML depending on mode
  const [originLink, setOriginLink] = useState<string | null>(null);

  // Editor State
  const [activeTab, setActiveTab] = useState<Tab>('write');
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [previewHtml, setPreviewHtml] = useState('');

  // Fetch Article for Edit Mode
  const { data: article } = useQuery({
    queryKey: ['article', articleId],
    queryFn: () => getArticleDetail(Number(articleId)),
    enabled: isEditMode,
  });

  // Determine if we are in "Board 1 Mode" (Markdown) or "Other Mode" (HTML)
  // Logic: New articles (Create Mode) default to Board 1 logic.
  // Existing articles check board.id being 1.
  const isBoard1 = !isEditMode || article?.board?.id === 1;

  // Initialize Turndown Service
  const turndownService = useMemo(() => {
    const service = new TurndownService({
      headingStyle: 'atx',
      codeBlockStyle: 'fenced',
    });
    service.use(gfm);
    return service;
  }, []);

  // Populate data when article loads
  useEffect(() => {
    if (article) {
      setTitle(article.title);
      setAuthor(article.author || '');
      setOriginLink(article.originLink);

      // Condition: Is Board 1? -> Turn HTML to Markdown
      if (article.board?.id === 1) {
        // Safe conversion
        try {
          const markdown = turndownService.turndown(article.content);
          setContent(markdown);
        } catch (e) {
          console.error('Turndown conversion failed', e);
          setContent(article.content); // Fallback
        }
      } else {
        // Other boards -> Raw HTML
        setContent(article.content);
      }
    }
  }, [article, turndownService]);

  // Update preview structure securely
  useEffect(() => {
    const updatePreview = async () => {
      if (isBoard1) {
        // If Board 1, content is Markdown -> Convert to HTML for preview
        try {
          const html = await marked.parse(content, { breaks: true });
          setPreviewHtml(html);
        } catch (error) {
          console.error('Markdown conversion failed:', error);
        }
      } else {
        // Other boards, content is HTML -> Use directly
        setPreviewHtml(content);
      }
    };
    updatePreview();
  }, [content, isBoard1]);

  // Image Paste Handler
  const handlePaste = async (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
    const items = Array.from(e.clipboardData.items);
    const imageItem = items.find((item) => item.type.startsWith('image/'));

    if (imageItem) {
      e.preventDefault();
      const file = imageItem.getAsFile();
      if (!file || !textareaRef.current) return;

      try {
        const url = await uploadImage(file);

        let insertedText = '';
        if (isBoard1) {
          // Markdown image syntax
          insertedText = `![image](${url})`;
        } else {
          // HTML image syntax
          insertedText = `<img src="${url}" alt="image" />`;
        }

        // Insert at cursor position
        const textarea = textareaRef.current;
        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const text = textarea.value;

        const newText =
          text.substring(0, start) + insertedText + text.substring(end);

        setContent(newText);

        // Restore cursor position after insertion (adjusted for inserted length)
        setTimeout(() => {
          textarea.focus();
          textarea.setSelectionRange(
            start + insertedText.length,
            start + insertedText.length
          );
        }, 0);
      } catch (err) {
        console.error('Image upload failed', err);
        alert('이미지 업로드에 실패했습니다.');
      }
    }
  };

  // Mutations
  const createMutation = useMutation({
    mutationFn: createArticle,
    onSuccess: () => {
      alert('게시글이 성공적으로 작성되었습니다.');
      navigate(`/${from}`);
    },
    onError: (error) => {
      console.error('Failed to create article', error);
      alert('게시글 작성에 실패했습니다.');
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data: CreateArticleRequest) =>
      updateArticle(Number(articleId), data),
    onSuccess: () => {
      alert('게시글이 성공적으로 수정되었습니다.');
      navigate(`/article/${articleId}`, {
        replace: true,
        state: { from },
      });
    },
    onError: (error) => {
      console.error('Failed to update article', error);
      alert('게시글 수정에 실패했습니다.');
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title || !content.trim()) {
      alert('제목과 내용을 입력해주세요.');
      return;
    }

    let finalContent = '';

    if (isBoard1) {
      // If Board 1, content is Markdown -> Convert to HTML for submit
      try {
        finalContent = await marked.parse(content, { breaks: true });
      } catch (err) {
        console.error('Markdown conversion failed on submit:', err);
        finalContent = content; // Fallback
      }
    } else {
      // If other boards, content is HTML -> Send raw
      finalContent = content;
    }

    const currentAuthor = author.trim() === '' ? '관리자' : author;
    const payload = {
      title,
      content: finalContent,
      author: currentAuthor,
      originLink: originLink || null,
      publishedAt: article?.publishedAt || new Date().toISOString(),
    };

    if (isEditMode) {
      updateMutation.mutate(payload);
    } else {
      createMutation.mutate(payload);
    }
  };

  const isPending = isEditMode
    ? updateMutation.isPending
    : createMutation.isPending;
  const isError = isEditMode ? updateMutation.isError : createMutation.isError;

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>
        {isEditMode ? '게시글 수정' : '게시글 작성'}
      </h1>

      {isError && (
        <div className={styles.errorMessage}>
          에러가 발생했습니다. 다시 시도해주세요.
        </div>
      )}

      <form className={styles.form} onSubmit={handleSubmit}>
        {/* Title */}
        <div className={styles.formGroup}>
          <label className={styles.label}>제목</label>
          <input
            type="text"
            className={styles.input}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="제목을 입력하세요"
            required
          />
        </div>

        {/* Author */}
        <div className={styles.formGroup}>
          <label className={styles.label}>작성자 (기본: 관리자)</label>
          <input
            type="text"
            className={styles.input}
            value={author}
            onChange={(e) => setAuthor(e.target.value)}
            placeholder="관리자"
          />
        </div>

        {/* Editor Area */}
        <div className={styles.formGroup}>
          <label className={styles.label}>
            {isBoard1 ? '내용 (Markdown 지원)' : '내용 (HTML 편집)'}
          </label>

          <div className={styles.editorContainer}>
            <div className={styles.tabHeader}>
              <button
                type="button"
                className={`${styles.tabButton} ${activeTab === 'write' ? styles.active : ''}`}
                onClick={() => setActiveTab('write')}
              >
                Write
              </button>
              <button
                type="button"
                className={`${styles.tabButton} ${activeTab === 'preview' ? styles.active : ''}`}
                onClick={() => setActiveTab('preview')}
              >
                Preview
              </button>
            </div>

            <div className={styles.contentArea}>
              {activeTab === 'write' ? (
                <textarea
                  ref={textareaRef}
                  className={styles.markdownTextarea}
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  onPaste={handlePaste}
                  placeholder={
                    isBoard1
                      ? '# 내용을 입력하세요 (Markdown)...'
                      : '<div>내용을 입력하세요 (HTML)...</div>'
                  }
                />
              ) : (
                <div
                  className={`${styles.previewArea} ${styles.prose}`}
                  dangerouslySetInnerHTML={{ __html: previewHtml }}
                />
              )}
            </div>
          </div>
        </div>

        {/* Buttons */}
        <div className={styles.buttonGroup}>
          <button
            type="button"
            className={styles.cancelButton}
            onClick={() => {
              if (isEditMode) {
                navigate(`/article/${articleId}`, { state: { from } });
              } else {
                navigate(`/${from}`);
              }
            }}
          >
            취소
          </button>
          <button
            type="submit"
            className={styles.submitButton}
            disabled={isPending}
          >
            {isPending ? '처리 중...' : '등록'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateArticlePage;
