import { BadRequestException } from '@nestjs/common';
import type { ClassConstructor } from 'class-transformer';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';

export const getClientAction = (
  body: Record<string, unknown>,
): string => {
  return typeof body['client-action'] === 'string'
    ? body['client-action']
    : '';
};

export const getCheckSubmitRecid = (recid?: string): string => {
    if (!recid) { throw new BadRequestException('recid is required for this request.'); }
    return recid;
};

export const getValidateForm = async <T extends object>(
    values: Record<string, unknown>,
    validate_type: ClassConstructor<T>,
  ): Promise<Record<string, string[]>> => {

    const dto = plainToInstance(validate_type, values);
    const validationErrors = await validate(dto);
    const errors: Record<string, string[]> = {};

    for (const validationError of validationErrors) {
        errors[validationError.property] = Object.values(
            validationError.constraints ?? {},
        );
    }

    return errors;
}

export const getFormMianInfo = (msg = '', pageinfo = {}) => {
    return {
        ...pageinfo,
        errors: {},
        msg,
    };
}
