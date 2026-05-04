export type ImportWarningCode =
  | 'long-title'
  | 'empty-content'
  | 'duplicate-title'
  | 'large-content'
  | 'fallback-title';

export type ImportWarning = {
  code: ImportWarningCode;
  chapterId: string;
  message: string;
};

export type ImportChapterDraft = {
  id: string;
  title: string;
  content: string;
  sourceIndex: number;
  warnings: ImportWarningCode[];
  sourceTitle?: string;
};

export type ImportParseResult = {
  chapters: ImportChapterDraft[];
  warnings: ImportWarning[];
  sourceFormat: 'text' | 'html';
};

const MAX_TITLE_LENGTH = 100;
const LONG_TITLE_WORDS = 18;
const LARGE_CONTENT_WORDS = 12000;

function escapeHtml(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function stripTags(value: string) {
  return value
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, ' ')
    .trim();
}

function normalizeText(value: string) {
  return value.trim().replace(/\s+/g, ' ');
}

function makeId(index: number) {
  return `import-chapter-${index + 1}`;
}

function paragraphsToHtml(lines: string[]) {
  return lines
    .join('\n')
    .split(/\n{2,}/)
    .map((block) => block.trim())
    .filter(Boolean)
    .map((block) => `<p>${escapeHtml(block).replace(/\n/g, '<br>')}</p>`)
    .join('');
}

function isChapterHeading(line: string) {
  return /^(chapter|book|part)\s+([0-9]+|[ivxlcdm]+)([\s.:;-].*)?$/i.test(line.trim());
}

function isPublicDomainRomanHeading(line: string) {
  return /^CHAPTER\s+[IVXLCDM]+\.?$/i.test(line.trim());
}

function shouldPromoteSubtitle(heading: string, nextLine: string) {
  const next = nextLine.trim();
  return (
    isPublicDomainRomanHeading(heading) &&
    next.length > 0 &&
    next.length <= 80 &&
    !isChapterHeading(next) &&
    !/[.!?]$/.test(next)
  );
}

function createDraft(title: string, bodyLines: string[], sourceIndex: number): ImportChapterDraft {
  const normalizedTitle = normalizeText(title) || `Chapter ${sourceIndex + 1}`;

  return {
    id: makeId(sourceIndex),
    title: normalizedTitle.slice(0, MAX_TITLE_LENGTH),
    content: paragraphsToHtml(bodyLines),
    sourceIndex,
    warnings: [],
    sourceTitle: normalizedTitle,
  };
}

function attachWarnings(chapters: ImportChapterDraft[], warnings: ImportWarning[]) {
  return chapters.map((chapter) => ({
    ...chapter,
    warnings: warnings
      .filter((warning) => warning.chapterId === chapter.id)
      .map((warning) => warning.code),
  }));
}

export function parsePlainTextManuscript(text: string): ImportParseResult {
  const lines = text.replace(/\r\n/g, '\n').replace(/\r/g, '\n').split('\n');
  const chapters: ImportChapterDraft[] = [];
  let pendingTitle = '';
  let bodyLines: string[] = [];
  let sourceIndex = 0;

  function flush() {
    if (!pendingTitle && bodyLines.every((line) => !line.trim())) return;
    chapters.push(createDraft(pendingTitle || 'Imported manuscript', bodyLines, sourceIndex));
    sourceIndex += 1;
    pendingTitle = '';
    bodyLines = [];
  }

  for (let i = 0; i < lines.length; i += 1) {
    const current = lines[i].trim();
    const next = lines[i + 1]?.trim() ?? '';

    if (isChapterHeading(current)) {
      flush();
      pendingTitle = shouldPromoteSubtitle(current, next) ? `${current} ${next}` : current;
      if (shouldPromoteSubtitle(current, next)) i += 1;
      continue;
    }

    bodyLines.push(lines[i]);
  }

  flush();

  if (chapters.length === 0) {
    chapters.push(createDraft('Imported manuscript', [text], 0));
  }

  const warnings = analyzeImportChapters(chapters);
  return {
    chapters: attachWarnings(chapters, warnings),
    warnings,
    sourceFormat: 'text',
  };
}

export function parseHtmlManuscript(html: string): ImportParseResult {
  const headingPattern = /<h[1-2][^>]*>[\s\S]*?<\/h[1-2]>/gi;
  const matches = [...html.matchAll(headingPattern)];

  if (matches.length === 0) {
    const result = parsePlainTextManuscript(stripTags(html));
    return {
      ...result,
      sourceFormat: 'html',
    };
  }

  const chapters = matches.map((match, index) => {
    const headingStart = match.index ?? 0;
    const headingEnd = headingStart + match[0].length;
    const nextStart = matches[index + 1]?.index ?? html.length;
    const title = normalizeText(stripTags(match[0])) || `Chapter ${index + 1}`;

    return {
      id: makeId(index),
      title: title.slice(0, MAX_TITLE_LENGTH),
      content: html.slice(headingEnd, nextStart).trim(),
      sourceIndex: index,
      warnings: [],
      sourceTitle: title,
    };
  });

  const warnings = analyzeImportChapters(chapters);
  return {
    chapters: attachWarnings(chapters, warnings),
    warnings,
    sourceFormat: 'html',
  };
}

export function analyzeImportChapters(chapters: ImportChapterDraft[]): ImportWarning[] {
  const warnings: ImportWarning[] = [];
  const seenTitles = new Map<string, string>();

  for (const chapter of chapters) {
    const sourceTitle = normalizeText(chapter.sourceTitle ?? chapter.title);
    const titleWords = sourceTitle.split(/\s+/).filter(Boolean).length;
    const contentWords = stripTags(chapter.content).split(/\s+/).filter(Boolean).length;
    const titleKey = chapter.title.toLowerCase();

    if (sourceTitle.length >= MAX_TITLE_LENGTH || titleWords > LONG_TITLE_WORDS) {
      warnings.push({
        code: 'long-title',
        chapterId: chapter.id,
        message: 'This chapter title is unusually long. Check that body text did not land in the title.',
      });
    }

    if (contentWords === 0) {
      warnings.push({
        code: 'empty-content',
        chapterId: chapter.id,
        message: 'This chapter has no body content.',
      });
    }

    if (contentWords > LARGE_CONTENT_WORDS) {
      warnings.push({
        code: 'large-content',
        chapterId: chapter.id,
        message: 'This chapter is very large. Check whether multiple chapters should be split apart.',
      });
    }

    if (chapter.title === 'Imported manuscript') {
      warnings.push({
        code: 'fallback-title',
        chapterId: chapter.id,
        message: 'No chapter headings were detected. Review the imported chapter before saving.',
      });
    }

    if (seenTitles.has(titleKey)) {
      warnings.push({
        code: 'duplicate-title',
        chapterId: chapter.id,
        message: `This title duplicates ${seenTitles.get(titleKey)}.`,
      });
    } else {
      seenTitles.set(titleKey, chapter.title);
    }
  }

  return warnings;
}
