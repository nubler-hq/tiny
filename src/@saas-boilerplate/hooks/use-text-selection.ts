'use client'

import { useEffect, useState } from 'react'

/**
 * Interface for the return value of the useTextSelection hook.
 * @interface UseTextSelectionReturn
 * @property {string} text - The selected text.
 * @property {DOMRect[]} rects - The bounding rectangles of the selected text.
 * @property {Range[]} ranges - The ranges of the selected text.
 * @property {Selection | null} selection - The current selection object.
 */
type UseTextSelectionReturn = {
  text: string
  rects: DOMRect[]
  ranges: Range[]
  selection: Selection | null
}

/**
 * Function to get ranges from a selection.
 * @param {Selection} selection - The selection object.
 * @returns {Range[]} - The ranges of the selection.
 */
const getRangesFromSelection = (selection: Selection): Range[] => {
  const rangeCount = selection.rangeCount
  return Array.from({ length: rangeCount }, (_, i) => selection.getRangeAt(i))
}

/**
 * Function to check if the selection is inside a given element.
 * @param {Selection} selection - The selection object.
 * @param {React.RefObject<HTMLElement>} ref - The reference to the element.
 * @returns {boolean} - True if the selection is inside the element, false otherwise.
 */
const isSelectionInsideRef = (
  selection: Selection,
  ref: React.RefObject<HTMLElement>,
) => {
  if (!ref.current || selection.rangeCount === 0) return true

  const range = selection.getRangeAt(0)
  return ref.current.contains(range.commonAncestorContainer)
}

/**
 * Hook to use the text selection API.
 * @param {React.RefObject<HTMLElement>} [elementRef] - The reference to the element to listen for selection changes.
 * @returns {UseTextSelectionReturn} - The current state of the text selection.
 */
export function useTextSelection(
  elementRef?: React.RefObject<HTMLElement>,
): UseTextSelectionReturn {
  const [selection, setSelection] = useState<Selection | null>(null)
  const [text, setText] = useState('')
  const [ranges, setRanges] = useState<Range[]>([])
  const [rects, setRects] = useState<DOMRect[]>([])

  useEffect(() => {
    const onSelectionChange = () => {
      const newSelection = window.getSelection()

      if (
        newSelection &&
        (!elementRef || isSelectionInsideRef(newSelection, elementRef))
      ) {
        setSelection(newSelection)
        setText(newSelection.toString())
        const newRanges = getRangesFromSelection(newSelection)
        setRanges(newRanges)
        setRects(newRanges.map((range) => range.getBoundingClientRect()))
      } else {
        setText('')
        setRanges([])
        setRects([])
        setSelection(null)
      }
    }

    document.addEventListener('selectionchange', onSelectionChange)

    return () => {
      document.removeEventListener('selectionchange', onSelectionChange)
    }
  }, [elementRef])

  return {
    text,
    rects,
    ranges,
    selection,
  }
}
