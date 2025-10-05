import React from 'react';
import { render } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import MonacoEditorWrapper from '../components/MonacoEditorWrapper';

// Mock the editor component since it's heavy and not needed for this test
vi.mock('@monaco-editor/react', () => ({
  __esModule: true,
  default: vi.fn(({ onMount }) => {
    // Simulate the onMount call with mock editor and monaco instances
    React.useEffect(() => {
      const mockEditor = {
        layout: vi.fn(),
        // Add other mock methods as needed
      };
      const mockMonaco = {};
      if(onMount) {
        onMount(mockEditor, mockMonaco);
      }
    }, [onMount]);
    return <div data-testid="monaco-editor-mock" />;
  }),
}));

// Mock the custom resize hook
vi.mock('../hooks/useDebouncedResize', () => ({
  useDebouncedResize: vi.fn(() => ({ width: 800, height: 600 })),
}));

describe('MonacoEditorWrapper', () => {
  it('renders the Monaco Editor mock', () => {
    const { getByTestId } = render(
      <MonacoEditorWrapper
        language="javascript"
        value=""
        onEditorMount={vi.fn()}
      />
    );
    expect(getByTestId('monaco-editor-mock')).toBeInTheDocument();
  });

  it('sets aria-label for accessibility', () => {
    const { container } = render(
      <MonacoEditorWrapper
        language="javascript"
        value=""
        onEditorMount={vi.fn()}
      />
    );
    const wrapperDiv = container.firstChild as HTMLElement;
    expect(wrapperDiv.getAttribute('aria-label')).toBe('Code Editor');
  });

  // Note: Testing the actual 'layout' call after a resize is complex in a JSDOM
  // environment as it requires mocking ResizeObserver and timing. This basic
  // test ensures the component renders and integrates its dependencies correctly.
});
