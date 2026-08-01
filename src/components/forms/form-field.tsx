"use client";

import { useState } from "react";
import { UseFormRegister, FieldErrors } from "react-hook-form";
import { cn } from "@/lib/utils";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

interface FormFieldProps {
  label: string;
  name: string;
  type?: "text" | "email" | "password" | "number" | "tel";
  placeholder?: string;
  register: UseFormRegister<any>;
  errors?: FieldErrors;
  required?: boolean;
  disabled?: boolean;
  className?: string;
  maxLength?: number;
  minLength?: number;
  pattern?: RegExp;
}

export function FormField({
  label,
  name,
  type = "text",
  placeholder,
  register,
  errors,
  required,
  disabled,
  className,
  maxLength,
  minLength,
  pattern,
}: FormFieldProps) {
  const error = errors?.[name]?.message as string | undefined;
  const hasError = !!error;

  return (
    <div className={cn("space-y-2", className)}>
      <Label htmlFor={name}>
        {label}
        {required && <span className="text-destructive ml-1">*</span>}
      </Label>
      <Input
        id={name}
        type={type}
        placeholder={placeholder}
        disabled={disabled}
        {...register(name, {
          required: required ? `${label} is required` : false,
          maxLength: maxLength ? { value: maxLength, message: `Maximum ${maxLength} characters allowed` } : undefined,
          minLength: minLength ? { value: minLength, message: `Minimum ${minLength} characters required` } : undefined,
          pattern: pattern ? { value: pattern, message: `Invalid ${label.toLowerCase()} format` } : undefined,
        })}
        className={cn(hasError && "border-destructive")}
        aria-invalid={hasError}
      />
      {hasError && (
        <p className="text-sm text-destructive">{error}</p>
      )}
    </div>
  );
}

interface FormSelectOption {
  label: string;
  value: string;
}

interface FormSelectProps {
  label: string;
  name: string;
  options: FormSelectOption[];
  placeholder?: string;
  register: UseFormRegister<any>;
  errors?: FieldErrors;
  required?: boolean;
  disabled?: boolean;
  className?: string;
}

export function FormSelect({
  label,
  name,
  options,
  placeholder,
  register,
  errors,
  required,
  disabled,
  className,
}: FormSelectProps) {
  const error = errors?.[name]?.message as string | undefined;
  const hasError = !!error;

  return (
    <div className={cn("space-y-2", className)}>
      <Label htmlFor={name}>
        {label}
        {required && <span className="text-destructive ml-1">*</span>}
      </Label>
      <select
        id={name}
        disabled={disabled}
        {...register(name, { required: required ? `${label} is required` : false })}
        className={cn(
          "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
          hasError && "border-destructive"
        )}
      >
        {placeholder && (
          <option value="" disabled>
            {placeholder}
          </option>
        )}
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {hasError && (
        <p className="text-sm text-destructive">{error}</p>
      )}
    </div>
  );
}
