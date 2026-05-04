import assert from 'node:assert/strict';
import test from 'node:test';
import {
  analyzeImportChapters,
  parseHtmlManuscript,
  parsePlainTextManuscript,
} from '@/lib/import/manuscript';

test('plain text parser splits common chapter headings and keeps body text out of titles', () => {
  const result = parsePlainTextManuscript(`
Chapter 1
The first real paragraph belongs in the body.

Chapter 2: The Door
Second body paragraph.
`);

  assert.equal(result.chapters.length, 2);
  assert.equal(result.chapters[0].title, 'Chapter 1');
  assert.match(result.chapters[0].content, /first real paragraph/);
  assert.equal(result.chapters[1].title, 'Chapter 2: The Door');
  assert.match(result.chapters[1].content, /Second body paragraph/);
});

test('plain text parser supports public-domain roman numeral headings', () => {
  const result = parsePlainTextManuscript(`
CHAPTER I.
Down the Rabbit-Hole

Alice was beginning to get very tired.

CHAPTER II
The Pool of Tears

Curiouser and curiouser.
`);

  assert.equal(result.chapters.length, 2);
  assert.equal(result.chapters[0].title, 'CHAPTER I. Down the Rabbit-Hole');
  assert.match(result.chapters[0].content, /Alice was beginning/);
  assert.equal(result.chapters[1].title, 'CHAPTER II The Pool of Tears');
});

test('plain text parser does not promote immediate body prose into roman numeral titles', () => {
  const result = parsePlainTextManuscript(`
CHAPTER I.
Call me Ishmael
Some years ago...
`);

  assert.equal(result.chapters.length, 1);
  assert.equal(result.chapters[0].title, 'CHAPTER I.');
  assert.match(result.chapters[0].content, /Call me Ishmael/);
  assert.match(result.chapters[0].content, /Some years ago/);
});

test('parser falls back to one chapter when no heading exists', () => {
  const result = parsePlainTextManuscript('A loose scene with no heading.');

  assert.equal(result.chapters.length, 1);
  assert.equal(result.chapters[0].title, 'Imported manuscript');
  assert.match(result.chapters[0].content, /loose scene/);
});

test('html parser splits h1 and h2 headings', () => {
  const result = parseHtmlManuscript('<h1>One</h1><p>Body one.</p><h2>Two</h2><p>Body two.</p>');

  assert.equal(result.chapters.length, 2);
  assert.equal(result.chapters[0].title, 'One');
  assert.equal(result.chapters[0].content, '<p>Body one.</p>');
  assert.equal(result.chapters[1].title, 'Two');
});

test('html parser preserves content before the first heading', () => {
  const result = parseHtmlManuscript('<p>Intro before heading.</p><h1>One</h1><p>Body.</p>');

  assert.equal(result.chapters.length, 1);
  assert.equal(result.chapters[0].title, 'One');
  assert.match(result.chapters[0].content, /Intro before heading/);
  assert.match(result.chapters[0].content, /Body\./);
});

test('html parser flags generated titles as fallback titles', () => {
  const result = parseHtmlManuscript('<h1>   </h1><p>Body.</p>');

  assert.equal(result.chapters.length, 1);
  assert.equal(result.chapters[0].title, 'Chapter 1');
  assert.ok(result.warnings.some((warning) => warning.code === 'fallback-title'));
  assert.ok(result.chapters[0].warnings.includes('fallback-title'));
});

test('analysis flags suspicious titles and empty chapters', () => {
  const warnings = analyzeImportChapters([
    {
      id: 'a',
      title: 'Chapter One ' + 'word '.repeat(35),
      content: '',
      sourceIndex: 0,
      warnings: [],
    },
  ]);

  assert.equal(warnings.length, 2);
  assert.equal(warnings[0].code, 'long-title');
  assert.equal(warnings[1].code, 'empty-content');
});
