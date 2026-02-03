// src/types/action-result-types.ts

export interface ActionResult<T = void> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface ValidationError {
  field: string;
  message: string;
}

export interface ActionResultWithValidation<T = void> {
  success: boolean;
  data?: T;
  error?: string;
  validationErrors?: ValidationError[];
}
