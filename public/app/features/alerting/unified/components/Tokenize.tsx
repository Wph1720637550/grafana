import { css } from '@emotion/css';
import React from 'react';

import { GrafanaTheme2 } from '@grafana/data';
import { Badge, useStyles2 } from '@grafana/ui';

import { HoverCard } from './HoverCard';
import { keywords as KEYWORDS, builtinFunctions as FUNCTIONS } from './receivers/editor/language';

const VARIABLES = ['$', '.', '"'];

interface TokenizerProps {
  input: string;
  delimiter?: [string, string];
}

function Tokenize({ input, delimiter = ['{{', '}}'] }: TokenizerProps) {
  const styles = useStyles2(getStyles);

  const [open, close] = delimiter;
  const normalizedIput = normalizeInput(input);

  /**
   * This RegExp uses 2 named capture groups, text that comes before the token and the token itself
   *
   *  <before> open  <token>  close
   *  ───────── ── ─────────── ──
   *  Some text {{ $labels.foo }}
   */
  const regex = new RegExp(`(?<before>.*?)(${open}(?<token>.*?)${close}|$)`, 'gm');

  const matches = Array.from(normalizedIput.matchAll(regex));

  const output: React.ReactElement[] = [];

  matches.forEach((match, index) => {
    const before = match.groups?.before;
    const token = match.groups?.token?.trim();

    if (before) {
      output.push(<span key={`${index}-before`}>{before}</span>);
    }

    if (token) {
      const type = tokenType(token);
      const description = type === TokenType.Variable ? token : '';
      const tokenContent = `${open} ${token} ${close}`;

      output.push(<Token key={`${index}-token`} content={tokenContent} type={type} description={description} />);
    }
  });

  return <span className={styles.wrapper}>{output}</span>;
}

enum TokenType {
  Variable = 'variable',
  Function = 'function',
  Keyword = 'keyword',
  Unknown = 'unknown',
}

interface TokenProps {
  content: string;
  type?: TokenType;
  description?: string;
}

function Token({ content, description, type }: TokenProps) {
  const styles = useStyles2(getStyles);
  const varName = content.trim();

  const disableCard = Boolean(type) === false;

  return (
    <HoverCard
      placement="top-start"
      disabled={disableCard}
      content={
        <div className={styles.hoverTokenItem}>
          <Badge text={<>{type}</>} color={'blue'} /> {description && <code>{description}</code>}
        </div>
      }
    >
      <span>
        <Badge className={styles.token} text={varName} color={'blue'} />
      </span>
    </HoverCard>
  );
}

function normalizeInput(input: string) {
  return input.replace(/\s+/g, ' ').trim();
}

function isVariable(input: string) {
  return VARIABLES.some((character) => input.startsWith(character));
}

function isKeyword(input: string) {
  return KEYWORDS.some((keyword) => input.startsWith(keyword));
}

function isFunction(input: string) {
  return FUNCTIONS.some((functionName) => input.startsWith(functionName));
}

function tokenType(input: string) {
  let tokenType;
  if (isVariable(input)) {
    tokenType = TokenType.Variable;
  } else if (isKeyword(input)) {
    tokenType = TokenType.Keyword;
  } else if (isFunction(input)) {
    tokenType = TokenType.Function;
  } else {
    tokenType = TokenType.Unknown;
  }

  return tokenType;
}

const getStyles = (theme: GrafanaTheme2) => ({
  wrapper: css`
    display: inline-flex;
    align-items: center;
    white-space: pre;
  `,
  token: css`
    cursor: default;
    font-family: ${theme.typography.fontFamilyMonospace};
  `,
  popover: css`
    border-radius: ${theme.shape.borderRadius()};
    box-shadow: ${theme.shadows.z3};
    background: ${theme.colors.background.primary};
    border: 1px solid ${theme.colors.border.medium};

    padding: ${theme.spacing(1)};
  `,
  hoverTokenItem: css`
    display: flex;
    flex-direction: row;
    align-items: center;
    gap: ${theme.spacing(1)};
  `,
});

export { Tokenize, Token };
