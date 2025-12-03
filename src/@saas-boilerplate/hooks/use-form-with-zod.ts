import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useRef } from "react";
import {
  useForm,
  UseFormReturn,
  type DefaultValues,
  type SubmitHandler,
  type FieldValues,
  type UseFormProps,
} from "react-hook-form";
import { z } from "zod";

type HookFormParams<
  TFieldValues extends FieldValues,
  TContext,
  TTransformedValues extends FieldValues | undefined,
> = UseFormProps<TFieldValues, TContext, TTransformedValues>;

type UseFormOptions<TSchema extends z.ZodObject<any>> = Omit<
  HookFormParams<z.input<TSchema>, any, z.output<TSchema>>,
  "onSubmit"
> & {
  schema: TSchema;
  defaultValues?: DefaultValues<z.input<TSchema>>;
  onSubmit?: SubmitHandler<z.output<TSchema>>;
};

export type FormWithZodReturn<TSchema extends z.ZodObject<any>> = UseFormReturn<
  z.input<TSchema>,
  any,
  z.output<TSchema>
> & {
  onSubmit: (e?: React.BaseSyntheticEvent) => Promise<void>;
};

export function useFormWithZod<TSchema extends z.ZodObject<any>>({
  schema,
  defaultValues,
  onSubmit,
  mode,
  ...rest
}: UseFormOptions<TSchema>): FormWithZodReturn<TSchema> {
  const form = useForm<z.input<TSchema>, any, z.output<TSchema>>({
    resolver: zodResolver(schema),
    defaultValues,
    mode,
    ...rest,
  });

  const prevDefaultValuesRef = useRef<
    DefaultValues<z.input<TSchema>> | undefined
  >(defaultValues);

  const noop: SubmitHandler<z.output<TSchema>> = () => undefined;

  useEffect(() => {
    if (mode === "onChange") {
      let timeoutId: ReturnType<typeof setTimeout> | undefined;

      const subscription = form.watch(() => {
        if (timeoutId) clearTimeout(timeoutId);
        timeoutId = setTimeout(() => {
          form.handleSubmit(onSubmit || noop)();
        }, 2000);
      });

      return () => {
        subscription.unsubscribe();
        if (timeoutId) clearTimeout(timeoutId);
      };
    }
  }, [mode, form.watch, form.handleSubmit, onSubmit]);

  useEffect(() => {
    const isDefaultValuesDifferent =
      JSON.stringify(prevDefaultValuesRef.current) !==
      JSON.stringify(defaultValues);

    if (defaultValues && isDefaultValuesDifferent) {
      prevDefaultValuesRef.current = defaultValues;
      form.reset(defaultValues);
    }
  }, [defaultValues, form.reset]);

  return {
    ...form,
    onSubmit: form.handleSubmit(onSubmit || noop),
  };
}
