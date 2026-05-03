import {Box, Text, useInput} from 'ink';
import type {Key} from 'ink';
import {useEffect, useState} from 'react';

export type SelectableListItem<T> = {
  readonly key: string;
  readonly label: string;
  readonly value: T;
};

export function SelectableList<T>({
  items,
  onFocusedInput,
  onSelect,
}: {
  readonly items: readonly SelectableListItem<T>[];
  readonly onFocusedInput?: (input: string, key: Key, item: T) => boolean;
  readonly onSelect: (value: T) => void;
}): React.JSX.Element {
  const [focusedIndex, setFocusedIndex] = useState(0);
  const itemKeys = items.map(item => item.key).join('\0');

  useEffect(() => {
    setFocusedIndex(0);
  }, [itemKeys]);

  useInput((input, key) => {
    const focusedItem = items[focusedIndex];

    if (
      focusedItem !== undefined &&
      onFocusedInput?.(input, key, focusedItem.value) === true
    ) {
      return;
    }

    if (key.downArrow || input === 'j') {
      setFocusedIndex(index => Math.min(index + 1, items.length - 1));
      return;
    }

    if (key.upArrow || input === 'k') {
      setFocusedIndex(index => Math.max(index - 1, 0));
      return;
    }

    if (key.return || input === 'l') {
      if (focusedItem !== undefined) {
        onSelect(focusedItem.value);
      }
    }
  }, {isActive: items.length > 0});

  return (
    <Box flexDirection="column">
      {items.map((item, index) => {
        const isFocused = index === focusedIndex;

        return (
          <Text key={item.key} color={isFocused ? 'cyan' : undefined}>
            {isFocused ? '>' : ' '} {item.label}
          </Text>
        );
      })}
    </Box>
  );
}
