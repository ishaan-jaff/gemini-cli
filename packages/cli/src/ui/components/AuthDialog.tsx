/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Box, Text, useInput } from 'ink';
import { Colors } from '../colors.js';
import { RadioButtonSelect } from './shared/RadioButtonSelect.js';
import { LoadedSettings, SettingScope } from '../../config/settings.js';
import { AuthType } from '@google/gemini-cli-core';
import { validateAuthMethod } from '../../config/auth.js';

interface AuthDialogProps {
  onSelect: (authMethod: string | undefined, scope: SettingScope) => void;
  onHighlight: (authMethod: string | undefined) => void;
  settings: LoadedSettings;
  initialErrorMessage?: string | null;
}

export function AuthDialog({
  onSelect,
  onHighlight,
  settings,
  initialErrorMessage,
}: AuthDialogProps): React.JSX.Element {
  const [errorMessage, setErrorMessage] = useState<string | null>(
    initialErrorMessage || null,
  );
  const allAuthItems = [
    {
      label: 'Login with Google',
      value: AuthType.LOGIN_WITH_GOOGLE_PERSONAL,
    },
    { label: 'Gemini API Key', value: AuthType.USE_GEMINI },
    {
      label: 'Login with Google Workspace',
      value: AuthType.LOGIN_WITH_GOOGLE_ENTERPRISE,
    },
    { label: 'Vertex AI', value: AuthType.USE_VERTEX_AI },
  ];

  const isSelectedAuthInMore = allAuthItems
    .slice(2)
    .some((item) => item.value === settings.merged.selectedAuthType);

  const [showAll, setShowAll] = useState(isSelectedAuthInMore);

  const initialAuthItems = [
    ...allAuthItems.slice(0, 2),
    { label: 'More...', value: 'more' },
  ];

  const items = showAll ? allAuthItems : initialAuthItems;

  let initialAuthIndex = items.findIndex(
    (item) => item.value === settings.merged.selectedAuthType,
  );

  if (initialAuthIndex === -1) {
    initialAuthIndex = 0;
  }

  const handleAuthSelect = (authMethod: string) => {
    if (authMethod === 'more') {
      setShowAll(true);
      return;
    }
    const error = validateAuthMethod(authMethod);
    if (error) {
      setErrorMessage(error);
    } else {
      setErrorMessage(null);
      onSelect(authMethod, SettingScope.User);
    }
  };

  useInput((_input, key) => {
    if (key.escape) {
      if (settings.merged.selectedAuthType === undefined) {
        // Prevent exiting if no auth method is set
        setErrorMessage(
          'You must select an auth method to proceed. Press Ctrl+C twice to exit.',
        );
        return;
      }
      onSelect(undefined, SettingScope.User);
    }
  });

  return (
    <Box
      borderStyle="round"
      borderColor={Colors.Gray}
      flexDirection="column"
      padding={1}
      width="100%"
    >
      <Text bold>Select Auth Method</Text>
      <RadioButtonSelect
        items={items}
        initialIndex={initialAuthIndex}
        onSelect={handleAuthSelect}
        onHighlight={onHighlight}
        isFocused={true}
      />
      {errorMessage && (
        <Box marginTop={1}>
          <Text color={Colors.AccentRed}>{errorMessage}</Text>
        </Box>
      )}
      <Box marginTop={1}>
        <Text color={Colors.Gray}>(Use Enter to select)</Text>
      </Box>
    </Box>
  );
}
