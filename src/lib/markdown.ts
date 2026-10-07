import MarkdownIt from 'markdown-it';

// html:false escapa cualquier HTML en crudo; markdown-it ya bloquea javascript:/vbscript:/data: en enlaces.
const md = new MarkdownIt({ html: false, linkify: true, breaks: false });
const defaultLink = md.renderer.rules.link_open ?? ((t, i, o, _e, s) => s.renderToken(t, i, o));
md.renderer.rules.link_open = (tokens, i, opts, env, self) => {
  tokens[i].attrSet('rel', 'noopener noreferrer');
  return defaultLink(tokens, i, opts, env, self);
};

export const renderMarkdown = (src: string) => md.render(src);
