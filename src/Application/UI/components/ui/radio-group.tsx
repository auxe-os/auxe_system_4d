import * as React from 'react'
import * as RadixRadioGroup from '@radix-ui/react-radio-group'
import { cn } from '../../lib/utils'

export const RadioGroup = React.forwardRef<
  React.ElementRef<typeof RadixRadioGroup.Root>,
  React.ComponentPropsWithoutRef<typeof RadixRadioGroup.Root>
>(({ className, ...props }, ref) => (
  <RadixRadioGroup.Root
    ref={ref}
    className={cn('flex gap-2', className)}
    {...props}
  />
))
RadioGroup.displayName = 'RadioGroup'

export const RadioGroupItem = React.forwardRef<
  React.ElementRef<typeof RadixRadioGroup.Item>,
  React.ComponentPropsWithoutRef<typeof RadixRadioGroup.Item>
>(({ className, children, ...props }, ref) => (
  <RadixRadioGroup.Item
    ref={ref}
    className={cn(
      'w-5 h-5 rounded-full border border-white bg-black flex items-center justify-center',
      'data-[state=checked]:bg-white',
      className
    )}
    {...props}
  >
    <RadixRadioGroup.Indicator className="w-2 h-2 bg-black rounded-full" />
    {children}
  </RadixRadioGroup.Item>
))
RadioGroupItem.displayName = 'RadioGroupItem'
