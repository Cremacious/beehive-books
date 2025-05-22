import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatError(error: unknown) {
  if (
    typeof error === 'object' &&
    error !== null &&
    'name' in error &&
    (error as { name: string }).name === 'ZodError'
  ) {
    const zodError = error as unknown as { errors: Record<string, { message: string }> };
    const fieldErrors = Object.keys(zodError.errors).map(
      (field) => zodError.errors[field].message
    );

    return fieldErrors.join('. ');
  } else if (
    typeof error === 'object' &&
    error !== null &&
    'name' in error &&
    (error as { name: string }).name === 'PrismaClientKnownRequestError' &&
    'code' in error &&
    (error as { code: string }).code === 'P2002'
  ) {
    const prismaError = error as { meta?: { target?: string[] } };
    const field = prismaError.meta?.target ? prismaError.meta.target[0] : 'Field';
    return `${field.charAt(0).toUpperCase() + field.slice(1)} already exists`;
  } else if (
    typeof error === 'object' &&
    error !== null &&
    'message' in error &&
    typeof (error as { message: unknown }).message === 'string'
  ) {
    return (error as { message: string }).message;
  } else if (
    typeof error === 'object' &&
    error !== null &&
    'message' in error
  ) {
    return JSON.stringify((error as { message: unknown }).message);
  } else {
    return JSON.stringify(error);
  }
}