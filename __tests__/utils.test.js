// Testes unitários para funções críticas de utils.js
import { slugify, validateInput } from '../utils.js';

describe('slugify', () => {
  it('deve converter texto simples em slug', () => {
    expect(slugify('Login com sucesso')).toBe('login-com-sucesso');
    expect(slugify('Cadastro Inválido!')).toBe('cadastro-invalido');
  });
});

describe('validateInput', () => {
  it('deve validar campo obrigatório', () => {
    expect(validateInput('', { required: true }).valid).toBe(false);
    expect(validateInput('abc', { required: true }).valid).toBe(true);
  });
  it('deve validar minLength', () => {
    expect(validateInput('ab', { minLength: 3 }).valid).toBe(false);
    expect(validateInput('abc', { minLength: 3 }).valid).toBe(true);
  });
  it('deve validar maxLength', () => {
    expect(validateInput('abc', { maxLength: 2 }).valid).toBe(false);
    expect(validateInput('a', { maxLength: 2 }).valid).toBe(true);
  });
});
