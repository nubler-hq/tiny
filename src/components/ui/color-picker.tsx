'use client'

import { forwardRef, useMemo, useState } from 'react'
import { HexColorPicker } from 'react-colorful'
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from '@radix-ui/react-popover'
import { Input } from './input'
import { type ButtonProps, Button } from './button'
import { cn } from '@/utils/cn'
import { useForwardedRef } from '@/@saas-boilerplate/hooks/use-forward-ref'

interface ColorPickerProps {
  value: string
  onChange: (value: string) => void
  onBlur?: () => void
}

const ColorPicker = forwardRef<
  HTMLInputElement,
  Omit<ButtonProps, 'value' | 'onChange' | 'onBlur'> & ColorPickerProps
>(
  (
    { disabled, value, onChange, onBlur, name, className, ...props },
    forwardedRef,
  ) => {
    const ref = useForwardedRef(forwardedRef)
    const [open, setOpen] = useState(false)

    const parsedValue = useMemo(() => {
      return value || '#FFFFFF'
    }, [value])

    return (
      <Popover onOpenChange={setOpen} open={open}>
        <PopoverTrigger asChild disabled={disabled} onBlur={onBlur}>
          <Button
            {...props}
            className={cn('block', className)}
            name={name}
            onClick={() => {
              setOpen(true)
            }}
            size="icon"
            style={{
              backgroundColor: parsedValue,
            }}
            variant="outline"
          >
            <div />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-full">
          <HexColorPicker color={parsedValue} onChange={onChange} />

          <Input
            maxLength={7}
            ref={ref}
            value={parsedValue}
            onChange={(e) => {
              onChange(e?.currentTarget?.value)
            }}
          />
        </PopoverContent>
      </Popover>
    )
  },
)
ColorPicker.displayName = 'ColorPicker'

export { ColorPicker }
