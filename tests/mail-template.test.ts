import test from 'node:test';
import assert from 'node:assert/strict';
import { createVerificationEmail } from '../src/lib/mail-template.ts';

const email = () => createVerificationEmail('Богдан', '123456');

test('тема содержит код и название сервиса', () => {
  assert.match(email().subject, /123456.*Решись Авиа/);
});

test('HTML содержит приветствие и код', () => {
  assert.match(email().html, /Богдан/);
  assert.match(email().html, /123456/);
});

test('HTML экранирует имя и код', () => {
  const result = createVerificationEmail('<script>', '<123>');
  assert.doesNotMatch(result.html, /<script>|<123>/);
  assert.match(result.html, /&lt;script&gt;/);
  assert.match(result.html, /&lt;123&gt;/);
});

test('указаны срок действия и назначение кода', () => {
  assert.match(email().html, /10 минут/);
  assert.match(email().text, /10 минут/);
  assert.match(email().text, /123456/);
});

test('письмо содержит локальные брендовые изображения на HTTPS', () => {
  assert.match(email().html, /https:\/\/ddln\.space\/media\/email-logo\.png/);
  assert.match(email().html, /https:\/\/ddln\.space\/media\/email-hero\.jpg/);
});

test('HTML содержит табличную структуру и текстовые альтернативы', () => {
  assert.match(email().html, /<table/i);
  assert.match(email().html, /alt="Решись Авиа"/);
  assert.match(email().html, /<title>/i);
});

test('в тексте объясняется что делать при незапрошенном коде', () => {
  assert.match(email().text, /не запрашивали/i);
  assert.match(email().html, /не запрашивали/i);
});
