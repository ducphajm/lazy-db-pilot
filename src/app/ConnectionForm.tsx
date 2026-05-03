import {Box, Text, useInput} from 'ink';
import {useEffect, useState} from 'react';
import {ConnectionEnvironment, DatabaseType} from '../connections/types.js';
import {databaseTypeItems, environmentItems} from './ui.js';

export type ConnectionFormDraft = {
  readonly name: string;
  readonly type: DatabaseType | null;
  readonly environment: ConnectionEnvironment | null;
  readonly mongoUrl: string;
};

type ConnectionFormField = 'name' | 'type' | 'environment' | 'mongoUrl';

const emptyDraft: ConnectionFormDraft = {
  name: '',
  type: null,
  environment: null,
  mongoUrl: '',
};

export function createEmptyConnectionFormDraft(): ConnectionFormDraft {
  return emptyDraft;
}

export function ConnectionForm({
  draft,
  onCancel,
  onChange,
  onSubmit,
}: {
  readonly draft: ConnectionFormDraft;
  readonly onCancel: () => void;
  readonly onChange: (draft: ConnectionFormDraft) => void;
  readonly onSubmit: () => void;
}): React.JSX.Element {
  const [focusedField, setFocusedField] =
    useState<ConnectionFormField>('name');
  const fields = getVisibleFields(draft.type);

  useEffect(() => {
    if (!fields.includes(focusedField)) {
      setFocusedField('environment');
    }
  }, [fields, focusedField]);

  useInput((input, key) => {
    if (key.escape) {
      onCancel();
      return;
    }

    if (key.tab) {
      setFocusedField(currentField =>
        getFieldByOffset(fields, currentField, key.shift ? -1 : 1),
      );
      return;
    }

    if (key.return) {
      onSubmit();
      return;
    }

    if (focusedField === 'name') {
      onChange({...draft, name: updateTextValue(draft.name, input, key)});
      return;
    }

    if (focusedField === 'mongoUrl') {
      onChange({
        ...draft,
        mongoUrl: updateTextValue(draft.mongoUrl, input, key),
      });
      return;
    }

    if (focusedField === 'type') {
      onChange({
        ...draft,
        type: selectOption(databaseTypeItems, draft.type, input, key),
      });
      return;
    }

    onChange({
      ...draft,
      environment: selectOption(environmentItems, draft.environment, input, key),
    });
  });

  return (
    <Box flexDirection="column">
      <Text>Connection form</Text>
      <FormRow
        isFocused={focusedField === 'name'}
        label="Name"
        value={draft.name}
        placeholder="required"
      />
      <FormRow
        isFocused={focusedField === 'type'}
        label="Database"
        value={getDatabaseTypeLabel(draft.type)}
        placeholder="required"
      />
      <FormRow
        isFocused={focusedField === 'environment'}
        label="Environment"
        value={draft.environment ?? ''}
        placeholder="required"
      />
      {draft.type === DatabaseType.MongoDB ? (
        <FormRow
          isFocused={focusedField === 'mongoUrl'}
          label="MongoDB URL"
          value={draft.mongoUrl}
          placeholder="mongodb://host:port"
        />
      ) : null}
      <Text dimColor>Press Escape to cancel, Enter to save.</Text>
    </Box>
  );
}

function FormRow({
  isFocused,
  label,
  placeholder,
  value,
}: {
  readonly isFocused: boolean;
  readonly label: string;
  readonly placeholder: string;
  readonly value: string;
}): React.JSX.Element {
  const displayValue = value.length > 0 ? value : placeholder;

  return (
    <Text color={isFocused ? 'cyan' : undefined}>
      {isFocused ? '>' : ' '} {label}: {displayValue}
    </Text>
  );
}

function getVisibleFields(
  type: DatabaseType | null,
): readonly ConnectionFormField[] {
  if (type === DatabaseType.MongoDB) {
    return ['name', 'type', 'environment', 'mongoUrl'];
  }

  return ['name', 'type', 'environment'];
}

function getFieldByOffset(
  fields: readonly ConnectionFormField[],
  currentField: ConnectionFormField,
  offset: number,
): ConnectionFormField {
  const currentIndex = fields.indexOf(currentField);
  const nextIndex = (currentIndex + offset + fields.length) % fields.length;

  return fields[nextIndex] ?? fields[0] ?? 'name';
}

function updateTextValue(
  value: string,
  input: string,
  key: {
    readonly backspace: boolean;
    readonly delete: boolean;
    readonly ctrl: boolean;
    readonly meta: boolean;
  },
): string {
  if (key.backspace || key.delete) {
    return value.slice(0, -1);
  }

  if (key.ctrl || key.meta || input.length === 0) {
    return value;
  }

  return `${value}${input}`;
}

function selectOption<T>(
  items: readonly {readonly label: string; readonly value: T}[],
  currentValue: T | null,
  input: string,
  key: {readonly downArrow: boolean; readonly upArrow: boolean},
): T | null {
  if (!key.downArrow && !key.upArrow && input !== 'j' && input !== 'k') {
    return currentValue;
  }

  if (currentValue === null) {
    return items[0]?.value ?? null;
  }

  const currentIndex = Math.max(
    0,
    items.findIndex(item => item.value === currentValue),
  );
  const nextIndex =
    key.upArrow || input === 'k'
      ? Math.max(currentIndex - 1, 0)
      : Math.min(currentIndex + 1, items.length - 1);

  return items[nextIndex]?.value ?? currentValue;
}

function getDatabaseTypeLabel(type: DatabaseType | null): string {
  return databaseTypeItems.find(item => item.value === type)?.label ?? '';
}
